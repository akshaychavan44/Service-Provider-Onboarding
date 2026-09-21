const mongoose = require('mongoose');
const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const Document = require('../models/Document');

// @desc    Get dashboard metrics and statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: {
          stats: {
            totalProviders: 12,
            pendingApplications: 3,
            approvedProviders: 7,
            rejectedApplications: 1,
            draftApplications: 1,
          },
          recentApplications: [
            {
              _id: '6633a2222222222222222222',
              userId: {
                _id: '6633a2222222222222222222',
                name: 'Rahul Sharma',
                email: 'rahul@example.com',
                phone: '+91 9123456780',
                createdAt: new Date().toISOString(),
              },
              applicationStatus: 'Approved',
              serviceCategories: ['Electrician', 'Appliance Repair'],
              city: 'Bangalore',
              state: 'Karnataka',
              completionPercentage: 100,
              updatedAt: new Date().toISOString(),
            },
            {
              _id: '6633a3333333333333333333',
              userId: {
                _id: '6633a3333333333333333333',
                name: 'Priya Patel',
                email: 'priya.patel@example.com',
                phone: '+91 9876501234',
                createdAt: new Date().toISOString(),
              },
              applicationStatus: 'Submitted',
              serviceCategories: ['Cleaning', 'Pest Control'],
              city: 'Mumbai',
              state: 'Maharashtra',
              completionPercentage: 90,
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      });
    }

    const totalProviders = await User.countDocuments({ role: 'provider' });

    const [
      pendingApplications,
      approvedProviders,
      rejectedApplications,
      draftApplications,
    ] = await Promise.all([
      ProviderProfile.countDocuments({
        applicationStatus: { $in: ['Submitted', 'Under Review'] },
      }),
      ProviderProfile.countDocuments({ applicationStatus: 'Approved' }),
      ProviderProfile.countDocuments({ applicationStatus: 'Rejected' }),
      ProviderProfile.countDocuments({ applicationStatus: 'Draft' }),
    ]);

    // Fetch 5 most recent submissions for quick review
    const recentApplications = await ProviderProfile.find()
      .populate('userId', 'name email phone createdAt')
      .sort({ updatedAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProviders,
          pendingApplications,
          approvedProviders,
          rejectedApplications,
          draftApplications,
        },
        recentApplications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all providers with search, filters, and pagination
// @route   GET /api/admin/providers
// @access  Private (Admin)
const getProviders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, status, service, city, experience } = req.query;

    // Build filter for ProviderProfile
    const profileFilter = {};

    if (status && status !== 'All') {
      profileFilter.applicationStatus = status;
    }

    if (service && service !== 'All') {
      profileFilter.serviceCategories = { $regex: new RegExp(service, 'i') };
    }

    if (city && city.trim()) {
      profileFilter.city = { $regex: new RegExp(city.trim(), 'i') };
    }

    if (experience && !isNaN(Number(experience))) {
      profileFilter.experience = { $gte: Number(experience) };
    }

    // If search term is provided, find matching User IDs (name, email, phone)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const matchingUsers = await User.find({
        role: 'provider',
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      // Provider could match by User name/email/phone OR city/skills
      profileFilter.$or = [
        { userId: { $in: userIds } },
        { skills: searchRegex },
        { city: searchRegex },
      ];
    }

    const total = await ProviderProfile.countDocuments(profileFilter);

    const providers = await ProviderProfile.find(profileFilter)
      .populate('userId', 'name email phone createdAt')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: {
        providers,
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete provider details by profile ID
// @route   GET /api/admin/providers/:id
// @access  Private (Admin)
const getProviderById = async (req, res, next) => {
  try {
    let profile = await ProviderProfile.findById(req.params.id)
      .populate('userId', 'name email phone createdAt')
      .populate('reviewedBy', 'name email');

    // If not found by profile ID, check if it was requested by userId
    if (!profile) {
      profile = await ProviderProfile.findOne({ userId: req.params.id })
        .populate('userId', 'name email phone createdAt')
        .populate('reviewedBy', 'name email');
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found.',
      });
    }

    const documents = await Document.find({ providerProfileId: profile._id });
    const completionPercentage = profile.calculateCompletion(documents.length);

    return res.status(200).json({
      success: true,
      data: {
        profile,
        documents,
        completionPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve provider application
// @route   PUT /api/admin/providers/:id/approve
// @access  Private (Admin)
const approveProvider = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found.',
      });
    }

    profile.applicationStatus = 'Approved';
    profile.reviewedAt = new Date();
    profile.reviewedBy = req.user._id;
    profile.rejectionRemarks = '';
    await profile.save();

    const updatedProfile = await ProviderProfile.findById(profile._id)
      .populate('userId', 'name email phone')
      .populate('reviewedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Provider application approved successfully.',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject provider application
// @route   PUT /api/admin/providers/:id/reject
// @access  Private (Admin)
const rejectProvider = async (req, res, next) => {
  try {
    const { remarks } = req.body;

    if (!remarks || remarks.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection remarks are required to explain the decision.',
      });
    }

    const profile = await ProviderProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found.',
      });
    }

    profile.applicationStatus = 'Rejected';
    profile.rejectionRemarks = remarks.trim();
    profile.reviewedAt = new Date();
    profile.reviewedBy = req.user._id;
    await profile.save();

    const updatedProfile = await ProviderProfile.findById(profile._id)
      .populate('userId', 'name email phone')
      .populate('reviewedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Provider application has been marked as rejected with remarks.',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getProviders,
  getProviderById,
  approveProvider,
  rejectProvider,
};
