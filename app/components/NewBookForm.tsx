"use client";

import React, { useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";

export default function NewBookForm({ onClose }: { onClose: () => void }) {
  const [pdfName, setPdfName] = React.useState<string | null>(null);
  const [numPages, setNumPages] = React.useState<string>("");
  const [frontCover, setFrontCover] = React.useState<string | null>(null);
  const [backCover, setBackCover] = React.useState<string | null>(null);
  const [spine, setSpine] = React.useState<string | null>(null);
  const [starRating, setStarRating] = React.useState<number>(0);
  const [numericRating, setNumericRating] = React.useState<string>("");

  // Estados para HEX
  const [frontHex, setFrontHex] = React.useState<string>("#000000");
  const [spineHex, setSpineHex] = React.useState<string>("#000000");
  const [backHex, setBackHex] = React.useState<string>("#000000");

  useEffect(() => {
    // ✅ Ruta correcta: se sirve como /pdf.worker.js
    GlobalWorkerOptions.workerSrc = "/pdf.worker.js";
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setter?: (url: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (setter) setter(url);

      if (file.type === "application/pdf") {
        setPdfName(file.name);
        try {
          const pdf = await pdfjsLib.getDocument({ url }).promise;
          setNumPages(pdf.numPages.toString());
        } catch (err) {
          console.error("Error leyendo PDF:", err);
        }
      }
    }
  };

  const handleImageClick = (
    e: React.MouseEvent<HTMLImageElement>,
    setter: (hex: string) => void
  ) => {
    const img = e.currentTarget;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const realX = Math.floor(x * scaleX);
    const realY = Math.floor(y * scaleY);

    const pixel = ctx.getImageData(realX, realY, 1, 1).data;
    const hex = `#${[pixel[0], pixel[1], pixel[2]]
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")}`;

    setter(hex);
  };
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "2rem",
          borderRadius: "10px",
          width: "950px",
          maxHeight: "90vh",
          overflowY: "auto",
          color: "#fff",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          display: "grid",
          gridTemplateColumns: "0.8fr 1.2fr",
          gap: "1rem",
        }}
      >
        {/* Upload PDF */}
        <div style={{ gridColumn: "1 / span 2", marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>File name:</label>
          <label
            style={{
              display: "inline-block",
              backgroundColor: "#444",
              color: "#fff",
              padding: "0.6rem 1.2rem",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
          >
            Upload PDF
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileUpload(e)}
              style={{ display: "none" }}
            />
          </label>
          <div style={{ marginTop: "0.5rem" }}>{pdfName ?? "No file selected"}</div>
        </div>

        {/* Metadata */}
        <div>
          {[
            "Title", "Author", "Editorial", "Genre", "Publishing place",
            "Edition", "# of pages", "# of chapters"
          ].map((label, i) => (
            <div key={i} style={{ marginBottom: "0.6rem" }}>
              <label style={{ display: "block", marginBottom: "0.2rem", fontSize: "14px" }}>{label}:</label>
              <input
                type="text"
                value={label === "# of pages" ? numPages : undefined}
                onChange={(e) => label === "# of pages" ? setNumPages(e.target.value) : undefined}
                style={{
                  width: "90%",
                  padding: "0.4rem",
                  borderRadius: "6px",
                  border: "1px solid #444",
                  backgroundColor: "#111",
                  color: "#fff",
                  fontSize: "14px",
                }}
              />
            </div>
          ))}
        </div>

        {/* Columna derecha: portadas */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 40px 2fr", gap: "0.5rem" }}>
        {/* Front cover */}
<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
  {/* Imagen con sampler */}
  {frontCover ? (
    <img
      src={frontCover}
      alt="Front cover"
      style={{ width: "100%", height: "360px", objectFit: "cover", borderRadius: "6px" }}
      onClick={(e) => handleImageClick(e, setFrontHex)}
    />
  ) : (
    <span style={{ fontSize: "32px", color: "#fff" }}>+</span>
  )}

  {/* Botón Upload */}
  <label
    style={{
      display: "inline-block",
      backgroundColor: "#444",
      color: "#fff",
      padding: "0.4rem 0.8rem",
      borderRadius: "6px",
      cursor: "pointer",
      marginTop: "0.5rem",
    }}
  >
    Upload Front
    <input
      type="file"
      accept="image/*"
      style={{ display: "none" }}
      onChange={(e) => handleFileUpload(e, setFrontCover)}
    />
  </label>

  {/* Campo HEX + preview */}
  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
    <input
      type="text"
      value={frontHex}
      onChange={(e) => setFrontHex(e.target.value)}
      style={{
        width: "80%",
        padding: "0.3rem",
        borderRadius: "6px",
        border: "1px solid #444",
        backgroundColor: "#111",
        color: "#fff",
        textAlign: "center",
      }}
    />
    <div
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "4px",
        border: "1px solid #444",
        backgroundColor: frontHex,
      }}
    />
  </div>
</div>


          {/* Spine */}
<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
  {spine ? (
    <img
      src={spine}
      alt="Spine"
      style={{ width: "100%", height: "360px", objectFit: "cover", borderRadius: "6px" }}
      onClick={(e) => handleImageClick(e, setSpineHex)}
    />
  ) : (
    <span style={{ fontSize: "32px", color: "#fff" }}>+</span>
  )}

  <label
    style={{
      display: "inline-block",
      backgroundColor: "#444",
      color: "#fff",
      padding: "0.4rem 0.8rem",
      borderRadius: "6px",
      cursor: "pointer",
      marginTop: "0.5rem",
    }}
  >
    Upload Spine
    <input
      type="file"
      accept="image/*"
      style={{ display: "none" }}
      onChange={(e) => handleFileUpload(e, setSpine)}
    />
  </label>

  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
    <input
      type="text"
      value={spineHex}
      onChange={(e) => setSpineHex(e.target.value)}
      style={{
        width: "80%",
        padding: "0.3rem",
        borderRadius: "6px",
        border: "1px solid #444",
        backgroundColor: "#111",
        color: "#fff",
        textAlign: "center",
      }}
    />
    <div
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "4px",
        border: "1px solid #444",
        backgroundColor: spineHex,
      }}
    />
  </div>
</div>

         {/* Back cover */}
<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
  {backCover ? (
    <img
      src={backCover}
      alt="Back cover"
      style={{ width: "100%", height: "360px", objectFit: "cover", borderRadius: "6px" }}
      onClick={(e) => handleImageClick(e, setBackHex)}
    />
  ) : (
    <span style={{ fontSize: "32px", color: "#fff" }}>+</span>
  )}

  <label
    style={{
      display: "inline-block",
      backgroundColor: "#444",
      color: "#fff",
      padding: "0.4rem 0.8rem",
      borderRadius: "6px",
      cursor: "pointer",
      marginTop: "0.5rem",
    }}
  >
    Upload Back
    <input
      type="file"
      accept="image/*"
      style={{ display: "none" }}
      onChange={(e) => handleFileUpload(e, setBackCover)}
    />
  </label>

  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
    <input
      type="text"
      value={backHex}
      onChange={(e) => setBackHex(e.target.value)}
      style={{
        width: "80%",
        padding: "0.3rem",
        borderRadius: "6px",
        border: "1px solid #444",
        backgroundColor: "#111",
        color: "#fff",
        textAlign: "center",
      }}
    />
    <div
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "4px",
        border: "1px solid #444",
        backgroundColor: backHex,
      }}
    />
  </div>
