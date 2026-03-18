<template>
  <div class="angle-editor" :class="{ 'mode-camera': mode === 'camera' }">
    <div class="toolbar-menu-box">
      <!-- 顶部标题栏 -->
      <div class="toolbar-menu-box__header">
        <p class="toolbar-menu-box__title">多角度</p>
        <button class="reset-button" @click="handleReset" aria-label="重置">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" fill-opacity="0.9" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
          </svg>
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="toolbar-menu-box__content">
        <!-- 模式切换 -->
        <div class="mode-switch">
          <button
            class="mode-button"
            :class="{ active: mode === 'subject' }"
            @click="mode = 'subject'"
          >
            主体
          </button>
          <button
            class="mode-button"
            :class="{ active: mode === 'camera' }"
            @click="mode = 'camera'"
          >
            摄像头
          </button>
        </div>

        <!-- 3D 场景 -->
        <div class="angle-editor-scene">
          <ThreeScene
            :mode="mode"
            :image-url="props.imageUrl"
            :cube-rotate-x="cubeRotateX"
            :cube-rotate-y="cubeRotateY"
            :cube-scale="cubeScale"
            :sphere-rotate-x="-cameraSphereX"
            :sphere-rotate-y="-cameraSphereY"
            :camera-sphere-rotate-x="-cameraSphereX"
            :camera-sphere-rotate-y="-cameraSphereY"
            :camera-texture-scale="cameraTextureScale"
            :camera-texture-offset="cameraTextureOffset"
            :cube-texture-scale="cubeTextureScale"
            :cube-texture-offset="cubeTextureOffset"
            @drag="handleSceneDrag"
            @drag-end="handleSceneDragEnd"
          />

          <!-- 摄像头模式：方向按钮 -->
          <div v-if="mode === 'camera'" class="direction-buttons-absolute">
            <button class="direction-btn up" @click="handleDirection('up')">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M8 13.9999L11.6464 10.3535C11.8417 10.1582 12.1583 10.1582 12.3536 10.3535L16 13.9999" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </button>
            <button class="direction-btn down" @click="handleDirection('down')">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M8 10L11.6464 13.6464C11.8417 13.8417 12.1583 13.8417 12.3536 13.6464L16 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </button>
            <button class="direction-btn left" @click="handleDirection('left')">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M13.7929 16L10.1464 12.3536C9.95118 12.1583 9.95118 11.8417 10.1464 11.6464L13.7929 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </button>
            <button class="direction-btn right" @click="handleDirection('right')">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M10 16L13.6464 12.3536C13.8417 12.1582 13.8417 11.8417 13.6464 11.6464L10 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- 控制面板 -->
        <div class="angle-editor-controls">
          <div class="control-group">
            <!-- 旋转 -->
            <div class="control-item">
              <div class="control-label">
                <span class="label-text">旋转</span>
                <span class="label-value">{{ rotationValue }}</span>
              </div>
              <Slider :value="rotationPercent" @update:value="handleRotationChange" :min="0" :max="100" />
            </div>

            <!-- 倾斜 -->
            <div class="control-item">
              <div class="control-label">
                <span class="label-text">倾斜</span>
                <span class="label-value">{{ tiltValue }}</span>
              </div>
              <Slider :value="tiltPercent" @update:value="handleTiltChange" :min="0" :max="100" />
            </div>

            <!-- 缩放 -->
            <div class="control-item">
              <div class="control-label">
                <span class="label-text">缩放</span>
                <span class="label-value">{{ zoomLabel }}</span>
              </div>
              <Slider :value="zoomPercent" @update:value="handleZoomChange" :min="0" :max="100" />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="toolbar-menu-box__actions">
        <button class="cancel-button" @click="handleCancel">取消</button>
        <button class="apply-button" @click="handleApply">
          立即使用
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" fill-opacity="0.9" d="M15.534 2.415a.889.889 0 0 0-1.546-.766L4.21 13.204a.889.889 0 0 0 .679 1.463h5.114l-1.537 6.918a.889.889 0 0 0 1.546.767l9.778-11.555a.889.889 0 0 0-.679-1.463h-5.114z"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ThreeScene from './ThreeScene.vue'
import Slider from './Slider.vue'

