import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  const client = await clientPromise;
  const db = client.db("tuNombreDeDB"); // cambia por el nombre de tu base
  const data = await req.json();

  const result = await db.collection("books").insertOne({
    ...data,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true, bookId: result.insertedId });
}