</div>
        </div>
        
       {/* Rating debajo de las portadas */}
<div style={{ gridColumn: "1 / span 2", marginTop: "0", padding: "0" }}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "2rem",
      justifyContent: "center",
      margin: 0,
      padding: 0,
      lineHeight: "1", // compacta la altura de línea
    }}
  >
    <div style={{ margin: 0, padding: 0 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setStarRating(star)}
          style={{
            fontSize: "32px",
            cursor: "pointer",
            color: starRating >= star ? "#ccc" : "#444",
            margin: 0,
            padding: 0,
            lineHeight: "1",
          }}
        >
          ★
        </span>
      ))}
      <span style={{ marginLeft: "0.5rem", margin: 0, padding: 0, lineHeight: "1" }}>
        {starRating}/5 stars
      </span>
    </div>

    <div style={{ margin: 0, padding: 0 }}>
      <input
        type="text"
        placeholder="e.g. 7.5"
        value={numericRating}
        onChange={(e) => setNumericRating(e.target.value)}
        style={{
          width: "70px",
          padding: "0.3rem",
          borderRadius: "6px",
          border: "1px solid #444",
          backgroundColor: "#111",
          color: "#fff",
          textAlign: "center",
          margin: 0,
          lineHeight: "1",
        }}
      />
      <span style={{ marginLeft: "0.3rem", margin: 0, padding: 0, lineHeight: "1" }}>/10</span>
    </div>
  </div>
</div>


       {/* Sinopsis */}
<div style={{ gridColumn: "1 / span 2", marginTop: "0", padding: "0" }}>
  <label style={{ display: "block", marginBottom: "0.2rem", marginTop: "0", padding: "0", lineHeight: "1" }}>
    Synopsis:
  </label>
  <textarea
    rows={4}
    style={{
      width: "100%",
      padding: "0.5rem",
      borderRadius: "6px",
      border: "1px solid #444",
      backgroundColor: "#111",
      color: "#fff",
      margin: 0,          // elimina margen inferior
      lineHeight: "1.2",  // compacta la altura de línea
      resize: "vertical", // opcional: permite ajustar altura manualmente
    }}
  />
</div>

        {/* Botones */}
        <div
          style={{
            gridColumn: "1 / span 2",
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          <button
            style={{
              backgroundColor: "#444",
              color: "#fff",
              padding: "0.6rem 1.2rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#666")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#444")}
          >
            Add PDF to Library
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#222",
              color: "#fff",
              padding: "0.6rem 1.2rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#444")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#222")}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}