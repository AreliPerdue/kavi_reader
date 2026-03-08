export function PdfNavigation({ pageNum, setPageNum, pdfDoc, twoPage }: any) {
  const goPrev = () => {
    if (!pdfDoc) return;
    let newPage = twoPage ? Math.max(pageNum - 2, 1) : Math.max(pageNum - 1, 1);
    setPageNum(newPage);
  };

  const goNext = () => {
    if (!pdfDoc) return;
    let newPage = twoPage
      ? pageNum === 1 ? 2 : pageNum + 2
      : pageNum + 1;
    if (newPage <= pdfDoc.numPages) setPageNum(newPage);
  };

  return { goPrev, goNext };
}
