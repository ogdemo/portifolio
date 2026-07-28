const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
// Update: Rwanda phone numbers must be 10 digits (local) or 12 digits (international '250' prefix — e.g., 25078XXXXXXX).
// But user asks for 10 digits, revise validation & formatting here:

/**
 * Normalize a Rwanda MTN phone number to the required format for payment/disbursement.
 * Accepts both local '07XXXXXXXX' (10 digits) or international '2507XXXXXXXX' (12 digits),
 * trims extra digits, and throws if invalid.
 */


// MTN MoMo API configuration
const MTN = {
  clientId:
    process.env.MTN_CLIENT_ID || "l6zlXXXXXXXXXXXXXXXXXXXXXXXXtGyd",
  clientSecret:
    process.env.MTN_CLIENT_SECRET || "UrFMXXXXXXXXn89v",
  shopName: process.env.MTN_SHOP_NAME || "mrchicken",
  callbackURL:
    process.env.MTN_CALLBACK_URL ||
    "https://concentrate-seminar-include-seeds.trycloudflare.com/api/momo/callback",
  countryCode: process.env.MTN_COUNTRY_CODE || "RW",
  environment: process.env.MTN_ENVIRONMENT || "sandbox",
  apiMode: process.env.MTN_API_MODE || "payments",
  useSubscriptionKey:
    process.env.MTN_USE_SUBSCRIPTION_KEY !== undefined
      ? String(process.env.MTN_USE_SUBSCRIPTION_KEY).toLowerCase() === "true"
      : false,
  subscriptionKey:
    process.env.MTN_SUBSCRIPTION_KEY || "YOUR_SUBSCRIPTION_KEY_HERE",
  collectionPath: "collection/v1_0",
  requestPath: "requesttopay",
  paymentsPath: "v1/payments",
  get shouldUseTokenSubscriptionKey() {
    return this.useSubscriptionKey;
  },
  get shouldUseSubscriptionKey() {
    return this.useSubscriptionKey;
  },
  get apiBase() {
    return this.environment === "sandbox"
      ? "https://sandbox.momodeveloper.mtn.com"
      : "https://api.mtn.com";
  },
  get tokenPath() {
    return this.environment === "sandbox"
      ? "collection/token/"
      : "v1/oauth/access_token";
  },
  get targetEnvironment() {
    return this.environment === "sandbox" ? "sandbox" : "production";
  },
};

class MtnConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "MtnConfigError";
    this.code = "MTN_MISSING_SUBSCRIPTION_KEY";
  }
}

async function fetchMtnSubscriptionKeyFromDb() {
  if (!db || !db.promise) {
    return null;
  }

  const keyNames = [
    "MTN_SUBSCRIPTION_KEY",
    "mtn_subscription_key",
    "subscription_key",
    "mtn_key",
    "subscriptionKey",
    "mtnSubscriptionKey",
    "MOMO_SUBSCRIPTION_KEY",
    "momo_subscription_key",
  ];

  const tableCandidates = [
    { table: "settings", keyColumns: ["key", "name", "config_key"], valueColumns: ["value", "config_value"] },
    { table: "config", keyColumns: ["key", "name", "config_key"], valueColumns: ["value", "config_value"] },
    { table: "api_keys", keyColumns: ["key", "name", "type"], valueColumns: ["value", "secret"] },
    { table: "credentials", keyColumns: ["key", "name", "type"], valueColumns: ["value", "secret"] },
  ];

  for (const candidate of tableCandidates) {
    for (const keyName of keyNames) {
      for (const keyColumn of candidate.keyColumns) {
        for (const valueColumn of candidate.valueColumns) {
          try {
            const [rows] = await db.promise().query(
              `SELECT \`${valueColumn}\` AS value FROM \`${candidate.table}\` WHERE \`${keyColumn}\` = ? LIMIT 1`,
              [keyName]
            );

            if (rows.length && rows[0].value) {
              return String(rows[0].value).trim();
            }
          } catch (err) {
            continue;
          }
        }
      }
    }
  }

  return null;
}

