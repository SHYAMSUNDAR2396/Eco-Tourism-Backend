const mongoose = require('mongoose');
const EcoEvent = require('./models/EcoEvent');
const EventRegistration = require('./models/EventRegistration');
const User = require('./models/User');

// Test data for eco-events (without createdBy - will be added after admin user creation)
const testEvents = [
  {
    title: 'Wildlife Safari Adventure',
    description: 'Experience the thrill of spotting wild animals in their natural habitat',
    category: 'Wildlife Safari',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    location: 'Serengeti National Park, Tanzania',
    coordinates: { latitude: -2.3333, longitude: 34.8333 },
    images: [
      { url: 'https://example.com/safari1.jpg', alt: 'Lion in the wild' },
      { url: 'https://example.com/safari2.jpg', alt: 'Elephant herd' }
    ],
    maxParticipants: 20,
    currentParticipants: 0,
    price: 1500,
    duration: 8,
    difficulty: 'Moderate',
    requirements: ['Comfortable walking shoes', 'Camera', 'Binoculars'],
    highlights: ['Lion sightings', 'Elephant encounters', 'Bird watching'],
    organizer: {
      name: 'Wildlife Adventures Ltd',
      contact: '+255-123-456-789',
      email: 'info@wildlifeadventures.com'
    },
    status: 'upcoming',
    progress: 0,
    isActive: true
  },
  {
    title: 'Mountain Trek Expedition',
    description: 'Climb to the summit and enjoy breathtaking panoramic views',
    category: 'Nature Trek',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    location: 'Mount Kilimanjaro, Tanzania',
    coordinates: { latitude: -3.0674, longitude: 37.3556 },
    images: [
      { url: 'https://example.com/trek1.jpg', alt: 'Mountain peak' },
      { url: 'https://example.com/trek2.jpg', alt: 'Hiking trail' }
    ],
    maxParticipants: 15,
    currentParticipants: 0,
    price: 2500,
    duration: 72,
    difficulty: 'Challenging',
    requirements: ['Hiking boots', 'Warm clothing', 'Physical fitness'],
    highlights: ['Summit achievement', 'Stunning views', 'Team building'],
    organizer: {
      name: 'Peak Adventures',
      contact: '+255-987-654-321',
      email: 'info@peakadventures.com'
    },
    status: 'upcoming',
    progress: 0,
    isActive: true
  },
  {
    title: 'Bird Watching Paradise',
    description: 'Discover rare and beautiful bird species in their natural habitat',
    category: 'Bird Watching',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    location: 'Lake Manyara, Tanzania',
    coordinates: { latitude: -3.5833, longitude: 35.7500 },
    images: [
      { url: 'https://example.com/birds1.jpg', alt: 'Flamingo flock' },
      { url: 'https://example.com/birds2.jpg', alt: 'Eagle in flight' }
    ],
    maxParticipants: 12,
    currentParticipants: 0,
    price: 800,
    duration: 6,
    difficulty: 'Easy',
    requirements: ['Binoculars', 'Bird guide book', 'Quiet behavior'],
    highlights: ['Flamingo sightings', 'Rare species', 'Peaceful environment'],
    organizer: {
      name: 'Bird Lovers Society',
      contact: '+255-456-789-123',
      email: 'info@birdlovers.com'
    },
    status: 'upcoming',
    progress: 0,
    isActive: true
  }
];

