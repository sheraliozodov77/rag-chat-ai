import mongoose from "mongoose";

const vectorSchema = new mongoose.Schema({
  url: { type: String, required: true },
  chunkIndex: { type: Number, required: true }, // Add chunkIndex
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  updatedAt: { type: Date, default: Date.now },
});

// Composite unique index for `url` and `chunkIndex`
vectorSchema.index({ url: 1, chunkIndex: 1 }, { unique: true });

export default mongoose.model("Vector", vectorSchema);
