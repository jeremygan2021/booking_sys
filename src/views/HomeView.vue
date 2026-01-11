<template>
  <div class="home-view">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">爱云香舍</h1>
        <p class="hero-subtitle">法式优雅 · 温馨体验</p>
        <p class="hero-description">体验法式浪漫与中式温馨的完美融合，享受宁静舒适的度假时光</p>
        <div class="hero-actions">
          <RouterLink to="/rooms" class="btn-primary">预订客房</RouterLink>
          <RouterLink to="/restaurant" class="btn-secondary">餐厅订餐</RouterLink>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="features-grid">
        <div class="feature-card card">
          <h3 class="feature-title">精致客房</h3>
          <p class="feature-description">法式装饰风格，舒适温馨的住宿环境</p>
        </div>
        <div class="feature-card card">
          <h3 class="feature-title">美味佳肴</h3>
          <p class="feature-description">多种菜系选择，满足您的味蕾需求</p>
        </div>
        <div class="feature-card card">
          <h3 class="feature-title">便捷预订</h3>
          <p class="feature-description">移动端优化，随时随地轻松预订</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

.hero-section {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, theme('colors.cream') 0%, theme('colors.gold') / 5% 100%);
  padding: 4rem 2rem;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  animation: fade-in 1s ease-in-out;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  color: theme('colors.deep-blue');
  margin-bottom: 1rem;
  font-family: 'Playfair Display', serif;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: theme('colors.gold');
  margin-bottom: 1.5rem;
  font-family: 'Dancing Script', cursive;
}

.hero-description {
  font-size: 1.125rem;
  color: theme('colors.text-gray');
  margin-bottom: 2rem;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.features-section {
  padding: 4rem 2rem;
  background: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: theme('colors.deep-blue');
  margin-bottom: 1rem;
}

.feature-description {
  color: theme('colors.text-gray');
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
