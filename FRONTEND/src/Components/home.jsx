import React from "react";
import { Link } from "react-router-dom";

function home() {
  return (
    <div className="flex justify-between p-4">
      {/* Inventory Management System Title */}
      <div className="text-blue-900 text-xl font-bold">
        Inventory Management System
      </div>
      <div>
          < button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mr-4"
          >QR code generator</button>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">Scan QR</button>
        </div>

      <div>
        <Link to="/login">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Sign In
          </button>
        </Link>
        <Link to="/register" className="ml-4">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}

export default home;
