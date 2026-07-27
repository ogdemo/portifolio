import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";

const API = "http://localhost:5000";

function formatPhoneInput(value) {
  return value.replace(/[^\d+]/g, "");
}
// Utility function to handle and display payment errors from server/API
function handlePaymentAPIError(error, setError) {
  if (error.response && error.response.status === 500) {
    // Backend/server error
    setError("Sorry, there was a server error processing MTN MoMo payment. Please try again later.");
  } else if (error.message && error.message.includes("MTN MoMo payment failed")) {
    setError("MTN MoMo payment failed. Please check your phone number and try again.");
  } else {
    setError(error.message || "An unexpected error occurred during payment. Please try again.");
  }
}

// Rwanda MTN: 250 + 9 digits (e.g. 250780253627) or local 0780253627
function normalizeRwandaPhone(phone) {
  let digits = String(phone).replace(/\D/g, "");

  if (digits.startsWith("0")) {
    digits = "250" + digits.slice(1);
  } else if (digits.startsWith("7") && digits.length === 9) {
    digits = "250" + digits;
  }

  return digits;
}

function isValidRwandaMomoPhone(phone) {
  const normalized = normalizeRwandaPhone(phone);
  // 250 + 9-digit mobile starting with 7 (MTN: 78x, 79x)
  return /^2507\d{8}$/.test(normalized);
}

function getPhoneError(phone) {
  const normalized = normalizeRwandaPhone(phone);

  if (!phone.trim()) {
    return "Enter your MTN MoMo number";
  }

  if (normalized.length < 12) {
    return `Number too short (${normalized.length} digits). Use 0780253627 or 250780253627`;
  }

  if (normalized.length > 12) {
    return `Number too long (${normalized.length} digits). Rwanda numbers are 12 digits, e.g. 250780253627 — remove the extra digits`;
  }

  if (!normalized.startsWith("2507")) {
    return "MTN Rwanda numbers start with 078, 079, or 25078, 25079";
  }

  return "Invalid MTN number. Example: 0780253627 or 250780253627";
}

