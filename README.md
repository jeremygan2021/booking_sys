# 爱云香舍名宿预订系统 (Aiyunxiangshe Booking System)

一个现代化的Vue.js 3预订系统，采用法式风格UI设计，支持房间预订和餐厅订餐功能。

## 技术栈

- **前端框架**: Vue.js 3 (Composition API)
- **构建工具**: Vite 7
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **代码质量**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged

## 项目结构

```
aiyunxiangshe-booking/
├── src/
│   ├── api/              # API客户端
│   ├── assets/           # 静态资源和样式
│   ├── components/       # Vue组件
│   │   ├── admin/        # 管理后台组件
│   │   ├── booking/      # 预订相关组件
│   │   ├── layout/       # 布局组件
│   │   └── ui/           # UI基础组件
│   ├── composables/      # Vue组合式函数
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia状态管理
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   │   ├── admin/        # 管理后台页面
│   │   └── booking/      # 预订页面
│   ├── App.vue           # 根组件
│   └── main.ts           # 应用入口
├── .env.example          # 环境变量示例
├── .husky/               # Git hooks配置
├── package.json          # 项目依赖
├── tailwind.config.js    # Tailwind配置
├── tsconfig.json         # TypeScript配置
└── vite.config.ts        # Vite配置
```

## 开始使用

### 环境要求

- Node.js >= 20.0.0
- npm >= 10.0.0

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码质量检查

```bash
# 运行ESLint
npm run lint

# 运行类型检查
npm run type-check

# 格式化代码
npm run format
```

## 环境变量

复制 `.env.example` 到 `.env` 并配置以下变量：

```env
VITE_API_BASE_URL=http://localhost:3392/api
```

## 法式设计系统

项目采用优雅的法式风格设计：

### 配色方案

- **主色调**: 奶油白 (#FAF9F6)
- **辅助色**: 温暖金色 (#D4AF37)
- **强调色**: 深蓝色 (#1E3A8A)
- **文字色**: 深灰色 (#374151)

### 字体

- **标题**: Playfair Display (优雅衬线字体)
- **正文**: Inter (现代无衬线字体)
- **装饰**: Dancing Script (手写风格)

### CSS变量

```css
--color-cream: #faf9f6 --color-gold: #d4af37 --color-deep-blue: #1e3a8a --color-text-gray: #374151;
```

## 路由结构

- `/` - 首页
- `/rooms` - 房间预订
- `/restaurant` - 餐厅订餐
- `/login` - 登录页面
- `/admin` - 管理后台
  - `/admin/content` - 内容管理
  - `/admin/bookings` - 预订管理
  - `/admin/calendar` - 日历视图

## API集成

项目包含一个完整的API客户端 (`src/api/client.ts`)，支持：

- JWT身份验证
- RESTful API调用
- 文件上传
- 错误处理
- 自动token管理

## Git工作流

项目配置了pre-commit hooks，在提交前自动：

1. 运行ESLint检查和修复
2. 运行Prettier格式化代码
3. 确保代码质量

## 开发规范

- 使用TypeScript进行类型安全开发
- 遵循Vue 3 Composition API最佳实践
- 使用Tailwind CSS进行样式开发
- 保持组件小而专注
- 编写清晰的注释和文档

## 下一步

查看 `.kiro/specs/aiyunxiangshe-booking/tasks.md` 了解完整的实施计划和任务列表。

## 许可证

Private - 爱云香舍名宿专用
