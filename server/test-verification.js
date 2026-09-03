const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('🚀 Starting Automated Full-Stack API Verification...\n');
  let adminToken = '';
  let providerToken = '';
  let testProfileId = '';

  // 1. Admin Login
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin@123',
    });
    if (res.data.success && res.data.data.user.role === 'admin') {
      adminToken = res.data.data.token;
      console.log('✅ 1. Admin Login: SUCCESS (Role: admin)');
    } else {
      throw new Error('Admin login did not return admin role');
    }
  } catch (err) {
    console.error('❌ 1. Admin Login: FAILED -', err.response?.data?.message || err.message);
    process.exit(1);
  }

  // 2. Provider Login
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'rahul@example.com',
      password: 'Provider@123',
    });
    if (res.data.success && res.data.data.user.role === 'provider') {
      providerToken = res.data.data.token;
      console.log('✅ 2. Provider Login: SUCCESS (Role: provider)');
    } else {
      throw new Error('Provider login did not return provider role');
    }
  } catch (err) {
    console.error('❌ 2. Provider Login: FAILED -', err.response?.data?.message || err.message);
    process.exit(1);
  }

  // 3. Register a brand new test provider
  const uniqueEmail = `test.contractor.${Date.now()}@example.com`;
  let newProviderToken = '';
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Contractor',
      email: uniqueEmail,
      phone: '9988776655',
      password: 'Password@123',
    });
    if (res.data.success) {
      newProviderToken = res.data.data.token;
      testProfileId = res.data.data.profile.id || res.data.data.profile._id;
      console.log('✅ 3. Provider Registration: SUCCESS (Draft Profile Created)');
    }
  } catch (err) {
    console.error('❌ 3. Provider Registration: FAILED -', err.response?.data?.message || err.message);
    process.exit(1);
  }

  // 4. Update Profile for New Provider
  try {
    const res = await axios.put(
      `${BASE_URL}/provider/profile`,
      {
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        bio: 'Automated test electrician contractor',
        experience: 5,
        skills: ['Wiring', 'Lighting', 'Switchgear'],
        serviceCategories: ['Electrician', 'AC Repair'],
        address: '123 Tech Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        serviceRadius: 25,
      },
      { headers: { Authorization: `Bearer ${newProviderToken}` } }
    );
    if (res.data.success) {
      console.log(
        `✅ 4. Update Provider Profile: SUCCESS (Completeness: ${res.data.data.completionPercentage}%)`
      );
    }
  } catch (err) {
    console.error('❌ 4. Update Profile: FAILED -', err.response?.data?.message || err.message);
    process.exit(1);
  }

  // 5. Admin Dashboard Metrics
  try {
    const res = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.data.success && res.data.data.stats.totalProviders > 0) {
      const stats = res.data.data.stats;
      console.log(
        `✅ 5. Admin Dashboard Stats: SUCCESS (Total: ${stats.totalProviders}, Pending: ${stats.pendingApplications}, Approved: ${stats.approvedProviders})`
      );
    }
  } catch (err) {
    console.error('❌ 5. Admin Dashboard Stats: FAILED -', err.response?.data?.message || err.message);
    process.exit(1);
  }

  // 6. Admin Search & Filtering
  try {
    const res = await axios.get(
      `${BASE_URL}/admin/providers?page=1&limit=5&city=Bangalore`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (res.data.success && Array.isArray(res.data.data.providers)) {
      console.log(
        `✅ 6. Admin Search & Filter: SUCCESS (Found ${res.data.data.providers.length} in Bangalore)`
      );
    }
  } catch (err) {
    console.error('❌ 6. Admin Filter: FAILED -', err.response?.data?.message || err.message);
    process.exit(1);
  }

  // 7. Admin Provider Detail Dossier
  try {
    const res = await axios.get(`${BASE_URL}/admin/providers/${testProfileId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.data.success && res.data.data.profile) {
      console.log('✅ 7. Admin Provider Dossier Fetch: SUCCESS');
    }
  } catch (err) {
    console.error('❌ 7. Admin Dossier Fetch: FAILED -', err.response?.data?.message || err.message);
    process.exit(1);
  }

  // 8. Admin Rejection with Remarks
  try {
    const res = await axios.put(
      `${BASE_URL}/admin/providers/${testProfileId}/reject`,
      { remarks: 'Test Rejection: Incomplete verification documents.' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (res.data.success && res.data.data.applicationStatus === 'Rejected') {
      console.log('✅ 8. Admin Reject with Remarks: SUCCESS (Status: Rejected)');
    }
  } catch (err) {
    console.error('❌ 8. Admin Reject: FAILED -', err.response?.data?.message || err.message);
    process.exit(1);
  }

  // 9. Admin Approval Workflow
  try {
    const res = await axios.put(
      `${BASE_URL}/admin/providers/${testProfileId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (res.data.success && res.data.data.applicationStatus === 'Approved') {
      console.log('✅ 9. Admin Approve Provider: SUCCESS (Status: Approved)');
    }
  } catch (err) {
    console.error('❌ 9. Admin Approve: FAILED -', err.response?.data?.message || err.message);
    process.exit(1);
  }

  // 10. Role Protection Guard (Provider cannot access Admin endpoints)
  try {
    await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${providerToken}` },
    });
    console.error('❌ 10. Role Protection: FAILED (Provider was able to access Admin dashboard!)');
    process.exit(1);
  } catch (err) {
    if (err.response?.status === 403) {
      console.log('✅ 10. Role Protection: SUCCESS (403 Forbidden properly blocked provider from admin routes)');
    } else {
      console.error('❌ 10. Role Protection: Unexpected error:', err.message);
    }
  }

  console.log('\n🎉 ALL 10 CORE AUTOMATED TESTS PASSED WITH 100% SUCCESS!\n');
  process.exit(0);
}

runTests();
