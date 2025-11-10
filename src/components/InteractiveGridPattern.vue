<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Props {
  width?: number
  height?: number
  squares?: [number, number]
  squaresClassName?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 20,
  height: 20,
  squares: () => [80, 80],
  squaresClassName: 'hover:fill-blue-500',
  class: '',
})

const svgRef = ref<SVGSVGElement>()
const hoveredSquares = ref<Set<string>>(new Set())

const cols = computed(() => Math.ceil(props.squares[0]))
const rows = computed(() => Math.ceil(props.squares[1]))

// Generate grid squares
const gridSquares = computed(() => {
  const squares = []
  for (let col = 0; col < cols.value; col++) {
    for (let row = 0; row < rows.value; row++) {
      squares.push({ col, row, id: `${col}-${row}` })
    }
  }
  return squares
})

const handleMouseEnter = (col: number, row: number) => {
  hoveredSquares.value.add(`${col}-${row}`)
}

const handleMouseLeave = (col: number, row: number) => {
  hoveredSquares.value.delete(`${col}-${row}`)
}

const isHovered = (id: string) => {
  return hoveredSquares.value.has(id)
}

onMounted(() => {
  if (svgRef.value) {
    // Add some initial animation
    const squares = svgRef.value.querySelectorAll('rect')
    squares.forEach((square, index) => {
      setTimeout(() => {
        square.style.opacity = '1'
      }, index * 2)
    })
  }
})
</script>

<template>
  <svg
    ref="svgRef"
    :class="['absolute inset-0 h-full w-full pointer-events-none', props.class]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="grid-pattern" :width="width" :height="height" patternUnits="userSpaceOnUse">
        <path
          :d="`M ${width} 0 L 0 0 0 ${height}`"
          fill="none"
          stroke="rgba(156, 163, 175, 0.3)"
          stroke-width="1"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid-pattern)" stroke-opacity="1" />

    <!-- Interactive squares -->
    <g class="pointer-events-auto">
      <rect
        v-for="square in gridSquares"
        :key="square.id"
        :x="square.col * width"
        :y="square.row * height"
        :width="width"
        :height="height"
        class="transition-all duration-300 ease-out cursor-pointer"
        :class="[
          isHovered(square.id) ? 'fill-blue-500 opacity-40' : 'fill-transparent',
          squaresClassName,
        ]"
        @mouseenter="handleMouseEnter(square.col, square.row)"
        @mouseleave="handleMouseLeave(square.col, square.row)"
      />
    </g>
  </svg>
</template>

<style scoped>
rect {
  transition:
    fill 0.3s ease,
    opacity 0.3s ease;
}

rect:hover {
  opacity: 0.4 !important;
}
</style>
