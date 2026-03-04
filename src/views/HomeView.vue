<template>
  <section class="home-v1 grid gap-4">
    <div class="page-block section-block">
      <h1>🧮 Mathématiques</h1>
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
    </div>

    <div class="page-block section-block">
      <h1>🗣️ Langues</h1>
      <div class="cards-grid grid grid-cols-1 gap-4">
        <router-link class="home-card" :to="{ name: 'languages-english' }">
          <h2>🇬🇧 Anglais</h2>
          <p>Apprends l'anglais avec des listes, des flashcards et la lecture des mots à voix haute.</p>
        </router-link>
      </div>
    </div>
  </section>
</template>
