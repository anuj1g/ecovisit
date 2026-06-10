
export async function uploadToCloudinary(file: File | string, type: 'image' | 'video' | 'raw' = 'image'): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.warn('Cloudinary not configured. Falling back to local data URL.');
    
    if (typeof file === 'string') return file;
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      const errorMsg = error.error?.message || 'Upload to Cloudinary failed';
      console.warn(`[Cloudinary Error] ${errorMsg}. Falling back to Data URL.`);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (err) {
    console.warn('Cloudinary upload failed, using fallback data URL.');
    if (typeof file === 'string') return file;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
