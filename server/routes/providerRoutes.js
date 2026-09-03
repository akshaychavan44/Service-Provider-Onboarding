const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { providerMiddleware } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadVerificationDocument,
  getDocuments,
  deleteDocument,
  submitApplication,
  getApplicationStatus,
} = require('../controllers/providerController');

// All provider routes require valid JWT and 'provider' role
router.use(authMiddleware, providerMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.post('/profile-photo', upload.single('photo'), uploadProfilePhoto);

router.post('/documents', upload.single('file'), uploadVerificationDocument);
router.get('/documents', getDocuments);
router.delete('/documents/:id', deleteDocument);

router.post('/submit', submitApplication);
router.get('/status', getApplicationStatus);

module.exports = router;
