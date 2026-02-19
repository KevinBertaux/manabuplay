<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  clearFailedAttempts,
  getRateLimitInfo,
  isAdminSessionValid,
  registerFailedAttempt,
  startAdminSession,
  verifyAdminCredentials,
} from '@/features/admin/auth';

const router = useRouter();

const username = ref('');
const password = ref('');
const statusMessage = ref('');
const isSubmitting = ref(false);
const blockedMs = ref(getRateLimitInfo().blockedMs);
const blockLevel = ref(getRateLimitInfo().blockLevel);

let intervalId;

function refreshRateLimit() {
  const info = getRateLimitInfo();
  blockedMs.value = info.blockedMs;
  blockLevel.value = info.blockLevel;
}

const isBlocked = computed(() => blockedMs.value > 0);
const blockedSeconds = computed(() => Math.ceil(blockedMs.value / 1000));

function buildBlockedMessage(seconds, level) {
  if (level === 'hard') {
    return `Acces verrouille. Reessaie dans ${seconds}s.`;
  }
  return `Acces temporairement bloque. Reessaie dans ${seconds}s.`;
}

async function submitLogin() {
  refreshRateLimit();

  if (isBlocked.value) {
    statusMessage.value = buildBlockedMessage(blockedSeconds.value, blockLevel.value);
    return;
  }

  statusMessage.value = '';
  isSubmitting.value = true;

  try {
    const valid = await verifyAdminCredentials(username.value, password.value);
    if (!valid) {
      const info = registerFailedAttempt();
      blockedMs.value = info.blockedMs;
      blockLevel.value = info.blockLevel;

      if (info.isBlocked) {
        statusMessage.value = buildBlockedMessage(Math.ceil(info.blockedMs / 1000), info.blockLevel);
      }
      return;
    }

    clearFailedAttempts();
    startAdminSession();
    await router.replace({ name: 'studio-ops-panel' });
  } finally {
    isSubmitting.value = false;
    password.value = '';
  }
}

onMounted(async () => {
  if (isAdminSessionValid()) {
    await router.replace({ name: 'studio-ops-panel' });
    return;
  }

  refreshRateLimit();
  intervalId = window.setInterval(() => {
    refreshRateLimit();
    if (isBlocked.value) {
      statusMessage.value = buildBlockedMessage(blockedSeconds.value, blockLevel.value);
    }
  }, 1000);
});

onUnmounted(() => {
  if (intervalId) {
    window.clearInterval(intervalId);
  }
});
</script>

<template>
  <section class="page-block auth-page">
    <div class="auth-card">
      <form class="auth-form" @submit.prevent="submitLogin">
        <label for="studio-username">Nom d'utilisateur</label>
        <input
          id="studio-username"
          v-model="username"
          type="text"
          autocomplete="username"
          :disabled="isSubmitting || isBlocked"
          required
        />

        <label for="studio-password">Mot de passe</label>
        <input
          id="studio-password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          :disabled="isSubmitting || isBlocked"
          required
        />

        <button class="btn btn-primary" type="submit" :disabled="isSubmitting || isBlocked">
          {{ isSubmitting ? 'Verification...' : 'Se connecter' }}
        </button>
      </form>

      <p v-if="isBlocked && statusMessage" class="status status-error">{{ statusMessage }}</p>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  max-width: 520px;
  margin-inline: auto;
}

.auth-card {
  border: 1px solid #d9e1ed;
  border-radius: 14px;
  padding: 16px;
  background: #fbfdff;
}

.auth-form {
  display: grid;
  gap: 10px;
}

.auth-form label {
  font-weight: 700;
}

.auth-form input {
  width: 100%;
  border: 1px solid #c2d0e1;
  border-radius: 10px;
  padding: 10px;
  background: white;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #4ecdc4, #6fe7dd);
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status {
  margin-top: 12px;
  font-weight: 700;
}

.status-error {
  color: #b33939;
}
</style>
