# 早餐时段功能更新

## 概述

为餐厅预订系统添加了早餐时段支持，现在系统支持三个用餐时段：早餐、午餐和晚餐。

## 更新内容

### 1. 数据库架构更新

- **文件**: `server/src/db/schema.sql`
- 更新了 `restaurant_bookings`、`time_slots` 和 `meal_packages` 表的 `meal_type` 约束
- 现在支持: `'breakfast'`, `'lunch'`, `'dinner'`

### 2. 数据库迁移

- **文件**: `server/src/db/migrations/add_breakfast_meal_type.sql`
- 创建了迁移脚本来更新现有数据库
- 包含示例早餐时间段数据（已注释）

### 3. TypeScript 类型定义

- **文件**: `src/types/index.ts`
- 更新了以下接口的 `mealType` 类型：
  - `MealPackage`
  - `RestaurantBooking`
  - `TimeSlot`
  - `RestaurantBookingForm`

### 4. 前端组件更新

#### 时段选择器

- **文件**: `src/components/booking/TimeSlotPicker.vue`
- 添加了早餐选项按钮（🌅 早餐）
- 更新了用餐时段显示逻辑
- 改为 3 列网格布局以容纳三个选项

#### 菜单选择

- **文件**: `src/components/booking/MenuSelection.vue`
- 添加了早餐选项按钮
- 更新了类型定义和过滤逻辑
- 改为 3 列网格布局

#### 预订表单

- **文件**: `src/components/booking/DiningBookingForm.vue`
- 更新了时段显示逻辑以支持早餐
- 更新了 props 类型定义

#### 餐厅预订视图

- **文件**: `src/views/booking/RestaurantBookingView.vue`
- 更新了本地接口类型定义
- 更新了预订数据结构

#### 时段管理（管理后台）

- **文件**: `src/views/admin/TimeSlotManagement.vue`
- 添加了"早餐时间"标签页
- 添加了早餐时间段列表和管理功能
- 更新了表单选项以包含早餐

### 5. 后端支持

- **文件**: `server/src/controllers/restaurantController.js`
- 控制器已使用参数化查询，自动支持任何 meal_type 值
- 无需额外修改

## 使用说明

### 运行数据库迁移

```bash
cd aiyunxiangshe-booking/server
psql -U your_username -d your_database -f src/db/migrations/add_breakfast_meal_type.sql
```

### 添加早餐时间段

1. 登录管理后台
2. 进入"时间段管理"
3. 点击"早餐时间"标签
4. 点击"添加早餐时间段"按钮
5. 设置时间范围（例如：07:00-08:00）和容量

### 添加早餐套餐（可选）

1. 在管理后台的内容管理中
2. 创建早餐相关的菜系和套餐
3. 将 meal_type 设置为 'breakfast'

## 图标说明

- 🌅 早餐
- 🌞 午餐
- 🌙 晚餐

## 注意事项

- 所有前端组件已更新类型定义，支持早餐选项
- 数据库约束已更新，允许 'breakfast' 值
- 后端 API 无需修改，已自动支持新的 meal_type
- 建议在生产环境部署前先在测试环境验证迁移脚本
