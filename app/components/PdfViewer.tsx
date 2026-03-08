"use client";

import { useState, useRef, useEffect } from "react";

export default function PdfViewer() {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [viewMode, setViewMode] = useState<"preview" | "kindle">("kindle");
  const [twoPage, setTwoPage] = useState(false);

  const canvasRefLeft = useRef<HTMLCanvasElement>(null);
  const canvasRefRight = useRef<HTMLCanvasElement>(null);

  const renderTaskRefLeft = useRef<any>(null);
  const renderTaskRefRight = useRef<any>(null);

  const renderPage = async (
    num: number,
    pdf: any,
    canvasEl: HTMLCanvasElement | null,
    renderTaskRef: React.MutableRefObject<any>
  ) => {
    if (!pdf || !canvasEl) return;

    if (renderTaskRef.current) {
      try {
        await renderTaskRef.current.promise;
      } catch {}
      renderTaskRef.current = null;
    }

    const page = await pdf.getPage(num);
    const viewport = page.getViewport({ scale: 1.5 });

    const context = canvasEl.getContext("2d");
    if (!context) return;

    canvasEl.height = viewport.height;
    canvasEl.width = viewport.width;

    const renderTask = page.render({
      canvasContext: context,
      viewport,
    });

    renderTaskRef.current = renderTask;

    try {
      await renderTask.promise;
    } catch {}
    finally {
      renderTaskRef.current = null;
    }
  };

  const renderSpread = async (startPage: number, pdf: any) => {
    if (!twoPage) {
      await renderPage(startPage, pdf, canvasRefLeft.current, renderTaskRefLeft);
      return;
    }

    if (startPage === 1) {
      await renderPage(1, pdf, canvasRefRight.current, renderTaskRefRight);
      if (canvasRefLeft.current) {
        const ctx = canvasRefLeft.current.getContext("2d");
        ctx?.clearRect(
          0,
          0,
          canvasRefLeft.current.width,
          canvasRefLeft.current.height
        );
      }
      return;
    }

    await renderPage(startPage, pdf, canvasRefLeft.current, renderTaskRefLeft);

    if (startPage + 1 <= pdf.numPages) {
      await renderPage(
        startPage + 1,
        pdf,
        canvasRefRight.current,
        renderTaskRefRight
      );
    }
  };

  const renderPreviewPage = async (
    num: number,
    canvasEl: HTMLCanvasElement | null
  ) => {
    if (!pdfDoc || !canvasEl) return;

    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: 1.2 });

    const context = canvasEl.getContext("2d");
    if (!context) return;

    canvasEl.height = viewport.height;
    canvasEl.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
  };

  useEffect(() => {
    if (!pdfDoc) return;

    const render = async () => {
      await renderSpread(pageNum, pdfDoc);
    };

    render();
  }, [pdfDoc, pageNum, twoPage]);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type === "application/pdf") {
      const reader = new FileReader();

      reader.onload = async () => {
        if (!reader.result) return;

        const pdfjsLib = await import("pdfjs-dist");

        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjsLib.getDocument({
          data: reader.result as ArrayBuffer,
        }).promise;

        setPdfDoc(pdf);
        setPageNum(1);
      };

      reader.readAsArrayBuffer(uploadedFile);
    }
  };

  const goPrev = () => {
    if (!pdfDoc) return;

    let newPage = pageNum;

    if (twoPage) {
      if (pageNum === 1) return;
      newPage = pageNum - 2;
      if (newPage < 1) newPage = 1;
    } else {
      newPage = pageNum - 1;
      if (newPage < 1) newPage = 1;
    }

    setPageNum(newPage);
  };

  const goNext = () => {
    if (!pdfDoc) return;

    let newPage = pageNum;

    if (twoPage) {
      if (pageNum === 1) newPage = 2;
      else newPage = pageNum + 2;
    } else {
      newPage = pageNum + 1;
    }

    if (newPage > pdfDoc.numPages) return;

    setPageNum(newPage);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Interactive Reader Prototype</h2>

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

      <div style={{ marginTop: "1rem" }}>
        {viewMode === "preview" && pdfDoc && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflowY: "scroll",
              maxHeight: "80vh",
            }}
          >
            {Array.from({ length: pdfDoc.numPages }, (_, i) => (
              <canvas
                key={i}
                ref={(el) => {
                  if (el) renderPreviewPage(i + 1, el);
                }}
                style={{
                  marginBottom: "1rem",
                  border: "1px solid #ccc",
                }}
              />
            ))}
          </div>
        )}

        {viewMode === "kindle" && pdfDoc && (
          <>
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
                maxWidth: "1000px",
                margin: "0 auto",
              }}
            >
              {/* LEFT PAGE */}
              <div style={{ position: "relative" }}>
                <canvas
                  ref={canvasRefLeft}
                  style={{ border: "1px solid #ccc", display: "block" }}
                />

                {twoPage && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "20%",
                      height: "100%",
                      cursor: "pointer",
                    }}
                    onClick={goPrev}
                  />
                )}
              </div>

              {/* RIGHT PAGE */}
              {twoPage && (
                <div style={{ position: "relative" }}>
                  <canvas
                    ref={canvasRefRight}
                    style={{ border: "1px solid #ccc", display: "block" }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "20%",
                      height: "100%",
                      cursor: "pointer",
                    }}
                    onClick={goNext}
                  />
                </div>
              )}

              {!twoPage && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "20%",
                      height: "100%",
                      cursor: "pointer",
                    }}
                    onClick={goPrev}
                  />

                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "20%",
                      height: "100%",
                      cursor: "pointer",
                    }}
                    onClick={goNext}
                  />
                </>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              {twoPage
                ? pageNum === 1
                  ? `Page 1 of ${pdfDoc.numPages}`
                  : `Pages ${pageNum}–${Math.min(
                      pageNum + 1,
                      pdfDoc.numPages
                    )} of ${pdfDoc.numPages}`
                : `Page ${pageNum} of ${pdfDoc.numPages}`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}