import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

// Since this runs from `backend`, `../frontend/public/assets/uploads` points to the target folder.
const UPLOAD_DIR = join(process.cwd(), '../frontend/public/assets/uploads');

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: UPLOAD_DIR,
      filename: (req, file, cb) => {
        // Giữ nguyên tên file gốc, chỉ thay đổi khoảng trắng thành dấu '-'
        // Điều này giúp tránh việc tạo ra nhiều bản sao (img-1234.jpg, img-5678.jpg) 
        // khi người dùng upload cùng một file logo_laptop.jpg nhiều lần.
        const originalName = file.originalname.replace(/\s+/g, '-');
        cb(null, originalName);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new Error('Chỉ cho phép định dạng hình ảnh (jpg, png, gif, webp)!') as any, false);
      }
      cb(null, true);
    }
  }))
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new HttpException('File không hợp lệ hoặc bị thiếu', HttpStatus.BAD_REQUEST);
    }
    
    return {
      url: `/assets/uploads/${file.filename}`
    };
  }
}
