const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/BlogPost", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const emailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
});

const Email = mongoose.model("Email", emailSchema);

// POST: Subscribe to Newsletter
app.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const existingEmail = await Email.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already subscribed" });
    }
    
    const newEmail = new Email({ email });
    await newEmail.save();
    res.status(201).json({ message: "Subscribed successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// GET: Fetch all subscribed emails
app.get("/subscribers", async (req, res) => {
  try {
    const subscribers = await Email.find();
    res.status(200).json(subscribers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

