const multer = require('multer');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Create storage engine using GridFS
const storage = new GridFsStorage({
  url: process.env.MONGO_URI || 'mongodb://localhost:27017/food_relief',
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const allowedFileTypes = /jpeg|jpg|png/;
      const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedFileTypes.test(file.mimetype);

      if (mimetype && extname) {
        const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        const fileInfo = {
          filename: filename,
          bucketName: 'photos' // Collection name will be photos.files and photos.chunks
        };
        resolve(fileInfo);
      } else {
        reject(new Error('Only images (jpeg, jpg, png) are allowed!'));
      }
    });
  }
});

const uploadFood = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadProof = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = { uploadFood, uploadProof };
