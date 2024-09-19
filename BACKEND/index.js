const express = require("express");
const app = express();
const cors = require("cors");
const JWT = require("jsonwebtoken");
const { User, Entry } = require("./model");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Middleware to allow CORS
app.use(
  cors({
    origin: ["https://qr-management-system-frontend-six.vercel.app',"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(bodyParser.json());

//secret key
const JWTSECRETKEY = "shubhamsharma";

app.get("/", (req, res) => {
  res.json("hello");
});

app.post("/registerdata", (req, res) => {
  const { name, email, password } = req.body;

  const newUser = new User({ name, email, password });

  newUser
    .save()
    .then(() =>
      res.status(200).json({ message: "User registered successfully!" })
    )
    .catch((err) =>
      res.status(500).json({ error: "Registration failed", err })
    );
});

app.post("/logindata", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = JWT.sign({ email: email }, JWTSECRETKEY, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/formdata", async (req, res) => {
  try {
    const entries = await Entry.find();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new entry
app.post("/formdata", async (req, res) => {
  try {
    const { component, date, items, status, qrCodeValue, dispatchDate } =
      req.body;
    if (!component || !date || !items || !status || !qrCodeValue) {
      return res.status(400).send("Missing required fields");
    }

    const newEntry = new Entry(req.body);
    await newEntry.save();
    res.status(201).send(newEntry);
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(400).send("Error adding data: " + error.message);
  }
});

// Update an entry
app.put("/formdata/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const result = await Entry.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (result) {
      res.status(200).json(result); // Send updated entry back to client
    } else {
      res.status(404).json({ message: "Data not found" });
    }
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(400).json({ message: "Bad Request", error: error.message });
  }
});

// Update status based on QR code value
app.put("/formdata/status/:qrCodeValue", async (req, res) => {
  const { status, dispatchDate } = req.body;
  try {
    const updatedEntry = await Entry.findOneAndUpdate(
      { qrCodeValue: req.params.qrCodeValue },
      { status, dispatchDate },
      { new: true }
    );
    res.json(updatedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an entry
app.delete("/formdata/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Entry.findByIdAndDelete(id); // Use your correct method to find and delete

    if (result) {
      res.status(200).json({ message: "Data deleted successfully" });
    } else {
      res.status(404).json({ message: "Data not found" });
    }
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(4000, () => {
  console.log("App is running on port 4000");
});
