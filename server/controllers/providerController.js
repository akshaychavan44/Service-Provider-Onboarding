const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Document = require('../models/Document');
const { validateProfileSubmission } = require('../validators/inputValidators');

// @desc    Get provider profile and onboarding status
// @route   GET /api/provider/profile
// @access  Private (Provider)
const getProfile = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: {
          profile: {
            _id: '6633a4444444444444444444',
            userId: req.user,
            dateOfBirth: '1992-05-14',
            gender: 'Male',
            bio: 'Certified master electrician with 7+ years of experience.',
            skills: ['Electrical Wiring', 'Circuit Breakers', 'Troubleshooting'],
            experience: 7,
            serviceCategories: ['Electrician', 'Appliance Repair'],
            address: '42, MG Road, Indiranagar',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560038',
            serviceRadius: 20,
            applicationStatus: 'Approved',
          },
          documents: [],
          completionPercentage: 100,
        },
      });
    }

    let profile = await ProviderProfile.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email phone role'
    );

    if (!profile) {
      profile = await ProviderProfile.create({
        userId: req.user._id,
        applicationStatus: 'Draft',
      });
      profile = await profile.populate('userId', 'name email phone role');
    }

    const documents = await Document.find({ providerProfileId: profile._id }).sort({
      createdAt: -1,
    });

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

// @desc    Update provider profile details
// @route   PUT /api/provider/profile
// @access  Private (Provider)
const updateProfile = async (req, res, next) => {
  try {
    let profile = await ProviderProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await ProviderProfile.create({
        userId: req.user._id,
        applicationStatus: 'Draft',
      });
    }

    // Check if application is locked in 'Submitted' or 'Under Review'
    if (
      profile.applicationStatus === 'Submitted' ||
      profile.applicationStatus === 'Under Review'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Application is currently under review and cannot be modified. Contact support if changes are needed.',
      });
    }

    const {
      name,
      phone,
      dateOfBirth,
      gender,
      skills,
      experience,
      previousExperience,
      bio,
      serviceCategories,
      address,
      city,
      state,
      pincode,
      serviceRadius,
      latitude,
      longitude,
    } = req.body;

    // Update user personal details if provided
    if (name || phone) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          ...(name && { name: name.trim() }),
          ...(phone && { phone: phone.trim() }),
        },
        { new: true, runValidators: true }
      );
    }

    // Update profile fields
    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;
    if (gender !== undefined) profile.gender = gender;
    if (skills !== undefined) {
      profile.skills = Array.isArray(skills)
        ? skills.filter((s) => s && s.trim())
        : [];
    }
    if (experience !== undefined) profile.experience = Number(experience) || 0;
    if (previousExperience !== undefined) profile.previousExperience = previousExperience;
    if (bio !== undefined) profile.bio = bio;
    if (serviceCategories !== undefined) {
      profile.serviceCategories = Array.isArray(serviceCategories)
        ? serviceCategories.filter((c) => c && c.trim())
        : [];
    }
    if (address !== undefined) profile.address = address;
    if (city !== undefined) profile.city = city.trim();
    if (state !== undefined) profile.state = state.trim();
    if (pincode !== undefined) profile.pincode = pincode.trim();
    if (serviceRadius !== undefined) profile.serviceRadius = Number(serviceRadius) || 15;
    if (latitude !== undefined) profile.latitude = Number(latitude);
    if (longitude !== undefined) profile.longitude = Number(longitude);

    await profile.save();

    const updatedProfile = await ProviderProfile.findById(profile._id).populate(
      'userId',
      'name email phone role'
    );
    const documents = await Document.find({ providerProfileId: profile._id });
    const completionPercentage = updatedProfile.calculateCompletion(documents.length);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        profile: updatedProfile,
        completionPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile photo
