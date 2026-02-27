const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Generic storage creator
const createStorage = (directory, prefix = '') => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = `public/${directory}`;
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const namePrefix = prefix ? `${prefix}-` : '';
            cb(null, `${namePrefix}${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    });
};

// Generic upload dir config
const uploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: uploadStorage });
const uploadOffer = multer({ storage: createStorage('offers', 'offer') });
const uploadProfile = multer({ storage: createStorage('storelogo', 'logo') });
const uploadHelp = multer({ storage: createStorage('help', 'ticket') });

module.exports = {
    upload,
    uploadOffer,
    uploadProfile,
    uploadHelp
};
