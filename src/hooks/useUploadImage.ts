import { useMutation } from '@tanstack/react-query';
import { uploadService } from '../services/uploadService';
import { showApiErrorToast } from '../utils/apiToast';

export function useUploadImage() {
  return useMutation({
    mutationFn: ({
      localUri,
      fileName,
      mimeType,
    }: {
      localUri: string;
      fileName?: string;
      mimeType?: string;
    }) => uploadService.uploadImageToCloudinary(localUri, fileName, mimeType),
    onError: (error) => {
      showApiErrorToast(error, {
        errorTitle: 'Upload thất bại',
        errorMessage: 'Không thể upload ảnh.',
      });
    },
  });
}
