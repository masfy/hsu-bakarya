// Helper pengekstrak ID Google Drive agar dapat dirender langsung sebagai gambar/thumbnail di website
export const getDriveDirectImageUrl = (urlOrId: string | undefined | null, size: string = "w1200"): string => {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  
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

// ID Aset Google Drive Resmi BAKARYA
export const BAKARYA_LOGO_DRIVE_ID = "12d63rkseNKj6_emhc3iwjwg24ONzH_s6";
export const BAKARYA_HERO_BANNER_DRIVE_ID = "1KAn_yZaoB7PtKwVIpzYpCvz-2ie8wYPH";

export const BAKARYA_LOGO_URL = getDriveDirectImageUrl(BAKARYA_LOGO_DRIVE_ID, "w400");
export const BAKARYA_DEFAULT_THUMBNAIL_URL = getDriveDirectImageUrl(BAKARYA_HERO_BANNER_DRIVE_ID, "w1200");