async function loadMtnSubscriptionKey() {
  if (MTN.subscriptionKey && MTN.subscriptionKey !== "YOUR_SUBSCRIPTION_KEY_HERE") {
    return MTN.subscriptionKey;
  }

  const dbKey = await fetchMtnSubscriptionKeyFromDb();
  if (dbKey) {
    console.log("Loaded MTN subscription key from database.");
    MTN.subscriptionKey = dbKey;
    return dbKey;
  }

  // Try common environment variable names as a last resort
  const envNames = [
    "MTN_SUBSCRIPTION_KEY",
    "MOMO_SUBSCRIPTION_KEY",
    "SUBSCRIPTION_KEY",
    "MTN_KEY",
    "SUBSCRIPTIONKEY",
    "MOMO_KEY",
  ];

  for (const name of envNames) {
    const val = process.env[name];
    if (val && String(val).trim() && val !== "YOUR_SUBSCRIPTION_KEY_HERE") {
      console.log(`Loaded MTN subscription key from env var ${name}.`);
      MTN.subscriptionKey = String(val).trim();
      return MTN.subscriptionKey;
    }
  }

  return null;
}

async function getAccessToken() {
  const subscriptionKey = await loadMtnSubscriptionKey();

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (MTN.shouldUseTokenSubscriptionKey) {
    if (subscriptionKey) {
      headers["Ocp-Apim-Subscription-Key"] = subscriptionKey;
      console.log("Sending MTN token request with Ocp-Apim-Subscription-Key.");
    } else {
      console.warn(
        "MTN_USE_SUBSCRIPTION_KEY=true, but no subscription key was found. Continuing without the header because this MTN product may not require it."
      );
    }
  } else {
    console.log(
      "Skipping Ocp-Apim-Subscription-Key on MTN token request because the configuration does not require it."
    );
  }

  console.log("MTN TOKEN REQUEST HEADERS:", JSON.stringify(headers, null, 2));

  // Try token request, retry with subscription key if MTN rejects due to missing key
  try {
    const response = await axios.post(
      `${MTN.apiBase}/${MTN.tokenPath}`,
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        auth: {
          username: MTN.clientId,
          password: MTN.clientSecret,
        },
        headers,
      }
    );

    return response.data.access_token;
  } catch (err) {
    const status = err.response?.status;
    const bodyMessage =
      err.response?.data?.message || JSON.stringify(err.response?.data) || err.message;

    // If MTN complains about missing subscription key, attempt a retry with any available key
    if (
      status === 401 &&
      /subscription key/i.test(String(bodyMessage))
    ) {
      console.warn("MTN token request failed due to missing subscription key. Attempting retry with subscription key if available...");

      const fallbackKey = await loadMtnSubscriptionKey();
      if (fallbackKey) {
        headers["Ocp-Apim-Subscription-Key"] = fallbackKey;
        console.log("Retrying MTN TOKEN REQUEST with Ocp-Apim-Subscription-Key.", JSON.stringify(headers, null, 2));

        const retryResp = await axios.post(
          `${MTN.apiBase}/${MTN.tokenPath}`,
          new URLSearchParams({ grant_type: "client_credentials" }),
          {
            auth: {
              username: MTN.clientId,
              password: MTN.clientSecret,
            },
            headers,
          }
        );

        return retryResp.data.access_token;
      }
    }

    // If MTN reports a subscription-key issue we log it clearly but do not fail the flow
    // until we have verified the merchant account and endpoint configuration.
    if (status === 401 && /subscription key/i.test(String(bodyMessage))) {
      const message =
        "MTN rejected the token request. Verify the merchant account, callback URL, and the endpoint/payload that match your enrolled MTN product.";
      console.error(message, "Details:", bodyMessage);
      throw new MtnConfigError(message + " Details: " + String(bodyMessage));
    }

    // rethrow original error if we couldn't handle it
    throw err;
  }
}

