import { useState, useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Home from "./components/Home";
import Cart from "./components/Cart";
import Products from "./components/Products";
import Dashboard from "./components/Dashboard";
import AdminProducts from "./components/AdminProducts";
import AdminOrders from "./components/AdminOrders";
import AdminUsers from "./components/AdminUsers";
import Garaly from "./components/Garaly";
import Footer from "./components/Footer";
import AboutUs from "./components/AboutUs";
import { Routes, Route } from "react-router-dom";

export default function App() {

  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState("");


  // LOAD CART
  useEffect(() => {
    const saved = localStorage.getItem("cart");

    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (err) {
        console.log("Cart parse error:", err);
        localStorage.removeItem("cart");
      }
    }

  }, []);



  // SAVE CART
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);



  // MESSAGE
  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };



  // ADD TO CART
  const addToCart = (product) => {

    setCartItems((prev) => {

      const product_id = product.product_id;

      const exist = prev.find(
        (item) => item.product_id === product_id
      );


      if (exist) {

        return prev.map((item) =>
          item.product_id === product_id
            ? {
                ...item,
                qty: item.qty + 1
              }
            : item
        );

      }


      return [
        ...prev,
        {
          product_id,
          name: product.name,
          price: product.price,
          image: product.image,
          qty: 1,
        }
      ];

    });

  };



  // REMOVE CART ITEM
  const removeFromCart = (product_id) => {

    setCartItems((prev) =>
      prev.filter(
        (item) => item.product_id !== product_id
      )
    );

    showMessage("Removed from cart");

  };



  // INCREASE QUANTITY
  const increaseQty = (product_id) => {

    setCartItems((prev) =>
      prev.map((item) =>
        item.product_id === product_id
          ? {
              ...item,
              qty: item.qty + 1
            }
          : item
      )
    );

  };



  // DECREASE QUANTITY
  const decreaseQty = (product_id) => {

    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product_id === product_id
            ? {
                ...item,
                qty: item.qty - 1
              }
            : item
        )
        .filter((item) => item.qty > 0)
    );

  };



  return (

    <div className="min-h-screen flex flex-col">


      {/* MESSAGE */}
      {message && (

        <div className="
          fixed 
          top-20 
          right-5 
          bg-green-600 
          text-white 
          px-4 
          py-2 
          rounded 
          shadow-lg 
          z-50
        ">

          {message}

        </div>

      )}




      {/* HEADER */}
      <Header
        cartCount={
          cartItems.reduce(
            (sum, item) => sum + item.qty,
            0
          )
        }
      />





      {/* PAGE CONTENT */}
      <main className="flex-1">


        <Routes>

          <Route
            path="/"
            element={<Home />}
          />


          <Route
            path="/products"
            element={
              <Products
                addToCart={addToCart}
              />
            }
          />


          <Route
            path="/cart"
            element={
              <Cart

                cartItems={cartItems}

                removeFromCart={removeFromCart}

                increaseQty={increaseQty}

                decreaseQty={decreaseQty}

              />
            }
          />



          <Route
           path="/dashboard"
         element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

          <Route
            path="/adminproducts"
            element={<AdminProducts />}
          />


          <Route
            path="/orders"
            element={<AdminOrders />}
          />


          <Route
            path="/users"
            element={<AdminUsers />}
          />


          <Route
            path="/garaly"
            element={<Garaly />}
          />
           <Route
           path="/about"
           element={<AboutUs />}
           />

        </Routes>


      </main>





      {/* FOOTER */}
      <Footer />


    </div>

  );
}