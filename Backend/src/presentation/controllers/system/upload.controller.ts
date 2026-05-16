import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Khởi tạo Cloudinary bằng biến môi trường CLOUDINARY_URL
// Nếu process.env.CLOUDINARY_URL có tồn tại, cloudinary sẽ tự động nhận diện.
cloudinary.config(true);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Chỉ cho phép ảnh
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      throw new HttpException('Chỉ cho phép định dạng hình ảnh!', HttpStatus.BAD_REQUEST);
    }
    return {
      folder: 'pocket-mini/uploads',
      format: file.mimetype.split('/')[1],
      public_id: file.originalname.replace(/\.[^/.]+$/, "").replace(/\s+/g, '-'),
    };
  },
});

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new HttpException('File không hợp lệ hoặc bị thiếu', HttpStatus.BAD_REQUEST);
    }
    
    // Cloudinary trả về url của ảnh trong thuộc tính `path`
    return {
      url: file.path
    };
  }
}
