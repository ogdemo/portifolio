import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import homepage from "../assets/homepage.png";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch(`${API}/products`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setProducts([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const featured = products; // show all products on the home page

  return (
    <main className="min-h-screen bg-gray-50 pt-24">
      {/* Full-width homepage banner: spans full width and top-to-middle (50vh) */}
      <div className="w-full mb-6">
        <div className="w-full h-[50vh] overflow-hidden relative">
          <img src={homepage} alt="Homepage banner" className="w-full h-full object-cover" />

          {/* Overlay Shop Now button - left side, vertically centered */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2">
            <Link
              to="/products"
              className="inline-flex items-center rounded-lg bg-amber-500 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-amber-600 transition"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Featured Products</h2>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading products…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <div key={p.product_id} className="bg-white rounded-2xl overflow-hidden shadow group">
                <img
                  src={`${API}/uploads/${p.image}`}
                  alt={p.product_name}
                  className="w-full h-52 object-cover"
                />

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{p.product_name}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{p.description}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-green-600 font-bold">FRW {Number(p.price).toLocaleString()}</div>
                    <Link
                      to={`/product/${p.product_id}`}
                      className="ml-2 inline-flex items-center rounded-md bg-emerald-600 px-3 py-1 text-white text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}