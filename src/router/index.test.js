import { beforeEach, describe, expect, it, vi } from 'vitest';

let createRouterMock;
let createWebHistoryMock;
let isAdminSessionValidMock;

async function loadRouterModule(isAuthenticated) {
  vi.resetModules();

  createRouterMock = vi.fn((config) => {
    const router = {
      config,
      beforeEach: vi.fn((guard) => {
        router.guard = guard;
      }),
      guard: null,
    };
    return router;
  });

  createWebHistoryMock = vi.fn(() => ({ type: 'web-history' }));
  isAdminSessionValidMock = vi.fn(() => isAuthenticated);

  vi.doMock('vue-router', () => ({
    createRouter: createRouterMock,
    createWebHistory: createWebHistoryMock,
  }));

  vi.doMock('@/features/admin/auth', () => ({
    isAdminSessionValid: isAdminSessionValidMock,
  }));

  const module = await import('./index.js');
  return module.default;
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('router configuration', () => {
  it('declares studio-ops panel as protected route', async () => {
    await loadRouterModule(false);

    expect(createRouterMock).toHaveBeenCalledTimes(1);
    expect(createWebHistoryMock).toHaveBeenCalledTimes(1);

    const config = createRouterMock.mock.calls[0][0];
    const protectedRoute = config.routes.find((route) => route.name === 'studio-ops-panel');

    expect(protectedRoute).toBeDefined();
    expect(protectedRoute.path).toBe('/-/studio-ops/panel');
    expect(protectedRoute.meta).toEqual({ requiresStudioOpsAuth: true });
  });

  it('allows navigation when route is not protected', async () => {
    const router = await loadRouterModule(false);

    const result = router.guard({ meta: {} });
    expect(result).toBe(true);
  });

  it('allows protected route when session is valid', async () => {
    const router = await loadRouterModule(true);

    const result = router.guard({ meta: { requiresStudioOpsAuth: true } });
    expect(isAdminSessionValidMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('redirects to login when protected route is requested without session', async () => {
    const router = await loadRouterModule(false);

    const result = router.guard({ meta: { requiresStudioOpsAuth: true } });
    expect(isAdminSessionValidMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ name: 'studio-ops-login' });
  });
});
