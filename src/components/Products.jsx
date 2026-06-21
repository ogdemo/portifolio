import { useEffect, useState } from "react";
import Login from "./Login";

export default function Products({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.log(err));
  }, []);

  const saveOrder = (product) => {
    const user = JSON.parse(localStorage.getItem("user"));

    // Show login form instead of alert
    if (!user) {
      setShowLogin(true);
      return;
    }

    addToCart({
      product_id: product.product_id,
      name: product.product_name,
      price: product.price,
      image: `http://localhost:5000/uploads/${product.image}`,
      qty: 1,
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 pt-24 px-6">

        <div className="max-w-7xl mx-auto">

          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Our Products
          </h1>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {products.map((product) => (
              <div
                key={product.product_id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
              >
                <img
                  src={`http://localhost:5000/uploads/${product.image}`}
                  alt={product.product_name}
                  className="w-full h-52 object-cover"
                />

                <div className="p-4">

                  <h2 className="text-lg font-bold text-gray-800">
                    {product.product_name}
                  </h2>

                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                    {product.description}
                  </p>

                  <p className="text-green-600 font-bold text-xl mt-3">
                    FRW {Number(product.price).toLocaleString()}
                  </p>

                  <button
                    onClick={() => saveOrder(product)}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition duration-300"
                  >
                    Shop Now
                  </button>

                </div>
              </div>
            ))}

          </div>

        </div>

      </div>

      {/* Login Modal */}
      {showLogin && (
        <Login closeForm={() => setShowLogin(false)} />
      )}
    </>
  );
}