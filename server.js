const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db/connectDB.js");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes.js");
const postRoutes = require("./routes/postRoutes.js");
const authRouter = require("./routes/authRouter");

const messageRoutes = require("./routes/messageRoutes.js");
const { v2: cloudinary } = require("cloudinary");
const { app, server } = require("./socket/socket.js");
const job = require("./cron/cron.js");
const morgan = require("morgan");
dotenv.config();

connectDB();
job.start();

const PORT = process.env.PORT || 5000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middlewares
app.use(express.json({ limit: "50mb" })); // To parse JSON data in the req.body
app.use(express.urlencoded({ extended: true })); // To parse form data in the req.body
app.use(cookieParser());
app.use(morgan("tiny"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/v1/auth", authRouter);



// http://localhost:5000 => backend,frontend

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  // react app
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
