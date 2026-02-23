import type { DealStage, NoteStatus } from "../types";
import {
  defaultCompanySectors,
  defaultDealCategories,
  defaultDealPipelineStatuses,
  defaultDealStages,
  defaultNoteStatuses,
  defaultTaskTypes,
} from "../root/defaultConfiguration";

export type TemplateDefinition = {
  id: string;
  nameKey: string;
  summaryKey: string;
  badgeKey?: string;
  highlights: string[];
  pipeline: string[];
  fields: string[];
  tags: string[];
  config: {
    companySectors: string[];
    dealCategories: string[];
    dealPipelineStatuses: string[];
    dealStages: DealStage[];
    noteStatuses: NoteStatus[];
    taskTypes: string[];
  };
};

const unique = (items: string[]) => Array.from(new Set(items));

export type TemplateConfig = TemplateDefinition["config"];

export type CustomTemplate = {
  id: string;
  name: string;
  description?: string;
  config: TemplateConfig;
  createdAt?: string;
  updatedAt?: string;
};

const counselingStages: DealStage[] = [
  { value: "opportunity", label: "Inquiry" },
  { value: "proposal-sent", label: "Assessment" },
  { value: "in-negociation", label: "Care Plan" },
  { value: "won", label: "Active Care" },
  { value: "lost", label: "Closed" },
  { value: "delayed", label: "Follow-up" },
];

const ecommerceStages: DealStage[] = [
  { value: "opportunity", label: "Lead" },
  { value: "proposal-sent", label: "Quote Sent" },
  { value: "in-negociation", label: "Negotiation" },
  { value: "won", label: "Converted" },
  { value: "lost", label: "Churned" },
  { value: "delayed", label: "Post-sale" },
];

export const templates: TemplateDefinition[] = [
  {
    id: "general",
    nameKey: "crm.templates.general.name",
    summaryKey: "crm.templates.general.summary",
    badgeKey: "crm.templates.general.badge",
    highlights: [
      "crm.templates.general.highlights.0",
      "crm.templates.general.highlights.1",
      "crm.templates.general.highlights.2",
    ],
    pipeline: [
      "crm.templates.general.pipeline.0",
      "crm.templates.general.pipeline.1",
      "crm.templates.general.pipeline.2",
    ],
    fields: [
      "crm.templates.general.fields.0",
      "crm.templates.general.fields.1",
      "crm.templates.general.fields.2",
    ],
    tags: [
      "crm.templates.general.tags.0",
      "crm.templates.general.tags.1",
      "crm.templates.general.tags.2",
    ],
    config: {
      companySectors: defaultCompanySectors,
      dealCategories: defaultDealCategories,
      dealPipelineStatuses: defaultDealPipelineStatuses,
      dealStages: defaultDealStages,
      noteStatuses: defaultNoteStatuses,
      taskTypes: defaultTaskTypes,
    },
  },
  {
    id: "counseling",
    nameKey: "crm.templates.counseling.name",
    summaryKey: "crm.templates.counseling.summary",
    badgeKey: "crm.templates.counseling.badge",
    highlights: [
      "crm.templates.counseling.highlights.0",
      "crm.templates.counseling.highlights.1",
      "crm.templates.counseling.highlights.2",
    ],
    pipeline: [
      "crm.templates.counseling.pipeline.0",
      "crm.templates.counseling.pipeline.1",
      "crm.templates.counseling.pipeline.2",
    ],
    fields: [
      "crm.templates.counseling.fields.0",
      "crm.templates.counseling.fields.1",
      "crm.templates.counseling.fields.2",
    ],
    tags: [
      "crm.templates.counseling.tags.0",
      "crm.templates.counseling.tags.1",
      "crm.templates.counseling.tags.2",
    ],
    config: {
      companySectors: [
        "Mental health",
        "Wellness",
        "Community services",
        "Education",
        "Healthcare",
      ],
      dealCategories: defaultDealCategories,
      dealPipelineStatuses: defaultDealPipelineStatuses,
      dealStages: counselingStages,
      noteStatuses: defaultNoteStatuses,
      taskTypes: unique([
        ...defaultTaskTypes,
        "Session",
        "Assessment",
        "Care plan",
        "Case review",
        "Follow-up call",
      ]),
    },
  },
  {
    id: "ecommerce",
    nameKey: "crm.templates.ecommerce.name",
    summaryKey: "crm.templates.ecommerce.summary",
    badgeKey: "crm.templates.ecommerce.badge",
    highlights: [
      "crm.templates.ecommerce.highlights.0",
      "crm.templates.ecommerce.highlights.1",
      "crm.templates.ecommerce.highlights.2",
    ],
    pipeline: [
      "crm.templates.ecommerce.pipeline.0",
      "crm.templates.ecommerce.pipeline.1",
      "crm.templates.ecommerce.pipeline.2",
    ],
    fields: [
      "crm.templates.ecommerce.fields.0",
      "crm.templates.ecommerce.fields.1",
      "crm.templates.ecommerce.fields.2",
    ],
    tags: [
      "crm.templates.ecommerce.tags.0",
      "crm.templates.ecommerce.tags.1",
      "crm.templates.ecommerce.tags.2",
    ],
    config: {
      companySectors: [
        "Cross-border",
        "Retail",
        "Marketplaces",
        "Logistics",
        "Consumer goods",
      ],
      dealCategories: unique([
        ...defaultDealCategories,
        "Wholesale",
        "Subscription",
        "Fulfillment",
      ]),
      dealPipelineStatuses: defaultDealPipelineStatuses,
      dealStages: ecommerceStages,
      noteStatuses: defaultNoteStatuses,
      taskTypes: unique([
        ...defaultTaskTypes,
        "Quote review",
        "Order follow-up",
        "Returns review",
        "Inventory sync",
      ]),
    },
  },
];

