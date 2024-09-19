import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import QRCodeGenerator from "qrcode"; // Import the qrcode library
import { QrReader } from "react-qr-scanner"; // Import the QR reader for webcam scanning
import axios from "axios"; // Import axios
import jsQR from "jsqr"; // Import jsQR for decoding QR codes from images

function Dashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [showScan, setShowScan] = useState(false); // State to control the Scan QR section
  const [formData, setFormData] = useState([]);
  const [component, setComponent] = useState("");
  const [date, setDate] = useState("");
  const [items, setItems] = useState("");
  const [editingIndex, setEditingIndex] = useState(null); // Index for editing
  const [scannedData, setScannedData] = useState(""); // State to store scanned QR data
  const [uploadedImage, setUploadedImage] = useState(null); // For storing uploaded image

  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  axios.defaults.withCredentials = true;
  useEffect(() => {
    axios
      .get("qr-management-system-api.vercel.app/formdata") // Replace with your API endpoint
      .then((response) => {
        setFormData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const openPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newEntry = {
      component,
      date,
      items: Number(items),
      status: "Pending",
      qrCodeValue: component,
      dispatchDate: null,
    };

    if (editingIndex !== null) {
      // Update existing entry
      const entryId = formData[editingIndex]._id; // Ensure the correct ID is used
      axios
        .put(
          `qr-management-system-api.vercel.app/formdata/${entryId}`,
          newEntry
        ) // Update endpoint
        .then((response) => {
          const updatedData = [...formData];
          updatedData[editingIndex] = response.data; // Use the response data to update the state
          setFormData(updatedData);
          setEditingIndex(null);
          setComponent("");
          setDate("");
          setItems("");
          setShowPopup(false);
        })
        .catch((error) => {
          console.error("Error updating data:", error);
        });
    } else {
      // Add new entry
      axios
        .post("qr-management-system-api.vercel.app/formdata", newEntry) // Create endpoint
        .then((response) => {
          setFormData([...formData, response.data]);
          setComponent("");
          setDate("");
          setItems("");
          setShowPopup(false);
        })
        .catch((error) => {
          console.error("Error adding data:", error);
        });
    }
  };

  const downloadQRCode = (value) => {
    QRCodeGenerator.toDataURL(value, { width: 100 }, (err, url) => {
      if (err) {
        console.error("Error generating QR code:", err);
        return;
      }
      const link = document.createElement("a");
      link.href = url;
      link.download = "qrcode.png";
      link.click();
    });
  };

  const handleUpdate = (index) => {
    const entryToEdit = formData[index];
    setComponent(entryToEdit.component);
    setDate(entryToEdit.date);
    setItems(entryToEdit.items);
    setEditingIndex(index);
    openPopup();
  };

  const handleDelete = (index) => {
    const entryToDelete = formData[index];

    if (!entryToDelete || !entryToDelete._id) {
      console.error("Invalid entry or missing ID");
      return;
    }

    axios
      .delete(
        `qr-management-system-api.vercel.app/formdata/${entryToDelete._id}`
      ) // Ensure correct endpoint
      .then(() => {
        // Remove the entry from the state only after successful deletion from the backend
        const updatedData = formData.filter((_, i) => i !== index);
        setFormData(updatedData);
      })
      .catch((error) => {
        console.error(
          "Error deleting data:",
          error.response ? error.response.data : error.message
        );
      });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.src = e.target.result;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

        if (qrCode) {
          setScannedData(qrCode.data); // Store the scanned data
          const updatedData = formData.map((entry) =>
            entry.qrCodeValue === qrCode.data
              ? {
                  ...entry,
                  status: "Delivered",
                  dispatchDate: new Date().toLocaleDateString(),
                }
              : entry
          );
          setFormData(updatedData);
          axios
            .put(
              `qr-management-system-api.vercel.app/formdata/status/${qrCode.data}`,
              {
                status: "Delivered",
                dispatchDate: new Date().toLocaleDateString(),
              }
            )
            .catch((error) => {
              console.error("Error updating status:", error);
            });
        } else {
          alert("No QR code found in the image");
        }
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="flex justify-between p-4 bg-gray-100">
        <div className="text-blue-900 text-xl font-bold">
          Inventory Management System
        </div>
        <div className="">
          <button
            onClick={openPopup}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            QR Code Generator
          </button>
          <button
            onClick={() => setShowScan(true)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Scan QR Code
          </button>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            LogOut
          </button>
        </div>
      </div>

      {/* QR Image Upload Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Upload QR Code Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4"
        />
        {/* {scannedData && (
          <p className="text-green-600">Scanned Data: {scannedData}</p>
        )} */}
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-96 relative">
            <h2 className="text-xl font-bold mb-4">
              {editingIndex !== null
                ? "Edit QR Code"
                : "QR Code Generator Form"}
            </h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2">
                Component:
                <select
                  value={component}
                  onChange={(e) => setComponent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                >
                  <option value="" disabled>
                    Select a component
                  </option>
                  <option value="C1">Component 1</option>
                  <option value="C2">Component 2</option>
                  <option value="C3">Component 3</option>
                  <option value="C4">Component 4</option>
                  <option value="C5">Component 5</option>
                </select>
              </label>
              <label className="block mb-2">
                Date:
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={today}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                />
                {date && new Date(date) > new Date(today) && (
                  <p className="text-red-500">
                    Error: Please select a date before today.
                  </p>
                )}
              </label>
              <label className="block mb-2">
                Number of Items:
                <input
                  type="number"
                  placeholder="Enter number of items"
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                />
              </label>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {editingIndex !== null ? "Update QR Code" : "Generate QR Code"}
              </button>
            </form>
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              X
            </button>
          </div>
        </div>
      )}

      {/* Scan QR Code Section */}
      {showScan && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-96 relative">
            <h2 className="text-xl font-bold mb-4">Scan QR Code</h2>
            <QrReader
              delay={300} // Reduce delay for faster scanning
              facingMode="environment" // Use the rear camera by default for mobile devices
              onResult={(result, error) => {
                if (result) {
                  setScannedData(result?.text);
                  const updatedData = formData.map((entry) =>
                    entry.qrCodeValue === result?.text
                      ? {
                          ...entry,
                          status: "Delivered",
                          dispatchDate: new Date().toLocaleDateString(),
                        }
                      : entry
                  );
                  setFormData(updatedData);
                  axios
                    .put(
                      `http://localhost:4000/formdata/status/${result?.text}`,
                      {
                        status: "Delivered",
                        dispatchDate: new Date().toLocaleDateString(),
                      }
                    )
                    .catch((error) => {
                      console.error("Error updating status:", error);
                    });
                }
                if (error) {
                  console.error("QR Scan Error:", error);
                }
              }}
              style={{ width: "100%" }}
            />
            <button
              onClick={() => setShowScan(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              X
            </button>
          </div>
        </div>
      )}

      {/* Display Table with Submitted Data */}
      {formData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Submitted Data</h2>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Component</th>
                <th className="py-2 px-4 border-b">Date Received</th>
                <th className="py-2 px-4 border-b">Date Dispatch</th>
                <th className="py-2 px-4 border-b">Items</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">QR Code</th>
                <th className="py-2 px-4 border-b">Admin Panel</th>
              </tr>
            </thead>
            <tbody>
              {formData.map((entry, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{entry.component}</td>
                  <td className="py-2 px-4 border-b">{entry.date}</td>
                  <td className="py-2 px-4 border-b">
                    {entry.dispatchDate || "-"}
                  </td>
                  <td className="py-2 px-4 border-b">{entry.items}</td>
                  <td className="py-2 px-4 border-b">{entry.status}</td>
                  <td className="py-2 px-4 border-b">
                    <div
                      onClick={() => downloadQRCode(entry.qrCodeValue)}
                      style={{ cursor: "pointer" }}
                    >
                      <QRCode value={entry.qrCodeValue} size={100} />
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleUpdate(index)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default Dashboard;
