// Helper pengekstrak ID Google Drive agar dapat dirender langsung sebagai gambar/thumbnail di website
export const getDriveDirectImageUrl = (urlOrId: string | undefined | null, size: string = "w1200"): string => {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  
  // Jika path lokal atau data URI, langsung kembalikan path tersebut
  if (trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  
  // Jika hanya berupa ID Google Drive langsung
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return `https://drive.google.com/thumbnail?id=${trimmed}&sz=${size}`;
  }
  
  // Ekstrak dari pola /file/d/{ID} atau ?id={ID} atau /d/{ID}
  const match =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=${size}`;
  }
  
  return trimmed;
};

// ID Aset Google Drive Resmi BAKARYA (Sebagai fallback)
export const BAKARYA_LOGO_DRIVE_ID = "12d63rkseNKj6_emhc3iwjwg24ONzH_s6";
export const BAKARYA_HERO_BANNER_DRIVE_ID = "1KAn_yZaoB7PtKwVIpzYpCvz-2ie8wYPH";

// Aset Resmi Unggahan Pengguna
export const BAKARYA_LOGO_URL = "/bakarya-icon.png";
export const BAKARYA_LOGO_FULL_URL = "/bakarya-logo-full.png";
export const BAKARYA_FAVICON_URL = "/favicon.png";
export const BAKARYA_OG_IMAGE_URL = "/og-image.png";
export const BAKARYA_DEFAULT_THUMBNAIL_URL = "/thumbnail-default.png";
