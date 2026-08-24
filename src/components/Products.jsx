import { useEffect, useState } from "react";
import Login from "./Login";
import API from "../api";
import { useLocation } from "react-router-dom";

const normalize = (value) => String(value || "").toLowerCase().trim();

const productText = (product) => [
  product.product_name,
  product.description,
  product.category,
  product.category_slug,
  product.category_name,
  product.categoryName,
  product.category && product.category.name,
].filter(Boolean).map(normalize).join(" ");

const similarityScore = (product, query) => {
  const name = normalize(product.product_name);
  const text = productText(product);
  const queryWords = normalize(query).split(/\s+/).filter(Boolean);

  if (name === normalize(query)) return 1000;
  if (text.includes(normalize(query))) return 800;

  return queryWords.reduce((score, word) => {
    if (text.includes(word)) return score + 120;

    const closestDistance = name.split(/\s+/).reduce((best, nameWord) => {
      let previous = Array.from({ length: nameWord.length + 1 }, (_, index) => index);

      for (let row = 1; row <= word.length; row += 1) {
        const current = [row];
        for (let column = 1; column <= nameWord.length; column += 1) {
          current[column] = Math.min(
            current[column - 1] + 1,
            previous[column] + 1,
            previous[column - 1] + (word[row - 1] === nameWord[column - 1] ? 0 : 1),
          );
        }
        previous = current;
      }

      return Math.min(best, previous[nameWord.length]);
    }, Number.POSITIVE_INFINITY);

    return score + Math.max(0, 80 - closestDistance * 12);
  }, 0);
};

export default function Products({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const categoryParam = params.get("category");
  const searchParam = params.get("search")?.trim() || "";

  useEffect(() => {
    fetch(`${API}/products`)
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
      image: product.image || "/placeholder.png",
      qty: 1,
    });
  };

  const categoryProducts = categoryParam
    ? products.filter((product) => {
        const categories = [
          product.category,
          product.category_slug,
          product.category_name,
          product.categoryName,
          product.category && product.category.name,
        ];

        return categories.some(
          (category) => typeof category === "string" && normalize(category) === normalize(categoryParam),
        );
      })
    : products;

  const exactMatches = searchParam
    ? categoryProducts.filter((product) => productText(product).includes(normalize(searchParam)))
    : categoryProducts;

  const visibleProducts = searchParam && exactMatches.length === 0
    ? categoryProducts
        .map((product) => ({ product, score: similarityScore(product, searchParam) }))
        .filter(({ score }) => score >= 20)
        .sort((first, second) => second.score - first.score)
        .slice(0, 4)
        .map(({ product }) => product)
    : exactMatches;

  return (
    <>
      <div className="min-h-screen bg-gray-100 pt-24 px-6">

        <div className="max-w-7xl mx-auto">

          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            {searchParam ? `Results for "${searchParam}"` : "Our Products"}
          </h1>

          {searchParam && exactMatches.length === 0 && visibleProducts.length > 0 && (
            <p className="mb-8 text-center text-slate-600">
              No exact matches found. Showing the closest products instead.
            </p>
          )}

          {searchParam && visibleProducts.length === 0 && (
            <p className="mb-8 text-center text-slate-600">
              We could not find a close match for that search.
            </p>
          )}

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {visibleProducts.map((product) => (
              <div
                key={product.product_id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
              >
                <img
                  src={product.image || "/placeholder.png"}
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