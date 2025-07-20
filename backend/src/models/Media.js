const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  originalName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  s3Key: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['image', 'audio'],
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
    min: 0,
  },
  metadata: {
    etag: String,
    bucket: String,
    uploadedBy: {
      type: String,
      default: 'anonymous',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
mediaSchema.index({ type: 1, createdAt: -1 });
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ name: 'text' });

// Virtual for formatted file size
mediaSchema.virtual('formattedSize').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Ensure virtual fields are serialized
mediaSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Media', mediaSchema);
