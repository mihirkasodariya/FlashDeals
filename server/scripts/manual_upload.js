const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// AWS Config
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const uploadFile = async () => {
    const filePath = 'C:/Users/PREMIUM/.gemini/antigravity/brain/45eb18ad-dc19-46b9-a8c3-2ef98c0025fa/sample_offer_banner_1774874979093.png';
    const fileName = `sample_offer_${Date.now()}.png`;
    const bucketName = process.env.S3_BUCKET_NAME;

    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: bucketName,
        Key: `offers/${fileName}`,
        Body: fileContent,
        ContentType: 'image/png'
    };

    try {
        const data = await s3.upload(params).promise();
        console.log(`Success! Image uploaded to: ${data.Location}`);
    } catch (err) {
        console.error('Upload Error Details:', JSON.stringify(err, null, 2));
        process.exit(1);
    }
};

uploadFile();
