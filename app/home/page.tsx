"use client";

import React, { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Poiret_One, Moirai_One } from "next/font/google";
import NewBookForm from "../components/NewBookForm";

const poiret = Poiret_One({ weight: "400", subsets: ["latin"] });
const morai = Moirai_One({ weight: "400", subsets: ["latin"] });

interface Book {
  _id?: string;
  coverUrl?: string | null;
  title?: string | null;
  pdfUrl?: string | null;
}

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        marginTop: "1rem",
        padding: "10px 20px",
        backgroundColor: "#e74c3c",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  );
}

interface NewBookButtonProps {
  coverUrl?: string | null;
  title?: string | null;
  onClick: () => void;
}

function NewBookButton({ coverUrl, title, onClick }: NewBookButtonProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <button
        onClick={onClick}
        style={{
          width: "150px",
          height: "220px",
          backgroundColor: "#222",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt="Book cover"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span style={{ color: "#fff", fontSize: "48px" }}>+</span>
        )}
      </button>

      <div
        style={{
          marginTop: "0.4rem",
          color: "#ddd",
          fontSize: "15px",
          textAlign: "center",
          maxWidth: "150px",
        }}
      >
        {title ?? "New book"}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: session } = useSession();

  const [books, setBooks] = React.useState<Book[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);

  useEffect(() => {
    // 🔥 wait for session
    if (!session?.user?.email) return;

    const userEmail = session.user.email.toLowerCase();

    console.log("📥 FETCHING FOR USER:", userEmail);

    fetch("/api/books", {
      headers: {
        "user-id": userEmail, // 🔥 MUST MATCH BACKEND
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          console.error("❌ FETCH ERROR:", errText);
          throw new Error("Failed to fetch books");
        }

        const text = await res.text();
        if (!text) return [];

        return JSON.parse(text);
      })
      .then((data) => {
        console.log("📚 BOOKS RECEIVED:", data);

        const formatted = data.map((b: any) => ({
          _id: b._id,
          coverUrl: b.frontCover,
          title: b.title,
          pdfUrl: b.pdfUrl,
        }));

        setBooks(formatted);
      })
      .catch((err) => console.error("❌ Error fetching books:", err));
  }, [session]); // 🔥 IMPORTANT

  const handleBookAdded = (book: any) => {
    setBooks((prev) => [
      ...prev,
      {
        coverUrl: book.frontCover ?? null,
        title: book.title ?? "Untitled",
        pdfUrl: book.pdfUrl ?? null,
      },
    ]);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff" }}>

      <header style={{ display: "grid", gridTemplateColumns: "auto 1fr auto 60px", padding: "1rem" }}>
        <div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span className={morai.className} style={{ fontSize: "50px" }}>KAVI</span>
            <span className={poiret.className} style={{ fontSize: "40px" }}>Reader</span>
          </div>
          <div className={poiret.className}>
            {`Nice to see you back, ${session?.user?.name ?? "Guest"}`}
          </div>
        </div>
      </header>

      {!selectedBook ? (
        <main style={{ padding: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, 150px)", gap: "1.5rem" }}>
          {books.map((book, index) => (
            <NewBookButton
              key={index}
              coverUrl={book.coverUrl}
              title={book.title}
              onClick={() => {
              console.log("OPENING BOOK:", book);
              setSelectedBook(book);
}}
            />
          ))}

          <NewBookButton
            coverUrl={null}
            title="New book"
            onClick={() => setShowForm(true)}
          />
        </main>
      ) : (
        <div style={{ padding: "1rem", height: "100vh" }}>
          <button onClick={() => setSelectedBook(null)}>← Back</button>
          <iframe src={selectedBook.pdfUrl || ""} width="100%" height="90%" />
        </div>
      )}

      {showForm && (
        <NewBookForm
          onClose={() => setShowForm(false)}
          onBookAdded={handleBookAdded}
        />
      )}

      <LogoutButton />
    </div>
  );
}