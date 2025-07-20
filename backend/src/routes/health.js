const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Health check endpoint
// @route   GET /health
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    service: 'media-app-backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  // Check database connection
  try {
    const dbState = mongoose.connection.readyState;
    healthcheck.database = {
      status: dbState === 1 ? 'connected' : 'disconnected',
      readyState: dbState,
    };
  } catch (error) {
    healthcheck.database = {
      status: 'error',
      error: error.message,
    };
  }

  // Check S3 connection
  try {
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });
    
    await s3.headBucket({ Bucket: process.env.S3_BUCKET }).promise();
    healthcheck.s3 = { status: 'connected' };
  } catch (error) {
    healthcheck.s3 = {
      status: 'error',
      error: error.message,
    };
  }

  const httpStatus = (healthcheck.database.status === 'connected' && healthcheck.s3.status === 'connected') ? 200 : 503;
  
  res.status(httpStatus).json(healthcheck);
}));

module.exports = router;
