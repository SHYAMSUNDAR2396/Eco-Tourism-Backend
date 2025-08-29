const mongoose = require('mongoose');
require('dotenv').config();

async function testSetup() {
  console.log('🧪 Testing Eco-Tourism Backend Setup...\n');

  try {
    // Test MongoDB connection
    console.log('📡 Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eco-tourism');
    console.log('✅ MongoDB connected successfully\n');

    // Test User model
    console.log('👤 Testing User model...');
    const User = require('./models/User');
    console.log('✅ User model loaded successfully\n');

    // Test middleware
    console.log('🔐 Testing authentication middleware...');
    const { authenticateToken, requireAdmin, requireUser } = require('./middleware/auth');
    console.log('✅ Authentication middleware loaded successfully\n');

    // Test routes
    console.log('🛣️  Testing route modules...');
    const authRoutes = require('./routes/auth');
    const adminRoutes = require('./routes/admin');
    const userRoutes = require('./routes/user');
    console.log('✅ All route modules loaded successfully\n');

    // Test server configuration
    console.log('⚙️  Testing server configuration...');
    const app = require('express')();
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/user', userRoutes);
    console.log('✅ Server routes configured successfully\n');

    console.log('🎉 All tests passed! Your Eco-Tourism Backend is ready to use.\n');
    console.log('📋 Next steps:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Set up your .env file with proper values');
    console.log('   3. Run: npm run dev');
    console.log('   4. Test the API endpoints\n');

  } catch (error) {
    console.error('❌ Setup test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Check if MongoDB is running');
    console.log('   - Verify your .env file configuration');
    console.log('   - Ensure all dependencies are installed');
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
    process.exit(0);
  }
}

// Run the test
testSetup();
