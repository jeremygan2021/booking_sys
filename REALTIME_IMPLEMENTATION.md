# 实时状态同步系统实现说明

## 概述

本文档说明了爱云香舍预订系统的实时状态同步功能实现，包括统一日历组件和WebSocket实时通信系统。

## 实现的功能

### 1. 统一日历组件 (Task 9.1)

#### 组件结构

- **UnifiedCalendar.vue**: 主日历组件，支持多视图模式切换
- **MonthView.vue**: 月视图，显示整月的预订情况
- **WeekView.vue**: 周视图，显示一周的时间段和预订
- **DayView.vue**: 日视图，显示单日的详细时间表
- **BookingDetailModal.vue**: 预订详情弹窗

#### 核心特性

- ✅ 三种视图模式：月/周/日
- ✅ 房间和餐厅预订统一显示
- ✅ 可切换显示的预订类型（房间/餐厅）
- ✅ 响应式设计，适配移动端
- ✅ 实时更新预订状态
- ✅ 点击预订查看详情

#### 使用方式

```vue
<UnifiedCalendar
  title="预订管理日历"
  :initial-view-mode="'month'"
  @booking-selected="handleBookingSelected"
  @date-selected="handleDateSelected"
/>
```

### 2. 实时状态同步系统 (Task 9.2)

#### 后端实现

**WebSocket服务 (`server/src/services/websocketService.js`)**

- WebSocket服务器初始化和连接管理
- JWT身份验证
- 客户端连接跟踪
- 广播和单播消息功能
- 预订事件通知（创建/更新/取消）
- 可用性变更通知

**集成到Express服务器**

- 在 `server/src/index.js` 中初始化WebSocket服务
- 在控制器中添加WebSocket通知：
  - `roomController.js`: 房间预订创建时通知
  - `restaurantController.js`: 餐厅预订创建时通知

#### 前端实现

**WebSocket Composable (`src/composables/useWebSocket.ts`)**

- WebSocket连接管理
- 自动重连机制（最多5次，间隔3秒）
- 心跳检测（每30秒）
- 事件订阅系统
- 离线状态检测

**实时状态Store (`src/stores/realtime.ts`)**

- 管理WebSocket连接状态
- 处理实时预订事件
- 离线更新队列
- 在线/离线状态管理
- 自动同步待处理更新

**连接状态组件 (`src/components/realtime/ConnectionStatus.vue`)**

- 显示实时连接状态
- 显示待同步更新数量
- 最后同步时间
- 自动隐藏功能

#### 实时事件类型

1. **booking_created**: 新预订创建
2. **booking_updated**: 预订更新
3. **booking_cancelled**: 预订取消
4. **availability_changed**: 可用性变更

#### 使用方式

**在组件中使用WebSocket**

```typescript
import { useWebSocket } from '@/composables/useWebSocket'

const ws = useWebSocket()

// 监听预订创建事件
ws.onBookingCreated((data) => {
  console.log('New booking:', data)
})

// 监听连接状态
watch(
  () => ws.isConnected.value,
  (connected) => {
    console.log('Connection status:', connected)
  },
)
```

**在组件中使用实时Store**

```typescript
import { useRealtimeStore } from '@/stores/realtime'

const realtimeStore = useRealtimeStore()

// 初始化监听器
onMounted(() => {
  realtimeStore.initializeListeners()
})

// 监听自定义事件
window.addEventListener('booking-created', (event) => {
  const { bookingType, booking } = event.detail
  // 处理新预订
})
```

## 离线支持

### 离线检测

- 监听 `online` 和 `offline` 事件
- 自动检测网络状态变化

### 离线队列

- 离线时将更新添加到队列
- 恢复在线时自动同步
- 显示待同步更新数量

### 自动重连

- 连接断开时自动尝试重连
- 最多5次重连尝试
- 指数退避策略（3秒间隔）

## 安全性

### WebSocket认证

- 使用JWT token进行身份验证
- 连接建立后立即验证
- 只有认证用户才能接收广播消息

### 消息验证

- 所有消息都经过JSON解析验证
- 错误消息统一处理
- 防止恶意消息注入

## 性能优化

### 心跳机制

- 每30秒发送ping消息
- 保持连接活跃
- 及时检测连接断开

### 消息批处理

- 支持批量更新同步
- 减少网络请求次数

### 内存管理

- 使用Map存储预订数据
- 及时清理断开的连接
- 组件卸载时清理事件监听

## 测试建议

### 功能测试

1. 创建预订，验证实时更新
2. 多个客户端同时连接，验证广播
3. 断开网络，验证离线队列
4. 恢复网络，验证自动同步

### 性能测试

1. 多个并发连接
2. 高频率消息发送
3. 长时间连接稳定性

### 安全测试

1. 未认证连接尝试
2. 无效token验证
3. 恶意消息注入

## 依赖项

### 后端

- `ws`: ^8.16.0 - WebSocket服务器

### 前端

- Vue 3 Composition API
- Pinia (状态管理)
- TypeScript

## 配置

### 环境变量

```env
# WebSocket URL (自动从VITE_API_URL推导)
VITE_API_URL=http://localhost:3000
```

### WebSocket路径

- 服务器: `ws://localhost:3000/ws`
- 生产环境: `wss://your-domain.com/ws`

## 未来改进

1. **消息持久化**: 将重要消息存储到数据库
2. **消息确认**: 实现消息送达确认机制
3. **房间管理**: 支持用户加入特定房间（如特定日期的预订）
4. **压缩**: 对大消息进行压缩
5. **监控**: 添加WebSocket连接监控和日志
6. **负载均衡**: 支持多服务器WebSocket集群

## 故障排查

### 连接失败

1. 检查服务器是否运行
2. 验证WebSocket URL配置
3. 检查防火墙设置
4. 查看浏览器控制台错误

### 消息未接收

1. 验证用户已认证
2. 检查事件监听器是否正确注册
3. 查看服务器日志

### 性能问题

1. 检查连接数量
2. 监控消息频率
3. 优化消息大小
4. 考虑消息批处理

## 相关文件

### 后端

- `server/src/services/websocketService.js`
- `server/src/index.js`
- `server/src/controllers/roomController.js`
- `server/src/controllers/restaurantController.js`

### 前端

- `src/composables/useWebSocket.ts`
- `src/stores/realtime.ts`
- `src/components/calendar/UnifiedCalendar.vue`
- `src/components/calendar/MonthView.vue`
- `src/components/calendar/WeekView.vue`
- `src/components/calendar/DayView.vue`
- `src/components/calendar/BookingDetailModal.vue`
- `src/components/realtime/ConnectionStatus.vue`
- `src/views/admin/CalendarView.vue`