const props = defineProps({
  imageUrl: {
    type: String,
    default: '/img.png'
  }
})

const emit = defineEmits(['close'])

// ============ 状态定义 ============
const mode = ref('subject')  // 当前模式：subject（主体）或 camera（摄像头）

// 主体模式状态
const subjectRotation = ref(45)  // 旋转角度（-90 到 90）
const subjectTilt = ref(-30)     // 倾斜角度（-30 到 60）
const subjectZoom = ref(50)      // 缩放：0-特写、50-中等、100-广角

// 摄像头模式状态
const cameraRotation = ref(-45)  // 旋转角度（-90 到 90）
const cameraTilt = ref(-30)      // 倾斜角度（-30 到 60）
const cameraZoom = ref(50)       // 缩放：0-特写、50-中等、100-广角
const cameraSphereY = ref(-45)   // 球面上摄像机Y位置
const cameraSphereX = ref(-30)   // 球面上摄像机X位置

// 拖动阈值
let dragAccumulatedX = 0
let dragAccumulatedY = 0
const DRAG_THRESHOLD = 3  // 拖动阈值（像素）

// ============ 监听器 ============
// 监听滑块变化，同步球面位置
watch([cameraRotation, cameraTilt], ([newRotation, newTilt]) => {
  if (mode.value === 'camera') {
    cameraSphereY.value = newRotation
    cameraSphereX.value = newTilt
  }
})

// 监听模式切换
watch(mode, (newMode) => {
  if (newMode === 'camera') {
    cameraSphereY.value = cameraRotation.value
    cameraSphereX.value = cameraTilt.value
    cameraZoom.value = 50  // 重置为中等
  } else {
    subjectZoom.value = 50  // 重置为中等
  }
})

// ============ 计算属性 ============
// 当前倾斜值
const tiltValue = computed(() => {
  if (mode.value === 'subject') {
    return subjectTilt.value
  } else {
    return cameraTilt.value
  }
})

// 当前旋转值
const rotationValue = computed(() => {
  if (mode.value === 'subject') {
    return subjectRotation.value
  } else {
    return cameraRotation.value
  }
})

// 旋转滑块百分比（0-100）
const rotationPercent = computed(() => {
  const val = mode.value === 'subject' ? subjectRotation.value : cameraRotation.value
  const rangeMin = -90
  const rangeMax = 90
  return ((val - rangeMin) / (rangeMax - rangeMin)) * 100
})

// 倾斜滑块百分比（0-100）
const tiltPercent = computed(() => {
  const val = mode.value === 'subject' ? subjectTilt.value : cameraTilt.value
  const rangeMin = -30
  const rangeMax = 60
  return ((val - rangeMin) / (rangeMax - rangeMin)) * 100
})

// 缩放滑块百分比（0-100）
const zoomPercent = computed(() => mode.value === 'subject' ? subjectZoom.value : cameraZoom.value)

// 缩放标签
const zoomLabel = computed(() => {
  const val = mode.value === 'subject' ? subjectZoom.value : cameraZoom.value
  if (val === 0) return '特写'
  if (val === 50) return '中等'
  return '广角'
})

// 立方体X轴旋转
const cubeRotateX = computed(() => mode.value === 'subject' ? subjectTilt.value : 0)

// 立方体Y轴旋转
const cubeRotateY = computed(() => mode.value === 'subject' ? subjectRotation.value : 0)

// 立方体缩放
const cubeScale = computed(() => {
  const val = mode.value === 'subject' ? subjectZoom.value : cameraZoom.value
  // 三个固定档位：特写-最大、中等-中等、广角-最小
  if (val === 0) return mode.value === 'subject' ? 1.5 : 1.5  // 特写（最大）
  if (val === 50) return mode.value === 'subject' ? 1.15 : 1.15  // 中等
  return mode.value === 'subject' ? 0.9 : 0.9  // 广角（最小）
})

