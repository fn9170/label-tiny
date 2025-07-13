<template>
  <div class="class-selector">
    <h3 class="selector-header">选择类别</h3>
    <div class="class-list">
      <div
        v-for="classItem in classes"
        :key="classItem.id"
        class="class-item"
        :class="{ active: selectedClass === classItem.id }"
        @click="selectClass(classItem.id)"
      >
        <span
          class="class-color"
          :style="{ backgroundColor: classItem.color }"
        ></span>
        <span class="class-name">{{ classItem.name }}</span>
        <span class="class-id">{{ classItem.id }}</span>
      </div>
    </div>
    <div class="class-actions">
      <button class="btn btn-small" @click="showAddClassDialog">
        + 添加类别
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ClassSelector',
  computed: {
    ...mapState('annotation', ['classes', 'selectedClass'])
  },
  methods: {
    ...mapMutations('annotation', ['SET_SELECTED_CLASS', 'SET_CLASSES']),
    
    selectClass(classId) {
      this.SET_SELECTED_CLASS(classId);
    },
    
    showAddClassDialog() {
      const name = prompt('请输入类别名称：');
      if (!name) return;
      
      const color = prompt('请输入颜色（HEX格式，如 #FF0000）：', '#' + Math.floor(Math.random()*16777215).toString(16));
      if (!color) return;
      
      const newClass = {
        id: Math.max(...this.classes.map(c => c.id), -1) + 1,
        name: name,
        color: color
      };
      
      this.SET_CLASSES([...this.classes, newClass]);
    }
  }
}
</script>

<style scoped>
.class-selector {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.selector-header {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 500;
}

.class-list {
  max-height: 200px;
  overflow-y: auto;
}

.class-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 5px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.class-item:hover {
  background: #f5f5f5;
}

.class-item.active {
  background: #ecf5ff;
  border-color: #409eff;
}

.class-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 10px;
  flex-shrink: 0;
}

.class-name {
  flex: 1;
  font-size: 14px;
}

.class-id {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.class-actions {
  margin-top: 10px;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
  width: 100%;
}
</style>