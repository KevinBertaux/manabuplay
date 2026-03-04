<template>
  <section class="page-block section-block">
    <h1>🧮 Mathématiques</h1>
    <p class="hub-intro">Choisis un module pour commencer.</p>

    <div class="cards-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
      <router-link class="home-card" :to="{ name: 'math-multiplications' }">
        <h2>✖️ Multiplications</h2>
        <p>Tables de 0 à 11, score, série et entraînement progressif.</p>
      </router-link>

      <router-link class="home-card" :to="{ name: 'math-symmetry' }">
        <h2>🪞 Symétrie</h2>
        <p>QCM visuel avec clavier (1, 2, 3, 4) et suivi de série.</p>
      </router-link>
    </div>
  </section>
</template>
