import { connectDB } from "../../lib/db";
import { MongoClient, GridFSBucket } from "mongodb";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  await connectDB();

  const { fileId } = req.query;

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  const bucket = new GridFSBucket(db, { bucketName: "pdfs" });

  const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

  res.setHeader("Content-Type", "application/pdf");
  downloadStream.pipe(res);
}
