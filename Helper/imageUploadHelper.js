const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');
const { S3_ACCESS } = require('../config/keys');
const s3 = new aws.S3({
  ...S3_ACCESS,
});
const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb('Error:Images Only!');
};
module.exports = {
  imageUpload: folderName =>
    multer({
      storage: multerS3({
        acl: 'public-read',
        s3,
        bucket: 'foodvybe-review-images',
        metadata: (req, file, cb) => {
          cb(null, {
            fieldName: file.fieldname,
          });
        },
        key: (req, file, cb) => {
          const newFileName = `${Date.now()}-${file.originalname}`;
          const fullPath = `${folderName}${newFileName}`;
          cb(null, fullPath);
        },
      }),
      limits: {
        fileSize: 10000000,
      },
      fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
      },
    }),
};