export default function Cart({
  cartItems,
  removeFromCart,
  increaseQty,
  decreaseQty,
  clearCart,
}) {
  const navigate = useNavigate();
  const pollRef = useRef(null);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhoneNumber, setConfirmPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const finishOrder = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPendingOrder(null);
    clearCart();
    navigate("/success");
  };

  const pollPaymentStatus = (orderId) => {
    let attempts = 0;
    const maxAttempts = 40;

    pollRef.current = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(`${API}/orders/${orderId}/status`);
        const data = await res.json();

        if (data.payment_status === "PAID") {
              setToast({ message: "MTN MoMo payment successful!", type: "info" });
              finishOrder();
          return;
        }

        if (data.payment_status === "FAILED") {
              clearInterval(pollRef.current);
              setPendingOrder(null);
              setToast({ message: "Payment failed. Please try again.", type: "error" });
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          setPendingOrder(null);
          setToast({ message: "Payment is still pending. Check your phone or contact mrchicken support.", type: "warning" });
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
  };

  const checkout = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return setToast({ message: "Login required", type: "warning" });

    if (cartItems.length === 0) return setToast({ message: "Cart is empty", type: "warning" });

    if (!paymentMethod) return setToast({ message: "Please select a payment method", type: "warning" });

    if (paymentMethod === "MTN Mobile Money") {
        if (!isValidRwandaMomoPhone(phoneNumber)) {
        return setToast({ message: getPhoneError(phoneNumber), type: "error" });
      }

      if (normalizeRwandaPhone(phoneNumber) !== normalizeRwandaPhone(confirmPhoneNumber)) {
        return setToast({ message: "The phone numbers do not match. Please confirm your MTN number.", type: "error" });
      }
    }

    const normalizedPhone = normalizeRwandaPhone(phoneNumber);

    const body = {
      user_id: user.id,
      paymentMethod,
      phoneNumber: normalizedPhone,
      cartItems: cartItems.map((i) => ({
        product_id: i.product_id,
        qty: i.qty,
        price: i.price,
      })),
    };

    try {
      setLoading(true);

      const res = await fetch(`${API}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Checkout failed");
      }

      if (data.status === "COD") {
        setToast({ message: "Order placed! Pay cash on delivery.", type: "info" });
        finishOrder();
        return;
      }

      if (data.status === "PENDING") {
        const simulated = !!data.simulated;
        setPendingOrder({
          orderId: data.orderId,
          reference: data.reference,
          amount: data.amount,
          phone: data.phone,
          simulated,
        });

        if (simulated) {
          setToast({ message: "Simulated MTN payment started. The order will complete automatically.", type: "info" });
          const simulatedOrderId = data.orderId;
          setTimeout(() => {
            if (simulatedOrderId === data.orderId) {
              finishOrder();
            }
          }, 8000);
          return;
        }

        setToast({ message: "MTN MoMo request sent to your phone. Enter your PIN to approve the payment.", type: "info" });
        pollPaymentStatus(data.orderId);
      }
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || "Checkout failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {pendingOrder && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 mb-6">
            <h3 className="font-bold text-yellow-800 text-lg mb-2">
              Waiting for MTN MoMo approval
            </h3>
            <p className="text-yellow-700 text-sm mb-1">
              Check your phone ({pendingOrder.phone}) and approve the payment
              prompt from <strong>mrchicken</strong>.
            </p>
            <p className="text-yellow-600 text-xs">
              Order #{pendingOrder.orderId} · FRW{" "}
              {Number(pendingOrder.amount).toLocaleString()} · Ref:{" "}
              {pendingOrder.reference.slice(0, 8)}...
            </p>
            {pendingOrder.simulated && (
              <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Simulated sandbox payment
              </div>
            )}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            <h2 className="text-xl font-bold">Your cart is empty</h2>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <div
                key={item.product_id}
                className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col md:flex-row items-center gap-5"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-28 h-28 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{item.name}</h2>
                  <p className="text-green-600 font-bold">
                    FRW {Number(item.price).toLocaleString()}
                  </p>
                  <p>
                    Subtotal: FRW{" "}
                    {(item.price * item.qty).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => decreaseQty(item.product_id)}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button
                    onClick={() => increaseQty(item.product_id)}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}

            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>

              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setPhoneNumber("");
                  setConfirmPhoneNumber("");
                }}
                className="w-full border p-3 rounded-lg mb-4"
                disabled={!!pendingOrder}
              >
                <option value="">Select Payment</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="MTN Mobile Money">MTN Mobile Money</option>
                <option value="Airtel Money">Airtel Money (coming soon)</option>
              </select>

              {paymentMethod === "MTN Mobile Money" && (
                <>
                  <div className="mb-4">
                    <input
                      type="tel"
                      placeholder="0780253627 or 250780253627"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(formatPhoneInput(e.target.value))
                      }
                      className="w-full border p-3 rounded-lg"
                      disabled={!!pendingOrder}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Rwanda MTN format: <strong>078XXXXXXX</strong> (10 digits)
                      or <strong>25078XXXXXXX</strong> (12 digits). Example:
                      0780253627
                    </p>
                  </div>

                  <div className="mb-4">
                    <input
                      type="tel"
                      placeholder="Confirm MTN number"
                      value={confirmPhoneNumber}
                      onChange={(e) =>
                        setConfirmPhoneNumber(formatPhoneInput(e.target.value))
                      }
                      className="w-full border p-3 rounded-lg"
                      disabled={!!pendingOrder}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Please enter the number again to confirm before payment.
                    </p>
                  </div>
                </>
              )}

              <div className="flex justify-between mb-5">
                <h2 className="text-2xl font-bold">Total</h2>
                <span className="text-2xl font-bold text-green-600">
                  FRW {total.toLocaleString()}
                </span>
              </div>

              <button
                disabled={loading || !!pendingOrder}
                onClick={checkout}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-lg"
              >
                {loading
                  ? "Sending MTN MoMo request..."
                  : pendingOrder
                  ? "Waiting for phone approval..."
                  : "Confirm Order"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
