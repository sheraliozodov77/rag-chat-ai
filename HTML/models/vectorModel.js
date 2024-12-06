import mongoose from "mongoose";

const vectorSchema = new mongoose.Schema({
  url: { type: String, unique: true },
  text: String,
  embedding: [Number],
  updatedAt: { type: Date, default: Date.now },
});

const Vector = mongoose.model("Vector", vectorSchema);

export default Vector;
