# 手机验证码登录功能

## 功能概述

为管理员登录页面添加了手机验证码登录方式，用户可以选择使用邮箱密码或手机验证码进行登录。

**安全限制**：只有在 `.env` 文件中配置的管理员手机号白名单才能使用验证码登录功能。

## 配置说明

### 环境变量配置

在 `server/.env` 文件中添加管理员手机号白名单：

```env
# SMS Configuration
# 管理员手机号白名单（多个手机号用逗号分隔）
ADMIN_PHONE_WHITELIST=18585164448,13800138000
```

- 支持配置多个手机号，用英文逗号分隔
- 只有白名单中的手机号才能接收验证码
- 手机号必须是已注册的管理员账号

## 实现内容

### 后端实现

1. **SMS服务** (`server/src/utils/smsService.js`)
   - 集成短信API：`https://data.tangledup-ai.com/api/send-sms`
   - 生成6位随机验证码
   - 验证码有效期：5分钟
   - 自动清理过期验证码

2. **新增API接口** (`server/src/controllers/authController.js`)
   - `POST /api/auth/send-sms` - 发送验证码
     - 参数：`{ phone: "手机号" }`
     - 验证手机号格式（中国手机号）
     - **检查手机号是否在白名单中**
     - 检查手机号是否已注册
     - **验证用户是否为管理员角色**
   - `POST /api/auth/login-sms` - 验证码登录
     - 参数：`{ phone: "手机号", code: "验证码" }`
     - **检查手机号是否在白名单中**
     - 验证验证码是否正确和有效
     - **再次确认用户是管理员**
     - 返回JWT token和用户信息

3. **路由配置** (`server/src/routes/authRoutes.js`)
   - 添加验证规则
   - 注册新的登录路由

### 前端实现

1. **登录页面** (`src/views/LoginView.vue`)
   - 添加登录方式切换标签（邮箱登录 / 手机验证码）
   - 手机验证码表单：
     - 手机号输入（支持中国手机号格式验证）
     - 验证码输入（6位数字）
     - 获取验证码按钮（60秒倒计时）
   - 统一的错误提示

2. **状态管理** (`src/stores/auth.ts`)
   - `sendSmsCode(phone)` - 发送验证码
   - `loginWithSms({ phone, code })` - 验证码登录
   - 统一的loading和error状态管理

3. **Composable** (`src/composables/useAuth.ts`)
   - 导出新的登录方法供组件使用

## 使用方法

### 管理员登录流程

1. 访问登录页面 `/login`
2. 点击"手机验证码"标签
3. 输入已注册的手机号
4. 点击"获取验证码"按钮
5. 输入收到的6位验证码
6. 点击"登录"按钮

### 注意事项

- **手机号必须在 `.env` 配置的白名单中**
- 手机号必须已在系统中注册
- **用户必须具有管理员角色**
- 验证码有效期为5分钟
- 获取验证码后需等待60秒才能重新获取
- 验证码使用后自动失效

## API示例

### 发送验证码

```bash
curl -X POST 'http://localhost:3000/api/auth/send-sms' \
  -H 'Content-Type: application/json' \
  -d '{"phone": "18585164448"}'
```

响应：

```json
{
  "success": true,
  "message": "验证码已发送"
}
```

### 验证码登录

```bash
curl -X POST 'http://localhost:3000/api/auth/login-sms' \
  -H 'Content-Type: application/json' \
  -d '{
    "phone": "18585164448",
    "code": "123456"
  }'
```

响应：

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "full_name": "管理员",
    "phone": "18585164448",
    "role": "admin"
  }
}
```

## 技术细节

### 验证码存储

当前使用内存Map存储验证码（开发环境）：

```javascript
{
  phone: {
    code: "123456",
    expiresAt: 1234567890
  }
}
```

**生产环境建议**：使用Redis存储验证码，提供更好的性能和可扩展性。

### 安全措施

- **管理员手机号白名单验证**（环境变量配置）
- **管理员角色验证**（数据库验证）
- 手机号格式验证（正则表达式）
- 验证码6位数字
- 5分钟有效期
- 使用后自动失效
- 60秒发送间隔限制（前端）

## 依赖

- `axios` - HTTP客户端（后端）
- `express-validator` - 请求验证

## 测试

启动服务器后，可以通过以下方式测试：

1. 在 `server/.env` 中配置管理员手机号白名单
2. 确保数据库中有对应的管理员用户记录（role='admin'）
3. 访问 `http://localhost:5173/login`
4. 切换到"手机验证码"标签
5. 输入白名单中的管理员手机号并获取验证码
6. 查看服务器日志获取验证码（开发环境）
7. 输入验证码完成登录

### 错误场景测试

- 使用非白名单手机号：返回 403 错误 "该手机号无权限使用验证码登录"
- 使用未注册手机号：返回 404 错误 "该手机号未注册"
- 使用非管理员账号：返回 403 错误 "只有管理员可以使用验证码登录"
- 使用错误验证码：返回 401 错误 "验证码错误或已过期"

## 未来改进

- [ ] 添加发送频率限制（防止短信轰炸）
- [ ] 使用Redis存储验证码
- [ ] 添加验证码错误次数限制
- [ ] 支持更多国家的手机号格式
- [ ] 添加短信发送日志记录
