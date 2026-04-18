import type {
  RoadmapArea,
  RoadmapItem,
  RoadmapPriority,
  RoadmapStatus,
  RoadmapType,
  RoadmapVersion,
} from "../lib/admin-roadmap";

type RoadmapLabels = {
  priority: Record<RoadmapPriority, string>;
  area: Record<RoadmapArea, string>;
  type: Record<RoadmapType, string>;
  status: Record<RoadmapStatus, string>;
};

type VersionSummary = {
  id: string;
  label: string;
  kind: RoadmapVersion["kind"];
  summary: string;
  done: number;
  total: number;
  childDone: number;
  childTotal: number;
};

type RoadmapPayload = {
  roadmap: {
    meta: {
      defaultVersionId: string;
    };
    versions: RoadmapVersion[];
  };
  versionSummaries: VersionSummary[];
  labels: RoadmapLabels;
  kindLabels: Record<RoadmapVersion["kind"], string>;
};

type BacklogState = {
  versionId: string;
  statusFilter: string;
  sortKey: string;
};

type Summary = {
  done: number;
  total: number;
  childDone: number;
  childTotal: number;
};

const roadmapPayloadElement = document.getElementById("roadmap-data");
const backlogList = document.getElementById("backlog-list");
const currentVersionChip = document.getElementById("backlog-current-version-chip");
const summaryItemsChip = document.getElementById("backlog-summary-items-chip");
const summaryChildrenChip = document.getElementById("backlog-summary-children-chip");