// @route   POST /api/provider/profile-photo
// @access  Private (Provider)
const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file.',
      });
    }

    const relativePath = `/uploads/${req.file.filename}`;
    let profile = await ProviderProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await ProviderProfile.create({
        userId: req.user._id,
        applicationStatus: 'Draft',
      });
    }

    // Delete old profile photo if exists
    if (profile.profilePhoto && profile.profilePhoto.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', profile.profilePhoto);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, () => {});
      }
    }

    profile.profilePhoto = relativePath;
    await profile.save();

    const documents = await Document.find({ providerProfileId: profile._id });
    const completionPercentage = profile.calculateCompletion(documents.length);

    return res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully.',
      data: {
        profilePhoto: relativePath,
        completionPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload verification document
// @route   POST /api/provider/documents
// @access  Private (Provider)
const uploadVerificationDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a document file.',
      });
    }

    const { documentType } = req.body;
    const validTypes = ['id_proof', 'address_proof', 'certificate', 'experience_cert', 'other'];

    if (!documentType || !validTypes.includes(documentType)) {
      // Remove uploaded file if invalid type
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: `Invalid document type. Allowed types: ${validTypes.join(', ')}`,
      });
    }

    let profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await ProviderProfile.create({
        userId: req.user._id,
        applicationStatus: 'Draft',
      });
    }

    const relativePath = `/uploads/${req.file.filename}`;

    const document = await Document.create({
      providerProfileId: profile._id,
      userId: req.user._id,
      documentType,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: relativePath,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      status: 'uploaded',
    });

    const documents = await Document.find({ providerProfileId: profile._id });
    const completionPercentage = profile.calculateCompletion(documents.length);

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      data: {
        document,
        completionPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all uploaded documents
// @route   GET /api/provider/documents
// @access  Private (Provider)
const getDocuments = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const documents = await Document.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an uploaded document
// @route   DELETE /api/provider/documents/:id
// @access  Private (Provider)
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
    }

    // Verify ownership
    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this document.',
      });
    }

    // Guard if submitted
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (
      profile &&
      (profile.applicationStatus === 'Submitted' ||
        profile.applicationStatus === 'Under Review')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete documents while application is under review.',
      });
    }

    // Remove file from disk
    const diskPath = path.join(__dirname, '..', document.filePath);
    if (fs.existsSync(diskPath)) {
      fs.unlink(diskPath, () => {});
    }

    await Document.findByIdAndDelete(req.params.id);

    const documents = await Document.find({ providerProfileId: profile._id });
    const completionPercentage = profile.calculateCompletion(documents.length);

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully.',
      data: {
        completionPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit application for admin review
// @route   POST /api/provider/submit
// @access  Private (Provider)
const submitApplication = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found. Please complete profile first.',
      });
    }

    if (
      profile.applicationStatus === 'Submitted' ||
      profile.applicationStatus === 'Under Review'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Your application has already been submitted and is under review.',
      });
    }

    if (profile.applicationStatus === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Your application has already been approved.',
      });
    }

    const documents = await Document.find({ providerProfileId: profile._id });

    // Validate completeness
    const { isValid, missingFields } = validateProfileSubmission(profile, documents);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: `Please complete all required fields before submitting: ${missingFields.join(', ')}.`,
        missingFields,
      });
    }

    profile.applicationStatus = 'Submitted';
    profile.submittedAt = new Date();
    profile.rejectionRemarks = ''; // Clear prior rejection remarks if resubmitting
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Application submitted successfully! Your profile is now under review.',
      data: {
        applicationStatus: profile.applicationStatus,
        submittedAt: profile.submittedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current application status & timeline
// @route   GET /api/provider/status
// @access  Private (Provider)
const getApplicationStatus = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      });
    }

    const documents = await Document.find({ providerProfileId: profile._id });
    const completionPercentage = profile.calculateCompletion(documents.length);

    // Milestones tracking
    const milestones = [
      {
        step: 1,
        title: 'Account Created',
        completed: true,
        date: req.user.createdAt,
      },
      {
        step: 2,
        title: 'Profile Information Completed',
        completed: completionPercentage >= 80,
      },
      {
        step: 3,
        title: 'Application Submitted',
        completed:
          profile.applicationStatus === 'Submitted' ||
          profile.applicationStatus === 'Under Review' ||
          profile.applicationStatus === 'Approved' ||
          profile.applicationStatus === 'Rejected',
        date: profile.submittedAt,
      },
      {
        step: 4,
        title: 'Under Review',
        completed:
          profile.applicationStatus === 'Under Review' ||
          profile.applicationStatus === 'Approved' ||
          profile.applicationStatus === 'Rejected',
      },
      {
        step: 5,
        title: 'Application Approved',
        completed: profile.applicationStatus === 'Approved',
        rejected: profile.applicationStatus === 'Rejected',
        date: profile.reviewedAt,
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        status: profile.applicationStatus,
        rejectionRemarks: profile.rejectionRemarks,
        submittedAt: profile.submittedAt,
        reviewedAt: profile.reviewedAt,
        completionPercentage,
        milestones,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadVerificationDocument,
  getDocuments,
  deleteDocument,
  submitApplication,
  getApplicationStatus,
};
