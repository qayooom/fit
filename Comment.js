// const express = require("express");
// const mongoose = require("mongoose");
// const app = express();
// const port = 2000;
// const cors = require("cors");
// app.use(cors());
// app.use(express.json()); 

// mongoose
//   .connect("mongodb://localhost:27017/BlogPost", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("Failed to connect to MongoDB", err));

// // Define the Comment Schema
// const CommentSchema = new mongoose.Schema({
//   Name: { type: String, required: true },
//   Phone: { type: String, required: true },
//   Email: { type: String, required: true },
//   Comment: { type: String, required: true },
// });

// const Comment = mongoose.model("Comment", CommentSchema); 


// app.post("/comment", async (req, res) => {
//   const { Name, Phone, Email, Comment: commentText } = req.body;

//   try {
//     const comment = new Comment({ Name, Phone, Email, Comment: commentText });
//     await comment.save();
//     res.status(201).json({ message: "Comment added successfully!" });
//   } catch (error) {
//     res.status(400).json({ error: "Failed to add comment" });
//   }
// });
// app.get("/comments", async (req, res) => {
//     try {
//       const comments = await Comment.find();
//       res.status(200).json(comments); 
//     } catch (error) {
//       res.status(500).json({ error: "Failed to fetch comments" });
//     }
//   });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
