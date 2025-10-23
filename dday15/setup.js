// TaskFlow Setup Script
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up TaskFlow...');

// Create .env file
const envContent = `# TaskFlow Environment Variables
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DB_PATH=./database/taskflow.db

# Optional: Database configuration for production
# DATABASE_URL=sqlite:./database/taskflow.db

# Optional: CORS settings
# CORS_ORIGIN=http://localhost:3000`;

fs.writeFileSync('.env', envContent);
console.log('✅ Created .env file');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Created database directory');
}

console.log('🎉 TaskFlow setup complete!');
console.log('');
console.log('Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm start');
console.log('3. Open: http://localhost:3000');
console.log('');
console.log('Default login credentials:');
console.log('Email: john@taskflow.com');
console.log('Password: password123');
