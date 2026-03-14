import { createRouter, createWebHistory } from 'vue-router';
import { isAdminSessionValid } from '@/features/admin/auth';
import { ROUTE_NAMES, ROUTE_PATHS } from './routes';

const routes = [
  {
    path: ROUTE_PATHS.HOME,
    name: ROUTE_NAMES.HOME,
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: ROUTE_PATHS.MATH_HUB,
    name: ROUTE_NAMES.MATH_HUB,
    component: () => import('@/views/MathHubView.vue'),
  },
  {
    path: ROUTE_PATHS.MATH_MULTIPLICATIONS,
    name: ROUTE_NAMES.MATH_MULTIPLICATIONS,
    component: () => import('@/views/MathMultiplicationsView.vue'),
  },
  {
    path: ROUTE_PATHS.MATH_SYMMETRY,
    name: ROUTE_NAMES.MATH_SYMMETRY,
    component: () => import('@/views/MathSymmetryView.vue'),
  },
  {
    path: ROUTE_PATHS.LANGUAGES_HUB,
    name: ROUTE_NAMES.LANGUAGES_HUB,
    component: () => import('@/views/LanguagesHubView.vue'),
  },
  {
    path: ROUTE_PATHS.LANGUAGES_ENGLISH,
    name: ROUTE_NAMES.LANGUAGES_ENGLISH,
    component: () => import('@/views/LanguagesEnglishView.vue'),
  },
  {
    path: ROUTE_PATHS.LANGUAGES_FRENCH,
    name: ROUTE_NAMES.LANGUAGES_FRENCH,
    component: () => import('@/views/LanguagesFrenchView.vue'),
  },
  {
    path: ROUTE_PATHS.STUDIO_OPS_HELP,
    name: ROUTE_NAMES.STUDIO_OPS_HELP,
    component: () => import('@/views/StudioOpsHelpView.vue'),
    meta: { requiresStudioOpsAuth: true },
  },
  {
    path: ROUTE_PATHS.STUDIO_OPS_LOGIN,
    name: ROUTE_NAMES.STUDIO_OPS_LOGIN,
    component: () => import('@/views/StudioOpsLoginView.vue'),
  },
  {
    path: ROUTE_PATHS.STUDIO_OPS_PANEL,
    name: ROUTE_NAMES.STUDIO_OPS_PANEL,
    component: () => import('@/views/StudioOpsDashboardView.vue'),
    meta: { requiresStudioOpsAuth: true },
  },
  {
    path: ROUTE_PATHS.LEGAL_NOTICE,
    name: ROUTE_NAMES.LEGAL_NOTICE,
    component: () => import('@/views/LegalNoticeView.vue'),
  },
  {
    path: ROUTE_PATHS.LEGAL_PRIVACY,
    name: ROUTE_NAMES.LEGAL_PRIVACY,
    component: () => import('@/views/LegalPrivacyView.vue'),
  },
  {
    path: ROUTE_PATHS.LEGAL_TERMS,
    name: ROUTE_NAMES.LEGAL_TERMS,
    component: () => import('@/views/LegalTermsView.vue'),
  },
  {
    path: ROUTE_PATHS.LEGAL_COOKIES,
    name: ROUTE_NAMES.LEGAL_COOKIES,
    component: () => import('@/views/LegalCookiesView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: ROUTE_PATHS.HOME,
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

  return { name: ROUTE_NAMES.STUDIO_OPS_LOGIN };
});

export default router;
