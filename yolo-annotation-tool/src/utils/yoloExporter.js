/**
 * 导出标注数据为 YOLO 格式
 * YOLO 格式：class x_center y_center width height
 * 所有坐标都是相对坐标（0-1之间）
 */

export function exportToYOLO(annotationState) {
  const { images, annotations, classes } = annotationState;
  
  // 创建一个 zip 包含所有文件
  const zip = createZip();
  
  // 创建 classes.txt 文件
  const classesContent = classes.map(c => c.name).join('\n');
  zip.file('classes.txt', classesContent);
  
  // 为每个图片创建对应的标注文件
  images.forEach(image => {
    const imageAnnotations = annotations[image.id] || [];
    if (imageAnnotations.length > 0) {
      const annotationContent = imageAnnotations.map(ann => {
        // YOLO 格式：class x_center y_center width height
        return `${ann.class} ${ann.x_center.toFixed(6)} ${ann.y_center.toFixed(6)} ${ann.width.toFixed(6)} ${ann.height.toFixed(6)}`;
      }).join('\n');
      
      // 使用图片名称但替换扩展名为 .txt
      const txtFileName = image.name.replace(/\.[^/.]+$/, '.txt');
      zip.file(`labels/${txtFileName}`, annotationContent);
    }
  });
  
  // 生成 README 文件说明格式
  const readmeContent = `YOLO 标注数据格式说明
===================

目录结构：
- classes.txt: 类别列表文件，每行一个类别名称
- labels/: 标注文件目录，每个图片对应一个同名的 .txt 文件

标注格式：
每个标注文件中，每行代表一个目标框，格式为：
<class_id> <x_center> <y_center> <width> <height>

其中：
- class_id: 类别索引（从0开始）
- x_center, y_center: 目标框中心点的相对坐标（0-1）
- width, height: 目标框的相对宽度和高度（0-1）

类别对应关系：
${classes.map((c, i) => `${i}: ${c.name}`).join('\n')}

生成时间：${new Date().toLocaleString('zh-CN')}
图片数量：${images.length}
标注框总数：${Object.values(annotations).flat().length}
`;
  
  zip.file('README.txt', readmeContent);
  
  // 下载 zip 文件
  downloadZip(zip, 'yolo_annotations.zip');
}

// 创建简单的 zip 结构（模拟）
function createZip() {
  const files = {};
  return {
    file(name, content) {
      files[name] = content;
    },
    generate() {
      return files;
    }
  };
}

// 下载 zip 文件（简化版本，实际导出为多个文件）
function downloadZip(zip, filename) {
  const files = zip.generate();
  
  // 为了简化，我们创建一个包含所有内容的文本文件
  let combinedContent = '';
  
  Object.entries(files).forEach(([name, content]) => {
    combinedContent += `\n========== ${name} ==========\n`;
    combinedContent += content;
    combinedContent += '\n';
  });
  
  // 创建 blob 并下载
  const blob = new Blob([combinedContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace('.zip', '_all.txt');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // 同时下载单独的标注文件
  Object.entries(files).forEach(([name, content]) => {
    if (name.startsWith('labels/')) {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name.replace('labels/', '');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });
  
  alert('标注数据已导出！请查看下载的文件。');
}

// 单独导出某个图片的标注
export function exportSingleImageAnnotations(image, annotations, classes) {
  const content = annotations.map(ann => {
    return `${ann.class} ${ann.x_center.toFixed(6)} ${ann.y_center.toFixed(6)} ${ann.width.toFixed(6)} ${ann.height.toFixed(6)}`;
  }).join('\n');
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = image.name.replace(/\.[^/.]+$/, '.txt');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}