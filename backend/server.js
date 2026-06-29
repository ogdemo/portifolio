const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");

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
    const { fullname, email, password,phone, location} = req.body;
    // CHECK IF EMAIL EXISTS

    const checkEmail = "SELECT * FROM users WHERE email = ?";
    db.query(checkEmail, [email], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (result.length > 0) {
            return res.status(400).json({ message: "Email already exists"});
        }

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json(err);
            }
            const role = "customer";
            const insertUser = "INSERT INTO users (fullname, email, password, phone, location, role) VALUES (?, ?, ?, ?, ?, ?)";
            db.query(insertUser, [fullname, email, hash, phone, location, role], (err, result) => {
                if (err) {
                    return  res.status(500).json(err);
                }
                return res.status(200).json({ message: "User added"});
            });
        });
    });
    
});



app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const findUser = "SELECT * FROM users WHERE email = ?";

  db.query(findUser, [email], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect email or password" });
      }

      // 🔐 CREATE TOKEN (IMPORTANT)
      const token = jwt.sign(
        {
          id: user.user_id,
          role: user.role,
        },
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

app.post("/add-to-cart", (req, res) => {
  const { user_id, product_id } = req.body;

  const orderSql =
    "INSERT INTO orders(user_id, order_date, status) VALUES (?, NOW(), 'pending')";

  db.query(orderSql, [user_id], (err, orderResult) => {
    if (err) {
      return res.status(500).json(err);
    }

    const orderId = orderResult.insertId;

    const itemSql =
      "INSERT INTO order_items(order_id, product_id, quantity) VALUES (?, ?, ?)";

    db.query(itemSql, [orderId, product_id, 1], (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Product added successfully"
      });
    });
  });
});

app.get("/orders", (req, res) => {

    const sql = `
    SELECT 
        orders.order_id,
        orders.order_date,
        orders.payment_status,

        users.fullname,
        users.email,
        users.phone,
        users.location,

        products.product_name,

        order_items.quantity

    FROM orders

    JOIN users 
    ON orders.user_id = users.user_id

    JOIN order_items
    ON orders.order_id = order_items.order_id

    JOIN products
    ON order_items.product_id = products.product_id

    ORDER BY orders.order_date DESC
    `;


    db.query(sql, (err, result) => {

        if(err){
            return res.status(500).json(err);
        }


        res.json(result);

    });

});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/products", upload.single("image"), (req, res) => {
  const { product_name, description, price, stock } = req.body;
  const image = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO products (product_name, description, price, image, stock)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [product_name, description, price, image, stock], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Product added successfully" });
  });
});

app.delete("/orders/:id", (req, res) => {

  const orderId = req.params.id;


  // First delete order items
  const deleteItems =
    "DELETE FROM order_items WHERE order_id = ?";


  db.query(deleteItems, [orderId], (err) => {

    if (err) {

      console.log(err);

      return res.status(500).json({
        message: "Failed to delete order items"
      });

    }



    // Then delete the order
    const deleteOrder =
      "DELETE FROM orders WHERE order_id = ?";



    db.query(deleteOrder, [orderId], (err, result) => {


      if (err) {

        console.log(err);

        return res.status(500).json({
          message: "Failed to delete order"
        });

      }



      if (result.affectedRows === 0) {

        return res.status(404).json({
          message:"Order not found"
        });

      }



      res.json({

        message:"Order deleted successfully"

      });


    });


  });


});
app.get("/products", (req, res) => {
  const sql = "SELECT * FROM products";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.delete("/products/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM products WHERE product_id = ?";

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Product deleted" });
  });
});

app.put("/products/:id", (req, res) => {
  const id = req.params.id;

  const {
    product_name,
    description,
    price,
    stock,
  } = req.body;

  const sql = `
    UPDATE products
    SET product_name = ?,
        description = ?,
        price = ?,
        stock = ?
    WHERE product_id = ?
  `;

  db.query(
    sql,
    [product_name, description, price, stock, id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Product updated" });
    }
  );
});

app.post("/checkout", (req, res) => {

  const { user_id, cartItems } = req.body;


  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({
      message: "Cart empty"
    });
  }


  // Create order
  const orderSql = `
    INSERT INTO orders
    (
      user_id,
      order_date,
      payment_status
    )
    VALUES (?, NOW(), 'Pending')
  `;


  db.query(
    orderSql,
    [user_id],
    (err, orderResult) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }


      const orderId = orderResult.insertId;


      // Save products in order_items
      const values = cartItems
        .filter(item => item.product_id)
        .map(item => [
          orderId,
          item.product_id,
          item.qty
        ]);


      const itemSql = `
        INSERT INTO order_items
        (
          order_id,
          product_id,
          quantity
        )
        VALUES ?
      `;


      db.query(
        itemSql,
        [values],
        (err) => {

          if (err) {
            console.log(err);
            return res.status(500).json(err);
          }


          res.json({
            message: "Order placed successfully"
          });

        }
      );


    }
  );

});