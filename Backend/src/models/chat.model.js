import mongoose, { Schema } from "mongoose";

const chatMessageSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: "Project" },
  sender: { type: Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
}, { timestamps: true });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);