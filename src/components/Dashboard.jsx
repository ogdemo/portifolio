import { Link } from "react-router-dom";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen bg-gray-100 p-10 mt-16 top-16">

      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h1 className="text-2xl font-bold text-green-700">
          Admin Dashboard
        </h1>

        <p className="text-gray-600">
          Welcome {user?.fullname}
        </p>
      </div>

      {/* BUTTONS */}
      <div className="grid md:grid-cols-3 gap-5">

        <Link
          to="/adminproducts"
          className="bg-green-600 text-white p-6 rounded-xl text-center font-bold"
        >
          Manage Products
        </Link>

        <Link
          to="/orders"
          className="bg-blue-600 text-white p-6 rounded-xl text-center font-bold"
        >
          Manage Orders
        </Link>

        <Link
          to="/users"
          className="bg-purple-600 text-white p-6 rounded-xl text-center font-bold"
        >
          Manage Users
        </Link>

      </div>

    </div>
  );
}