// 摄像机屏幕纹理缩放（用于控制显示范围）
const cameraTextureScale = computed(() => {
  const val = mode.value === 'subject' ? subjectZoom.value : cameraZoom.value
  if (val === 0) return 0.6  // 特写：显示图片更多内容（缩小）
  if (val === 50) return 1.0  // 中等：显示正常图片
  return 1.5  // 广角：显示图片中间部分（放大）
})

// 摄像机屏幕纹理偏移（用于居中显示）
const cameraTextureOffset = computed(() => {
  const val = mode.value === 'subject' ? subjectZoom.value : cameraZoom.value
  if (val === 0) return 0.2  // 特写：居中偏移
  if (val === 50) return 0.0  // 中等：无偏移
  return -0.25  // 广角：居中偏移
})

// 立方体纹理缩放（中心位置的贴纸）
const cubeTextureScale = computed(() => {
  // 无论什么模式，立方体前面贴图都完整显示
  return 1.0
})

// 立方体纹理偏移
const cubeTextureOffset = computed(() => {
  // 无论什么模式，立方体前面贴图都完整显示
  return 0.0
})

// ============ 事件处理 ============
// 旋转滑块变化
const handleRotationChange = (value) => {
  const val = Math.round((value / 100) * 180 - 90)
  if (mode.value === 'subject') {
    subjectRotation.value = val
  } else {
    cameraRotation.value = val
    cameraSphereY.value = val
  }
}

// 倾斜滑块变化
const handleTiltChange = (value) => {
  const val = Math.round((value / 100) * 90 - 30)
  if (mode.value === 'subject') {
    subjectTilt.value = val
  } else {
    cameraTilt.value = val
    cameraSphereX.value = val
  }
}

// 缩放滑块变化（吸附到三个档位）
const handleZoomChange = (value) => {
  // 0-33：特写、34-66：中等、67-100：广角
  let snappedValue = 0
  if (value <= 33) {
    snappedValue = 0  // 特写
  } else if (value <= 66) {
    snappedValue = 50  // 中等
  } else {
    snappedValue = 100  // 广角
  }

  if (mode.value === 'subject') {
    subjectZoom.value = snappedValue
  } else {
    cameraZoom.value = snappedValue
  }
}

// 方向按钮点击（摄像头模式）
const handleDirection = (direction) => {
  const step = 15
  switch (direction) {
    case 'up':
      cameraTilt.value = Math.min(60, cameraTilt.value + step)
      break
    case 'down':
      cameraTilt.value = Math.max(-30, cameraTilt.value - step)
      break
    case 'left':
      cameraRotation.value = Math.max(-90, cameraRotation.value - step)
      break
    case 'right':
      cameraRotation.value = Math.min(90, cameraRotation.value + step)
      break
  }
  cameraSphereX.value = cameraTilt.value
  cameraSphereY.value = cameraRotation.value
}

// 场景拖动
const handleSceneDrag = (deltaX, deltaY) => {
  dragAccumulatedX += deltaX
  dragAccumulatedY += deltaY

  // 超过阈值才触发
  if (Math.abs(dragAccumulatedX) >= DRAG_THRESHOLD || Math.abs(dragAccumulatedY) >= DRAG_THRESHOLD) {
    if (mode.value === 'subject') {
      // 主体模式：直接旋转和倾斜
      subjectRotation.value += dragAccumulatedX * 0.5
      subjectTilt.value += dragAccumulatedY * 0.5
      // 限制范围（-90 到 90）
      subjectRotation.value = Math.max(-90, Math.min(90, subjectRotation.value))
      // 限制范围（-30 到 60）
      subjectTilt.value = Math.max(-30, Math.min(60, subjectTilt.value))
    } else {
      // 摄像头模式：移动球面上的摄像机
      cameraSphereY.value += dragAccumulatedX * 0.5
      cameraSphereX.value -= dragAccumulatedY * 0.5
      // 限制范围
      cameraSphereX.value = Math.max(-30, Math.min(60, cameraSphereX.value))
      cameraSphereY.value = Math.max(-90, Math.min(90, cameraSphereY.value))
      // 同步滑块值
      cameraRotation.value = Math.round(cameraSphereY.value)
      cameraTilt.value = Math.round(cameraSphereX.value)
    }
    dragAccumulatedX = 0
    dragAccumulatedY = 0
  }
}

