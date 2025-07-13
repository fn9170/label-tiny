# YOLO 图像标注工具

基于 Vue2 开发的独立 YOLO 图像标注工具，支持矩形框标注、类别管理、YOLO 格式导出等功能。

## 功能特性

- ✅ **图像标注**：支持矩形框绘制，实时预览
- ✅ **类别管理**：自定义类别，支持颜色标识
- ✅ **批量处理**：支持批量导入图片，快速切换
- ✅ **YOLO 格式**：直接导出 YOLO 格式标注文件
- ✅ **拖拽上传**：支持拖拽导入图片
- ✅ **缩放查看**：支持图片缩放、适应窗口
- ✅ **中文界面**：完整的中文用户界面
- ✅ **系统集成**：预留与主系统集成的接口

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

访问 http://localhost:8080 即可使用

### 生产环境构建

```bash
npm run build
```

构建产物在 `dist` 目录

## 使用指南

### 1. 导入图片

- 点击"导入图片"按钮选择图片
- 或直接拖拽图片到标注区域
- 支持格式：jpg、jpeg、png、bmp

### 2. 选择类别

- 在右侧类别列表中选择要标注的类别
- 点击"添加类别"可自定义新类别

### 3. 绘制标注框

- 选择类别后，在图片上按住鼠标拖动绘制矩形框
- 松开鼠标完成标注

### 4. 管理标注

- 右侧标注列表显示所有标注
- 点击标注可高亮显示
- 点击删除按钮可删除标注

### 5. 导出标注

- 点击"导出标注"按钮
- 自动下载 YOLO 格式的标注文件

## YOLO 格式说明

导出的标注文件格式：
```
<class_id> <x_center> <y_center> <width> <height>
```

- `class_id`: 类别索引（从0开始）
- `x_center`, `y_center`: 目标框中心点的相对坐标（0-1）
- `width`, `height`: 目标框的相对宽度和高度（0-1）

## 系统集成

### 1. 作为组件集成

```javascript
// 在主系统中引入
import YoloAnnotationTool from 'yolo-annotation-tool'

// 使用组件
<yolo-annotation-tool 
  :images="images"
  :classes="classes"
  @save="handleSave"
/>
```

### 2. 通过事件总线通信

```javascript
// 加载图片
this.$bus.$emit('external-load-images', images)

// 获取标注数据
this.$bus.$emit('external-get-annotations')
this.$bus.$on('external-annotations-ready', (annotations) => {
  console.log(annotations)
})
```

### 3. API 接口预留

项目预留了完整的 API 接口，位于 `src/api/index.js`：

- 用户认证：登录、登出、获取用户信息
- 图片管理：上传、删除、获取列表
- 标注管理：保存、加载、批量处理
- 类别管理：增删改查

## 配置说明

### 全局配置

在 `src/main.js` 中配置：

```javascript
Vue.prototype.$config = {
  apiBaseUrl: '/api',           // API 基础路径
  maxImageSize: 10 * 1024 * 1024, // 最大图片大小
  supportedFormats: ['jpg', 'jpeg', 'png', 'bmp'], // 支持的格式
  defaultClasses: [...]         // 默认类别列表
}
```

### 环境变量

创建 `.env` 文件：

```
VUE_APP_API_BASE_URL=http://your-api-server/api
```

## 项目结构

```
yolo-annotation-tool/
├── public/
│   └── index.html          # HTML 模板
├── src/
│   ├── api/               # API 接口模块
│   ├── assets/            # 静态资源
│   ├── components/        # Vue 组件
│   │   ├── ImageList.vue      # 图片列表
│   │   ├── AnnotationCanvas.vue # 标注画布
│   │   ├── ClassSelector.vue   # 类别选择器
│   │   └── AnnotationList.vue  # 标注列表
│   ├── router/            # 路由配置
│   ├── store/             # Vuex 状态管理
│   │   └── modules/
│   │       └── annotation.js   # 标注模块
│   ├── utils/             # 工具函数
│   │   └── yoloExporter.js    # YOLO 导出
│   ├── views/             # 页面组件
│   │   └── AnnotationView.vue  # 标注页面
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── webpack.config.js      # Webpack 配置
├── package.json           # 项目配置
└── README.md             # 说明文档
```

## 技术栈

- Vue 2.7.16
- Vue Router 3.6.5
- Vuex 3.6.2
- Webpack 5
- Babel

## 开发指南

### 添加新功能

1. 在 `store/modules/annotation.js` 添加状态管理
2. 在 `components` 目录创建新组件
3. 在 `api/index.js` 添加 API 接口

### 自定义样式

全局样式在 `App.vue` 中定义，组件样式使用 scoped。

### 扩展类别

修改 `main.js` 中的 `defaultClasses` 配置。

## 许可证

ISC

## 联系方式

如有问题或建议，请提交 Issue。