const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/roleMiddleware');
const {
  getDashboardStats,
  getProviders,
  getProviderById,
  approveProvider,
  rejectProvider,
} = require('../controllers/adminController');

// All admin routes require valid JWT and 'admin' role
router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', getDashboardStats);
router.get('/providers', getProviders);
router.get('/providers/:id', getProviderById);
router.put('/providers/:id/approve', approveProvider);
router.put('/providers/:id/reject', rejectProvider);

module.exports = router;
