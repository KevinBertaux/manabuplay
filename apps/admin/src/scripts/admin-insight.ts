type InsightManifest = {
  generatedAt: string;
  baseUrl: string;
  mode?: string;
  insightNote?: string;
  files: string[];
};

const grid = document.getElementById("insight-captures-grid");
const statusEl = document.getElementById("insight-captures-status");

async function loadCaptures() {
  if (!(grid instanceof HTMLElement)) return;

  try {
    const response = await fetch("/insight-captures/manifest.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`manifest ${response.status}`);
    const manifest = (await response.json()) as InsightManifest;
    const files = Array.isArray(manifest.files)
      ? manifest.files.filter((f) => f.endsWith(".png"))
      : [];

    if (files.length === 0) {
      if (statusEl) statusEl.textContent = "Aucune capture dans le manifest.";
      return;
    }

    if (statusEl) {
      statusEl.textContent =
        manifest.insightNote ?? "Une image Insight par fichier (viewport, pas pleine page).";
    }

    const sorted = [...files].sort();
    grid.replaceChildren(
      ...sorted.map((name) => {
        const figure = document.createElement("figure");
        figure.className = "overflow-hidden rounded-lg border border-[rgba(139,92,246,.2)]";
        const img = document.createElement("img");
        img.src = `/insight-captures/${name}?v=${encodeURIComponent(manifest.generatedAt)}`;
        img.alt = name;
        img.loading = "lazy";
        img.className = "block w-full bg-[#0a0911]";
        const caption = document.createElement("figcaption");
        caption.className = "px-3 py-2 font-body text-sm text-slate-500";
        const match = name.match(/^([a-z]{2})-([a-z]+)-([a-z]+)\.png$/);
        caption.textContent = match
          ? `${match[1].toUpperCase()} · ${match[2]} · ${match[3]}`
          : name;
        figure.append(img, caption);
        return figure;
      }),
    );
  } catch {
    if (statusEl) {
      statusEl.textContent =
        "Captures introuvables. Lance npm run insight:capture (build + preview), puis rafraîchis.";
    }
  }
}

void loadCaptures();

export {};