function formatRwandaPhone(phone) {
  let digits = String(phone).replace(/\D/g, "");

  if (digits.startsWith("0")) {
    digits = "250" + digits.slice(1);
  } else if (digits.startsWith("7") && digits.length === 9) {
    digits = "250" + digits;
  }

  if (!/^2507\d{8}$/.test(digits)) {
    throw new Error(
      `Invalid Rwanda MTN number: ${digits} (${digits.length} digits). Use 0780253627 or 250780253627`
    );
  }

  return digits;
}

async function initiateMtnPayment({ reference, amount, phoneNumber }) {
  const token = await getAccessToken();
  const msisdn = formatRwandaPhone(phoneNumber);

  const isPaymentsMode = MTN.apiMode === "payments";

  const paymentPayload = isPaymentsMode
    ? {
        amount: {
          amount: amount.toString(),
          units: "RWF",
        },
        payer: {
          payerIdType: "MSISDN",
          payerId: msisdn,
          payerNote: `${MTN.shopName} order payment`,
        },
        payee: [
          {
            amount: {
              amount: amount.toString(),
              units: "RWF",
            },
            payeeName: MTN.shopName,
            payeeNote: "Food order payment",
          },
        ],
        externalTransactionId: reference,
        callbackURL: MTN.callbackURL,
        description: `${MTN.shopName} food order payment`,
        channel: "WEB",
        countryCode: MTN.countryCode,
      }
    : {
        amount: amount.toString(),
        currency: "RWF",
        externalId: reference,
        payer: {
          partyIdType: "MSISDN",
          partyId: msisdn,
        },
        payerMessage: `${MTN.shopName} order payment`,
        payeeNote: "Food order payment",
        callbackUrl: MTN.callbackURL,
      };

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const subscriptionKey = await loadMtnSubscriptionKey();
  if (MTN.shouldUseSubscriptionKey && subscriptionKey) {
    headers["Ocp-Apim-Subscription-Key"] = subscriptionKey;
    console.log("Sending MTN payment request with Ocp-Apim-Subscription-Key.");
  } else {
    console.log("Skipping Ocp-Apim-Subscription-Key on MTN payment request because the configuration does not require it.");
  }

  if (!isPaymentsMode) {
    headers["X-Reference-Id"] = reference;
    headers["X-Target-Environment"] = MTN.targetEnvironment;
    headers["X-Callback-Url"] = MTN.callbackURL;
  }

  const mtmUrl = isPaymentsMode
    ? `${MTN.apiBase}/${MTN.paymentsPath}`
    : `${MTN.apiBase}/${MTN.collectionPath}/${MTN.requestPath}`;

  console.log("========== MTN REQUEST ==========");
  console.log("MTN REQUEST URL:", mtmUrl);
  console.log("MTN REQUEST PAYLOAD:", JSON.stringify(paymentPayload, null, 2));
  console.log("MTN REQUEST HEADERS:", JSON.stringify(headers, null, 2));
  console.log("MSISDN:", msisdn);
  console.log("REFERENCE:", reference);

  const paymentResponse = await axios.post(mtmUrl, paymentPayload, {
    headers,
  });

  return { paymentResponse, paymentPayload, msisdn };
}

function mapMtnStatus(status) {
  const value = String(status || "").toUpperCase();

  if (["SUCCESSFUL", "SUCCESS", "COMPLETED", "PAID", "APPROVED", "SUCCEEDED"].includes(value)) {
    return "PAID";
  }

  if (["PENDING", "PROCESSING", "IN_PROGRESS", "INITIATED", "CREATED"].includes(value)) {
    return "PENDING";
  }

  return "FAILED";
}

function getCallbackReference(data) {
  return (
    data.externalTransactionId ||
    data.externalId ||
    data.referenceId ||
    data.reference ||
    data.transactionId ||
    data.transactionReference ||
    data.correlatorId ||
    data.orderId ||
    data.id ||
    null
  );
}

