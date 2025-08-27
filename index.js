import express from "express";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
console.log(__filename);
const __dirname = path.dirname(__filename);
console.log(__dirname);

// Tell Express to serve static files from /public
app.use(express.static(path.join(__dirname, "public")));
const PORT = 8000;

// connect to MongoDB
// mongoose.connect("mongodb://127.0.0.1:27017/node-learning");
// This returns a promise so we can use async await

const dbStart = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/ShortURL"); // returns a promise
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

dbStart();

// setting EJS for server side rendering
// app.set("view engine", "ejs");
// app.set("views", path.resolve("./views"));

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortID: {
      type: String,
      required: true,
      unique: true,
    },
    visitHistory: [
      {
        timestamp: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

const URL = mongoose.model("URL", urlSchema);

// Middle to parse raw JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP routes here

// app.get("/test", async (req, res) => {
//   const allUrls = await URL.find({});
//   return res.render("home", { urls: allUrls });
// });

// Handle GET /
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/shorten", async (req, res) => {
  console.log("Requested URL:", req.url);
  console.log("Method:", req.method);
  console.log("Route params:", req.params);
  console.log("Query params:", req.query);
  console.log("Headers:", req.headers);
  const bodyURL = req.body.url;
  console.log(bodyURL);
  const shortID = nanoid(8);
  console.log(shortID);
  if (!bodyURL) {
    return res.status(400).json({ error: "URL is required" });
  }
  const urlData = await URL.create({
    originalUrl: bodyURL,
    shortID: shortID,
    visitHistory: [],
  });
  console.log(urlData);
  return res.json({ id: shortID });
});

app.get("/url/:shortID", async (req, res) => {
  const shortID = req.params.shortID;
  console.log(shortID);
  const entry = await URL.findOneAndUpdate(
    { shortID },
    {
      $push: {
        visitHistory: { timestamp: Date.now() },
      },
    }
  );
  res.redirect(entry.originalUrl);
});

app.get("/getAnalytics/:shortID", async (req, res) => {
  const shortID = req.params.shortID;
  console.log(shortID);
  const result = await URL.findOne({ shortID });
  return res.json({
    totalclicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
});

// to start the server on port use listen method
app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
