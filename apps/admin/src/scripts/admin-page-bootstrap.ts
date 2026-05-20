const pageId = document.body.dataset.adminPage;

const pageLoaders: Record<string, () => Promise<unknown>> = {
  architecture: () => import("./admin-content-i18n"),
  backlog: () => import("./admin-backlog"),
  business: () => import("./admin-content-i18n"),
  landing: () => import("./admin-content-i18n"),
  maintenance: () => import("./admin-maintenance"),
  "pack-reader": () => import("./admin-pack-reader"),
  waitlist: () => import("./admin-waitlist"),
  insight: () => import("./admin-insight"),
};

if (pageId && pageLoaders[pageId]) {
  void pageLoaders[pageId]();
}
