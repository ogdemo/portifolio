import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import Login from "./Login";

export default function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch(`${API}/products`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        const found = (data || []).find((p) => String(p.product_id) === String(id));
        setProduct(found || null);
      })
      .catch(() => setProduct(null))
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [id]);

  const handleAdd = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setShowLogin(true);
      return;
    }

    addToCart({
      product_id: product.product_id,
      name: product.product_name,
      price: product.price,
      image: product.image,
      qty: 1,
    });
  };

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!product) return <div className="p-8 text-center">Product not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-8 bg-white rounded-xl shadow p-6">
        <div>
          <img
            src={product.image || "/placeholder.png"}
            alt={product.product_name}
            className="w-full h-96 object-cover rounded"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">{product.product_name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="text-2xl font-extrabold text-emerald-600 mb-6">FRW {Number(product.price).toLocaleString()}</div>

          <div className="flex gap-3">
            <button onClick={handleAdd} className="bg-emerald-600 text-white px-4 py-2 rounded">Add to cart</button>
          </div>
        </div>
      </div>

      {showLogin && <Login closeForm={() => setShowLogin(false)} />}
    </div>
  );
}
