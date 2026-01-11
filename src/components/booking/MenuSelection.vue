<template>
  <div class="menu-selection">
    <h2 class="text-2xl font-playfair font-bold text-gray-900 mb-6">选择菜系与套餐</h2>

    <!-- 用餐类型选择 -->
    <div class="mb-8">
      <label class="block text-sm font-medium text-gray-700 mb-3">用餐类型</label>
      <div class="grid grid-cols-3 gap-3">
        <button
          @click="selectedMealType = 'breakfast'"
          :class="[
            'py-3 px-4 rounded-lg border-2 transition-all',
            selectedMealType === 'breakfast'
              ? 'border-gold bg-gold/10 text-gold font-semibold'
              : 'border-gray-200 hover:border-gray-300',
          ]"
        >
          🌅 早餐
        </button>
        <button
          @click="selectedMealType = 'lunch'"
          :class="[
            'py-3 px-4 rounded-lg border-2 transition-all',
            selectedMealType === 'lunch'
              ? 'border-gold bg-gold/10 text-gold font-semibold'
              : 'border-gray-200 hover:border-gray-300',
          ]"
        >
          🌞 午餐
        </button>
        <button
          @click="selectedMealType = 'dinner'"
          :class="[
            'py-3 px-4 rounded-lg border-2 transition-all',
            selectedMealType === 'dinner'
              ? 'border-gold bg-gold/10 text-gold font-semibold'
              : 'border-gray-200 hover:border-gray-300',
          ]"
        >
          🌙 晚餐
        </button>
      </div>
    </div>

    <!-- 菜系分类 -->
    <div class="mb-8">
      <label class="block text-sm font-medium text-gray-700 mb-3">菜系分类</label>
      <div v-if="loadingCuisines" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="animate-pulse">
          <div class="bg-gray-200 h-32 rounded-lg"></div>
        </div>
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          v-for="cuisine in cuisines"
          :key="cuisine.id"
          @click="selectedCuisineId = cuisine.id"
          :class="[
            'relative overflow-hidden rounded-lg border-2 transition-all group',
            selectedCuisineId === cuisine.id
              ? 'border-gold ring-2 ring-gold/20'
              : 'border-gray-200 hover:border-gold/50',
          ]"
        >
          <div class="aspect-square bg-gray-100 flex items-center justify-center">
            <img
              v-if="cuisine.image_url"
              :src="cuisine.image_url"
              :alt="cuisine.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-4xl">🍽️</span>
          </div>
          <div class="p-3 bg-white">
            <h3 class="font-semibold text-gray-900 group-hover:text-gold transition-colors">
              {{ cuisine.name }}
            </h3>
            <p v-if="cuisine.description" class="text-xs text-gray-500 mt-1 line-clamp-2">
              {{ cuisine.description }}
            </p>
          </div>
          <div
            v-if="selectedCuisineId === cuisine.id"
            class="absolute top-2 right-2 bg-gold text-white rounded-full p-1"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- 价位筛选 -->
    <div class="mb-8">
      <label class="block text-sm font-medium text-gray-700 mb-3">价位范围</label>
      <div class="flex gap-3">
        <button
          @click="selectedPriceRange = null"
          :class="[
            'px-4 py-2 rounded-lg border transition-all',
            selectedPriceRange === null
              ? 'border-gold bg-gold/10 text-gold font-semibold'
              : 'border-gray-200 hover:border-gray-300',
          ]"
        >
          全部
        </button>
        <button
          v-for="range in priceRanges"
          :key="range.label"
          @click="selectedPriceRange = range"
          :class="[
            'px-4 py-2 rounded-lg border transition-all',
            selectedPriceRange?.label === range.label
              ? 'border-gold bg-gold/10 text-gold font-semibold'
              : 'border-gray-200 hover:border-gray-300',
          ]"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <!-- 套餐列表 -->
    <div>
      <h3 class="text-xl font-semibold text-gray-900 mb-4">可选套餐</h3>
      <div v-if="loadingPackages" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="i in 4" :key="i" class="animate-pulse">
          <div class="bg-gray-200 h-48 rounded-lg"></div>
        </div>
      </div>
      <div v-else-if="filteredPackages.length === 0" class="text-center py-12 text-gray-500">
        <p>暂无符合条件的套餐</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="pkg in filteredPackages"
          :key="pkg.id"
          @click="selectPackage(pkg)"
          :class="[
            'bg-white rounded-lg border-2 p-6 cursor-pointer transition-all',
            selectedPackage?.id === pkg.id
              ? 'border-gold ring-2 ring-gold/20'
              : 'border-gray-200 hover:border-gold/50 hover:shadow-md',
          ]"
        >
          <div class="flex justify-between items-start mb-3">
            <h4 class="text-lg font-semibold text-gray-900">{{ pkg.name }}</h4>
            <div v-if="selectedPackage?.id === pkg.id" class="bg-gold text-white rounded-full p-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
          <p v-if="pkg.description" class="text-gray-600 text-sm mb-4">
            {{ pkg.description }}
          </p>
          <div class="flex justify-between items-center">
            <div>
              <span class="text-2xl font-bold text-gold">¥{{ pkg.price }}</span>
              <span class="text-sm text-gray-500 ml-2">/ 人</span>
            </div>
            <div class="text-sm text-gray-500">
              <span v-if="pkg.cuisine_name" class="inline-block bg-gray-100 px-3 py-1 rounded-full">
                {{ pkg.cuisine_name }}
              </span>
            </div>
          </div>
          <div class="mt-3 text-xs text-gray-500">最多 {{ pkg.max_guests }} 人</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Cuisine {
  id: string
  name: string
  description: string
  image_url: string
}

