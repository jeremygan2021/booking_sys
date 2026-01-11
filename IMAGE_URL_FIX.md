# 图片URL显示问题修复

## 问题描述

1. **图片CORS错误**：`ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`
2. **图片404错误**：请求 `/api/uploads/xxx.png` 返回404
3. **API路径重复**：请求 `/api/api/rooms/types` 等返回404

## 根本原因

### 问题1：Helmet CORS配置

- **错误**：Helmet默认配置阻止跨域资源加载
- **影响**：图片虽然返回200，但被浏览器CORS策略阻止

### 问题2：图片路径错误

- **错误URL**：`http://localhost:3000/api/uploads/xxx.png`
- **正确URL**：`http://localhost:3000/uploads/xxx.png`
- **原因**：静态文件服务配置在 `/uploads` 路径，不在 `/api/uploads`

### 问题3：API路径重复

- **错误URL**：`http://localhost:3000/api/api/rooms/types`
- **正确URL**：`http://localhost:3000/api/rooms/types`
- **原因**：`VITE_API_BASE_URL` 已包含 `/api`，不应再添加

## 解决方案

### 1. 修复Helmet配置

**文件**：`server/src/app.js`

```javascript
// 安全配置 - 配置helmet以允许跨域图片加载
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)
```

### 2. 修复图片URL拼接

所有组件中的图片URL处理：

```typescript
function getFullImageUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // 图片在服务器根路径，不在 /api 路径下
  const serverUrl =
    import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000'
  return `${serverUrl}${path}`
}
```

### 3. 修复API请求路径

**修复前**：

```typescript
axios.get(`${API_BASE}/api/restaurant/cuisines`) // ❌ 错误
```

**修复后**：

```typescript
axios.get(`${API_BASE}/restaurant/cuisines`) // ✅ 正确
```

## 修复的文件

### 后端

- `server/src/app.js` - 修复Helmet CORS配置

### 前端 - 图片URL处理

- `src/components/admin/ImageManager.vue`
- `src/views/admin/ContentManagement.vue`
- `src/views/admin/MenuManagement.vue`
- `src/components/booking/RoomGallery.vue`
- `src/components/booking/RoomDetail.vue`
- `src/components/booking/RestaurantGallery.vue`

### 前端 - API请求修复

- `src/components/booking/RoomGallery.vue`
- `src/views/admin/ContentManagement.vue`

## 环境变量配置

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## URL拼接规则

### API请求

```typescript
// ✅ 正确 - 不要重复添加 /api
fetch(`${import.meta.env.VITE_API_BASE_URL}/rooms/types`)
// 结果: http://localhost:3000/api/rooms/types

// ❌ 错误 - 重复了 /api
fetch(`${import.meta.env.VITE_API_BASE_URL}/api/rooms/types`)
// 结果: http://localhost:3000/api/api/rooms/types
```

### 图片URL

```typescript
// ✅ 正确 - 移除 /api 前缀
const serverUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '')
const imageUrl = `${serverUrl}${imagePath}`
// 结果: http://localhost:3000/uploads/xxx.png

// ❌ 错误 - 直接使用 API_BASE_URL
const imageUrl = `${import.meta.env.VITE_API_BASE_URL}${imagePath}`
// 结果: http://localhost:3000/api/uploads/xxx.png (404)
```

## 验证方法

### 1. 检查图片加载

打开浏览器开发者工具 Network 标签：

- ✅ 正确：`http://localhost:3000/uploads/xxx.png` (200 OK，无CORS错误)
- ❌ 错误：`http://localhost:3000/api/uploads/xxx.png` (404)
- ❌ 错误：`http://localhost:3000/uploads/xxx.png` (200 OK但有CORS错误)

### 2. 检查API请求

打开浏览器开发者工具 Network 标签：

- ✅ 正确：`http://localhost:3000/api/rooms/types` (200 OK)
- ❌ 错误：`http://localhost:3000/api/api/rooms/types` (404)

## 测试清单

- [ ] 重启后端服务器（helmet配置需要重启）
- [ ] 刷新前端页面（清除缓存）
- [ ] 图片上传成功
- [ ] 图片在管理后台正确显示（无CORS错误）
- [ ] 房间列表正确加载
- [ ] 房间图片正确显示
- [ ] 房间详情页图片正确显示
- [ ] 菜系封面图片正确显示
- [ ] 餐厅图片正确显示
- [ ] 图片复制链接功能正常
- [ ] 内容管理页面正常加载

## 重要提示

1. **必须重启后端服务器**：修改了 `app.js` 中的helmet配置
2. **清除浏览器缓存**：确保加载最新的前端代码
3. **检查环境变量**：确保 `VITE_API_BASE_URL` 包含 `/api` 后缀
4. **CORS配置**：helmet的 `crossOriginResourcePolicy` 设置为 `cross-origin`

## 相关文档

- [图片管理功能使用指南](./IMAGE_MANAGEMENT_GUIDE.md)
- [图片功能实现总结](./IMAGE_FEATURE_SUMMARY.md)
