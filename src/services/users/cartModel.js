import mongoose from "mongoose";

const { Schema, model } = mongoose;

const cartSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product"
        },
        quantity: Number
      }
    ]
  },
  {
    timestamps: true
  }
);

export default model("Cart", cartSchema);
