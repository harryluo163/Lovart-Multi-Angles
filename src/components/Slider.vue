<template>
  <div 
    ref="sliderRef"
    class="slider"
    :class="{ dragging: isDragging }"
    @mousedown="startDrag"
    @touchstart="startDrag"
    role="slider"
    :aria-valuenow="value"
    :aria-valuemin="min"
    :aria-valuemax="max"
  >
    <!-- 轨道背景 -->
    <div class="slider-track-bg"></div>
    
    <!-- 激活轨道 -->
    <div class="slider-track-active" :style="{ width: `${percentage}%` }"></div>
    
    <!-- 滑块 -->
    <div class="slider-thumb" :style="{ left: `${percentage}%` }">
      <div class="slider-thumb-dot"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 }
})

const emit = defineEmits(['update:value'])

const sliderRef = ref(null)
const isDragging = ref(false)

// 计算百分比（0-100）
const percentage = computed(() => {
  const range = props.max - props.min
  return ((props.value - props.min) / range) * 100
})

// 更新值
const updateValue = (e) => {
  const rect = sliderRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const x = e.clientX - rect.left
  const percent = Math.min(Math.max(x / rect.width, 0), 1)
  const newValue = props.min + percent * (props.max - props.min)
  emit('update:value', newValue)
}

// 开始拖拽
const startDrag = (e) => {
  isDragging.value = true
  const event = e.touches ? e.touches[0] : e
  updateValue(event)
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', onTouchDrag)
  document.addEventListener('touchend', endDrag)
}

// 拖拽中
const onDrag = (e) => {
  if (!isDragging.value) return
  updateValue(e)
}

// 触摸拖拽中
const onTouchDrag = (e) => {
  if (!isDragging.value) return
  updateValue(e.touches[0])
}

// 结束拖拽
const endDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onTouchDrag)
  document.removeEventListener('touchend', endDrag)
}

// 清理事件监听
onUnmounted(() => {
  endDrag()
})
</script>

<style scoped>
/* 滑块容器 */
.slider {
  position: relative;
  padding: 0 7px;
  border-radius: 999px;
  height: 12px;
  cursor: grab;
  user-select: none;
}

.slider.dragging {
  cursor: grabbing;
}

/* 轨道背景 */
.slider-track-bg {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: #e8e8e8;
}

/* 激活轨道 */
.slider-track-active {
  position: absolute;
  top: 50%;
  left: 0;
  height: 2px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.9);
}

/* 滑块 */
.slider-thumb {
  position: absolute;
  top: 50%;
  left: 0;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  border-radius: 50%;
  border: 2px solid white;
  background: rgba(0, 0, 0, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transform: translateY(-50%);
  transition: transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 滑块中心点 */
.slider-thumb-dot {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: white;
}

/* 悬停效果 */
.slider:hover .slider-thumb {
  transform: translateY(-50%) scale(1.1);
}

/* 拖拽效果 */
.slider.dragging .slider-thumb {
  transform: translateY(-50%) scale(1.15);
}
</style>