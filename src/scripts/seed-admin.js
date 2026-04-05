const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seedAdmin() {
  console.log('\n🔐 --- NUTRIZI ADMIN USER AUDIT ---');
  console.log('Time:', new Date().toLocaleString());
  console.log('------------------------------------\n');

  try {
    // 1. Audit: Check existing users
    console.log('🕵️  Scanning Database for users...');
    const users = await userRepository.findAll();
    
    if (users.length > 0) {
      console.log(`✅ FOUND: ${users.length} user(s) in the database.`);
      console.table(users.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        full_name: u.full_name || 'N/A'
      })));
      console.log('\n⚠️  Seeding skipped: Database already has users.');
    } else {
      console.log('⚠️  EMPTY: No users found in the database.');
      
      // 2. Seeding: Create initial admin
      const defaultUsername = 'admin';
      const defaultPassword = 'Password123';
      const defaultRole = 'ADMIN';

      console.log(`🚀 Creating placeholder user: [${defaultUsername}]...`);
      
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(defaultPassword, salt);

      const userId = await userRepository.create({
        username: defaultUsername,
        passwordHash: passwordHash,
        role: defaultRole,
        full_name: 'Super Admin',
        title: 'Master Nutritionist'
      });

      console.log(`\n✅ SUCCESS: Admin User created with ID: ${userId}`);
      console.log('------------------------------------');
      console.log('Credentials:');
      console.log(`- Username: ${defaultUsername}`);
      console.log(`- Password: ${defaultPassword}`);
      console.log('------------------------------------');
      console.log('🚨 IMPORTANT: Please change this password immediately after login!');
    }

  } catch (err) {
    console.error('\n❌ ERROR during Audit/Seed:', err.message);
  }

  console.log('\n🏁 Audit/Seed Complete.\n');
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error('CRITICAL ERROR:', err);
  process.exit(1);
});