interface MealPackage {
  id: string
  name: string
  description: string
  price: number
  cuisine_id: string
  cuisine_name: string
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  max_guests: number
}

interface PriceRange {
  label: string
  min: number
  max: number
}

const emit = defineEmits<{
  'update:mealType': [value: 'breakfast' | 'lunch' | 'dinner']
  'update:package': [value: MealPackage | null]
}>()

const props = defineProps<{
  mealType?: 'breakfast' | 'lunch' | 'dinner'
  package?: MealPackage | null
}>()

const selectedMealType = ref<'breakfast' | 'lunch' | 'dinner'>(props.mealType || 'lunch')
const selectedCuisineId = ref<string | null>(null)
const selectedPriceRange = ref<PriceRange | null>(null)
const selectedPackage = ref<MealPackage | null>(props.package || null)

const cuisines = ref<Cuisine[]>([])
const packages = ref<MealPackage[]>([])
const loadingCuisines = ref(false)
const loadingPackages = ref(false)

const priceRanges: PriceRange[] = [
  { label: '¥0-100', min: 0, max: 100 },
  { label: '¥100-200', min: 100, max: 200 },
  { label: '¥200-500', min: 200, max: 500 },
  { label: '¥500+', min: 500, max: Infinity },
]

const filteredPackages = computed(() => {
  let filtered = packages.value.filter((pkg) => pkg.meal_type === selectedMealType.value)

  if (selectedCuisineId.value) {
    filtered = filtered.filter((pkg) => pkg.cuisine_id === selectedCuisineId.value)
  }

  if (selectedPriceRange.value) {
    filtered = filtered.filter(
      (pkg) =>
        pkg.price >= selectedPriceRange.value!.min && pkg.price < selectedPriceRange.value!.max,
    )
  }

  return filtered
})

const fetchCuisines = async () => {
  try {
    loadingCuisines.value = true
    const response = await fetch('/api/restaurant/cuisines')
    const data = await response.json()

    if (data.success) {
      cuisines.value = data.data
    }
  } catch (error) {
    console.error('获取菜系失败:', error)
  } finally {
    loadingCuisines.value = false
  }
}

const fetchPackages = async () => {
  try {
    loadingPackages.value = true
    const response = await fetch('/api/restaurant/packages')
    const data = await response.json()

    if (data.success) {
      packages.value = data.data
    }
  } catch (error) {
    console.error('获取套餐失败:', error)
  } finally {
    loadingPackages.value = false
  }
}

const selectPackage = (pkg: MealPackage) => {
  selectedPackage.value = pkg
  emit('update:package', pkg)
}

watch(selectedMealType, (newValue) => {
  emit('update:mealType', newValue)
  // 清除选择的套餐，因为用餐类型改变了
  selectedPackage.value = null
  emit('update:package', null)
})

watch(
  () => props.mealType,
  (newValue) => {
    if (newValue) {
      selectedMealType.value = newValue
    }
  },
)

watch(
  () => props.package,
  (newValue) => {
    selectedPackage.value = newValue ?? null
  },
)

onMounted(() => {
  fetchCuisines()
  fetchPackages()
})
</script>

<style scoped>
.menu-selection {
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
