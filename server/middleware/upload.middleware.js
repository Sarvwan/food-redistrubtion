const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const createDirIfNotExists = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const foodPhotosDir = path.join(__dirname, '../../uploads/food-photos');
const proofPhotosDir = path.join(__dirname, '../../uploads/proof-photos');

createDirIfNotExists(foodPhotosDir);
createDirIfNotExists(proofPhotosDir);

// Storage for food photos
const foodStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, foodPhotosDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\\s+/g, '-')}`);
  }
});

// Storage for proof photos
const proofStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, proofPhotosDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\\s+/g, '-')}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
  }
};

const uploadFood = multer({
  storage: foodStorage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: fileFilter
});

const uploadProof = multer({
  storage: proofStorage,
  limits: { fileSize: 5000000 },
  fileFilter: fileFilter
});

module.exports = { uploadFood, uploadProof };