if (
  roadmapPayloadElement &&
  backlogList &&
  currentVersionChip &&
  summaryItemsChip &&
  summaryChildrenChip
) {
  const payload = JSON.parse(roadmapPayloadElement.textContent || "{}") as RoadmapPayload;
  const roadmap = payload.roadmap;
  const versionSummaries = payload.versionSummaries;
  const labels = payload.labels;
  const kindLabels = payload.kindLabels;

  const escapeHtml = (value: unknown) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const getStatusRank = (status: string) => (status === "done" ? 1 : 0);

  const getPriorityRank = (priority: string) => {
    switch (priority) {
      case "P0":
        return 0;
      case "P1":
        return 1;
      case "P2":
        return 2;
      case "P3":
        return 3;
      default:
        return 4;
    }
  };

  const getSummary = (versions: RoadmapVersion[]): Summary =>
    versions.reduce(
      (totals, version) => {
        totals.done += version.items.filter((item) => item.status === "done").length;
        totals.total += version.items.length;
        totals.childDone += version.items.reduce(
          (sum, item) =>
            sum + (item.children || []).filter((child) => child.status === "done").length,
          0,
        );
        totals.childTotal += version.items.reduce(
          (sum, item) => sum + (item.children || []).length,
          0,
        );
        return totals;
      },
      { done: 0, total: 0, childDone: 0, childTotal: 0 },
    );

  const sortItems = (items: RoadmapItem[], mode: string): RoadmapItem[] => {
    const withIndex = items.map((item, index) => ({ item, index }));

    withIndex.sort((left, right) => {
      if (mode === "status") {
        const byStatus = getStatusRank(left.item.status) - getStatusRank(right.item.status);
        if (byStatus !== 0) return byStatus;
      }

      if (mode === "priority") {
        const byPriority =
          getPriorityRank(left.item.priority) - getPriorityRank(right.item.priority);
        if (byPriority !== 0) return byPriority;
      }

      if (mode === "area") {
        const byArea = labels.area[left.item.area].localeCompare(
          labels.area[right.item.area],
          "fr",
        );
        if (byArea !== 0) return byArea;
      }

      return left.index - right.index;
    });

    return withIndex.map((entry) => entry.item);
  };

  const getState = (): BacklogState => {
    const params = new URLSearchParams(window.location.search);
    return {
      versionId: params.get("version") || roadmap.meta.defaultVersionId,
      statusFilter: params.get("status") || "all",
      sortKey: params.get("sort") || "roadmap",
    };
  };

  const getHref = (nextState: BacklogState) => {
    const params = new URLSearchParams();
    params.set("version", nextState.versionId);
    params.set("status", nextState.statusFilter);
    params.set("sort", nextState.sortKey);
    return `/pilotage/backlog?${params.toString()}`;
  };

  const renderList = (state: BacklogState) => {
    const selectedVersion =
      state.versionId === "all"
        ? null
        : roadmap.versions.find((version) => version.id === state.versionId) ||
          roadmap.versions.find((version) => version.id === roadmap.meta.defaultVersionId) ||
          roadmap.versions[0];

    const visibleVersions = selectedVersion ? [selectedVersion] : roadmap.versions;
    const versionBlocks = visibleVersions
      .map((version) => {
        const filteredItems = version.items.filter(
          (item) => state.statusFilter === "all" || item.status === state.statusFilter,
        );

        return {
          version,
          summary: versionSummaries.find((summary) => summary.id === version.id),
          items: sortItems(filteredItems, state.sortKey),
        };
      })
      .filter((block) => block.items.length > 0);

    const selectedSummary = selectedVersion
      ? versionSummaries.find((summary) => summary.id === selectedVersion.id) ||
        getSummary([selectedVersion])
      : getSummary(roadmap.versions);

    currentVersionChip.textContent = selectedVersion ? selectedVersion.label : "Lecture libre";
    summaryItemsChip.textContent = `${selectedSummary.done}/${selectedSummary.total} items terminés`;
    summaryChildrenChip.textContent = `${selectedSummary.childDone}/${selectedSummary.childTotal} sous-items terminés`;

    if (versionBlocks.length === 0) {
      backlogList.innerHTML = `
        <section class="backlog-card backlog-empty">
          Aucun item ne correspond au filtre actuel.
        </section>
      `;
      return;
    }

    backlogList.innerHTML = versionBlocks
      .map((block) => {
        const sectionHead = selectedVersion
          ? ""
          : `
            <section class="backlog-card backlog-section-head">
              <div class="backlog-section-title-row">
                <div class="backlog-section-title">${escapeHtml(block.version.label)}</div>
                <span class="backlog-version-kind ${escapeHtml(block.version.kind)}">${escapeHtml(kindLabels[block.version.kind])}</span>
              </div>
              <p class="backlog-section-copy">${escapeHtml(block.version.summary)}</p>
              <div class="backlog-section-meta">
                <span class="backlog-chip">${block.summary?.done ?? 0}/${block.summary?.total ?? 0} items terminés</span>
                <span class="backlog-chip">${block.summary?.childDone ?? 0}/${block.summary?.childTotal ?? 0} sous-items terminés</span>
              </div>
            </section>
          `;

        const items = block.items
          .map((item) => {
            const children = (item.children || []).length
              ? `
                <div class="backlog-children">
                  ${(item.children || [])
                    .map(
                      (child) => `
                        <div class="backlog-child ${child.status === "done" ? "is-done" : ""}">
                          <span class="backlog-child-check">${child.status === "done" ? "✓" : "•"}</span>
                          <span>${escapeHtml(child.title)}</span>
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              `
              : "";

            return `
              <article class="backlog-item ${item.status === "done" ? "is-done" : ""}">
                <div class="backlog-item-head">
                  <div class="backlog-item-title-wrap">
                    <div class="backlog-item-title">${escapeHtml(item.title)}</div>
                    ${item.notes ? `<p class="backlog-item-note">${escapeHtml(item.notes)}</p>` : ""}
                    <div class="backlog-item-meta">
                      <span class="backlog-meta-chip status-${escapeHtml(item.status)}">${escapeHtml(labels.status[item.status])}</span>
                      <span class="backlog-meta-chip priority-${escapeHtml(item.priority.toLowerCase())}">${escapeHtml(item.priority)}</span>
                      <span class="backlog-meta-chip">${escapeHtml(labels.area[item.area])}</span>
                      <span class="backlog-meta-chip">${escapeHtml(labels.type[item.type])}</span>
                    </div>
                  </div>
                  <div class="backlog-check">${item.status === "done" ? "✓" : "•"}</div>
                </div>
                ${children}
              </article>
            `;
          })
          .join("");

        return `<section class="backlog-version-section">${sectionHead}${items}</section>`;
      })
      .join("");
  };

  const syncControls = (state: BacklogState) => {
    document.querySelectorAll("[data-role='version-option']").forEach((element) => {
      const versionId = element.getAttribute("data-version-id") || roadmap.meta.defaultVersionId;
      element.classList.toggle("is-active", versionId === state.versionId);
      element.setAttribute(
        "href",
        getHref({ versionId, statusFilter: state.statusFilter, sortKey: state.sortKey }),
      );
    });

    document.querySelectorAll("[data-role='status-option']").forEach((element) => {
      const statusId = element.getAttribute("data-status-id") || "all";
      element.classList.toggle("is-active", statusId === state.statusFilter);
      element.setAttribute(
        "href",
        getHref({ versionId: state.versionId, statusFilter: statusId, sortKey: state.sortKey }),
      );
    });

    document.querySelectorAll("[data-role='sort-option']").forEach((element) => {
      const sortId = element.getAttribute("data-sort-id") || "roadmap";
      element.classList.toggle("is-active", sortId === state.sortKey);
      element.setAttribute(
        "href",
        getHref({ versionId: state.versionId, statusFilter: state.statusFilter, sortKey: sortId }),
      );
    });

    document.querySelectorAll("[data-role='version-card']").forEach((element) => {
      const versionId = element.getAttribute("data-version-id") || roadmap.meta.defaultVersionId;
      element.classList.toggle("is-active", versionId === state.versionId);
      element.setAttribute(
        "href",
        getHref({ versionId, statusFilter: state.statusFilter, sortKey: state.sortKey }),
      );
    });
  };

  const render = () => {
    const state = getState();
    syncControls(state);
    renderList(state);
  };

  render();

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-role]") : null;
    if (!(target instanceof HTMLAnchorElement)) return;

    event.preventDefault();
    const href = target.getAttribute("href");
    if (!href) return;

    window.history.pushState({}, "", href);
    render();
  });

  window.addEventListener("popstate", render);
}
