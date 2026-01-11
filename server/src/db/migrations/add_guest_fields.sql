-- 添加访客姓名和电话字段到 room_bookings 表
-- Add guest name and phone fields to room_bookings table

ALTER TABLE room_bookings 
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(20);

-- 为现有记录从 users 表填充数据
UPDATE room_bookings rb
SET 
    guest_name = u.full_name,
    guest_phone = u.phone
FROM users u
WHERE rb.user_id = u.id 
  AND rb.guest_name IS NULL;

COMMENT ON COLUMN room_bookings.guest_name IS '访客姓名（用于无需登录的预订）';
COMMENT ON COLUMN room_bookings.guest_phone IS '访客电话（用于无需登录的预订）';
