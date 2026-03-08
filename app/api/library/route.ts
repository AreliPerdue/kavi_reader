import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId"); // ?userId=testUser

    const client = await clientPromise;
    const db = client.db("KAVI_Reader");

    const query = userId ? { userId } : {};
    const books = await db.collection("library").find(query).toArray();

    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("KAVI_Reader");

    const result = await db.collection("library").insertOne({
      ...body,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, insertedId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message });
  }
}
