const MAX_DIMENSION_PX = 1600;
const JPEG_QUALITY = 0.75;

export interface CompressedImage {
  base64: string; // no "data:" prefix
  mimeType: string;
}

/**
 * Resizes/re-encodes an uploaded slip image to keep the OCR payload small,
 * using only native canvas APIs (no added dependency). PDFs pass through
 * untouched — Typhoon OCR accepts PDFs directly per the PRD.
 */
export async function compressAndEncodeImage(file: File): Promise<CompressedImage> {
  if (file.type === "application/pdf") {
    return { base64: await fileToBase64(file), mimeType: file.type };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", JPEG_QUALITY)
  );
  return { base64: await fileToBase64(blob), mimeType: "image/jpeg" };
}

function fileToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]); // strip "data:" prefix
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
