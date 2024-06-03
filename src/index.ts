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

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use(express.static(path.join(__dirname, "public")));

app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(req.url, err.message);

  res.status(500).json({
    message: err.message,
  });

  next();
});

// connect to the database
connectToDB();

app.use("/api", mainRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
