import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("KAVI_Reader"); // tu base de datos
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      ok: true,
      collections,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: (error as Error).message,
    });
  }
}