async function testEcoEvents() {
  try {
    console.log('🧪 Testing Eco-Events Functionality...\n');

    // Test 0: Create or find admin user for testing
    console.log('0. Setting up admin user for testing...');
    let adminUser = await User.findOne({ email: 'admin@test.com' });
    
    if (!adminUser) {
      // Create a test admin user
      adminUser = new User({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        phone: '+123-456-7890',
        address: 'Test Address'
      });
      await adminUser.save();
      console.log('   ✅ Created test admin user');
    } else {
      console.log('   ✅ Found existing test admin user');
    }

    // Test 1: Create test events
    console.log('\n1. Creating test events...');
    const createdEvents = [];
    for (const eventData of testEvents) {
      // Add the admin user as creator
      const eventWithCreator = { ...eventData, createdBy: adminUser._id };
      const event = new EcoEvent(eventWithCreator);
      await event.save();
      createdEvents.push(event);
      console.log(`   ✅ Created: ${event.title}`);
    }

    // Test 2: Test event queries
    console.log('\n2. Testing event queries...');
    const allEvents = await EcoEvent.find({ isActive: true });
    console.log(`   ✅ Found ${allEvents.length} active events`);

    const safariEvents = await EcoEvent.find({ category: 'Wildlife Safari' });
    console.log(`   ✅ Found ${safariEvents.length} Wildlife Safari events`);

    const upcomingEvents = await EcoEvent.find({ status: 'upcoming' });
    console.log(`   ✅ Found ${upcomingEvents.length} upcoming events`);

    // Test 3: Test search functionality
    console.log('\n3. Testing search functionality...');
    const searchResults = await EcoEvent.find({
      $or: [
        { title: { $regex: 'Adventure', $options: 'i' } },
        { description: { $regex: 'Adventure', $options: 'i' } }
      ]
    });
    console.log(`   ✅ Search for 'Adventure' found ${searchResults.length} results`);

    // Test 4: Test event methods
    console.log('\n4. Testing event methods...');
    const firstEvent = createdEvents[0];
    
    // Test addParticipant method
    await firstEvent.addParticipant();
    console.log(`   ✅ Added participant to ${firstEvent.title}`);
    console.log(`   Current participants: ${firstEvent.currentParticipants}/${firstEvent.maxParticipants}`);

    // Test updateProgress method
    await firstEvent.updateProgress(25);
    console.log(`   ✅ Updated progress to ${firstEvent.progress}%`);

    // Test 5: Test virtual properties
    console.log('\n5. Testing virtual properties...');
    console.log(`   Event full: ${firstEvent.isFull}`);
    console.log(`   Event upcoming: ${firstEvent.isUpcoming}`);

    // Test 6: Test event registration
    console.log('\n6. Testing event registration...');
    
    // Create a test user for registration testing
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      // Create a test user
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'user123',
        role: 'user',
        phone: '+123-456-7890',
        address: 'Test User Address'
      });
      await testUser.save();
      console.log('   ✅ Created test user for registration');
    } else {
      console.log('   ✅ Found existing test user');
    }

    // Test registration
    try {
      const registration = new EventRegistration({
        user: testUser._id,
        event: firstEvent._id,
        paymentAmount: firstEvent.price,
        paymentMethod: 'credit_card',
        specialRequirements: 'Vegetarian meals',
        emergencyContact: {
          name: 'John Doe',
          phone: '+123-456-7890',
          relationship: 'Spouse'
        }
      });
      await registration.save();
      console.log(`   ✅ Created registration for user ${testUser.name}`);
    } catch (error) {
      console.log(`   ⚠️  Could not create registration: ${error.message}`);
    }

    // Test 7: Test pagination
    console.log('\n7. Testing pagination...');
    const page1 = await EcoEvent.find({ isActive: true })
      .sort({ date: 1 })
      .skip(0)
      .limit(2);
    console.log(`   ✅ Page 1: ${page1.length} events`);

    const page2 = await EcoEvent.find({ isActive: true })
      .sort({ date: 1 })
      .skip(2)
      .limit(2);
    console.log(`   ✅ Page 2: ${page2.length} events`);

    console.log('\n🎉 All tests completed successfully!');
    console.log(`📊 Total events in database: ${await EcoEvent.countDocuments()}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  // Connect to database
  require('dotenv').config();
  const connectDB = require('./db/connect');
  
  connectDB(process.env.MONGO_URI)
    .then(() => {
      console.log('🔌 Connected to database');
      return testEcoEvents();
    })
    .catch(error => {
      console.error('❌ Database connection failed:', error);
    });
}

module.exports = { testEcoEvents };
