const AppError = require('./AppError');

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
];

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/m4a',
  'audio/x-m4a',
];

const validateFile = (file) => {
  const { mimetype, size, originalname } = file;

  // Check if file type is allowed
  if (!ALLOWED_IMAGE_TYPES.includes(mimetype) && !ALLOWED_AUDIO_TYPES.includes(mimetype)) {
    throw new AppError(
      `File type ${mimetype} is not allowed. Allowed types: Images (JPEG, PNG, GIF, WebP) and Audio (MP3, WAV, OGG, AAC, M4A)`,
      400
    );
  }

  // Check file size (50MB max)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (size > maxSize) {
    throw new AppError(`File ${originalname} is too large. Maximum size is 50MB`, 400);
  }

  // Check filename length
  if (originalname.length > 255) {
    throw new AppError(`Filename is too long. Maximum length is 255 characters`, 400);
  }

  return true;
};

const sanitizeFilename = (filename) => {
  // Remove or replace dangerous characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace dangerous characters with underscore
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .substring(0, 200); // Limit length
};

const getFileExtension = (mimetype) => {
  const mimeToExt = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/aac': 'aac',
    'audio/m4a': 'm4a',
    'audio/x-m4a': 'm4a',
  };

  return mimeToExt[mimetype] || 'bin';
};

module.exports = {
  validateFile,
  sanitizeFilename,
  getFileExtension,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_AUDIO_TYPES,
};
