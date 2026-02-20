<template>
  <section class="home-v1">
    <div class="page-block section-block">
      <h1>Mathématiques</h1>
      <div class="cards-grid two-cols">
        <router-link class="home-card" to="/math">
          <h2>Multiplications</h2>
          <p>Tables de 0 à 11, score, série et entraînement progressif.</p>
        </router-link>

        <router-link class="home-card" to="/math/symetrie">
          <h2>Symétrie</h2>
          <p>Module en préparation, accès déjà branché.</p>
        </router-link>
      </div>
    </div>

    <div class="page-block section-block">
      <h1>Langues</h1>
      <div class="cards-grid one-col">
        <router-link class="home-card" to="/vocab">
          <h2>Anglais</h2>
          <p>Apprends l'anglais avec des listes, des flashcards et la lecture des mots à voix haute.</p>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-v1 {
  display: grid;
  gap: 16px;
}

.section-block h1 {
  margin: 0 0 14px;
}

.cards-grid {
  display: grid;
  gap: 14px;
}

.two-cols {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.one-col {
  grid-template-columns: minmax(0, 1fr);
}

.home-card {
  display: block;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 16px;
  background: linear-gradient(150deg, #fff 0%, #f5faff 100%);
}

.home-card h2 {
  margin: 0 0 8px;
}

.home-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.45;
}

@media (max-width: 860px) {
  .two-cols {
    grid-template-columns: 1fr;
  }
}
</style>


