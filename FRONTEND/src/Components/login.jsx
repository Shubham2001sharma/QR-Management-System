import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("https://qr-management-system-api.vercel.app/logindata", {
        email,
        password,
      });
      const { token } = response.data;

      if (response.status === 200) {
        localStorage.setItem("token", token);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      {/* Navigation Bar */}
      <div className="flex flex-wrap justify-between items-center p-4 bg-gray-100">
        <div className="text-blue-900 text-lg sm:text-xl font-bold">
          Inventory Management System
        </div>
        <div className="flex space-x-2 sm:space-x-4 mt-2 sm:mt-0">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
            QR code generator
          </button>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
            Scan QR
          </button>
        </div>
        <div className="flex space-x-2 sm:space-x-4 mt-2 sm:mt-0">
          <Link to="/login">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Sign In
            </button>
          </Link>
          <Link to="/register">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Register
            </button>
          </Link>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
        <form
          className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-md"
          onSubmit={handleLoginSubmit}
        >
          <h2 className="text-2xl font-bold mb-4">Sign in</h2>
          <p className="mb-6 text-gray-700">Welcome, login to continue</p>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </button>
          <p className="mt-4 text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
