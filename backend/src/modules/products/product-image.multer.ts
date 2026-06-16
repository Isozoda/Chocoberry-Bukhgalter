import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIME = /^image\/(jpeg|png|webp|gif)$/;

// Multer config for product photo uploads — stored on local disk under
// ./uploads/products and served back via app.useStaticAssets() in main.ts.
export const productImageMulterOptions = {
  storage: diskStorage({
    destination: './uploads/products',
    filename: (_req: any, file: Express.Multer.File, callback: (error: any, filename: string) => void) => {
      callback(null, `${uuidv4()}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  fileFilter: (_req: any, file: Express.Multer.File, callback: (error: any, acceptFile: boolean) => void) => {
    if (!ALLOWED_MIME.test(file.mimetype)) {
      return callback(
        new BadRequestException('Only image files are allowed (jpeg, png, webp, gif)'),
        false,
      );
    }
    callback(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
};
