interface UploadImageResponse {
  secure_url?: string;
}

export const uploadService = {
  uploadImageToCloudinary: async (
    localUri: string,
    fileName?: string,
    mimeType?: string,
  ) => {
    try {
      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        return {
          success: false,
          url: null,
          message:
            'Thiếu cấu hình Cloudinary (EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME / EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET).',
        };
      }

      const formData = new FormData();
      formData.append('upload_preset', uploadPreset);
      formData.append('file', {
        uri: localUri,
        type: mimeType || 'image/jpeg',
        name: fileName || `upload_${Date.now()}.jpg`,
      } as any);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = (await response.json()) as UploadImageResponse & {
        error?: { message?: string };
      };

      if (!response.ok || !data?.secure_url) {
        return {
          success: false,
          url: null,
          message:
            data?.error?.message || 'Upload ảnh lên Cloudinary thất bại.',
        };
      }

      return {
        success: true,
        url: data.secure_url,
        message: 'Upload ảnh thành công',
      };
    } catch (error: any) {
      console.error('Upload image to Cloudinary error:', error);
      return {
        success: false,
        url: null,
        message: error.message || 'Upload ảnh thất bại',
      };
    }
  },
};
