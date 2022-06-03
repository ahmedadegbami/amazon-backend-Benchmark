import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewSchema = new Schema({
  comment: { type: String, required: true },
  rate: { type: Number, max: 5, required: true }, // max 5 stars
});

export default model("Review", reviewSchema);
