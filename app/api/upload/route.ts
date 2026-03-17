import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  console.log("UPLOAD API HIT");

  try {
    // ✅ Get file from formData (NOT JSON)
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("❌ No file uploaded");
      return new Response("No file uploaded", { status: 400 });
    }

    console.log("📄 FILE:", file.name);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `${Date.now()}-${file.name}`;

    console.log("⬆️ Uploading to R2...");

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const url = `${process.env.R2_PUBLIC_URL}/${fileName}`;

    console.log("✅ UPLOAD SUCCESS:", url);

    // ✅ ONLY return URL
    return Response.json({ url });

  } catch (err) {
    console.error("❌ Upload error:", err);
    return new Response("Upload failed", { status: 500 });
  }
}