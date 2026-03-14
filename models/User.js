import mongoose from "mongoose";

const PdfSchema = new mongoose.Schema({
  fileId: mongoose.Schema.Types.ObjectId, // referencia en GridFS
  name: String,
  uploadedAt: { type: Date, default: Date.now },
  lastPageRead: { type: Number, default: 1 },
  viewMode: { type: String, default: "kindle" }
});

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  pdfs: [PdfSchema]
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
