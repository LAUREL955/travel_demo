# 快速修复指南

## 常见问题及解决方案

### 问题1：页面空白无法加载

**症状：**
- 页面显示空白
- 控制台无错误信息
- 加载动画一直显示

**解决方案：**

1. 检查Node.js是否安装
```bash
node -v
npm -v
```

2. 安装依赖
```bash
npm install
```

3. 清除缓存重新启动
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules
rm -rf node_modules

# 重新安装
npm install
```

4. 检查端口占用
```bash
# Windows
netstat -ano | findstr :5173

# 如果端口被占用，修改vite.config.ts中的端口
```

### 问题2：TypeScript编译错误

**症状：**
- 控制台显示TypeScript错误
- 无法启动开发服务器

**解决方案：**

1. 检查tsconfig.json配置
2. 确保所有导入路径正确
3. 运行类型检查
```bash
npx tsc --noEmit
```

### 问题3：React组件错误

**症状：**
- 页面部分内容无法显示
- 控制台显示React错误

**解决方案：**

1. 检查ErrorBoundary是否正常工作
2. 查看组件导入是否正确
3. 验证props传递是否正确

### 问题4：网络请求失败

**症状：**
- 地图无法加载
- API请求失败
- 网络错误提示

**解决方案：**

1. 检查网络连接
2. 验证API密钥配置
3. 查看浏览器网络面板

## 环境检查清单

- [ ] Node.js v16.0.0+ 已安装
- [ ] npm 已安装并可正常使用
- [ ] 项目依赖已安装
- [ ] 端口5173未被占用
- [ ] 浏览器控制台无错误
- [ ] TypeScript编译无错误

## 调试步骤

1. **打开浏览器开发者工具**
   - 按F12或右键"检查"
   - 查看Console标签页的错误信息

2. **检查网络请求**
   - 切换到Network标签页
   - 查看失败的请求（红色）
   - 检查请求状态码

3. **查看React组件**
   - 安装React DevTools
   - 检查组件树和状态

4. **监控性能**
   - 切换到Performance标签页
   - 查看加载时间和渲染性能

## 联系支持

如果以上解决方案都无法解决问题，请提供以下信息：

1. 具体的错误信息（控制台截图）
2. 操作系统版本
3. 浏览器版本
4. Node.js和npm版本
5. 运行的命令和输出

## 紧急修复

如果项目完全无法启动，尝试：

```bash
# 创建全新的项目
npm create vite@latest travel-route-planner-new -- --template react-ts

# 复制src目录
cp -r src travel-route-planner-new/src/

# 安装依赖并启动
cd travel-route-planner-new
npm install
npm run dev
```