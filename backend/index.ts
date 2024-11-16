import express, { Request, Response } from "express";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import { subscriptionRoutes } from "./routes/subscriptionRoutes";
import { transactionRoutes } from "./routes/transactionRoutes";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.send("backend working!!!!");
  console.log("Working");
});

function middleware(req: Request, res: Response, next: any) {
  console.log(req.originalUrl);
  next();
}
app.use(middleware);

app.listen(8080, () => {
  console.log("server running at port : 8080");
});
