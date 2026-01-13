# 用餐房间系统 - 故障排除指南

## 已解决的问题

### ✅ 问题1: 数据库表不存在

**错误信息**: `relation "dining_rooms" does not exist`

**解决方案**:

```bash
cd booking_sys/server
npm run migrate
```

### ✅ 问题2: 图片404错误

**错误信息**: `Not Found - /images/rooms/xxx.jpg`

**解决方案**:

1. 创建占位图片：

```bash
cd booking_sys
node create-placeholder-images.js
```

2. 更新数据库中的图片路径：

```bash
cd booking_sys/server
node update-room-images.js
```

## 验证系统状态

### 1. 检查数据库表

```bash
# 连接到PostgreSQL
psql -U postgres -d aiyunxiangshe

# 检查表是否存在
\dt dining_rooms

# 查看表数据
SELECT id, name, room_type, capacity FROM dining_rooms;

# 退出
\q
```

### 2. 检查API端点

```bash
# 测试获取所有房间
curl http://localhost:3000/api/dining-rooms

# 测试获取单个房间（替换ID）
curl http://localhost:3000/api/dining-rooms/YOUR_ROOM_ID

# 测试可用性检查
curl "http://localhost:3000/api/dining-rooms/availability?booking_date=2026-01-20&meal_type=lunch"
```

### 3. 检查图片文件

```bash
# 列出图片文件
ls -la booking_sys/public/images/rooms/

# 应该看到：
# mahjong-room.svg
# private-room.svg
# open-area.svg
# tea-room.svg
# garden.svg
# default.svg
```

### 4. 测试前端

访问以下URL并检查：

- http://localhost:5173/restaurant - 用户预订页面
- http://localhost:5173/admin/dining-rooms - 管理后台（需登录）

## 常见问题

### Q1: 前端显示"加载房间数据失败"

**可能原因**:

- 后端服务未启动
- API端点配置错误
- CORS问题

**解决步骤**:

1. 确认后端运行：`curl http://localhost:3000/health`
2. 检查浏览器控制台错误
3. 检查 `.env` 文件中的 `VITE_API_BASE_URL`

### Q2: 管理后台无法创建房间

**可能原因**:

- 未登录或token过期
- 权限不足（非管理员）
- 表单验证失败

**解决步骤**:

1. 重新登录管理后台
2. 检查用户角色是否为 `admin`
3. 检查浏览器控制台的网络请求

### Q3: 图片不显示

**可能原因**:

- 图片路径错误
- 静态文件服务未配置
- 图片文件不存在

**解决步骤**:

1. 检查图片文件是否存在
2. 确认 `app.js` 中有静态文件配置：
   ```javascript
   app.use('/images', express.static(path.join(__dirname, '../public/images')))
   ```
3. 重新生成占位图片

### Q4: 预订时提示"房间容量不足"

**可能原因**:

- 客人数量超过房间容量
- 该时间段房间已被预订

**解决步骤**:

1. 检查房间的 `capacity` 设置
2. 查询该时间段的现有预订：
   ```sql
   SELECT * FROM restaurant_bookings
   WHERE dining_room_id = 'YOUR_ROOM_ID'
   AND booking_date = '2026-01-20'
   AND status IN ('pending', 'confirmed');
   ```

### Q5: 无法删除房间

**错误信息**: "该房间有未完成的预订，无法删除"

**解决步骤**:

1. 查看该房间的活跃预订
2. 取消或完成相关预订
3. 或者将房间设置为"不可用"而不是删除

## 重置系统

如果需要完全重置用餐房间系统：

```bash
# 1. 删除表（谨慎操作！）
psql -U postgres -d aiyunxiangshe -c "DROP TABLE IF EXISTS dining_rooms CASCADE;"

# 2. 重新运行迁移
cd booking_sys/server
npm run migrate

# 3. 重新生成图片
cd booking_sys
node create-placeholder-images.js

# 4. 更新图片路径
cd booking_sys/server
node update-room-images.js

# 5. 重启服务
npm run dev
```

## 开发调试

### 启用详细日志

在 `diningRoomController.js` 中添加日志：

```javascript
console.log('Fetching dining rooms with filters:', { is_available, room_type })
console.log('Query result:', result.rows)
```

### 检查数据库连接

```javascript
// 在 connection.js 中
pool.on('connect', () => {
  console.log('Database connected')
})

pool.on('error', (err) => {
  console.error('Database error:', err)
})
```

### 前端调试

在浏览器控制台：

```javascript
// 检查API响应
fetch('/api/dining-rooms')
  .then((r) => r.json())
  .then(console.log)

// 检查选中的房间
console.log('Selected room:', selectedRoom.value)
```

## 性能优化

### 1. 添加数据库索引

```sql
CREATE INDEX IF NOT EXISTS idx_dining_rooms_available_type
ON dining_rooms(is_available, room_type);
```

### 2. 缓存房间数据

在前端使用 localStorage：

```javascript
const cachedRooms = localStorage.getItem('dining_rooms')
if (cachedRooms) {
  rooms.value = JSON.parse(cachedRooms)
}
```

### 3. 图片优化

- 使用 WebP 格式
- 添加图片懒加载
- 使用 CDN

## 监控和日志

### 查看服务器日志

```bash
# 实时查看日志
tail -f booking_sys/server/logs/app.log

# 搜索错误
grep "ERROR" booking_sys/server/logs/app.log
```

### 数据库查询性能

```sql
-- 查看慢查询
SELECT * FROM pg_stat_statements
WHERE query LIKE '%dining_rooms%'
ORDER BY total_time DESC;
```

## 联系支持

如果问题仍未解决：

1. 检查 GitHub Issues
2. 查看完整文档：`DINING_ROOM_SYSTEM.md`
3. 提供错误日志和复现步骤

## 快速命令参考

```bash
# 启动服务
npm run dev                          # 前端
cd server && npm run dev             # 后端

# 数据库操作
npm run migrate                      # 运行迁移
psql -U postgres -d aiyunxiangshe   # 连接数据库

# 测试
curl http://localhost:3000/api/dining-rooms  # 测试API
node create-placeholder-images.js            # 生成图片
node server/update-room-images.js            # 更新图片路径

# 清理
rm -rf node_modules && npm install   # 重装依赖
```

## 系统状态检查清单

- [ ] PostgreSQL 服务运行中
- [ ] 数据库表 `dining_rooms` 存在
- [ ] 示例数据已插入（5个房间）
- [ ] 占位图片已生成
- [ ] 后端服务运行在 3000 端口
- [ ] 前端服务运行在 5173 端口
- [ ] API 端点响应正常
- [ ] 图片可以访问
- [ ] 管理员账号可以登录
- [ ] 用户可以浏览房间
- [ ] 预订流程正常工作