const STORAGE_KEY = "custly:template";
const TEMPLATE_CONFIG_KEY = "custly:template:config";
const CUSTOM_TEMPLATES_KEY = "custly:templates:custom";

export const getStoredTemplateId = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
};

export const setStoredTemplateId = (id: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
};

export const clearStoredTemplateId = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const getStoredTemplateConfig = () => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TEMPLATE_CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TemplateConfig;
  } catch {
    return null;
  }
};

export const setStoredTemplateConfig = (config: TemplateConfig) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TEMPLATE_CONFIG_KEY, JSON.stringify(config));
};

export const clearStoredTemplateConfig = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TEMPLATE_CONFIG_KEY);
};

export const applyTemplateSelection = (
  id: string,
  config?: TemplateConfig,
) => {
  setStoredTemplateId(id);
  if (config) {
    setStoredTemplateConfig(config);
  } else {
    clearStoredTemplateConfig();
  }
};

export const getActiveTemplate = () => {
  const storedId = getStoredTemplateId();
  if (!storedId) return null;
  return templates.find((template) => template.id === storedId) ?? null;
};

export const getTemplateOverrides = () => {
  const storedConfig = getStoredTemplateConfig();
  if (storedConfig) return storedConfig;
  return getActiveTemplate()?.config ?? null;
};

export const getStoredCustomTemplates = (): CustomTemplate[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CUSTOM_TEMPLATES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CustomTemplate[];
  } catch {
    return [];
  }
};

export const saveCustomTemplateLocal = (template: CustomTemplate) => {
  if (typeof window === "undefined") return [];
  const existing = getStoredCustomTemplates().filter(
    (item) => item.id !== template.id,
  );
  const next = [template, ...existing];
  window.localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(next));
  return next;
};

export const deleteCustomTemplateLocal = (id: string) => {
  if (typeof window === "undefined") return [];
  const next = getStoredCustomTemplates().filter((item) => item.id !== id);
  window.localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(next));
  return next;
};

export const isDemoMode = () => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const fromUrl =
    window.location.pathname.startsWith("/demo") || params.get("demo") === "1";

  if (fromUrl) {
    try {
      sessionStorage.setItem("custly_demo", "1");
    } catch {
      // ignore
    }
    return true;
  }

  try {
    return sessionStorage.getItem("custly_demo") === "1";
  } catch {
    return false;
  }
};
