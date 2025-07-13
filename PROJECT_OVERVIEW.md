# YOLO 图像标注工具 - 项目概述

## 项目信息

- **项目名称**: YOLO 图像标注工具
- **基于技术**: Vue 2.7.16
- **项目类型**: 独立运行的 Web 应用
- **主要功能**: YOLO 格式的图像标注和导出

## 已完成功能

### ✅ 核心功能
1. **图像管理**
   - 支持批量导入图片（拖拽/选择文件）
   - 图片列表展示和切换
   - 支持 JPG、JPEG、PNG、BMP 格式

2. **标注功能**
   - 矩形框绘制
   - 类别选择和管理
   - 标注列表查看和删除
   - 实时坐标显示

3. **导出功能**
   - YOLO 格式导出（txt 文件）
   - 批量导出所有标注
   - 包含 classes.txt 和说明文档

4. **用户界面**
   - 中文界面
   - 响应式布局
   - 图片缩放功能
   - 简洁现代的 UI 设计

### ✅ 预留接口
1. **后端 API 接口**
   - 用户认证（登录/登出）
   - 图片上传/下载
   - 标注保存/加载
   - 类别管理

2. **系统集成接口**
   - 事件总线通信
   - Props 传参
   - 组件化集成

## 项目结构

```
yolo-annotation-tool/
├── public/                 # 静态资源
│   └── index.html         # HTML 模板
├── src/                   # 源代码
│   ├── api/              # API 接口（预留）
│   ├── assets/           # 资源文件
│   ├── components/       # Vue 组件
│   │   ├── AnnotationCanvas.vue    # 标注画布
│   │   ├── AnnotationList.vue      # 标注列表
│   │   ├── ClassSelector.vue       # 类别选择器
│   │   └── ImageList.vue           # 图片列表
│   ├── router/           # 路由配置
│   ├── store/            # 状态管理
│   ├── utils/            # 工具函数
│   ├── views/            # 页面视图
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── .gitignore            # Git 忽略文件
├── integration-example.html  # 集成示例
├── package.json          # 项目配置
├── README.md            # 详细文档
├── QUICKSTART.md        # 快速开始
├── start.sh             # 启动脚本
└── webpack.config.js    # 构建配置
```

## 快速启动

```bash
# 方式一：使用启动脚本
./start.sh

# 方式二：手动启动
npm install
npm run dev
```

访问: http://localhost:8080

## 技术特点

1. **独立部署**: 可作为独立应用运行
2. **易于集成**: 提供多种集成方式
3. **零配置**: 开箱即用，无需额外配置
4. **轻量级**: 最小化依赖，快速加载
5. **可扩展**: 预留完整的扩展接口

## 下一步计划

1. 添加更多标注工具（多边形、点标注等）
2. 支持标注数据的云端同步
3. 添加快捷键支持
4. 优化大批量图片的性能
5. 添加标注历史记录功能

## 相关文档

- [README.md](./README.md) - 完整文档
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始
- [integration-example.html](./integration-example.html) - 集成示例