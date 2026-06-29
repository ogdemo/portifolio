
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {

  const user = JSON.parse(localStorage.getItem("user"));

  console.log("Current user:", user);


  if (!user) {
    return <Navigate to="/" />;
  }


  if (user.role !== "admin") {
    return <Navigate to="/products" />;
  }


  return children;
}