const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecommerce",
  port: Number(process.env.DB_PORT || 3306),
  ssl: process.env.DB_SSL === "false" ? undefined : { rejectUnauthorized: false },
});

console.log("🗑️  Deleting all old products...");

db.query("DELETE FROM products", (err) => {
  if (err) {
    console.error("❌ Error deleting products:", err.message);
    process.exit(1);
  }

  console.log("✅ All old products deleted!");
  console.log("\n📝 Next steps:");
  console.log("1. Go to http://localhost:5173/admin");
  console.log("2. Click 'Add Product'");
  console.log("3. Fill in: name, description, price, stock");
  console.log("4. SELECT AN IMAGE FILE");
  console.log("5. Click 'Add Product'");
  console.log("6. Check home page - image should appear!");
  
  process.exit(0);
});
