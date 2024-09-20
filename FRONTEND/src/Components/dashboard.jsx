import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import QRCodeGenerator from "qrcode";
import ReactQrScanner from "react-qr-scanner";
import axios from "axios";
import jsQR from "jsqr";

function Dashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [formData, setFormData] = useState([]);
  const [component, setComponent] = useState("");
  const [date, setDate] = useState("");
  const [items, setItems] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [scannedData, setScannedData] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);

  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get("https://qr-management-system-api.vercel.app/formdata")
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
    setComponent("");
    setDate("");
    setItems("");
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
      const entryId = formData[editingIndex]._id;
      axios
        .put(`https://qr-management-system-api.vercel.app/formdata/${entryId}`, newEntry)
        .then((response) => {
          const updatedData = [...formData];
          updatedData[editingIndex] = response.data;
          setFormData(updatedData);
          setEditingIndex(null);
          closePopup();
        })
        .catch((error) => {
          console.error("Error updating data:", error);
        });
    } else {
      axios
        .post("https://qr-management-system-api.vercel.app/formdata", newEntry)
        .then((response) => {
          setFormData([...formData, response.data]);
          closePopup();
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
      .delete(`https://qr-management-system-api.vercel.app/formdata/${entryToDelete._id}`)
      .then(() => {
        const updatedData = formData.filter((_, i) => i !== index);
        setFormData(updatedData);
      })
      .catch((error) => {
        console.error("Error deleting data:", error.response ? error.response.data : error.message);
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

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

        if (qrCode) {
          setScannedData(qrCode.data);
          const updatedData = formData.map((entry) =>
            entry.qrCodeValue === qrCode.data
              ? { ...entry, status: "Delivered", dispatchDate: new Date().toLocaleDateString() }
              : entry
          );
          setFormData(updatedData);

          axios
            .put(`https://qr-management-system-api.vercel.app/formdata/status/${qrCode.data}`, {
              status: "Delivered",
              dispatchDate: new Date().toLocaleDateString(),
            })
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
      <div className="flex justify-between items-center p-4 bg-gray-100">
        <div className="text-blue-900 text-lg font-bold">Inventory Management System</div>
        <div className="flex space-x-4">
          <button
            onClick={openPopup}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
        <button
          onClick={handleLogout}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          LogOut
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">Upload QR Code Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4"
        />
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
            <h2 className="text-lg font-bold mb-4">
              {editingIndex !== null ? "Edit QR Code" : "QR Code Generator Form"}
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
                Items Received:
                <input
                  type="number"
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                />
              </label>
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {editingIndex !== null ? "Update" : "Submit"}
                </button>
                <button
                  onClick={closePopup}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8 px-2">
        <h2 className="text-lg font-bold mb-4">QR Codes Table</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Component</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Items</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">QR Code</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formData.map((entry, index) => (
                <tr key={index} className="border">
                  <td className="px-4 py-2 border">{entry.component}</td>
                  <td className="px-4 py-2 border">{entry.date}</td>
                  <td className="px-4 py-2 border">{entry.items}</td>
                  <td className="px-4 py-2 border">{entry.status}</td>
                  <td className="px-4 py-2 border">
                    <QRCode value={entry.qrCodeValue} size={50} />
                    <button
                      onClick={() => downloadQRCode(entry.qrCodeValue)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mt-2"
                    >
                      Download QR Code
                    </button>
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleUpdate(index)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showScan && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-lg font-bold mb-4">Scan QR Code</h2>
            <ReactQrScanner
              delay={300}
              onError={(err) => console.error("Error scanning QR code:", err)}
              onScan={(data) => {
                if (data) {
                  setScannedData(data);
                  setShowScan(false);
                }
              }}
              className="w-full h-auto"
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setShowScan(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
