const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

const Media = require('../models/Media');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { validateFile, sanitizeFilename } = require('../utils/fileUtils');

const router = express.Router();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5, // Max 5 files per request
  },
  fileFilter: (req, file, cb) => {
    try {
      validateFile(file);
      cb(null, true);
    } catch (error) {
      cb(error, false);
    }
  },
});

// Validation schemas
const querySchema = Joi.object({
  type: Joi.string().valid('image', 'audio'),
  limit: Joi.number().integer().min(1).max(100).default(50),
  page: Joi.number().integer().min(1).default(1),
  sort: Joi.string().valid('createdAt', 'name', 'size').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

// @desc    Get all media files
// @route   GET /media
// @access  Public
router.get('/', asyncHandler(async (req, res, next) => {
  // Validate query parameters
  const { error, value } = querySchema.validate(req.query);
  if (error) {
    return next(new AppError('Invalid query parameters', 400));
  }

  const { type, limit, page, sort, order } = value;
  const skip = (page - 1) * limit;

  // Build query
  const query = {};
  if (type) {
    query.type = type;
  }

  // Build sort object
  const sortObj = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  try {
    const [media, total] = await Promise.all([
      Media.find(query)
        .sort(sortObj)
        .limit(limit)
        .skip(skip)
        .select('-__v'),
      Media.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: media,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(new AppError('Failed to fetch media files', 500));
  }
}));

// @desc    Get single media file
// @route   GET /media/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res, next) => {
  const media = await Media.findById(req.params.id).select('-__v');
  
  if (!media) {
    return next(new AppError('Media file not found', 404));
  }

  res.json({
    success: true,
    data: media,
  });
}));

// @desc    Upload media files
// @route   POST /media
// @access  Public
router.post('/', upload.array('files', 5), asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError('No files uploaded', 400));
  }

  const uploadPromises = req.files.map(async (file) => {
    try {
      let processedBuffer = file.buffer;
      let contentType = file.mimetype;
      
      // Process images with Sharp for optimization
      if (file.mimetype.startsWith('image/')) {
        processedBuffer = await sharp(file.buffer)
          .resize(1920, 1920, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ 
            quality: 85, 
            progressive: true 
          })
          .toBuffer();
        contentType = 'image/jpeg';
      }

      // Generate unique filename
      const fileExtension = contentType.split('/')[1];
      const uniqueFilename = `${Date.now()}-${uuidv4()}.${fileExtension}`;
      const sanitizedOriginalName = sanitizeFilename(file.originalname);

      // S3 upload parameters
      const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Key: `media/${uniqueFilename}`,
        Body: processedBuffer,
        ContentType: contentType,
        ACL: 'public-read',
        Metadata: {
          'original-name': sanitizedOriginalName,
          'upload-date': new Date().toISOString(),
        },
      };

      // Upload to S3
      const result = await s3.upload(uploadParams).promise();

      // Determine media type
      const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'audio';

      // Create media document
      const mediaDoc = new Media({
        name: sanitizedOriginalName,
        originalName: file.originalname,
        url: result.Location,
        s3Key: result.Key,
        type: mediaType,
        mimeType: contentType,
        size: processedBuffer.length,
        metadata: {
          etag: result.ETag,
          bucket: process.env.S3_BUCKET,
        },
      });

      await mediaDoc.save();
      return mediaDoc;

    } catch (error) {
      console.error(`Upload failed for ${file.originalname}:`, error);
      throw new AppError(`Failed to upload ${file.originalname}`, 500);
    }
  });

  try {
    const uploadedMedia = await Promise.all(uploadPromises);
    
    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadedMedia.length} file(s)`,
      data: uploadedMedia,
    });
  } catch (error) {
    next(error);
  }
}));

// @desc    Delete media file
// @route   DELETE /media/:id
// @access  Public
router.delete('/:id', asyncHandler(async (req, res, next) => {
  const media = await Media.findById(req.params.id);
  
  if (!media) {
    return next(new AppError('Media file not found', 404));
  }

  try {
    // Delete from S3
    if (media.s3Key) {
      await s3.deleteObject({
        Bucket: process.env.S3_BUCKET,
        Key: media.s3Key,
      }).promise();
    }

    // Delete from database
    await Media.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Media file deleted successfully',
    });
  } catch (error) {
    console.error('Delete failed:', error);
    next(new AppError('Failed to delete media file', 500));
  }
}));

// @desc    Get media statistics
// @route   GET /media/stats/summary
// @access  Public
router.get('/stats/summary', asyncHandler(async (req, res, next) => {
  try {
    const stats = await Media.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' },
        },
      },
    ]);

    const summary = {
      total: 0,
      totalSize: 0,
      images: 0,
      audio: 0,
      imagesSize: 0,
      audioSize: 0,
    };

    stats.forEach(stat => {
      summary.total += stat.count;
      summary.totalSize += stat.totalSize;
      
      if (stat._id === 'image') {
        summary.images = stat.count;
        summary.imagesSize = stat.totalSize;
      } else if (stat._id === 'audio') {
        summary.audio = stat.count;
        summary.audioSize = stat.totalSize;
      }
    });

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(new AppError('Failed to fetch statistics', 500));
  }
}));

module.exports = router;
