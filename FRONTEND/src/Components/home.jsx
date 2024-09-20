import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-wrap justify-between items-center p-4 bg-gray-100">
      {/* Inventory Management System Title */}
      <div className="text-blue-900 text-lg sm:text-xl font-bold">
        Inventory Management System
      </div>

      {/* QR Code and Scan QR Buttons */}
      <div className="flex space-x-2 sm:space-x-4 mt-2 sm:mt-0">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
          QR code generator
        </button>
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
          Scan QR
        </button>
      </div>

      {/* Sign In and Register Buttons */}
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
  );
}

export default Home;
