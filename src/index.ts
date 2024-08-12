import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { connectToDB } from "./config/database";
import mainRouter from "./routes/mainRouter";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

// Define the client URL for CORS

// const CLIENT_URL = "http://localhost:5173";
const CLIENT_URL = "https://expense-tracker-client-funs.onrender.com";
// Apply CORS middleware
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Handle preflight requests
app.options(
  "*",
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Other middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "50mb" }));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(req.url, err.message);
  res.status(500).json({ message: err.message });
  next();
});

// Connect to the database
connectToDB();

// Apply the main router
app.use("/api", mainRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
