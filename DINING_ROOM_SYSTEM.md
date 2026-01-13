# 用餐房间管理系统

## 概述

完整的用餐房间管理系统，包括前端展示、后台管理和数据库支持。

## 数据库更新

### 新增表：dining_rooms

```sql
CREATE TABLE dining_rooms (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    room_type VARCHAR(50) CHECK (room_type IN ('mahjong', 'private', 'public', 'tea_room', 'garden', 'other')),
    capacity INTEGER NOT NULL,
    facilities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 更新表：restaurant_bookings

添加字段：

- `dining_room_id UUID` - 关联到用餐房间

### 迁移文件

位置：`server/src/db/migrations/002_add_dining_rooms.sql`

运行迁移：

```bash
cd booking_sys/server
npm run migrate
```

## 后端 API

### 公开接口

#### 获取所有用餐房间

```
GET /api/dining-rooms
Query参数：
  - is_available: boolean (可选)
  - room_type: string (可选)
```

#### 获取单个房间详情

```
GET /api/dining-rooms/:id
```

#### 检查房间可用性

```
GET /api/dining-rooms/availability
Query参数：
  - booking_date: string (必需)
  - meal_type: string (必需)
  - time_slot: string (可选)
```

### 管理员接口

#### 创建用餐房间

```
POST /api/admin/dining-rooms
Headers: Authorization: Bearer <token>
Body: {
  name: string,
  description: string,
  room_type: string,
  capacity: number,
  facilities: string[],
  images: string[],
  is_available: boolean
}
```

#### 更新用餐房间

```
PUT /api/admin/dining-rooms/:id
Headers: Authorization: Bearer <token>
Body: (同创建，所有字段可选)
```

#### 删除用餐房间

```
DELETE /api/admin/dining-rooms/:id
Headers: Authorization: Bearer <token>
```

#### 获取房间统计

```
GET /api/admin/dining-rooms/:id/statistics
Headers: Authorization: Bearer <token>
Query参数：
  - start_date: string (可选)
  - end_date: string (可选)
