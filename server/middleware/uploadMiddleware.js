import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists - use absolute path for Windows compatibility
const uploadDir = path.join(__dirname, '../uploads/assignments');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✓ Created upload directory:', uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp-randomnumber-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter: Allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'text/csv'
  ];

  const allowedExtensions = [
    '.pdf', '.jpg', '.jpeg', '.png', '.gif',
    '.doc', '.docx', '.xls', '.xlsx',
    '.txt', '.zip', '.csv'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  
  console.log(`📋 [FILE FILTER] Checking file: ${file.originalname}`);
  console.log(`   - MIME type: ${file.mimetype}`);
  console.log(`   - Extension: ${ext}`);
  console.log(`   - MIME allowed: ${allowedMimes.includes(file.mimetype)}`);
  console.log(`   - Ext allowed: ${allowedExtensions.includes(ext)}`);
  
  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    console.log(`   ✓ File accepted`);
    cb(null, true);
  } else {
    const error = new Error(`Invalid file type: ${ext}. Allowed types: ${allowedExtensions.join(', ')}`);
    console.log(`   ✗ File rejected: ${error.message}`);
    cb(error);
  }
};

// Create multer instance for assignment submissions
const assignmentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per file
  }
});

export default assignmentUpload;
