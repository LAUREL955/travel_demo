# 开发指南

## 📋 目录

- [环境设置](#环境设置)
- [项目结构](#项目结构)
- [开发工作流](#开发工作流)
- [代码规范](#代码规范)
- [测试指南](#测试指南)
- [部署指南](#部署指南)

## 🔧 环境设置

### 必需工具

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **Git**: 最新版本
- **代码编辑器**: VS Code（推荐）

### 推荐的VS Code扩展

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

### 初始化步骤

1. **克隆仓库**
```bash
git clone <repository-url>
cd travel-route-planner
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **验证环境**
```bash
node diagnose.js
```

## 📁 项目结构

### 目录说明

```
src/
├── components/          # 可复用组件
│   ├── ErrorBoundary/   # 错误边界
│   ├── VirtualList/     # 虚拟列表
│   ├── Map/             # 地图组件
│   └── ...
├── pages/               # 页面级组件
│   ├── Home/            # 首页
│   └── Settings/        # 设置页
├── store/               # Redux状态管理
│   ├── index.ts         # Store配置
│   └── slices/          # Redux Slices
├── services/            # API服务层
│   ├── map.ts           # 地图服务
│   └── route.ts         # 路线服务
├── utils/               # 工具函数
│   ├── algorithms/      # 算法实现
│   ├── performanceMonitor.ts
│   └── ...
├── types/               # TypeScript类型
├── App.tsx              # 根组件
└── main.tsx             # 应用入口
```

### 文件命名规范

- **组件**: PascalCase (如 `Map.tsx`)
- **工具函数**: camelCase (如 `formatDate.ts`)
- **类型定义**: camelCase (如 `index.ts`)
- **常量**: UPPER_SNAKE_CASE (如 `API_ENDPOINTS.ts`)

## 🔄 开发工作流

### 分支策略

- `main` - 生产环境分支
- `develop` - 开发分支
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支
- `hotfix/*` - 紧急修复分支

### 开发流程

1. **创建功能分支**
```bash
git checkout -b feature/your-feature-name
```

2. **开发功能**
```bash
# 开发过程中
npm run dev

# 代码检查
npm run lint
npm run type-check
```

3. **提交代码**
```bash
git add .
git commit -m "feat: add new feature"
```

4. **推送分支**
```bash
git push origin feature/your-feature-name
```

5. **创建Pull Request**

### 提交信息规范

使用 Conventional Commits 规范：

- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具链相关

示例：
```bash
feat: add route optimization algorithm
fix: resolve memory leak in virtual list
docs: update API documentation
```

## 📝 代码规范

### TypeScript规范

```typescript
// ✅ 推荐
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = (id: string): User => {
  return { id, name: '', email: '' };
};

// ❌ 不推荐
const getUser = (id: any) => {
  return { id, name: '', email: '' };
};
```

### React组件规范

```typescript
// ✅ 推荐
interface Props {
  title: string;
  onClick: () => void;
}

const Button: React.FC<Props> = ({ title, onClick }) => {
  return <button onClick={onClick}>{title}</button>;
};

export default Button;
```

### Redux规范

```typescript
// ✅ 推荐
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RouteState {
  destinations: Destination[];
  currentRoute: Route;
}

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    addDestination: (state, action: PayloadAction<Destination>) => {
      state.destinations.push(action.payload);
    },
  },
});

export const { addDestination } = routeSlice.actions;
export default routeSlice.reducer;
```

### 样式规范

```typescript
// ✅ 推荐 - 使用Tailwind CSS
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">

// ❌ 不推荐 - 内联样式
<div style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
```

## 🧪 测试指南

### 单元测试

```typescript
// 示例测试文件
import { describe, it, expect } from 'vitest';

describe('Route Planner', () => {
  it('should calculate shortest route', () => {
    const result = calculateShortestRoute(destinations);
    expect(result.length).toBeGreaterThan(0);
  });
});
```

### 集成测试

```typescript
describe('Route Integration', () => {
  it('should add and remove destinations', () => {
    render(<RoutePlanner />);
    // 测试逻辑
  });
});
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --grep "Route Planner"

# 生成覆盖率报告
npm test -- --coverage
```

## 🚀 部署指南

### 构建生产版本

```bash
# 清理旧构建
npm run clean

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 环境变量

创建 `.env.production` 文件：

```env
VITE_API_URL=https://api.example.com
VITE_MAP_API_KEY=your-map-api-key
VITE_ENV=production
```

### 部署到Vercel

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 部署到Netlify

```bash
# 安装Netlify CLI
npm i -g netlify-cli

# 部署
netlify deploy --prod
```

## 🔍 调试技巧

### React DevTools

1. 安装React DevTools浏览器扩展
2. 检查组件树和props
3. 查看Redux状态

### 性能分析

```typescript
// 在浏览器控制台
performance.mark('start');
// 执行操作
performance.mark('end');
performance.measure('operation', 'start', 'end');
console.log(performance.getEntriesByName('operation'));
```

### 网络监控

```typescript
// 使用内置的网络监控工具
import { networkMonitor } from '@/utils/networkMonitor';

networkMonitor.subscribe((status) => {
  console.log('Network status:', status);
});
```

## 📚 常见问题

### Q: 如何添加新的Redux slice?

1. 在 `src/store/slices/` 创建新文件
2. 使用 `createSlice` 创建slice
3. 在 `src/store/index.ts` 中添加到reducer

### Q: 如何优化组件性能?

1. 使用 `React.memo` 避免不必要的重渲染
2. 使用 `useMemo` 缓存计算结果
3. 使用 `useCallback` 缓存函数引用
4. 使用虚拟列表处理长列表

### Q: 如何处理错误?

1. 使用ErrorBoundary捕获组件错误
2. 使用try-catch处理异步错误
3. 提供友好的错误提示

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📖 参考资料

- [React文档](https://react.dev/)
- [TypeScript文档](https://www.typescriptlang.org/)
- [Redux Toolkit文档](https://redux-toolkit.js.org/)
- [Vite文档](https://vitejs.dev/)
- [Tailwind CSS文档](https://tailwindcss.com/)

---

**注意**: 开发过程中请遵循代码规范，确保代码质量和可维护性。