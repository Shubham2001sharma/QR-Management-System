const mongoose = require('mongoose');

// MongoDB connection
const mongoURL = 'mongodb+srv://sharmashubu4600:18jan2001@qr-management-system.mny3n.mongodb.net/?retryWrites=true&w=majority&appName=QR-Management-System'; // You can update the database name as needed
mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('Failed to connect to MongoDB', err));

// Entry Schema and Model
const entrySchema = new mongoose.Schema({
  component: String,
  date: String,
  items: Number,
  status: String,
  qrCodeValue: String,
  dispatchDate: String,
});

const Entry = mongoose.model('Entry', entrySchema);

// User Schema and Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Export models
module.exports = {
  Entry,
  User
};
