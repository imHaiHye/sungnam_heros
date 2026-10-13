// Phone photos are several MB each, but localStorage holds about 5 MB in total.
// Downscale and re-encode before storing so dozens of missions can keep a photo.

const MAX_SIDE = 720;
const JPEG_QUALITY = 0.72;

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

/** Returns a JPEG data URL whose longer side is at most MAX_SIDE pixels. */
export async function compressPhoto(file) {
    const url = URL.createObjectURL(file);
    try {
        const img = await loadImage(url);
        const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    } finally {
        URL.revokeObjectURL(url);
    }
}
