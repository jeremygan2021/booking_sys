# 用餐房间系统 - 快速启动指南

## 快速开始

### 1. 运行数据库迁移

```bash
cd booking_sys/server
npm run migrate
```

这将创建 `dining_rooms` 表并插入示例数据。

### 2. 启动服务

**后端：**

```bash
cd booking_sys/server
npm run dev
```

**前端：**

```bash
cd booking_sys
npm run dev
```

### 3. 访问系统

**用户端预订：**

- URL: http://localhost:5173/restaurant
- 流程：选择房间 → 选择菜单 → 选择时间 → 填写信息

**管理后台：**

- URL: http://localhost:5173/admin/dining-rooms
- 需要管理员登录
- 功能：创建、编辑、删除房间

## 主要功能

### 用户端

✅ 浏览所有可用用餐房间  
✅ 查看房间照片和设施  
✅ 查看容纳人数  
✅ 选择合适的房间进行预订  
✅ 房间容量自动验证

### 管理端

✅ 创建新的用餐房间  
✅ 编辑房间信息（名称、描述、类型）  
✅ 设置容纳人数  
✅ 管理房间设施标签  
✅ 上传和管理房间图片  
✅ 设置房间可预订状态  
✅ 删除房间（需无活跃预订）

## API端点

### 公开接口

- `GET /api/dining-rooms` - 获取所有房间
- `GET /api/dining-rooms/:id` - 获取单个房间
- `GET /api/dining-rooms/availability` - 检查可用性

### 管理接口（需认证）

- `POST /api/admin/dining-rooms` - 创建房间
- `PUT /api/admin/dining-rooms/:id` - 更新房间
- `DELETE /api/admin/dining-rooms/:id` - 删除房间
- `GET /api/admin/dining-rooms/:id/statistics` - 房间统计

## 房间类型

- `mahjong` - 麻将房
- `private` - 独立包间
- `public` - 公开位置
- `tea_room` - 茶室
- `garden` - 花园
- `other` - 其他

## 示例数据

系统已预置5个房间：

1. 麻将房（8人）
2. 雅致包间（12人）
3. 大厅公开位置（20人）
4. 品茗茶室（6人）
5. 户外花园（15人）

## 图片准备

将房间图片放在 `public/images/rooms/` 目录：

- mahjong-room.jpg
- private-room.jpg
- open-area.jpg
- tea-room.jpg
- garden.jpg

## 测试流程

### 测试用户预订

1. 访问 http://localhost:5173/restaurant
2. 点击"开始预订"
3. 选择一个房间
4. 选择菜单套餐
5. 选择日期和时间
6. 填写联系信息
7. 提交预订

### 测试管理功能

1. 登录管理后台
2. 访问"用餐房间"菜单
3. 点击"添加房间"
4. 填写房间信息
5. 上传图片
6. 保存房间
7. 测试编辑和删除功能

## 常见问题

**Q: 房间图片不显示？**  
A: 确保图片路径正确，或使用占位图片。

**Q: 无法删除房间？**  
A: 检查是否有未完成的预订关联到该房间。

**Q: 预订时提示容量不足？**  
A: 检查房间容量设置和当前时间段的预订情况。

## 下一步

查看完整文档：`DINING_ROOM_SYSTEM.md`
