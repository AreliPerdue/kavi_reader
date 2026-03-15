import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
  title: String,
  author: String,
  editorial: String,
  genre: String,
  publishingPlace: String,
  edition: String,
  numPages: Number,
  numChapters: Number,
  frontCover: String,
  spine: String,
  backCover: String,
  frontHex: String,
  spineHex: String,
  backHex: String,
  starRating: Number,
  numericRating: Number,
  synopsis: String,
  pdfUrl: String, // aquí guardas el link al PDF
  userId: mongoose.Schema.Types.ObjectId, // referencia a la librería/cuenta del usuario
}, { timestamps: true });

export default mongoose.models.Book || mongoose.model("Book", BookSchema);
