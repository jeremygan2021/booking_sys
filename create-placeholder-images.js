import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rooms = [
  { name: 'mahjong-room', label: '麻将房', color: '#8B4513' },
  { name: 'private-room', label: '独立包间', color: '#4A5568' },
  { name: 'open-area', label: '公开位置', color: '#48BB78' },
  { name: 'tea-room', label: '茶室', color: '#9F7AEA' },
  { name: 'garden', label: '花园', color: '#38B2AC' },
  { name: 'default', label: '房间', color: '#718096' }
];

const createSVG = (label, color) => `
<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="800" fill="${color}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="72" fill="white" text-anchor="middle" dominant-baseline="middle">
    ${label}
  </text>
</svg>
`;

const outputDir = path.join(__dirname, 'public', 'images', 'rooms');

// 确保目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 生成占位图片
rooms.forEach(room => {
  const svg = createSVG(room.label, room.color);
  const filePath = path.join(outputDir, `${room.name}.svg`);
  fs.writeFileSync(filePath, svg.trim());
  console.log(`✓ Created: ${room.name}.svg`);
});

console.log('✅ All placeholder images created!');
