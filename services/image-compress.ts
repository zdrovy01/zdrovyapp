// Compress / resize an image file in the browser using a canvas.
// Returns a JPEG data URL kept under `maxBytes` by shrinking dimensions
// and lowering quality until it fits.

interface CompressOptions {
  maxDimension?: number; // longest edge in px
  maxBytes?: number; // target max size of the resulting data URL
  quality?: number; // initial JPEG quality (0..1)
}

const dataUrlBytes = (dataUrl: string) => {
  const comma = dataUrl.indexOf(",");
  const base64 = dataUrl.slice(comma + 1);
  // base64 length * 3/4 ≈ byte size
  return Math.floor((base64.length * 3) / 4);
};

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxDimension = 1280,
    maxBytes = 3 * 1024 * 1024,
    quality = 0.82,
  } = options;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = objectUrl;
    });

    let { width, height } = img;
    if (width > maxDimension || height > maxDimension) {
      const scale = maxDimension / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return await fileToDataUrl(file);
    ctx.drawImage(img, 0, 0, width, height);

    // Reduce quality until it fits under maxBytes (floor at 0.4)
    let q = quality;
    let dataUrl = canvas.toDataURL("image/jpeg", q);
    while (dataUrlBytes(dataUrl) > maxBytes && q > 0.4) {
      q -= 0.1;
      dataUrl = canvas.toDataURL("image/jpeg", q);
    }

    // Still too big? Shrink dimensions once more and retry.
    if (dataUrlBytes(dataUrl) > maxBytes) {
      canvas.width = Math.round(width * 0.7);
      canvas.height = Math.round(height * 0.7);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    }

    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
