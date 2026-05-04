interface UploadImageResponse {
  secure_url?: string;
}

interface UploadFileResult {
  success: boolean;
  url: string | null;
  message: string;
}

export const uploadService = {
  uploadFileToCloudinary: async (
    localUri: string,
    fileName?: string,
    mimeType?: string,
  ): Promise<UploadFileResult> => {
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
      formData.append('resource_type', 'auto');
      formData.append('file', {
        uri: localUri,
        type: mimeType || 'image/jpeg',
        name: fileName || `upload_${Date.now()}`,
      } as any);

      const resourceType = mimeType?.startsWith('video/') ? 'video' : 'auto';
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
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
      return {
        success: false,
        url: null,
        message: error.message || 'Upload ảnh thất bại',
      };
    }
  },

  uploadImageToCloudinary: async (
    localUri: string,
    fileName?: string,
    mimeType?: string,
  ) => {
    return uploadService.uploadFileToCloudinary(localUri, fileName, mimeType);
  },
};