```

## 前端组件

### 用户端

#### RoomSelection.vue

位置：`src/components/booking/RoomSelection.vue`

功能：

- 展示所有可用用餐房间
- 显示房间图片、设施、容纳人数
- 支持选择房间
- 从API动态加载数据

使用：

```vue
<RoomSelection v-model="selectedRoom" />
```

#### RestaurantBookingView.vue

位置：`src/views/booking/RestaurantBookingView.vue`

更新：

- 增加第一步：选择房间
- 步骤流程：选择房间 → 选择菜单 → 选择时间 → 填写信息
- 将选中的房间传递给预订表单

#### DiningBookingForm.vue

位置：`src/components/booking/DiningBookingForm.vue`

更新：

- 接收 `selectedRoom` prop
- 在提交预订时包含 `dining_room_id`

### 管理端

#### DiningRoomManager.vue

位置：`src/components/admin/DiningRoomManager.vue`

功能：

- 展示所有用餐房间列表
- 创建新房间
- 编辑现有房间
- 删除房间
- 图片管理
- 设施管理

#### DiningRoomManagement.vue

位置：`src/views/admin/DiningRoomManagement.vue`

管理页面视图，包含 DiningRoomManager 组件。

#### 路由配置

位置：`src/router/index.ts`

新增路由：

```typescript
{
  path: 'dining-rooms',
  name: 'admin-dining-rooms',
  component: () => import('../views/admin/DiningRoomManagement.vue'),
}
```

#### 导航菜单

位置：`src/views/admin/AdminDashboard.vue`

新增菜单项："用餐房间"

## 房间类型

系统支持以下房间类型：

1. **mahjong** - 麻将房
   - 配备麻将桌
   - 适合家庭聚会

2. **private** - 独立包间
   - 私密空间
   - 适合商务宴请

3. **public** - 公开位置
   - 开放式区域
   - 适合日常用餐

4. **tea_room** - 茶室
   - 雅致空间
   - 适合品茗论道

5. **garden** - 花园
   - 户外空间
   - 适合春秋季节

6. **other** - 其他
   - 自定义类型

## 预订流程

### 用户预订流程

1. **选择房间**
   - 浏览所有可用房间
   - 查看房间照片、设施、容纳人数
   - 选择合适的房间

2. **选择菜单**
   - 选择用餐类型（早餐/午餐/晚餐）
   - 选择套餐

3. **选择时间**
   - 选择日期
   - 选择时间段

4. **填写信息**
   - 输入客人数量
   - 输入联系人信息
   - 提交预订

### 后台管理流程

1. **房间管理**
   - 创建新房间
   - 上传房间图片
   - 设置房间类型和容纳人数
   - 添加设施标签
   - 设置可预订状态

2. **预订管理**
   - 查看所有预订
   - 查看每个预订关联的房间
   - 统计房间使用情况

## 容量验证

系统在预订时会进行多层容量验证：

1. **房间容量验证**
   - 检查客人数量是否超过房间最大容纳人数
   - 检查房间在该时间段是否已被预订

2. **时间段容量验证**
   - 检查该时间段的总容量
   - 确保不超过餐厅总接待能力

## 图片管理

房间图片存储在 JSONB 数组中：

- 支持多张图片
- 图片URL存储在数据库
- 实际文件存储在服务器 `/uploads` 目录

建议图片规格：

- 格式：JPG/PNG
- 尺寸：1200x800px
- 大小：< 2MB

## 示例数据

系统预置了5个示例房间：

1. 麻将房 - 8人
2. 雅致包间 - 12人
3. 大厅公开位置 - 20人
4. 品茗茶室 - 6人
5. 户外花园 - 15人

## 测试步骤

### 1. 运行数据库迁移

```bash
cd booking_sys/server
npm run migrate
```

### 2. 启动后端服务

```bash
cd booking_sys/server
npm run dev
```

### 3. 启动前端服务

```bash
cd booking_sys
npm run dev
```

### 4. 测试用户端

- 访问 http://localhost:5173/restaurant
- 测试房间选择流程
- 完成一次完整预订

### 5. 测试管理端

- 访问 http://localhost:5173/admin/dining-rooms
- 测试创建、编辑、删除房间
- 上传房间图片
- 查看房间统计

## 注意事项

1. **图片路径**
   - 确保 `/uploads` 目录存在且可写
   - 图片URL需要包含完整路径

2. **权限控制**
   - 管理接口需要管理员权限
   - 使用JWT token进行身份验证

3. **数据验证**
   - 房间容量必须大于0
   - 房间类型必须是预定义的值
   - 设施和图片使用JSONB存储

4. **删除限制**
   - 有未完成预订的房间无法删除
   - 需要先取消或完成相关预订

## 未来扩展

可能的功能扩展：

1. **房间预览**
   - 360度全景图
   - 虚拟导览

2. **智能推荐**
   - 根据人数推荐合适房间
   - 根据历史偏好推荐

3. **价格差异化**
   - 不同房间不同价格
   - 高峰期价格调整

4. **房间组合**
   - 支持预订多个房间
   - 大型宴会场景

5. **实时状态**
   - WebSocket实时更新房间状态
   - 实时显示可用性

## 相关文件

### 后端

- `server/src/db/migrations/002_add_dining_rooms.sql` - 数据库迁移
- `server/src/controllers/diningRoomController.js` - 房间控制器
- `server/src/routes/diningRoomRoutes.js` - 公开路由
- `server/src/routes/adminRoutes.js` - 管理路由
- `server/src/app.js` - 应用配置

### 前端

- `src/components/booking/RoomSelection.vue` - 房间选择组件
- `src/components/booking/DiningBookingForm.vue` - 预订表单
- `src/components/admin/DiningRoomManager.vue` - 房间管理组件
- `src/views/booking/RestaurantBookingView.vue` - 预订视图
- `src/views/admin/DiningRoomManagement.vue` - 管理视图
- `src/views/admin/AdminDashboard.vue` - 管理后台
- `src/router/index.ts` - 路由配置

## 技术栈

- **后端**: Node.js + Express + PostgreSQL
- **前端**: Vue 3 + TypeScript + Tailwind CSS
- **数据库**: PostgreSQL with JSONB support
- **认证**: JWT
- **实时通信**: WebSocket (已有)
