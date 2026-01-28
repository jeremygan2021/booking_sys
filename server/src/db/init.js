import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pool from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function insertSeedData() {
  // 1. Create Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@aiyunxiangshe.com';
  const adminPwd = process.env.ADMIN_PASSWORD || 'admin123';
  const adminPassword = await bcrypt.hash(adminPwd, 10);
  await pool.query(`
    INSERT INTO users (email, password_hash, full_name, phone, role)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (email) DO UPDATE SET role = $5, phone = $4
    RETURNING id;
  `, [adminEmail, adminPassword, 'System Administrator', '13800138000', 'admin']);
  
  console.log('  ✓ Admin user created/updated');

  // 根据 ADMIN_PHONE_WHITELIST 为白名单中的每个手机号确保存在 admin 用户（用于验证码登录）
  const whitelist = (process.env.ADMIN_PHONE_WHITELIST || '')
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p && /^1[3-9]\d{9}$/.test(p));
  for (const phone of whitelist) {
    const existing = await pool.query('SELECT id FROM users WHERE phone = $1 AND role = $2', [phone, 'admin']);
    if (existing.rows.length === 0) {
      const placeholderEmail = `admin_${phone}@internal`;
      await pool.query(`
        INSERT INTO users (email, password_hash, full_name, phone, role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE SET phone = $4, role = $5
      `, [placeholderEmail, adminPassword, `Admin ${phone}`, phone, 'admin']);
      console.log(`  ✓ Admin for phone ${phone} ensured`);
    }
  }

  // 2. Create Room Types
  // First clear existing room types to avoid duplicates if re-running without dropping tables
  // Note: This is a simple seed, in production be careful
  
  const roomTypes = [
    {
      name: 'Deluxe Room',
      description: 'Spacious room with king size bed and city view',
      base_price: 880.00,
      max_occupancy: 2,
      amenities: JSON.stringify(['WiFi', 'AC', 'TV', 'Minibar']),
      images: JSON.stringify(['/images/rooms/private-room.svg'])
    },
    {
      name: 'Standard Room',
      description: 'Cozy room with queen size bed',
      base_price: 580.00,
      max_occupancy: 2,
      amenities: JSON.stringify(['WiFi', 'AC']),
      images: JSON.stringify(['/images/rooms/open-area.svg'])
    },
    {
      name: 'Family Suite',
      description: 'Large suite with two bedrooms and living area',
      base_price: 1280.00,
      max_occupancy: 4,
      amenities: JSON.stringify(['WiFi', 'AC', 'TV', 'Kitchen', 'Balcony']),
      images: JSON.stringify(['/images/rooms/garden.svg'])
    }
  ];

  for (const type of roomTypes) {
    // Check if exists
    let typeId;
    const existing = await pool.query('SELECT id FROM room_types WHERE name = $1', [type.name]);
    if (existing.rows.length > 0) {
      typeId = existing.rows[0].id;
    } else {
      const res = await pool.query(`
        INSERT INTO room_types (name, description, base_price, max_occupancy, amenities, images)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `, [type.name, type.description, type.base_price, type.max_occupancy, type.amenities, type.images]);
      typeId = res.rows[0].id;
    }
    
    // Create Rooms for this type
    const prefix = type.name.charAt(0);
    for (let i = 1; i <= 5; i++) {
        const roomNum = `${prefix}10${i}`;
        await pool.query(`
            INSERT INTO rooms (room_number, room_type_id)
            VALUES ($1, $2)
            ON CONFLICT (room_number) DO NOTHING
        `, [roomNum, typeId]);
    }
  }
  console.log('  ✓ Room types and rooms created');

  // 3. Create Cuisines
  const cuisines = [
    { name: 'French', description: 'Authentic French cuisine', image_url: '/images/rooms/default.svg' },
    { name: 'Local Fusion', description: 'Local ingredients with modern twist', image_url: '/images/rooms/default.svg' }
  ];

  for (const cuisine of cuisines) {
    let cuisineId;
    const existing = await pool.query('SELECT id FROM cuisines WHERE name = $1', [cuisine.name]);
    if (existing.rows.length > 0) {
        cuisineId = existing.rows[0].id;
    } else {
        const res = await pool.query(`
        INSERT INTO cuisines (name, description, image_url)
        VALUES ($1, $2, $3)
        RETURNING id;
        `, [cuisine.name, cuisine.description, cuisine.image_url]);
        cuisineId = res.rows[0].id;
    }
    
    // Create Meal Packages
    const packages = [
      { 
        name: `${cuisine.name} Lunch Set`, 
        description: '3-course lunch menu', 
        price: 188.00, 
        meal_type: 'lunch', 
        max_guests: 4 
      },
      { 
        name: `${cuisine.name} Dinner Experience`, 
        description: '5-course dinner tasting menu', 
        price: 388.00, 
        meal_type: 'dinner', 
        max_guests: 6 
      }
    ];

    for (const pkg of packages) {
      // Check if package exists to avoid duplicates
      const existingPkg = await pool.query('SELECT id FROM meal_packages WHERE name = $1', [pkg.name]);
      if (existingPkg.rows.length === 0) {
        await pool.query(`
            INSERT INTO meal_packages (name, description, price, cuisine_id, meal_type, max_guests)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [pkg.name, pkg.description, pkg.price, cuisineId, pkg.meal_type, pkg.max_guests]);
      }
    }
  }
  console.log('  ✓ Cuisines and meal packages created');
}

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful');

    // Read and execute schema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Creating database schema...');
    await pool.query(schemaSql);
    console.log('✓ Database schema created successfully');

    // Insert seed data
    console.log('🌱 Inserting seed data...');
    await insertSeedData();
    console.log('✓ Seed data inserted successfully');

    console.log('✅ Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
