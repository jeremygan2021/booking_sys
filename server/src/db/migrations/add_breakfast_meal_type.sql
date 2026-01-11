-- 添加早餐时段支持
-- Migration: Add breakfast meal type support

-- 更新 restaurant_bookings 表的 meal_type 约束
ALTER TABLE restaurant_bookings 
DROP CONSTRAINT IF EXISTS restaurant_bookings_meal_type_check;

ALTER TABLE restaurant_bookings 
ADD CONSTRAINT restaurant_bookings_meal_type_check 
CHECK (meal_type IN ('breakfast', 'lunch', 'dinner'));

-- 更新 time_slots 表的 meal_type 约束
ALTER TABLE time_slots 
DROP CONSTRAINT IF EXISTS time_slots_meal_type_check;

ALTER TABLE time_slots 
ADD CONSTRAINT time_slots_meal_type_check 
CHECK (meal_type IN ('breakfast', 'lunch', 'dinner'));

-- 更新 meal_packages 表的 meal_type 约束
ALTER TABLE meal_packages 
DROP CONSTRAINT IF EXISTS meal_packages_meal_type_check;

ALTER TABLE meal_packages 
ADD CONSTRAINT meal_packages_meal_type_check 
CHECK (meal_type IN ('breakfast', 'lunch', 'dinner'));

-- 插入示例早餐时间段（可选）
-- INSERT INTO time_slots (meal_type, start_time, end_time, max_capacity, is_active) 
-- VALUES 
--   ('breakfast', '07:00:00', '08:00:00', 20, true),
--   ('breakfast', '08:00:00', '09:00:00', 20, true),
--   ('breakfast', '09:00:00', '10:00:00', 15, true);
