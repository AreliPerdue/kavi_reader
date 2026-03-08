import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export function usePdfDocument() {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    const savedFile = localStorage.getItem("pdfFile");
    if (savedFile) {
      const { data } = JSON.parse(savedFile);
      (async () => {
        const pdf = await pdfjsLib.getDocument({
          data: new Uint8Array(data),
        }).promise;
        setPdfDoc(pdf);
      })();
    }
  }, []);

const loadFile = async (file: File) => {
  const reader = new FileReader();
  reader.onload = async () => {
    if (!reader.result) return;

    const arrayBuffer = reader.result as ArrayBuffer;
    const uint8Array = new Uint8Array(arrayBuffer); // 👈 conviertes aquí

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    setPdfDoc(pdf);
    setFileName(file.name);

    // Guardar archivo en localStorage
    localStorage.setItem(
      "pdfFile",
      JSON.stringify({
        name: file.name,
        data: Array.from(uint8Array), // 👈 ya convertido, no se detacha
      })
    );
  };

  reader.readAsArrayBuffer(file);
};


  return { pdfDoc, fileName, loadFile };
}
