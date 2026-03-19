<template>
  <div class="app-container">
    <!-- 画布区域 -->
    <div class="canvas-container">
      <div
        ref="imageWrapperRef"
        class="image-wrapper"
        :style="imageWrapperStyle"
        @mousedown="handleMouseDown"
      >
        <img
          ref="imageRef"
          :src="imageUrl"
          alt="编辑图片"
          class="canvas-image"
          @load="handleImageLoad"
          draggable="false"
        />
      </div>

      <!-- 多角度编辑器 - 浮动在左侧或右侧 -->
      <AngleEditor
        v-if="showAngleEditor"
        @close="showAngleEditor = false"
        :image-url="imageUrl"
        class="angle-editor-float"
        :class="editorPosition"
        :style="editorStyle"
      />
    </div>

    <!-- 浮动按钮 -->
    <div class="floating-buttons">
      <button
        v-for="(btn, index) in buttons"
        :key="index"
        class="floating-btn"
        :class="{ active: btn === '多角度' && showAngleEditor }"
        @click="handleButtonClick(btn)"
      >
        {{ btn }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import AngleEditor from './components/AngleEditor.vue'

const showAngleEditor = ref(false)
const editorPosition = ref<'left' | 'right'>('left')
const imageRef = ref<HTMLImageElement | null>(null)
const imageWrapperRef = ref<HTMLDivElement | null>(null)
const imageUrl = ref('./img2.png')

// 图片拖拽位置
const imagePosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })
const imageStartPos = ref({ x: 0, y: 0 })
const isEditorVisibleBeforeDrag = ref(false)  // 记录拖拽前编辑器的可见性

// 编辑器位置（使用 ref 而不是 computed，确保能强制更新）
const editorPos = ref({ left: 0, top: 0 })

const buttons = [
  '多角度',
]

const imageWrapperStyle = computed(() => {
  if (imagePosition.value.x === 0 && imagePosition.value.y === 0) {
    // 初始居中
    return {
      transform: 'translate(-50%, -50%)'
    }
  }
  // 拖拽后使用 translate
  return {
    transform: `translate(calc(-50% + ${imagePosition.value.x}px), calc(-50% + ${imagePosition.value.y}px))`
  }
})

const editorStyle = computed(() => {
  return {
    left: `${editorPos.value.left}px`,
    top: `${editorPos.value.top}px`
  }
})

const handleButtonClick = (btn: string) => {
  console.log(`执行${btn}操作`)

  if (btn === '多角度') {
    // 先计算编辑器位置
    updateEditorPosition()

    // 然后显示编辑器（位置已经计算好了）
    showAngleEditor.value = true
  }
}

const handleImageLoad = () => {
  // 图片加载完成后，如果编辑器是显示状态，则更新位置
  if (showAngleEditor.value) {
    updateEditorPosition()
  }
}

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  dragStartPos.value = { x: e.clientX, y: e.clientY }
  imageStartPos.value = { x: imagePosition.value.x, y: imagePosition.value.y }

  // 记录拖拽前编辑器的可见性
  isEditorVisibleBeforeDrag.value = showAngleEditor.value

  // 拖拽开始时隐藏编辑器
  if (showAngleEditor.value) {
    showAngleEditor.value = false
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return

  const deltaX = e.clientX - dragStartPos.value.x
  const deltaY = e.clientY - dragStartPos.value.y

  imagePosition.value = {
    x: imageStartPos.value.x + deltaX,
    y: imageStartPos.value.y + deltaY
  }
}

const handleMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  // 拖拽结束后，如果之前编辑器是打开的，则重新显示并更新位置
  if (isEditorVisibleBeforeDrag.value) {
    // 先计算编辑器位置
    updateEditorPosition()

    // 然后显示编辑器
    showAngleEditor.value = true
  }
}

const updateEditorPosition = () => {
  // 安全检查：确保图片元素和容器都存在
  if (!imageRef.value || !imageWrapperRef.value) {
    console.warn('图片元素或容器未找到')
    return
  }

  const image = imageRef.value
  const imageRect = image.getBoundingClientRect()
  const containerRect = document.querySelector('.canvas-container')?.getBoundingClientRect()

  if (!containerRect) {
    console.warn('容器元素未找到')
    return
  }

  // 计算图片左边距离左边界和右边距离右边界的距离
  const windowWidth = window.innerWidth
  const distanceToLeft = imageRect.left
  const distanceToRight = windowWidth - imageRect.right

  // 如果左边距离大于右边距离，显示在左边，否则显示在右边
  editorPosition.value = distanceToLeft > distanceToRight ? 'left' : 'right'

  // 编辑器宽度（根据组件的实际宽度）
  const editorWidth = 280  // AngleEditor 组件的宽度约为 280px
  const offset = 5  // 距离图片的偏移量

  // 计算编辑器相对于 canvas-container 的位置
  let editorLeft: number

  if (editorPosition.value === 'left') {
    // 左侧：编辑器在图片左边
    editorLeft = imageRect.left - containerRect.left - editorWidth - offset
  } else {
    // 右侧：编辑器在图片右边
    editorLeft = imageRect.right - containerRect.left + offset
  }

  const editorTop = imageRect.top - containerRect.top

  // 更新 editorPos
  editorPos.value = {
    left: editorLeft,
    top: editorTop
  }

  console.log('编辑器位置更新:', {
    imageLeft: imageRect.left,
    imageRight: imageRect.right,
    imageTop: imageRect.top,
    distanceToLeft,
    distanceToRight,
    editorPosition: editorPosition.value,
    editorLeft,
    editorTop
  })
}

const handleResize = () => {
  // 窗口大小改变时，如果编辑器是显示状态，则立即更新位置
  if (showAngleEditor.value) {
    updateEditorPosition()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
}

.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-wrapper {
  position: absolute;
  left: 50%;
  top: 50%;
  cursor: move;
  user-select: none;
  display: inline-block;
}

.canvas-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  display: block;
  pointer-events: none;
}

.floating-buttons {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.floating-btn {
  background: #333;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.floating-btn:hover {
  background: #555;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.floating-btn.active {
  background: #2196F3;
}

.floating-btn:active {
  transform: translateY(0);
}

.angle-editor-float {
  position: absolute;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  z-index: 1000;
  opacity: 0;
  transform: scale(0.95);
  animation: fadeInScale 0.2s ease forwards;
}

@keyframes fadeInScale {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
