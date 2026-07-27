import { Link } from "react-router-dom";

export default function Success() {
  return (
    <div className="min-h-screen bg-gray-100 pt-24 px-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-md text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Order Placed!</h1>
        <p className="text-gray-500 mb-8">
          Thank you for your order. We will process it shortly.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/products"
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="text-green-600 hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
