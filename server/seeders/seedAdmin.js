const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Document = require('../models/Document');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdminAndData = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trizen_onboarding';
    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected to MongoDB');

    // 1. Seed or Update Admin
    const adminEmail = 'admin@example.com';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        name: 'Trizen Admin',
        email: adminEmail,
        phone: '+91 9876543210',
        password: 'Admin@123',
        role: 'admin',
      });
      console.log('✅ Admin account created successfully: admin@example.com / Admin@123');
    } else {
      admin.role = 'admin';
      admin.password = 'Admin@123';
      await admin.save();
      console.log('ℹ️ Admin account already exists. Password updated to: Admin@123');
    }

    // 2. Sample Providers for instant evaluation
    const sampleProviders = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '+91 9123456780',
        password: 'Provider@123',
        profile: {
          dateOfBirth: new Date('1992-05-14'),
          gender: 'Male',
          bio: 'Certified master electrician with 7+ years of residential and commercial wiring experience.',
          skills: ['Electrical Wiring', 'Circuit Breakers', 'Troubleshooting', 'Generator Setup'],
          experience: 7,
          serviceCategories: ['Electrician', 'Appliance Repair'],
          address: '42, MG Road, Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560038',
          serviceRadius: 20,
          applicationStatus: 'Approved',
          reviewedAt: new Date(),
          reviewedBy: admin._id,
        },
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '+91 9876501234',
        password: 'Password@123',
        profile: {
          dateOfBirth: new Date('1995-11-20'),
          gender: 'Female',
          bio: 'Professional deep cleaning and sanitization specialist handling villas, corporate spaces, and apartments.',
          skills: ['Deep Cleaning', 'Sanitization', 'Carpet Cleaning', 'Floor Polishing'],
          experience: 4,
          serviceCategories: ['Cleaning'],
          address: '104, Sunrise Heights, Koregaon Park',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          serviceRadius: 15,
          applicationStatus: 'Submitted',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      },
      {
        name: 'Vikram Verma',
        email: 'vikram.verma@example.com',
        phone: '+91 9811223344',
        password: 'Password@123',
        profile: {
          dateOfBirth: new Date('1988-08-03'),
          gender: 'Male',
          bio: 'Expert plumbing contractor solving heavy leakages, sewer repairs, and smart sanitary installations.',
          skills: ['Pipe Fitting', 'Leak Detection', 'Water Heater Repair', 'Drain Cleaning'],
          experience: 9,
          serviceCategories: ['Plumber'],
          address: 'Flat 302, Green Glen Layout, Bellandur',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560103',
          serviceRadius: 25,
          applicationStatus: 'Rejected',
          rejectionRemarks: 'Please upload a clearer copy of your Government ID Proof and trade license certificate.',
          submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          reviewedBy: admin._id,
        },
      },
      {
        name: 'Anita Desai',
        email: 'anita.desai@example.com',
        phone: '+91 9765432190',
        password: 'Password@123',
        profile: {
          dateOfBirth: new Date('1996-03-12'),
          gender: 'Female',
          bio: 'HVAC technician specialized in split and central AC installation, maintenance, and gas refill.',
          skills: ['AC Installation', 'Gas Refill', 'Compressor Repair', 'Duct Cleaning'],
          experience: 3,
          serviceCategories: ['AC Repair', 'Appliance Repair'],
          address: 'B-12, Sector 18',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301',
          serviceRadius: 18,
          applicationStatus: 'Draft',
        },
      },
    ];

    for (const data of sampleProviders) {
      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = await User.create({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: 'provider',
        });
        console.log(`✅ Sample provider created: ${data.name} (${data.profile.applicationStatus})`);
      }

      let profile = await ProviderProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = await ProviderProfile.create({
          userId: user._id,
          ...data.profile,
        });
      } else {
        Object.assign(profile, data.profile);
        await profile.save();
      }

      // Add dummy document for demo view
      const docCount = await Document.countDocuments({ providerProfileId: profile._id });
      if (docCount === 0) {
        await Document.create({
          providerProfileId: profile._id,
          userId: user._id,
          documentType: 'id_proof',
          fileName: 'demo_aadhaar_card.pdf',
          originalName: 'National_ID_Card.pdf',
          filePath: '/uploads/sample_doc.pdf',
          fileType: 'application/pdf',
          fileSize: 245000,
          status: 'uploaded',
        });
      }
    }

    console.log('🎉 Database seeded successfully with Admin and sample providers!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
};

seedAdminAndData();
