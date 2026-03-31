const { S3Client } = require("@aws-sdk/client-s3");
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// 1. Configure AWS S3 Client (v3)
const s3 = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});

// 2. Define Storage Engine
const s3Storage = (folder) => multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME || 'offerz-s3-bucket',
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${folder}/${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// 3. File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only images and PDFs are allowed!'), false);
    }
};

// 4. Export Middlewares
const uploadS3 = (folder) => multer({
    storage: s3Storage(folder),
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = {
    uploadOfferS3: uploadS3('offers'),
    uploadVendorS3: uploadS3('vendors'),
    uploadProfileS3: uploadS3('profiles'),
    uploadSupportS3: uploadS3('support'),
    uploadCategoryS3: uploadS3('categories')
};
