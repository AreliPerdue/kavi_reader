import { connectDB } from "../../lib/db";
import { User } from "../../models/User";
import { MongoClient, GridFSBucket } from "mongodb";
import multer from "multer";
import mongoose from "mongoose";

const upload = multer();

export const config = {
  api: {
    bodyParser: false, // necesario para multer
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  await connectDB();

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  const bucket = new GridFSBucket(db, { bucketName: "pdfs" });

  upload.single("file")(req, res, async (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const { userId } = req.body;
    const file = req.file;

    try {
      const uploadStream = bucket.openUploadStream(file.originalname);
      uploadStream.end(file.buffer);

      uploadStream.on("finish", async (uploadedFile) => {
        // Convertimos userId a ObjectId válido
        const objectId = new mongoose.Types.ObjectId(userId);

        await User.findByIdAndUpdate(objectId, {
          $push: {
            pdfs: {
              fileId: uploadedFile._id,
              name: file.originalname,
            },
          },
        });

        res.json({ success: true, fileId: uploadedFile._id });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
