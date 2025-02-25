const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

require('dotenv').config();
var nodemailer = require('nodemailer');

const port=process.env.PORT ||2000;  
// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
const mongoURL =process.env.DB_URL
mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));



// Define the BlogPost Schema
const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
});
const Blogpost = mongoose.model("Blog", blogPostSchema);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/"); // Save uploaded files to 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
//// USer model
const userSchma = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  img: { type: String, required: false },
  country: { type: String, required: false },
  password: { type: String, required: false },
});
const User = mongoose.model("user", userSchma);
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpeg, .jpg, or .png files are allowed!"));
    }
  },
});

// API to add a new blog post
app.post("/addblog", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required!" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required!" });
    }

    const imagePath = `http://localhost:${port}/uploads/${req.file.filename}`;

    const blog = new Blogpost({
      title,
      image: imagePath,
      description,
    });

    const savedBlog = await blog.save();

    res.status(201).json({
      message: "Blog post created successfully",
      data: savedBlog,
    });
  } catch (error) {
    console.error("Error saving blog post:", error);
    res.status(500).json({ message: "Failed to save blog post", error: error.message });
  }
});

// API to fetch all blogs
app.get("/getblogs", async (req, res) => {
  try {
    const blogs = await Blogpost.find();
    res.status(200).json({ message: "Blogs fetched successfully", data: blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Failed to fetch blogs", error: error.message });
  }
});

// Define the Comment Schema
const CommentSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Phone: { type: String, required: true },
  Email: { type: String, required: true },
  Comment: { type: String, required: true },
  approved: { type: Number, required: true },
  blogid: { type: String, required: true },
});

const Comment = mongoose.model("Comment", CommentSchema);

// API to add a comment
app.post("/comment", async (req, res) => {
  const { Name, Phone, Email, Comment: commentText, blogid } = req.body;

  try {
    const comment = new Comment({ Name, Phone, Email, Comment: commentText, blogid, approved: 0 });
    await comment.save();
    res.status(201).json({ message: "Comment added successfully!" });
  } catch (error) {
    res.status(400).json({ error: "Failed to add comment" });
  }
});

// API to fetch all comments
app.get("/comments", async (req, res) => {
  try {
    const comments = await Comment.find();
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});
app.put("/update-approval", async (req, res) => {
  try {
    
    var {approved,commentId} = req.body;


    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { approved: approved },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json({ message: "Comment approved successfully", updatedComment });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/get-approved-comments/:blogid", async (req, res) => {
  try {
    const { blogid } = req.params;

    // Find all comments where blogid matches and approved is 1
    const comments = await Comment.find({
      blogid: blogid,
      approved: 1
    });

    if (comments.length === 0) {
      return res.status(404).json({ message: "No approved comments found for this blog" });
    }

    res.json({ message: "Approved comments fetched successfully", comments });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
// API to add a user
app.post("/adduser", async (req, res) => {
  const { email, name, img,password,country } = req.body;

  try {
    const user = new User({ name, email, img,password,country });
    await user.save();
    res.status(201).json({ message: "user added successfully!" });
  } catch (error) {
    res.status(400).json({ error: "Failed to add user" });
  }
});

// Get User API 
app.get("/users", async (req, res) => {
  try {
    const users = await User.find(); 
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
// Express Route to Delete Blog by ID
app.delete("/deleteblog/:id", async (req, res) => { // Add :id in the URL path
  const { id } = req.params; // Access the ID from the URL parameter

  try {
    const deletedBlog = await Blogpost.findByIdAndDelete(id); // Delete the blog using the ID
    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ error: "Failed to delete blog" });
  }
});

// Newsletter
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
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  resetCode: String,
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Code expires in 5 minutes
});

const forget = mongoose.model("forget", UserSchema);

// Function to generate a random 4-digit code
function getCode() {
  return `${Math.floor(Math.random() * 10000)}`.padStart(4, "0");
}

// Forget Password Route
app.post("/forgetpassword", async (req, res) => {
  try {
    let { email } = req.body;
    let code = getCode();

    // Upsert (Insert or Update) in MongoDB
    await forget.findOneAndUpdate(
      { email: email },
      { resetCode: code, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Email Configuration
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "marmeting@gmail.com",
        pass: "lulg vztu tzhu lyfk",
      },
    });

    var mailOptions = {
      from: "marmeting@gmail.com",
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${code}`,
    };

    // Send Email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Email sending failed" });
      } else {
        console.log("Email sent: " + info.response);
        return res.json({ message: "Reset code sent successfully" });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});