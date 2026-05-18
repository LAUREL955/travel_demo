// 项目诊断脚本
// 用于识别和解决常见问题

console.log('========================================');
console.log('项目诊断工具');
console.log('========================================\n');

const issues = [];
const warnings = [];
const suggestions = [];

// 1. 检查Node.js和npm
console.log('【1. 环境检查】');
try {
  const nodeVersion = process.version;
  console.log(`Node.js版本: ${nodeVersion}`);
  
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 16) {
    issues.push('Node.js版本过低，建议升级到v16.0.0或更高版本');
  } else {
    console.log('✓ Node.js版本符合要求');
  }
} catch (error) {
  issues.push('无法检测Node.js版本，请确保已安装Node.js');
}

// 2. 检查package.json
console.log('\n【2. 配置文件检查】');
try {
  const fs = require('fs');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  console.log('项目名称:', packageJson.name);
  console.log('项目版本:', packageJson.version);
  
  // 检查依赖
  const requiredDeps = ['react', 'react-dom', '@reduxjs/toolkit', 'react-redux'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    issues.push(`缺少必要依赖: ${missingDeps.join(', ')}`);
  } else {
    console.log('✓ 所有必要依赖已配置');
  }
  
  // 检查脚本
  if (!packageJson.scripts.dev) {
    issues.push('缺少dev脚本');
  } else {
    console.log('✓ dev脚本已配置');
  }
  
} catch (error) {
  issues.push(`无法读取package.json: ${error.message}`);
}

// 3. 检查TypeScript配置
console.log('\n【3. TypeScript配置检查】');
try {
  const fs = require('fs');
  const tsConfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf8'));
  
  console.log('TypeScript配置已加载');
  
  if (!tsConfig.compilerOptions) {
    issues.push('tsconfig.json缺少compilerOptions');
  } else {
    console.log('✓ compilerOptions已配置');
  }
  
} catch (error) {
  warnings.push(`无法读取tsconfig.json: ${error.message}`);
}

// 4. 检查Vite配置
console.log('\n【4. Vite配置检查】');
try {
  const fs = require('fs');
  const viteConfigContent = fs.readFileSync('./vite.config.ts', 'utf8');
  
  if (viteConfigContent.includes('react')) {
    console.log('✓ Vite React插件已配置');
  } else {
    issues.push('Vite配置中缺少React插件');
  }
  
} catch (error) {
  warnings.push(`无法读取vite.config.ts: ${error.message}`);
}

// 5. 检查源文件结构
console.log('\n【5. 源文件结构检查】');
try {
  const fs = require('fs');
  const path = require('path');
  
  const requiredDirs = [
    'src',
    'src/components',
    'src/pages',
    'src/store',
    'src/utils',
    'src/types'
  ];
  
  const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir));
  
  if (missingDirs.length > 0) {
    issues.push(`缺少必要目录: ${missingDirs.join(', ')}`);
  } else {
    console.log('✓ 所有必要目录已创建');
  }
  
  // 检查关键文件
  const requiredFiles = [
    'src/App.tsx',
    'src/main.tsx',
    'src/store/index.ts',
    'src/store/slices/routeSlice.ts',
    'src/types/index.ts'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    issues.push(`缺少必要文件: ${missingFiles.join(', ')}`);
  } else {
    console.log('✓ 所有必要文件已创建');
  }
  
} catch (error) {
  issues.push(`文件系统检查失败: ${error.message}`);
}

// 6. 检查常见问题
console.log('\n【6. 常见问题检查】');

// 检查是否有node_modules
try {
  const fs = require('fs');
  if (!fs.existsSync('./node_modules')) {
    warnings.push('node_modules目录不存在，需要运行 npm install');
    suggestions.push('运行: npm install');
  } else {
    console.log('✓ node_modules目录存在');
  }
} catch (error) {
  // 忽略文件系统错误
}

// 7. 提供解决方案
console.log('\n========================================');
console.log('诊断结果');
console.log('========================================\n');

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ 未发现明显问题！');
  console.log('\n建议步骤:');
  console.log('1. 运行 npm install 安装依赖');
  console.log('2. 运行 npm run dev 启动开发服务器');
  console.log('3. 在浏览器中打开 http://localhost:5173');
} else {
  if (issues.length > 0) {
    console.log('❌ 发现以下问题:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  以下警告:');
    warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }
  
  if (suggestions.length > 0) {
    console.log('\n💡 建议解决方案:');
    suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });
  }
}

console.log('\n========================================');
console.log('如需更多帮助，请查看 OPTIMIZATION_REPORT.md');
console.log('========================================');