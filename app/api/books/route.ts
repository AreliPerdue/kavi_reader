import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// ==========================
// ✅ GET BOOKS (by user)
// ==========================
export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("kavi");

    // 🔥 Get userId from headers
    const userId = req.headers.get("user-id");

    if (!userId) {
      return NextResponse.json([]);
    }

    const books = await db
      .collection("books")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(books);
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ==========================
// ✅ SAVE BOOK
// ==========================
export async function POST(req: Request) {
  try {
    const body = await req.json();

// 🔥 ADD THIS RIGHT HERE
console.log("USER ID RECEIVED:", body.userId);
    const client = await clientPromise;
    const db = client.db("kavi");

    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "No userId" },
        { status: 401 }
      );
    }

    const collection = db.collection("books");

    // 🔥 DUPLICATE CHECK
    const existingBook = await collection.findOne({
      userId,
      title: body.title,
      author: body.author,
      numPages: body.numPages,
    });

    if (existingBook) {
      return NextResponse.json(
        { error: "Book already exists" },
        { status: 400 }
      );
    }

    // 🔥 AUTO BOOK NUMBER
    const count = await collection.countDocuments({ userId });

    const newBook = {
      ...body,
      userId,
      bookNumber: count + 1,
      createdAt: new Date(),
    };

    await collection.insertOne(newBook);

    return NextResponse.json(newBook);

  } catch (error) {
    console.error("POST ERROR:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}