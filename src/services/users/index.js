import express from "express";
import createError from "http-errors";
import userModel from "./model.js";
import productModel from "../products/models.js";
import cartModel from "./cartModel.js";

const userRouter = express.Router();

userRouter.post("/", async (req, res, next) => {
  try {
    const user = await userModel.create(req.body);
    res.send(user);
  } catch (err) {
    next(err);
  }
});

userRouter.get("/", async (req, res, next) => {
  try {
    const user = await userModel.find();
    res.send(user);
  } catch (err) {
    next(err);
  }
});

userRouter.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (user) {
      res.send(user);
    } else {
      next(createError(404, `User with id ${userId} not found!`));
    }
  } catch (err) {
    next(err);
  }
});

userRouter.put("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });
    if (user) {
      res.send(user);
    } else {
      next(createError(404, `User with id ${userId} not found!`));
    }
  } catch (err) {
    next(err);
  }
});

userRouter.delete("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findByIdAndDelete(userId);
    if (user) {
      res.send({ message: "User deleted successfully!" });
    } else {
      next(createError(404, `User with id ${userId} not found!`));
    }
  } catch (err) {
    next(err);
  }
});

userRouter.post("/:userId/cart", async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const user = await userModel.findById(req.params.userId);

    if (!user) {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }

    const product = await productModel.findById(productId);
    if (!product) {
      next(createError(404, `Product with id ${productId} not found!`));
    }

    const isProductInCart = await cartModel.findOne({
      userId: req.params.userId,
      "products.productId": productId,
    });
    if (isProductInCart) {
      // update quantity
      const updateCart = await cartModel.findOneAndUpdate(
        {
          userId: req.params.userId,
          "products.productId": productId,
        },
        {
          $inc: {
            "products.$.quantity": quantity,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
      res.send(updateCart);
    } else {
      const modifiedCart = await cartModel.findOneAndUpdate(
        { userId: req.params.userId },
        { $push: { products: { productId: productId, quantity } } },
        { new: true, upsert: true }
      );
      console.log(modifiedCart);
      res.send(modifiedCart);
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

userRouter.get("/:userId/cart", async (req, res, next) => {
  try {
    const user = await cartModel.findOne({ userId: req.params.userId });
    if (user) {
      res.send(user);
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (err) {
    next(err);
  }
});

userRouter.delete("/:userId/cart/:productId", async (req, res, next) => {
  try {
    const user = await cartModel.findOneAndUpdate(
      { userId: req.params.userId },
      { $pull: { products: { productId: req.params.productId } } },
      { new: true }
    );
    if (user) {
      res.send(user);
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (err) {
    next(err);
  }
});

export default userRouter;
