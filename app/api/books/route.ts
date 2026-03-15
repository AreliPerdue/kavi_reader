import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  console.log("API ROUTE HIT");

  const body = await req.json();

  const client = await clientPromise;

  const db = client.db("KAVI_Reader");

  const result = await db.collection("books").insertOne(body);

  return NextResponse.json({
    success: true,
    id: result.insertedId
  });
}