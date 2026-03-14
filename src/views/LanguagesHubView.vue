<template>
  <section class="page-block section-block">
    <h1>🗣️ Langues</h1>
    <p class="hub-intro">Choisis une langue pour démarrer.</p>

    <div class="cards-grid grid grid-cols-1 gap-4">
      <router-link class="home-card" :to="{ name: 'languages-english' }">
        <h2>🇬🇧 Anglais</h2>
        <p>Apprends l'anglais avec des listes, des flashcards et la lecture à voix haute.</p>
      </router-link>

      <router-link class="home-card" :to="{ name: 'languages-french' }">
        <h2>🇫🇷 Français</h2>
        <p>Travaille le présent avec être, avoir, aller, prendre et venir.</p>
      </router-link>
    </div>
  </section>
</template>
