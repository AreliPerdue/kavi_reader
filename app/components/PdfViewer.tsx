"use client";

import { useState } from "react";
import { usePdfDocument } from "./usePdfDocument";
import { PdfNavigation } from "./PdfNavigation";
import { PdfPageRenderer } from "./PdfPageRenderer";

export default function PdfViewer({ userId }: { userId: string }) {
  const { pdfDoc, fileName, fileId, uploadFile } = usePdfDocument(userId);
  const [pageNum, setPageNum] = useState(1);
  const [viewMode, setViewMode] = useState<"preview" | "kindle">("kindle");
  const [twoPage, setTwoPage] = useState(false);

  const { goPrev, goNext } = PdfNavigation({ pageNum, setPageNum, pdfDoc, twoPage });

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) uploadFile(uploadedFile);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <input type="file" onChange={handleFile} />

      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => setViewMode("preview")}>Preview Mode</button>
        <button onClick={() => setViewMode("kindle")}>Kindle Mode</button>
        {viewMode === "kindle" && (
          <button onClick={() => setTwoPage(!twoPage)}>
            {twoPage ? "Single Page" : "Two Pages"}
          </button>
        )}
      </div>

      {pdfDoc && (
        <PdfPageRenderer
          pdfDoc={pdfDoc}
          pageNum={pageNum}
          twoPage={twoPage}
          viewMode={viewMode}
          goPrev={goPrev}
          goNext={goNext}
        />
      )}

      {pdfDoc && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          {twoPage
            ? pageNum === 1
              ? `Page 1 of ${pdfDoc?.numPages}`
              : `Pages ${pageNum}–${Math.min(pageNum + 1, pdfDoc?.numPages)} of ${pdfDoc?.numPages}`
            : `Page ${pageNum} of ${pdfDoc?.numPages}`}
        </div>
      )}

      {fileName && (
        <div style={{ textAlign: "center", marginTop: "0.5rem", fontStyle: "italic" }}>
          {`Currently viewing: ${fileName}`}
        </div>
      )}
    </div>
  );
}
