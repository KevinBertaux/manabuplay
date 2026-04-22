import { readFileSync } from "node:fs";
import path from "node:path";

export type RoadmapStatus = "todo" | "done";
export type RoadmapPriority = "P0" | "P1" | "P2" | "P3";
export type RoadmapArea =
  | "core"
  | "landing"
  | "quiz"
  | "packs"
  | "admin"
  | "data"
  | "growth"
  | "business";
export type RoadmapType = "feature" | "content" | "ux" | "infra" | "research";

export type RoadmapChild = {
  id: string;
  title: string;
  status: RoadmapStatus;
};

export type RoadmapItem = {
  id: string;
  title: string;
  status: RoadmapStatus;
  priority: RoadmapPriority;
  area: RoadmapArea;
  type: RoadmapType;
  notes?: string;
  children?: RoadmapChild[];
};

export type RoadmapVersion = {
  id: string;
  label: string;
  kind: "history" | "current" | "planned" | "backlog";
  summary: string;
  items: RoadmapItem[];
};

type RoadmapMetaOption = {
  id: string;
  label: string;
};

type RoadmapData = {
  meta: {
    title: string;
    updatedAt: string;
    defaultVersionId: string;
    statuses: RoadmapMetaOption[];
    priorities: RoadmapMetaOption[];
    areas: RoadmapMetaOption[];
    types: RoadmapMetaOption[];
  };
  versions: RoadmapVersion[];
};

export type RoadmapLabels = {
  priority: Record<RoadmapPriority, string>;
  area: Record<RoadmapArea, string>;
  type: Record<RoadmapType, string>;
  status: Record<RoadmapStatus, string>;
};

export type RoadmapVersionSummary = {
  index: number;
  id: string;
  label: string;
  kind: RoadmapVersion["kind"];
  summary: string;
  done: number;
  total: number;
  childDone: number;
  childTotal: number;
};

export type RoadmapPayload = {
  roadmap: RoadmapData;
  versionSummaries: RoadmapVersionSummary[];
  labels: RoadmapLabels;
  statusOptions: { id: string; label: string }[];
  sortOptions: { id: string; label: string }[];
  kindLabels: Record<RoadmapVersion["kind"], string>;
};

function readRoadmapFile() {
  const filePath = path.join(process.cwd(), "docs", "ROADMAP.json");
  return readFileSync(filePath, "utf8");
}

export function getRoadmapData(): RoadmapData {
  return JSON.parse(readRoadmapFile()) as RoadmapData;
}

export function getRoadmapVersion(versionId: string) {
  const roadmap = getRoadmapData();
  return roadmap.versions.find((version) => version.id === versionId) ?? null;
}

export function getRoadmapVersionSummaries(): RoadmapVersionSummary[] {
  const roadmap = getRoadmapData();
  return roadmap.versions.map((version, index) => {
    const done = version.items.filter((item) => item.status === "done").length;
    const total = version.items.length;
    const childDone = version.items.reduce(
      (sum, item) => sum + (item.children?.filter((child) => child.status === "done").length ?? 0),
      0,
    );
    const childTotal = version.items.reduce((sum, item) => sum + (item.children?.length ?? 0), 0);

    return {
      index,
      id: version.id,
      label: version.label,
      kind: version.kind,
      summary: version.summary,
      done,
      total,
      childDone,
      childTotal,
    };
  });
}

export function getRoadmapLabelMap() {
  const roadmap = getRoadmapData();

  return {
    priority: Object.fromEntries(
      roadmap.meta.priorities.map((entry) => [entry.id, entry.label]),
    ) as Record<RoadmapPriority, string>,
    area: Object.fromEntries(roadmap.meta.areas.map((entry) => [entry.id, entry.label])) as Record<
      RoadmapArea,
      string
    >,
    type: Object.fromEntries(roadmap.meta.types.map((entry) => [entry.id, entry.label])) as Record<
      RoadmapType,
      string
    >,
    status: Object.fromEntries(
      roadmap.meta.statuses.map((entry) => [entry.id, entry.label]),
    ) as Record<RoadmapStatus, string>,
  };
}

export function getRoadmapPayload(): RoadmapPayload {
  return {
    roadmap: getRoadmapData(),
    versionSummaries: getRoadmapVersionSummaries(),
    labels: getRoadmapLabelMap(),
    statusOptions: [
      { id: "all", label: "Tout" },
      { id: "todo", label: "Backlog" },
      { id: "done", label: "Terminé" },
    ],
    sortOptions: [
      { id: "roadmap", label: "Ordre roadmap" },
      { id: "status", label: "Backlog puis terminé" },
      { id: "priority", label: "Priorité" },
      { id: "area", label: "Zone" },
    ],
    kindLabels: {
      history: "historique",
      current: "actif",
      planned: "prévu",
      backlog: "backlog",
    },
  };
}
