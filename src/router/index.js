import { createRouter, createWebHistory } from 'vue-router';
import { isAdminSessionValid } from '@/features/admin/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/math',
    name: 'math',
    component: () => import('@/views/MathView.vue'),
  },
  {
    path: '/math/symetrie',
    name: 'math-symetrie',
    component: () => import('@/views/MathSymmetryView.vue'),
  },
  {
    path: '/vocab',
    name: 'vocab',
    component: () => import('@/views/VocabView.vue'),
  },
  {
    path: '/aide/panel-interne',
    name: 'internal-panel-help-fr',
    component: () => import('@/views/InternalPanelHelpFrView.vue'),
  },
  {
    path: '/help/internal-panel',
    name: 'internal-panel-help-en',
    component: () => import('@/views/InternalPanelHelpEnView.vue'),
  },
  {
    path: '/-/studio-ops',
    name: 'studio-ops-login',
    component: () => import('@/views/AdminAccessView.vue'),
  },
  {
    path: '/-/studio-ops/panel',
    name: 'studio-ops-panel',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresStudioOpsAuth: true },
  },
  {
    path: '/legal/mentions-legales',
    name: 'mentions-legales',
    component: () => import('@/views/LegalMentionsView.vue'),
  },
  {
    path: '/legal/confidentialite',
    name: 'confidentialite',
    component: () => import('@/views/LegalPrivacyView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  if (!to.meta.requiresStudioOpsAuth) {
    return true;
  }

  if (isAdminSessionValid()) {
    return true;
  }

  return { name: 'studio-ops-login' };
});

export default router;
