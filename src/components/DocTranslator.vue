<template>
  <div class="container">
    <h1 class="title">Word文档翻译</h1>
    <div class="upload-area" :class="{ 'dragging': isDragging }" @drop="onDrop" @dragover.prevent @dragenter.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
      <input type="file" @change="onFileSelected" ref="fileInput">
      <div v-if="!file">
        <h2>拖放文件到此处或点击上传</h2>
        <p>支持 .docx 格式</p>
      </div>
      <div v-else class="file-info">
        <span>{{ file.name }}</span>
        <button @click="clearFile" class="clear-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <div class="options">
      <div class="option">
        <label for="language">目标语言:</label>
        <select id="language" v-model="targetLanguage">
          <option value="zh-CN">简体中文</option>
          <option value="en">英语</option>
          </select>
      </div>
      <div class="option">
        <label for="mode">翻译模式:</label>
        <select id="mode" v-model="bilingual">
          <option :value="true">双语对照</option>
          <option :value="false">纯翻译</option>
        </select>
      </div>
    </div>
    <button :disabled="!file" @click="translate" class="translate-btn">翻译</button>
    <div v-if="isTranslating" class="progress">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
    <div v-if="translatedDoc" class="download-area">
      <h2>翻译完成！</h2>
      <a :href="translatedDoc" download="translated.docx" class="download-btn">下载翻译结果</a>
    </div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      file: null,
      targetLanguage: 'zh-CN',
      bilingual: true,
      isTranslating: false,
      progress: 0,
      translatedDoc: null,
      isDragging: false, 
      errorMessage: null, // 用于存储错误信息
    };
  },
  methods: {
    onFileSelected(event) {
      this.file = event.target.files[0];
    },
    clearFile() {
      this.file = null;
      this.$refs.fileInput.value = null; // 清除input的值
    },
    async translate() {
      this.isTranslating = true;
      this.progress = 0;

      const formData = new FormData();
      formData.append('file', this.file);
      formData.append('targetLanguage', this.targetLanguage);
      formData.append('bilingual', this.bilingual);

      try {
        const response = await axios.post('/api/translate', formData,
        {
          onUploadProgress: (progressEvent) => {
            this.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          },
        });

        this.translatedDoc = response.data.translatedDoc;
      } catch (error) {
        // 检查是否为API返回的错误
        if (error.response && error.response.data && error.response.data.error) {
          this.errorMessage = error.response.data.error;
        } else {
          this.errorMessage = '翻译过程中出现错误。';
        }
      } finally {
        this.isTranslating = false;
      }
    },
    onDrop(event) {
      this.isDragging = false;
      this.file = event.dataTransfer.files[0];
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
  padding: 2rem;
}

.title {
  margin-bottom: 2rem;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 5px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.upload-area.dragging {
  background-color: #f2f2f2;
}

.upload-area input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
}

.clear-btn {
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 1.2rem;
  color: #aaa;
}

.options {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.option {
  display: flex;
  align-items: center;
}

.option label {
  margin-right: 0.5rem;
}

.translate-btn {
  background-color: #4CAF50;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 2rem;
  font-size: 1.2rem;
  transition: background-color 0.3s;
}

.translate-btn:hover {
  background-color: #3e8e41;
}

.translate-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.progress {
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 5px;
  height: 1rem;
  margin-top: 1rem;
  overflow: hidden;
}

.progress-bar {
  background-color: #4CAF50;
  height: 100%;
  width: 0%;
  transition: width 0.3s;
}

.download-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}

.download-btn {
  background-color: #3498db;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  margin-top: 1rem;
  font-size: 1.2rem;
  transition: background-color 0.3s;
}

.download-btn:hover {
  background-color: #2980b9;
}

.error-message {
  background-color: #fdd;
  border: 1px solid #faa;
  color: #a00;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 5px;
}
</style>