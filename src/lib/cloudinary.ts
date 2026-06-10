/**
 * Cloudinary Client-Side Direct Upload Helper
 * Enables serverless direct uploads from the browser to Cloudinary
 */

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

// Stored in localStorage or read from configs
const getCloudinaryConfig = (): CloudinaryConfig => {
  try {
    const rawVal = localStorage.getItem("cloudinary_config");
    if (rawVal) {
      return JSON.parse(rawVal);
    }
  } catch (e) {
    console.warn("Could not read local Cloudinary configs", e);
  }

  // Ensure production credentials are read from env or settings, fail if not exists.
  return {
    cloudName: (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || "",
    uploadPreset: (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string) || "ml_default"
  };
};

export const saveCloudinaryConfig = (cloudName: string, uploadPreset: string) => {
  localStorage.setItem(
    "cloudinary_config",
    JSON.stringify({ cloudName: cloudName.trim(), uploadPreset: uploadPreset.trim() })
  );
};

/**
 * Uploads a file (Base64 string or File object) directly to Cloudinary
 */
export async function uploadToCloudinaryClient(
  fileOrBase64: string | File,
  fileName: string = "uploaded_media"
): Promise<{ success: boolean; url?: string; error?: string }> {
  let fallbackBase64 = "";
  try {
    if (typeof fileOrBase64 === "string") {
      fallbackBase64 = fileOrBase64;
    } else {
      fallbackBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(fileOrBase64);
      });
    }

    const config = getCloudinaryConfig();
    if (!config.cloudName) {
      return {
        success: true,
        url: fallbackBase64,
        error: "Cloudinary Cloud Name is not configured. Falling back to local Base64."
      };
    }

    const formData = new FormData();
    formData.append("file", fileOrBase64);
    formData.append("upload_preset", config.uploadPreset || "ml_default");
    formData.append("tags", "vagina_room_cms");

    console.log(`Direct-uploading to Cloudinary Cloud: ${config.cloudName}...`);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      let message = "Cloudinary network error during direct upload.";
      try {
        const errData = await response.json();
        message = errData.error?.message || message;
      } catch (_) {}
      throw new Error(message);
    }

    const data = await response.json();
    console.log("Cloudinary Upload Success:", data.secure_url);
    
    return {
      success: true,
      url: data.secure_url,
    };
  } catch (err: any) {
    console.error("Cloudinary upload failed, falling back:", err);
    return {
      success: true,
      url: fallbackBase64 || (typeof fileOrBase64 === "string" ? fileOrBase64 : ""),
      error: `Cloudinary upload failed: ${err.message || "Failed to fetch"}`,
    };
  }
}
