import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Login({ closeForm }) {
  const [mode, setMode] = useState("login");

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url =
      mode === "login"
        ? "http://localhost:5000/login"
        : "http://localhost:5000/register";

    const dataBody =
      mode === "login"
        ? { email, password }
        : { fullname, email, password }; // ❗ no role from frontend

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataBody),
      });

      const data = await response.json();
      console.log(data);

      alert(data.message);

     if (response.ok && mode === "login") {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/products");
      }

      closeForm();
     }

      // CLEAR FIELDS
      setFullname("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  

  return (
    <div className={`auth-modal ${mode === "login" ? "login-mode" : "register-mode"}`}>
      <div className="form-box">

        <button
          onClick={closeForm}
          className="absolute top-3 right-4 text-2xl"
        >
          X
        </button>

        <h1>{mode === "login" ? "Login" : "Register"}</h1>

        <form onSubmit={handleSubmit}>
          
          {mode === "register" && (
            <div className="input-box">
              <input
                type="text"
                placeholder="Full Name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <p>
            {mode === "login" ? (
              <span>
                Don't have an account?{" "}
                <button type="button" onClick={() => setMode("register")}>
                  Register
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")}>
                  Login
                </button>
              </span>
            )}
          </p>

          <button type="submit" className="btn">
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}