const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const AWS = require('aws-sdk');

const upload = multer({ storage: multer.memoryStorage() });
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const mediaSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String,
  createdAt: { type: Date, default: Date.now }
});
const Media = mongoose.model('Media', mediaSchema);

router.get('/', async (req, res) => {
  const media = await Media.find();
  res.json(media);
});

router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ACL: 'public-read',
  };
  const result = await s3.upload(params).promise();
  const media = new Media({
    name: file.originalname,
    url: result.Location,
    type: file.mimetype.startsWith('image') ? 'image' : 'audio',
  });
  await media.save();
  res.json(media);
});

module.exports = router;
