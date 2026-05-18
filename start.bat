@echo off
chcp 65001 >nul
echo ========================================
echo 旅行路线规划小程序 - 快速启动
echo ========================================
echo.

:: 检查Node.js是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到Node.js
    echo 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js已安装
node -v
echo.

:: 检查npm是否安装
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到npm
    pause
    exit /b 1
)

echo ✓ npm已安装
npm -v
echo.

:: 检查是否需要安装依赖
if not exist "node_modules" (
    echo 📦 正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✓ 依赖安装完成
    echo.
)

:: 运行诊断
echo 🔍 运行项目诊断...
node diagnose.js
echo.

:: 启动开发服务器
echo 🚀 启动开发服务器...
echo.
call npm run dev

pause