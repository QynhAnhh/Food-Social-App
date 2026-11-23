import { UploadApiResponse } from 'cloudinary';
import { cloudinary, isCloudinaryConfigured } from '../../config/cloudinary';

export interface UploadImageOptions {
  folder: string;
  publicId?: string;
  transformation?: any[];
}

export const isStorageConfigured = (): boolean => {
  return isCloudinaryConfigured();
};

/**
 * Upload tệp ảnh dưới dạng Buffer lên Cloudinary.
 * Mặc định tự động tối ưu định dạng (WebP/AVIF) và chất lượng ảnh (q_auto, f_auto).
 */
export const uploadImage = async (
  buffer: Buffer,
  options: UploadImageOptions
): Promise<string> => {
  if (!isStorageConfigured()) {
    throw new Error('Cloudinary chưa được cấu hình đầy đủ các biến môi trường.');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: 'image',
        overwrite: true,
        transformation: options.transformation || [
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error || new Error('Upload ảnh lên Cloudinary thất bại.'));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Xóa ảnh trên Cloudinary bằng publicId nếu cần dọn dẹp.
 */
export const deleteImage = async (publicId: string): Promise<boolean> => {
  if (!isStorageConfigured()) {
    return false;
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch {
    return false;
  }
};
