<template>
  <div class="home">
    <div class="header">
      <h1>YOLO 图像标注工具</h1>
      <p>快速、准确、高效的图像标注解决方案</p>
    </div>
    
    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">📷</div>
        <h3>图像导入</h3>
        <p>支持拖拽导入，多种图像格式</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <h3>精准标注</h3>
        <p>支持矩形标注框，可缩放、移动、编辑</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🏷️</div>
        <h3>类别管理</h3>
        <p>灵活的类别配置，支持颜色区分</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📁</div>
        <h3>YOLO导出</h3>
        <p>一键导出YOLO格式标注文件</p>
      </div>
    </div>
    
    <div class="actions">
      <el-button type="primary" size="large" @click="goToAnnotation">
        开始标注
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    goToAnnotation() {
      this.$router.push('/annotation')
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  text-align: center;
  margin-bottom: 60px;
  color: white;
}

.header h1 {
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: 700;
}

.header p {
  font-size: 20px;
  opacity: 0.9;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
  max-width: 1000px;
  width: 100%;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 24px;
  margin-bottom: 15px;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.actions {
  text-align: center;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 36px;
  }
  
  .header p {
    font-size: 18px;
  }
  
  .features {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .feature-card {
    padding: 20px;
  }
}
</style> 