// 拖动结束
const handleSceneDragEnd = () => {
  dragAccumulatedX = 0
  dragAccumulatedY = 0
}

// 重置
const handleReset = () => {
  if (mode.value === 'subject') {
    subjectRotation.value = 45
    subjectTilt.value = -30
    subjectZoom.value = 50
  } else {
    cameraRotation.value = -45
    cameraTilt.value = -30
    cameraZoom.value = 50
    cameraSphereY.value = -45
    cameraSphereX.value = -30
  }
}

// 关闭
const handleClose = () => {
  emit('close')
}

// 取消
const handleCancel = () => {
  emit('close')
}

// 应用
const handleApply = () => {
  console.log('Apply', {
    mode: mode.value,
    rotation: rotationValue.value,
    tilt: tiltValue.value,
    zoom: mode.value === 'subject' ? subjectZoom.value : cameraZoom.value
  })
}
</script>

<style scoped>
.angle-editor {
  position: relative;
  overflow: hidden;
}

.toolbar-menu-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 12px;
  background: white;
  border: 1px solid #e8e8e8;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 260px;
  overflow: hidden;
}

/* 顶部标题栏 */
.toolbar-menu-box__header {
  display: flex;
  height: 44px;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.toolbar-menu-box__title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
  flex: 1;
}

.reset-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  color: rgba(0, 0, 0, 0.6);
  transition: background-color 0.15s;
}

.reset-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.reset-button svg {
  width: 14px;
  height: 14px;
}

/* 内容区域 */
.toolbar-menu-box__content {
  display: flex;
  min-height: 0;
  width: 100%;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px;
}

/* 模式切换 */
.mode-switch {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
  margin-bottom: 16px;
  width: 100%;
}

.mode-button {
  flex: 1;
  min-width: 0;
  padding: 6px 12px;
  font-size: 13px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  color: rgba(0, 0, 0, 0.5);
  transition: all 0.15s;
}

.mode-button:hover {
  color: rgba(0, 0, 0, 0.9);
}

.mode-button.active {
  background: white;
  color: rgba(0, 0, 0, 0.9);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 3D 场景 */
.angle-editor-scene {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
}

.direction-buttons-absolute {
  position: absolute;
  width: 236px;
  height: 236px;
  top: 10px;
  pointer-events: none;
  z-index: 10;
}

.direction-btn {
  position: absolute;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  pointer-events: auto;
  border-radius: 50%;
}

.direction-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.direction-btn:active {
  background: rgba(0, 0, 0, 0.1);
}

.direction-btn svg {
  width: 20px;
  height: 20px;
  color: rgba(0, 0, 0, 0.5);
}

.direction-btn:hover svg {
  color: rgba(0, 0, 0, 0.8);
}

.direction-btn.up {
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
}

.direction-btn.down {
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
}

.direction-btn.left {
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.direction-btn.right {
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

/* 控制面板 */
.angle-editor-controls {
  width: 100%;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label-text {
  font-size: 13px;
  min-width: 50px;
  color: rgba(0, 0, 0, 0.9);
}

.label-value {
  font-size: 13px;
  min-width: 60px;
  text-align: right;
  color: rgba(0, 0, 0, 0.5);
}

/* 底部按钮 */
.toolbar-menu-box__actions {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #f0f0f0;
}

.cancel-button,
.apply-button {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.cancel-button {
  background: transparent;
  color: rgba(0, 0, 0, 0.9);
  border: 1px solid #e0e0e0;
}

.cancel-button:hover {
  background: rgba(0, 0, 0, 0.03);
}

.apply-button {
  background: rgba(0, 0, 0, 0.9);
  color: white;
}

.apply-button:hover {
  background: rgba(0, 0, 0, 0.7);
}

.apply-button svg {
  width: 12px;
  height: 12px;
  margin-left: 4px;
}
</style>
