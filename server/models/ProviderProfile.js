const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Personal Information
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
      default: '',
    },

    // Professional Information
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },
    previousExperience: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },

    // Services
    serviceCategories: {
      type: [String],
      default: [],
    },

    // Location
    address: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
      index: true,
    },
    state: {
      type: String,
      default: '',
    },
    pincode: {
      type: String,
      default: '',
    },
    serviceRadius: {
      type: Number,
      default: 15, // in km
      min: [1, 'Service radius must be at least 1 km'],
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },

    // Profile Photo
    profilePhoto: {
      type: String,
      default: '',
    },

    // Application Status Flow
    // Draft -> Submitted -> Under Review -> Approved / Rejected
    applicationStatus: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'],
      default: 'Draft',
      index: true,
    },
    rejectionRemarks: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: calculate profile completion score
providerProfileSchema.methods.calculateCompletion = function (documentCount = 0) {
  let score = 0;

  // Personal: 20%
  if (this.dateOfBirth && this.gender) score += 20;
  else if (this.dateOfBirth || this.gender) score += 10;

  // Professional: 20%
  if (this.skills && this.skills.length > 0 && this.experience > 0 && this.bio) {
    score += 20;
  } else if ((this.skills && this.skills.length > 0) || this.experience > 0) {
    score += 10;
  }

  // Services: 20%
  if (this.serviceCategories && this.serviceCategories.length > 0) {
    score += 20;
  }

  // Location: 20%
  if (this.address && this.city && this.state && this.pincode) {
    score += 20;
  } else if (this.city || this.address) {
    score += 10;
  }

  // Documents & Photo: 20%
  let docScore = 0;
  if (this.profilePhoto) docScore += 10;
  if (documentCount > 0) docScore += 10;
  score += docScore;

  return Math.min(score, 100);
};

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
