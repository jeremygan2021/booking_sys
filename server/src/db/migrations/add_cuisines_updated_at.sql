-- 为 cuisines 表添加 updated_at 字段
ALTER TABLE cuisines ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 创建触发器以自动更新 updated_at
CREATE TRIGGER IF NOT EXISTS update_cuisines_updated_at 
BEFORE UPDATE ON cuisines
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
