import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import productRouter from "./services/products/index.js";
import reviewRouter from "./services/reviews/index.js";
import userRouter from "./services/users/index.js";
import {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler
} from "./errorHandlers.js";

const server = express();
const port = process.env.PORT || 3001;

//MIDDLEWARES

server.use(express.json());
server.use(cors());

//ROUTES
server.use("/products", productRouter);
server.use("/reviews", reviewRouter);
server.use("/users", userRouter);

//ERROR HANDLER
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_CONNECTION_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected to mongoDB");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server running on port ${port}`);
  });
});

server.on("error", (err) => {
  console.log("CONTROLLED ERROR", err);
});
