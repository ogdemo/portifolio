import { useState } from "react";

export default function Cart({ cartItems, removeFromCart, increaseQty, decreaseQty }) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);

  const checkout = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Login required");
    if (!paymentMethod) return alert("Please select payment method");
    if ((paymentMethod === "MTN Mobile Money" || paymentMethod === "Airtel Money") && !phoneNumber)
      return alert("Please enter phone number");

    let endpoint = "http://localhost:5000/checkout";
    let body = {
      user_id: user.id,
      payment_method: paymentMethod,
      cartItems: cartItems.map(i => ({ product_id: i.product_id, qty: i.qty }))
    };

    if (paymentMethod === "MTN Mobile Money") {
  endpoint = "http://localhost:5000/api/momo/pay";
  body = {
    user_id: user.id,
    amount: total,
    phone: phoneNumber,
    cartItems: cartItems.map(i => ({
      product_id: i.product_id,
      qty: i.qty
    }))
  };
}

    if (paymentMethod === "Airtel Money") {
      endpoint = "http://localhost:5000/airtel/request-payment";
      body = { ...body, amount: total, phone: phoneNumber };
    }

    try {
      setLoading(true);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      alert(data.message || "Request processed");
      if (res.ok) {
        setPaymentMethod("");
        setPhoneNumber("");
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      alert("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            <h2 className="text-xl font-bold">Your cart is empty</h2>
          </div>
        ) : (
          <>
            {cartItems.map(item => (
              <div key={item.product_id} className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col md:flex-row items-center gap-5">
                <img src={item.image} alt={item.name} className="w-28 h-28 object-cover rounded-lg" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{item.name}</h2>
                  <p className="text-green-600 font-bold">FRW {Number(item.price).toLocaleString()}</p>
                  <p>Subtotal: FRW {(item.price * item.qty).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => decreaseQty(item.product_id)} className="bg-gray-200 px-3 py-1 rounded">-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => increaseQty(item.product_id)} className="bg-gray-200 px-3 py-1 rounded">+</button>
                </div>

                <button onClick={() => removeFromCart(item.product_id)} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                  Remove
                </button>
              </div>
            ))}

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>

              <select
                value={paymentMethod}
                onChange={(e)=>setPaymentMethod(e.target.value)}
                className="w-full border p-3 rounded-lg mb-4">
                <option value="">Select Payment</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="MTN Mobile Money">MTN Mobile Money</option>
                <option value="Airtel Money">Airtel Money</option>
              </select>

              {(paymentMethod==="MTN Mobile Money" || paymentMethod==="Airtel Money") && (
                <input
                  type="text"
                  placeholder="25078XXXXXXX"
                  value={phoneNumber}
                  onChange={(e)=>setPhoneNumber(e.target.value)}
                  className="w-full border p-3 rounded-lg mb-4"
                />
              )}

              <div className="flex justify-between mb-5">
                <h2 className="text-2xl font-bold">Total</h2>
                <span className="text-2xl font-bold text-green-600">
                  FRW {total.toLocaleString()}
                </span>
              </div>

              <button
                disabled={loading}
                onClick={checkout}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg">
                {loading ? "Processing..." : "Confirm Order"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
