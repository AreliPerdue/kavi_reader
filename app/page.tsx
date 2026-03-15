"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Poiret_One, Moirai_One } from "next/font/google";
import NewBookForm from "./components/NewBookForm";

const poiret = Poiret_One({ weight: "400", subsets: ["latin"] });
const morai = Moirai_One({ weight: "400", subsets: ["latin"] });

interface Book {
  coverUrl?: string | null;
  title?: string | null;
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
        style={{
          width: "150px",
          height: "220px",
          backgroundColor: "#222",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#444")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#222")}
        onClick={onClick}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt="Book cover"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ color: "#fff", fontSize: "48px" }}>+</span>
        )}
      </button>

      <div style={{ marginTop: "0.5rem", color: "#fff", fontSize: "16px" }}>
        {title ?? "New book"}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  
  const [books, setBooks] = React.useState<Book[]>([{ coverUrl: null, title: null }]);
  const [showForm, setShowForm] = React.useState(false);

  const handleNewBookClick = (index: number) => {
    setShowForm(true);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff" }}>
      {/* HEADER */}
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto 60px",
          alignItems: "center",
          width: "100%",
          maxWidth: "100vw",
          boxSizing: "border-box",
          overflowX: "hidden",
          padding: "1rem",
          backgroundColor: "#000",
          borderBottom: "1px solid #333",
          gap: "1rem",
        }}
      >
        {/* Columna 1: Logo + Greeting */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span className={morai.className} style={{ fontSize: "50px", fontWeight: "bold" }}>
              KAVI
            </span>
            <span className={poiret.className} style={{ fontSize: "40px" }}>
              Reader
            </span>
          </div>
          <div className={poiret.className} style={{ fontSize: "15px", color: "#ccc" }}>
            {`Nice to see you back, ${session?.user?.name ?? "Guest"}`}
          </div>
        </div>

        {/* Columna 2: Search bar */}
        <div style={{ position: "relative", width: "100%", maxWidth: "600px" }}>
          <span
            style={{
              position: "absolute",
              left: "1rem",
              top: "0.9rem",
              color: "#aaa",
              fontSize: "20px",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search..."
            style={{
              width: "100%",
              padding: "0.8rem 1rem 0.8rem 3rem",
              borderRadius: "9999px",
              backgroundColor: "#111",
              color: "#fff",
              fontSize: "16px",
              border: "none",
              outline: "none",
            }}
          />
        </div>

        {/* Columna 3: Favoritos */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <button
              key={i}
              style={{
                width: "45px",
                height: "45px",
                backgroundColor: "#222",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#fff",
                fontSize: "28px",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#444")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#222")}
              onClick={() => console.log(`Abrir menú de selección para slot ${i + 1}`)}
            >
              +
            </button>
          ))}
        </div>

        {/* Columna 4: Hamburguesa */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <span style={{ width: "25px", height: "4px", backgroundColor: "#fff" }}></span>
              <span style={{ width: "25px", height: "4px", backgroundColor: "#fff" }}></span>
              <span style={{ width: "25px", height: "4px", backgroundColor: "#fff" }}></span>
              <span style={{ width: "25px", height: "4px", backgroundColor: "#fff" }}></span>
            </div>
          </button>
        </div>
      </header>

      {/* SECCIÓN DEBAJO DEL HEADER */}
      <main style={{ padding: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {books.map((book, index) => (
          <NewBookButton
            key={index}
            coverUrl={book.coverUrl}
            title={book.title}
            onClick={() => handleNewBookClick(index)}
          />
        ))}
      </main>

      {/* MODAL DEL FORMULARIO */}
      {showForm && <NewBookForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
