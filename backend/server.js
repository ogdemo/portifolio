const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const axios = require("axios");

 const { v4: uuidv4 } = require("uuid");

 const MTN = {
  baseURL: "https://api.mtn.com/v1",
  clientId: "YOUR_CONSUMER_KEY",
  clientSecret: "YOUR_CONSUMER_SECRET",
};

// Function to get access token from MTN API
async function getAccessToken() {
  try {
    const response = await axios.post(
      "https://api.mtn.com/v1/oauth/access_token",
      null,
      {
        params: {
          grant_type: "client_credentials",
          client_id: MTN.clientId,
          client_secret: MTN.clientSecret,
        },
      }
    );

    return response.data.access_token;
  } catch (err) {
    console.log("TOKEN ERROR:", err.response?.data || err.message);
    throw err;
  }
}

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// DATABASE
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ecommerce",
});

// CONNECT DB
db.connect((err) => {
  if (err) console.log("DB ERROR", err);
  else console.log("DB Connected");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
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

// ADD TO CART
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
  const { user_id, cartItems } = req.body;

  if (!user_id || !cartItems?.length) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const momo_reference = uuidv4();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  const insertOrderSql = `
    INSERT INTO orders (user_id, order_date, payment_status, momo_reference)
    VALUES (?, NOW(), 'PENDING', ?)
  `;

  db.query(insertOrderSql, [user_id, momo_reference], async (err, result) => {
    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const orderId = result.insertId;

    const items = cartItems.map(item => [
      orderId,
      item.product_id,
      item.qty
    ]);

    db.query(
      "INSERT INTO order_items (order_id, product_id, quantity) VALUES ?",
      [items],
      async (err2) => {
        if (err2) {
          console.log("ITEM ERROR:", err2);
          return res.status(500).json({ message: "Item insert failed" });
        }

        try {
          const token = await getAccessToken();

          const paymentPayload = {
            description: "Order Payment",
            channel: "WEB",
            redirectURL: "http://localhost:3000/success",
            externalId: momo_reference,
            payer: {
              payerRef: user_id.toString()
            },
            payee: [
              {
                payeeName: "MrChicken Shop",
                amount: {
                  amount: totalAmount.toString(),
                  units: "RWF"
                }
              }
            ]
          };

          const response = await axios.post(
            `${MTN.baseURL}/payment-link`,
            paymentPayload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                transactionId: momo_reference,
                countryCode: "RW"
              }
            }
          );

          return res.json({
            message: "Payment initiated",
            orderId,
            momo_reference,
            paymentLink: response.data
          });

        } catch (error) {
          console.log("MTN ERROR:", error.response?.data || error.message);

          return res.status(500).json({
            message: "Payment initiation failed"
          });
        }
      }
    );
  });
});

// MOMO CALLBACK
app.post("/api/momo/callback", (req, res) => {
  try {
    const data = req.body || {};

    const referenceId =
      data.referenceId ||
      data.externalId ||
      data.financialTransactionId ||
      data.transactionId;

    const status = (data.status || "").toUpperCase();

    if (!referenceId) {
      return res.status(400).send("Missing reference");
    }

    const findSql = "SELECT * FROM orders WHERE momo_reference = ?";

    db.query(findSql, [referenceId], (err, rows) => {
      if (err) return res.status(500).send("DB error");

      if (!rows.length) {
        return res.status(404).send("Order not found");
      }

      let paymentStatus = "FAILED";

      if (status === "SUCCESSFUL" || status === "SUCCESS") {
        paymentStatus = "PAID";
      } else if (status === "PENDING") {
        paymentStatus = "PENDING";
      }

      const updateSql = `
        UPDATE orders 
        SET payment_status = ?
        WHERE momo_reference = ?
      `;

      db.query(updateSql, [paymentStatus, referenceId], (err2) => {
        if (err2) {
          console.log("UPDATE ERROR:", err2);
          return res.status(500).send("Update failed");
        }

        console.log("✔ Payment updated:", referenceId, paymentStatus);

        return res.json({ ok: true });
      });
    });

  } catch (err) {
    console.log(err);
    return res.status(500).send("Server error");
  }
});
// Get payment methods

app.get("/orders/:order_id/status", (req, res) => {
  const orderId = req.params.order_id;

  const sql = `
    SELECT order_id, payment_status 
    FROM orders 
    WHERE order_id = ?
  `;

  db.query(sql, [orderId], (err, result) => {
    if (err) return res.status(500).json(err);
    if (!result.length) return res.status(404).json({ message: "Not found" });

    res.json(result[0]);
  });
});