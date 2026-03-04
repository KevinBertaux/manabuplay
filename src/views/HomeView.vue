<template>
  <section class="home-v1 grid gap-4">
    <div class="page-block section-block">
      <h1>🧮 Mathématiques</h1>
      <div class="cards-grid grid grid-cols-1 gap-[14px] lg:grid-cols-2">
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
      <div class="cards-grid grid grid-cols-1 gap-[14px]">
        <router-link class="home-card" :to="{ name: 'languages-english' }">
          <h2>🇬🇧 Anglais</h2>
          <p>Apprends l'anglais avec des listes, des flashcards et la lecture des mots à voix haute.</p>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-block h1 {
  margin: 0 0 14px;
}

.home-card {
  display: block;
  border: 1px solid #bfd1e8;
  border-radius: 14px;
  padding: 16px;
  background: linear-gradient(150deg, #fbfdff 0%, #f2f8ff 100%);
  box-shadow: 0 2px 0 rgba(15, 23, 42, 0.1);
  transition:
    transform 0.12s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.home-card h2 {
  margin: 0 0 8px;
}

.home-card p {
  margin: 0;
  color: #34465d;
  line-height: 1.45;
}

.home-card:hover,
.home-card:focus-visible {
  border-color: #2f4e6f;
  background: linear-gradient(150deg, #f7fbff 0%, #e9f3ff 100%);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.14);
  transform: translateY(-2px);
}

.home-card:active {
  transform: translateY(0);
  box-shadow: 0 2px 0 rgba(15, 23, 42, 0.12);
}
</style>