function handleMomoCallback(req, res) {
  try {
    const data = req.body || {};

    console.log("MTN CALLBACK:", JSON.stringify(data, null, 2));

    const referenceId = getCallbackReference(data);
    const status = data.status || data.paymentStatus || data.transactionStatus || data.state;

    if (!referenceId) {
      return res.status(400).json({ message: "Missing reference" });
    }

    if (!status) {
      return res.status(400).json({ message: "Missing payment status" });
    }

    const paymentStatus = mapMtnStatus(status);

    const updateSql = `
      UPDATE orders
      SET payment_status = ?
      WHERE momo_reference = ?
    `;

    db.query(updateSql, [paymentStatus, referenceId], (err) => {
      if (err) {
        console.log("CALLBACK UPDATE ERROR:", err);
        return res.status(500).json({ message: "Update failed" });
      }

      console.log("Payment updated:", referenceId, paymentStatus);
      return res.json({ ok: true, payment_status: paymentStatus });
    });
  } catch (err) {
    console.log("CALLBACK ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// DATABASE
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000,
  ssl: {
    rejectUnauthorized: true
  }
});
// REGISTER
app.post("/register", (req, res) => {
  const { fullname, email, password, phone, location } = req.body;

  const checkEmail = "SELECT * FROM users WHERE email = ?";
  db.query(checkEmail, [email], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json(err);

      const role = "customer";
      const insertUser =
        "INSERT INTO users (fullname, email, password, phone, location, role) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(
        insertUser,
        [fullname, email, hash, phone, location, role],
        (err) => {
          if (err) return res.status(500).json(err);
          return res.status(200).json({ message: "User added" });
        }
      );
    });
  });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const findUser = "SELECT * FROM users WHERE email = ?";
  db.query(findUser, [email], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect email or password" });
      }

      const token = jwt.sign(
        { id: user.user_id, role: user.role },
        "secret_key",
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.user_id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
        },
      });
    });
  });
});

// ADD TO CART (legacy endpoint)
app.post("/add-to-cart", (req, res) => {
  const { user_id, product_id } = req.body;
  const orderSql =
    "INSERT INTO orders(user_id, order_date, status) VALUES (?, NOW(), 'pending')";
  db.query(orderSql, [user_id], (err, orderResult) => {
    if (err) return res.status(500).json(err);

    const orderId = orderResult.insertId;
    const itemSql =
      "INSERT INTO order_items(order_id, product_id, quantity) VALUES (?, ?, ?)";
    db.query(itemSql, [orderId, product_id, 1], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Product added successfully" });
    });
  });
});

