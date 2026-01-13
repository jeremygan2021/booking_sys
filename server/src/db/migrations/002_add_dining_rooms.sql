-- 添加餐厅用餐房间表
-- Add dining rooms table for restaurant bookings

-- 餐厅用餐房间表
CREATE TABLE IF NOT EXISTS dining_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('mahjong', 'private', 'public', 'tea_room', 'garden', 'other')),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    facilities JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 为餐厅预订表添加用餐房间字段
ALTER TABLE restaurant_bookings 
ADD COLUMN IF NOT EXISTS dining_room_id UUID REFERENCES dining_rooms(id) ON DELETE SET NULL;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_dining_rooms_type ON dining_rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_dining_rooms_available ON dining_rooms(is_available);
CREATE INDEX IF NOT EXISTS idx_restaurant_bookings_dining_room ON restaurant_bookings(dining_room_id);

-- 创建更新时间戳触发器
DROP TRIGGER IF EXISTS update_dining_rooms_updated_at ON dining_rooms;
CREATE TRIGGER update_dining_rooms_updated_at BEFORE UPDATE ON dining_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO dining_rooms (name, description, room_type, capacity, facilities, images) VALUES
('麻将房', '独立包间，配备全自动麻将桌，适合家庭聚会或朋友小聚', 'mahjong', 8, 
 '["麻将桌", "独立包间", "空调", "音响系统"]'::jsonb, 
 '["/images/rooms/mahjong-room.svg"]'::jsonb),
 
('雅致包间', '私密舒适的用餐空间，适合商务宴请或家庭聚餐', 'private', 12, 
 '["独立包间", "空调", "电视", "独立卫生间"]'::jsonb, 
 '["/images/rooms/private-room.svg"]'::jsonb),
 
('大厅公开位置', '开放式用餐区域，氛围轻松愉快，适合日常用餐', 'public', 20, 
 '["开放空间", "自然采光", "空调"]'::jsonb, 
 '["/images/rooms/open-area.svg"]'::jsonb),
 
('品茗茶室', '雅致的茶室空间，品茗论道，适合商务洽谈或休闲聚会', 'tea_room', 6, 
 '["茶具", "独立包间", "古典装饰", "空调"]'::jsonb, 
 '["/images/rooms/tea-room.svg"]'::jsonb),
 
('户外花园', '户外花园用餐区，绿意盎然，适合春秋季节户外聚餐', 'garden', 15, 
 '["户外空间", "花园景观", "遮阳伞", "户外音响"]'::jsonb, 
 '["/images/rooms/garden.svg"]'::jsonb);

