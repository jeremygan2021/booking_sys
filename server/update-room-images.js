import pool from './src/db/connection.js';

async function updateRoomImages() {
  console.log('🔄 Updating room images to SVG format...');
  
  try {
    const updates = [
      { name: '麻将房', image: '/images/rooms/mahjong-room.svg' },
      { name: '雅致包间', image: '/images/rooms/private-room.svg' },
      { name: '大厅公开位置', image: '/images/rooms/open-area.svg' },
      { name: '品茗茶室', image: '/images/rooms/tea-room.svg' },
      { name: '户外花园', image: '/images/rooms/garden.svg' }
    ];

    for (const update of updates) {
      await pool.query(
        `UPDATE dining_rooms SET images = $1::jsonb WHERE name = $2`,
        [JSON.stringify([update.image]), update.name]
      );
      console.log(`✓ Updated: ${update.name}`);
    }

    console.log('✅ All room images updated successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

updateRoomImages();
