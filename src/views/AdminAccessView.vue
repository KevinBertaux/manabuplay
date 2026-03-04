<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AdminStatusBanner from '@/components/AdminStatusBanner.vue';
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

function penaltySummary() {
  return 'Pénalité encourue : blocage 30 minutes, puis 24 heures après un nouvel échec.';
}

function buildBlockedMessage(seconds, level) {
  const penalty = level === 'hard' ? 'Pénalité en cours : blocage 24 heures.' : 'Pénalité en cours : blocage 30 minutes.';
  return `Identifiants incorrects. Tentatives restantes : 0. ${penalty} Réessaie dans ${seconds}s.`;
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
      } else {
        statusMessage.value = `Identifiants incorrects. Tentatives restantes : ${info.remainingAttempts}. ${penaltySummary()}`;
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
  <section class="grid min-h-0 items-start justify-items-center p-2 md:p-2.5 lg:min-h-[calc(100dvh-172px)]">
    <div class="mt-3 w-full max-w-[460px] border border-[#d6e1ec] bg-white p-[14px] shadow-[0_1px_3px_rgba(15,23,42,0.09)]">
      <header class="mb-2.5">
        <h1 class="m-0 text-[1.35rem] leading-[1.2] text-[#132f4c]">Accès administration</h1>
      </header>

      <form class="auth-form grid gap-2" @submit.prevent="submitLogin">
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
          {{ isSubmitting ? 'Vérification...' : 'Se connecter' }}
        </button>
      </form>

      <AdminStatusBanner :message="statusMessage" tone="error" />
    </div>
  </section>
</template>

<style scoped>
.auth-form label {
  font-weight: 700;
  color: #1d3954;
}

.auth-form input {
  width: 100%;
  border: 1px solid #b5c6d8;
  border-radius: 4px;
  min-height: 36px;
  padding: 8px 10px;
  background: white;
  color: #1f3448;
}

.auth-form input:focus-visible {
  border-color: #2475b8;
  box-shadow: 0 0 0 2px rgba(36, 117, 184, 0.18);
  outline: none;
}

.btn {
  border: 1px solid transparent;
  border-radius: 4px;
  min-height: 34px;
  padding: 7px 10px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.18s ease;
}

.btn-primary {
  background: #0b7aa0;
  border-color: #086283;
  color: #f7fbff;
}

.btn:hover:not(:disabled),
.btn:focus-visible:not(:disabled) {
  filter: brightness(1.1);
}

.btn:active:not(:disabled) {
  filter: brightness(0.98);
}

.btn:disabled {
  opacity: 0.62;
  cursor: not-allowed;
}

:deep(.admin-status) {
  margin-top: 10px;
  border-radius: 4px;
}
</style>
