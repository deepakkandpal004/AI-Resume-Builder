import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../configs/api";

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

// ─── Browser-side image compression ──────────────────────────────────────────
// Resizes the image to max 800px on the longest side and re-encodes as JPEG
// at 0.82 quality. Typical phone photos go from 3–6MB down to ~150–300KB.
// This is the single biggest bandwidth saver — cuts ImageKit usage by ~70%.
const compressImage = (file, maxPx = 800, quality = 0.82) =>
  new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Only downscale — never upscale small images
      if (width <= maxPx && height <= maxPx) {
        resolve(file);
        return;
      }

      const ratio = Math.min(maxPx / width, maxPx / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          }));
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * useImageUpload
 *
 * Uploads an image directly to ImageKit from the browser.
 * The server is only involved for a short-lived auth token — the binary
 * never travels through your backend.
 *
 * Bandwidth optimisations applied:
 *   1. Canvas compression before upload  (−70% file size on average)
 *   2. removeBg is NOT applied here by default — pass removeBg: true only
 *      when the user explicitly saves with that flag, not on every toggle
 */
const useImageUpload = () => {
  const { token } = useSelector((state) => state.auth);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * @param {File}   file
   * @param {Object} options
   * @param {string}  options.userId
   * @param {string}  options.resumeId
   * @param {boolean} options.removeBg   — only pass true on explicit user save
   * @returns {Promise<string>}  ImageKit CDN URL
   */
  const upload = useCallback(
    async (file, { userId = "user", resumeId = "resume", removeBg = false } = {}) => {
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Step 1 — compress before uploading (saves ~70% bandwidth)
        const compressed = await compressImage(file);

        // Step 2 — get short-lived auth token from server
        const { data: authData } = await api.get("/api/imagekit/auth", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || "";

        // Step 3 — build multipart form for ImageKit upload API
        const formData = new FormData();
        formData.append("file", compressed);
        formData.append("fileName", `${userId}_${resumeId}.jpg`);
        formData.append("folder", "user-resumes");
        formData.append("publicKey", publicKey);
        formData.append("signature", authData.signature);
        formData.append("expire", String(authData.expire));
        formData.append("token", authData.token);

        // bg-removal is expensive — only apply when explicitly requested
        if (removeBg) {
          formData.append(
            "extensions",
            JSON.stringify([{ name: "remove-bg", options: { add_shadow: false } }])
          );
        }

        // Step 4 — upload via XHR for progress tracking (fetch doesn't support it)
        const cdnUrl = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", IMAGEKIT_UPLOAD_URL);

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const resp = JSON.parse(xhr.responseText);
              const endpoint =
                import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT ||
                "https://ik.imagekit.io/deepakkandpal";
              const filePath = resp?.filePath || "";
              const baseUrl = filePath ? `${endpoint}/${filePath}` : resp?.url || "";
              const tr = "tr=c-maintain_ratio,fo-face,w-300,h-300";
              resolve(baseUrl.includes("?") ? `${baseUrl}&${tr}` : `${baseUrl}?${tr}`);
            } else {
              reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
          xhr.addEventListener("abort",  () => reject(new Error("Upload cancelled")));

          xhr.send(formData);
        });

        setProgress(100);
        return cdnUrl;
      } catch (err) {
        setError(err.message || "Image upload failed");
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [token]
  );

  return { upload, uploading, progress, error };
};

export default useImageUpload;
