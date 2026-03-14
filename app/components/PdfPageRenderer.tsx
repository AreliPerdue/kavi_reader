"use client";

import { useRef, useEffect } from "react";

const SCALE = 1.5;

export function PdfPageRenderer({ pdfDoc, pageNum, twoPage, viewMode, goPrev, goNext }: any) {
  const canvasRefLeft = useRef<HTMLCanvasElement>(null);
  const canvasRefRight = useRef<HTMLCanvasElement>(null);

  const clearCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const renderPage = async (
    num: number,
    pdf: any,
    canvasEl: HTMLCanvasElement | null,
    scale = SCALE
  ) => {
    if (!pdf || !canvasEl) return;

    const page = await pdf.getPage(num);
    const viewport = page.getViewport({ scale });
    const context = canvasEl.getContext("2d");
    if (!context) return;

    canvasEl.height = viewport.height;
    canvasEl.width = viewport.width;

    // 👇 Cancela render previo si existe
    if ((canvasEl as any)._renderTask) {
      (canvasEl as any)._renderTask.cancel();
    }

    const renderTask = page.render({ canvasContext: context, viewport });
    (canvasEl as any)._renderTask = renderTask;

    try {
      await renderTask.promise;
    } catch {
      // ignorar si fue cancelado
    } finally {
      (canvasEl as any)._renderTask = null;
    }
  };

  const renderSpread = async (startPage: number, pdf: any) => {
    if (!twoPage) {
      await renderPage(startPage, pdf, canvasRefLeft.current);
      return;
    }

    if (startPage === 1) {
      await renderPage(1, pdf, canvasRefRight.current);
      return;
    }

    await renderPage(startPage, pdf, canvasRefLeft.current);

    if (startPage + 1 <= pdf.numPages) {
      await renderPage(startPage + 1, pdf, canvasRefRight.current);
    }
  };

  // Kindle mode render
  useEffect(() => {
    if (!pdfDoc || viewMode !== "kindle") return;
    clearCanvas(canvasRefLeft.current);
    clearCanvas(canvasRefRight.current);

    const render = async () => {
      await renderSpread(pageNum, pdfDoc);
    };
    render();
  }, [pdfDoc, pageNum, twoPage, viewMode]);

  // Preview mode render
  useEffect(() => {
    if (!pdfDoc || viewMode !== "preview") return;

    const renderAll = async () => {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const canvasEl = document.getElementById(`preview-${i}`) as HTMLCanvasElement;
        if (canvasEl) {
          await renderPage(i, pdfDoc, canvasEl, 1.2); // preview con escala más pequeña
        }
      }
    };

    renderAll();
  }, [pdfDoc, viewMode]);

  return (
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
              id={`preview-${i + 1}`}
              key={i}
              style={{
                marginBottom: "1rem",
                border: "1px solid #ccc",
              }}
            />
          ))}
        </div>
      )}

      {viewMode === "kindle" && pdfDoc && (
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            maxWidth: "90%",
            margin: "0 auto",
          }}
        >
          {twoPage && pageNum > 1 && (
            <div style={{ position: "relative" }}>
              <canvas ref={canvasRefLeft} style={{ border: "1px solid #ccc" }} />
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
            </div>
          )}

          <div style={{ position: "relative" }}>
            <canvas ref={twoPage ? canvasRefRight : canvasRefLeft} style={{ border: "1px solid #ccc" }} />
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
        </div>
      )}
    </div>
  );
}
