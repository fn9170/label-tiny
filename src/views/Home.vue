<template>
  <div class="home">
    <div class="header">
      <h1>YOLO Image Annotation Tool</h1>
      <p>Fast, accurate, and efficient image annotation solution</p>
    </div>
    
    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">📷</div>
        <h3>Image Import</h3>
        <p>Support drag & drop, multiple image formats</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <h3>Precise Annotation</h3>
        <p>Support bounding boxes with zoom, move, edit features</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🏷️</div>
        <h3>Category Management</h3>
        <p>Flexible category configuration with color coding</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📁</div>
        <h3>YOLO Export</h3>
        <p>One-click export to YOLO format annotation files</p>
      </div>
    </div>
    
    <div class="actions">
      <el-button type="primary" size="large" @click="goToAnnotation">
        Start Annotation
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