// GET ORDERS
app.get("/orders", (req, res) => {
  const sql = `
    SELECT orders.order_id, orders.order_date, orders.payment_status,
           users.fullname, users.email, users.phone, users.location,
           products.product_name, order_items.quantity
    FROM orders
    JOIN users ON orders.user_id = users.user_id
    JOIN order_items ON orders.order_id = order_items.order_id
    JOIN products ON order_items.product_id = products.product_id
    ORDER BY orders.order_date DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// MULTER STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ADD PRODUCT
app.post("/products", upload.single("image"), (req, res) => {
  const { product_name, description, price, stock } = req.body;
  const image = req.file ? req.file.filename : null;
  const sql =
    "INSERT INTO products (product_name, description, price, image, stock) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [product_name, description, price, image, stock], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Product added successfully" });
  });
});

// DELETE ORDER
app.delete("/orders/:id", (req, res) => {
  const orderId = req.params.id;
  const deleteItems = "DELETE FROM order_items WHERE order_id = ?";
  db.query(deleteItems, [orderId], (err) => {
    if (err) return res.status(500).json({ message: "Failed to delete order items" });

    const deleteOrder = "DELETE FROM orders WHERE order_id = ?";
    db.query(deleteOrder, [orderId], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to delete order" });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json({ message: "Order deleted successfully" });
    });
  });
});

// GET PRODUCTS
app.get("/products", (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// DELETE PRODUCT
app.delete("/products/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM products WHERE product_id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Product deleted" });
  });
});

// UPDATE PRODUCT
app.put("/products/:id", (req, res) => {
  const id = req.params.id;
  const { product_name, description, price, stock } = req.body;
  const sql =
    "UPDATE products SET product_name = ?, description = ?, price = ?, stock = ? WHERE product_id = ?";
  db.query(sql, [product_name, description, price, stock, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Product updated" });
  });
});

// CHECKOUT
app.post("/checkout", async (req, res) => {
  const { user_id, cartItems, phoneNumber, paymentMethod } = req.body;

  console.log("CHECKOUT REQUEST", {
    user_id,
    items: cartItems?.length || 0,
    paymentMethod,
    phoneNumber,
  });

  if (!user_id || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: "Invalid checkout request" });
  }

  if (!paymentMethod) {
    return res.status(400).json({ message: "Payment method is required" });
  }

  const isMtnPayment = paymentMethod === "MTN Mobile Money";

  if (isMtnPayment && !phoneNumber?.trim()) {
    return res.status(400).json({ message: "MTN MoMo phone number is required" });
  }

  if (paymentMethod === "Airtel Money") {
    return res.status(400).json({
      message: "Airtel Money is not configured yet. Please use MTN Mobile Money.",
    });
  }

  const momo_reference = uuidv4();
  const totalAmount = cartItems.reduce(
    (total, item) => total + Number(item.price) * Number(item.qty),
    0
  );

  const initialStatus =
    paymentMethod === "Cash on Delivery" ? "COD" : "PENDING";

  const orderSql = `
    INSERT INTO orders
    (user_id, order_date, payment_status, momo_reference)
    VALUES (?, NOW(), ?, ?)
  `;

  db.query(
    orderSql,
    [user_id, initialStatus, momo_reference],
    async (orderErr, result) => {
      if (orderErr) {
        console.log("ORDER ERROR:", orderErr);
        return res.status(500).json({ message: "Order creation failed" });
      }

      const orderId = result.insertId;
      const orderItems = cartItems.map((item) => [
        orderId,
        item.product_id,
        item.qty,
      ]);

      db.query(
        `INSERT INTO order_items (order_id, product_id, quantity) VALUES ?`,
        [orderItems],
        async (itemErr) => {
          if (itemErr) {
            console.log("ORDER ITEMS ERROR:", itemErr);
            return res.status(500).json({ message: "Order items failed" });
          }

          if (paymentMethod === "Cash on Delivery") {
            return res.json({
              message: "Order placed successfully",
              orderId,
              reference: momo_reference,
              amount: totalAmount,
              status: "COD",
            });
          }

          try {
            const { paymentResponse, msisdn } = await initiateMtnPayment({
              reference: momo_reference,
              amount: totalAmount,
              phoneNumber,
            });

            console.log("MTN STATUS:", paymentResponse.status);
            console.log("MTN RESPONSE:", paymentResponse.data);

            return res.json({
              message: "MTN MoMo payment request sent. We will update the order once MTN confirms the payment.",
              orderId,
              reference: momo_reference,
              amount: totalAmount,
              phone: msisdn,
              status: "PENDING",
              shop: MTN.shopName,
              mtn: paymentResponse.data,
            });
          } catch (paymentError) {
            const errMsg = paymentError.response?.data || paymentError.message;

            // Handle missing subscription key configuration explicitly
            if (paymentError && (paymentError.name === "MtnConfigError" || paymentError.code === "MTN_MISSING_SUBSCRIPTION_KEY")) {
              console.error("MTN CONFIG ERROR:", errMsg);

              db.query(
                "UPDATE orders SET payment_status = 'FAILED' WHERE order_id = ?",
                [orderId]
              );

              return res.status(400).json({
                message: "MTN configuration error: missing subscription key",
                hint: "Set MTN_SUBSCRIPTION_KEY in backend/.env or add it to your database. For sandbox, this is usually required.",
                details: errMsg,
              });
            }

            console.log("MTN ERROR:", errMsg);

            db.query(
              "UPDATE orders SET payment_status = 'FAILED' WHERE order_id = ?",
              [orderId]
            );

            return res.status(500).json({
              message: "MTN MoMo payment failed",
              error: errMsg,
            });
          }
        }
      );
    }
  );
});

// MOMO CALLBACK — MTN sends POST and PUT
app.get("/api/momo/config", (req, res) => {
  res.json({
    environment: MTN.environment,
    apiMode: MTN.apiMode,
    callbackUrl: MTN.callbackURL,
    shopName: MTN.shopName,
    countryCode: MTN.countryCode,
  });
});

app.post("/api/momo/callback", handleMomoCallback);
app.put("/api/momo/callback", handleMomoCallback);

// ORDER PAYMENT STATUS
app.get("/orders/:order_id/status", async (req, res) => {
  const orderId = req.params.order_id;

  const sql = `
    SELECT order_id, payment_status, momo_reference
    FROM orders
    WHERE order_id = ?
  `;

  db.query(sql, [orderId], async (err, result) => {
    if (err) return res.status(500).json(err);
    if (!result.length) return res.status(404).json({ message: "Not found" });

    const order = result[0];

    if (order.payment_status === "PENDING" && order.momo_reference) {
      try {
        const token = await getAccessToken();

        const statusUrl = MTN.apiMode === "payments"
          ? `${MTN.apiBase}/${MTN.paymentsPath}/${order.momo_reference}/transactionStatus`
          : `${MTN.apiBase}/${MTN.collectionPath}/${MTN.requestPath}/${order.momo_reference}`;

        const statusHeaders = {
          Authorization: `Bearer ${token}`,
        };

        const subscriptionKey = await loadMtnSubscriptionKey();
        if (MTN.shouldUseSubscriptionKey && subscriptionKey) {
          statusHeaders["Ocp-Apim-Subscription-Key"] = subscriptionKey;
        }

        if (MTN.apiMode !== "payments") {
          statusHeaders["X-Target-Environment"] = MTN.targetEnvironment;
        }

        const mtnStatusRes = await axios.get(statusUrl, {
          headers: statusHeaders,
        });

        const mtnStatus =
          mtnStatusRes.data?.status ||
          mtnStatusRes.data?.data?.status ||
          mtnStatusRes.data?.paymentStatus;

        if (mtnStatus) {
          const mapped = mapMtnStatus(mtnStatus);

          if (mapped !== order.payment_status) {
            db.query(
              "UPDATE orders SET payment_status = ? WHERE order_id = ?",
              [mapped, orderId]
            );
            order.payment_status = mapped;
          }
        }
      } catch (pollError) {
        console.log(
          "MTN STATUS POLL:",
          pollError.response?.data || pollError.message
        );
      }
    }

    res.json({
      order_id: order.order_id,
      payment_status: order.payment_status,
    });
  });
});

if (require.main === module) {
  app.listen(5000, () => {
    console.log("Server running on port 5000");
    console.log(`MTN API mode: ${MTN.apiMode}`);
    console.log(`MTN environment: ${MTN.environment}`);
    console.log(`MTN useSubscriptionKey: ${MTN.useSubscriptionKey ?? "undefined"}`);
    console.log(`MTN shouldUseTokenSubscriptionKey: ${MTN.shouldUseTokenSubscriptionKey}`);
    console.log(`MTN shouldUseSubscriptionKey: ${MTN.shouldUseSubscriptionKey}`);
  });
}

module.exports = {
  app,
  db,
  MTN,
  formatRwandaPhone,
  mapMtnStatus,
  getCallbackReference,
  handleMomoCallback,
};
