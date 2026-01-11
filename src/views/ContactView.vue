<template>
  <div class="contact-view">
    <div class="container">
      <h1 class="page-title">联系我们</h1>
      <div class="content">
        <p>如有任何问题，请联系我们</p>
        <p>更多联系方式即将推出...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Contact page component
</script>

<style scoped>
.contact-view {
  padding: 2rem 0;
  min-height: 60vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-deep-blue);
  margin-bottom: 2rem;
}

.content {
  font-size: 1rem;
  line-height: 1.8;
  color: #4b5563;
}

.content p {
  margin-bottom: 1rem;
}
</style>
