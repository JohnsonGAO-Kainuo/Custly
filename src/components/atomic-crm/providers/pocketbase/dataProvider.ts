import {
  withLifecycleCallbacks,
  type CreateParams,
  type DataProvider,
  type GetListParams,
  type Identifier,
  type UpdateParams,
} from "ra-core";

import type {
  Contact,
  ContactNote,
  Deal,
  DealNote,
  SalesFormData,
  SignUpData,
} from "../../types";
import { getActivityLog } from "../commons/activity";
import { mergeContacts } from "../commons/mergeContacts";
import type { CrmDataProvider } from "../types";
import { buildFileUrl, getAuthToken, getPocketBaseUrl } from "./client";
import { getIsInitialized } from "./authProvider";

type FileFieldConfig = {
  multiple: boolean;
};

const FILE_FIELDS: Record<string, Record<string, FileFieldConfig>> = {
  companies: { logo: { multiple: false } },
  contacts: { avatar: { multiple: false } },
  sales: { avatar: { multiple: false } },
  contactNotes: { attachments: { multiple: true } },
  dealNotes: { attachments: { multiple: true } },
};

const SEARCH_FIELDS: Record<string, string[]> = {
  contacts: ["first_name", "last_name", "title"],
  companies: ["name", "website", "city", "stateAbbr"],
  contacts_summary: ["first_name", "last_name"],
  deals: ["name", "description"],
};

const normalizeResource = (resource: string) => {
  if (resource.endsWith("_summary")) {
    return resource.replace(/_summary$/, "");
  }
  return resource;
};

const escapeFilterValue = (value: string) => value.replace(/"/g, '\\"');

const formatFilterValue = (value: unknown) => {
  if (value === null) {
    return "null";
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return `${value}`;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/^{/, "").replace(/}$/, "");
    return `"${escapeFilterValue(cleaned)}"`;
  }
  return `"${escapeFilterValue(String(value))}"`;
};

const parseFilterKey = (key: string, value: unknown) => {
  if (key.includes("@")) {
    const lastIndex = key.lastIndexOf("@");
    const field = key.slice(0, lastIndex);
    const op = key.slice(lastIndex + 1);
    if (op === "ilike" || op === "like") {
      return { field, operator: "~" };
    }
    if (op === "cs") {
      const raw = typeof value === "string" ? value : "";
      const cleaned = raw.replace(/^{/, "").replace(/}$/, "");
      return { field, operator: "?=", normalizedValue: cleaned };
    }
    if (op === "lt") {
      return { field, operator: "<" };
    }
    if (op === "lte") {
      return { field, operator: "<=" };
    }
    if (op === "gt") {
      return { field, operator: ">" };
    }
    if (op === "gte") {
      return { field, operator: ">=" };
    }
    if (op === "neq" || op === "ne") {
      return { field, operator: "!=", allowNull: true };
    }
    if (op === "is") {
      return { field, operator: "=", allowNull: true };
    }
    if (op === "not.is") {
      return { field, operator: "!=", allowNull: true };
    }
    return { field, operator: "=" };
  }
  return { field: key, operator: "=" };
};

const buildFilter = (resource: string, filter?: Record<string, unknown>) => {
  if (!filter || Object.keys(filter).length === 0) return "";

  const clauses: string[] = [];
  const { q, ...rest } = filter;

  if (q && typeof q === "string") {
    const fields = SEARCH_FIELDS[resource] ?? [];
    if (fields.length > 0) {
      const qClause = fields
        .map((field) => `${field} ~ "${escapeFilterValue(q)}"`)
        .join(" || ");
      clauses.push(`(${qClause})`);
    }
  }

  for (const [key, value] of Object.entries(rest)) {
    if (key === "@or" && typeof value === "object" && value) {
      const orParts = Object.entries(value).map(([orKey, orValue]) => {
        const parsed = parseFilterKey(orKey, orValue);
        const normalized =
          parsed.normalizedValue ?? (orValue as unknown);
        return `${parsed.field} ${parsed.operator} ${formatFilterValue(
          normalized,
        )}`;
      });
      if (orParts.length) {
        clauses.push(`(${orParts.join(" || ")})`);
      }
      continue;
    }

    const parsed = parseFilterKey(key, value);
    const normalizedValue =
      parsed.normalizedValue ?? value;
    if (
      (normalizedValue === undefined ||
        normalizedValue === null ||
        normalizedValue === "") &&
      !parsed.allowNull
    ) {
      continue;
    }

    if (Array.isArray(normalizedValue)) {
      const orClause = normalizedValue
        .map((item) => `${parsed.field} ${parsed.operator} ${formatFilterValue(item)}`)
        .join(" || ");
      clauses.push(`(${orClause})`);
    } else {
      clauses.push(
        `${parsed.field} ${parsed.operator} ${formatFilterValue(normalizedValue)}`,
      );
    }
  }

  return clauses.join(" && ");
};

const dataUrlToFile = (dataUrl: string, fileName: string) => {
  const [header, base64] = dataUrl.split(",");
  const match = header.match(/data:(.*?);base64/);
  const mime = match?.[1] ?? "application/octet-stream";
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return new File([bytes], fileName, { type: mime });
};

const extractFileUploads = (resource: string, data: Record<string, any>) => {
  const fileConfig = FILE_FIELDS[resource] ?? {};
  const uploads: Record<string, File[]> = {};

  Object.entries(fileConfig).forEach(([field, config]) => {
    const value = data[field];
    if (!value) return;

    const values = config.multiple ? (Array.isArray(value) ? value : [value]) : [value];
    const files = values
      .map((item) => {
        if (item instanceof File) return item;
        if (item?.rawFile instanceof File && item.rawFile.size > 0) return item.rawFile;
        if (typeof item?.src === "string" && item.src.startsWith("data:")) {
          const name = item.title || "upload";
          return dataUrlToFile(item.src, name);
        }
        return null;
      })
      .filter((file): file is File => Boolean(file));

    if (files.length > 0) {
      uploads[field] = files;
    }
  });

  return uploads;
};

const toFormData = (resource: string, data: Record<string, any>) => {
  const uploads = extractFileUploads(resource, data);
  const formData = new FormData();
  const fileConfig = FILE_FIELDS[resource] ?? {};

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;

    if (fileConfig[key]) {
      if (uploads[key]) {
        uploads[key].forEach((file) => formData.append(key, file));
      } else if (value === null) {
        formData.append(key, "");
      }
      return;
    }

    if (value === null) {
      formData.append(key, "");
      return;
    }

    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

const mapRecordFiles = (resource: string, record: Record<string, any>) => {
  const fileConfig = FILE_FIELDS[resource] ?? {};
  const mapped = { ...record };

  Object.entries(fileConfig).forEach(([field, config]) => {
    const value = record[field];
    if (!value) return;
    if (config.multiple) {
      const files = Array.isArray(value) ? value : [value];
      mapped[field] = files.map((fileName) => ({
        src: buildFileUrl(resource, record.id, fileName),
        title: fileName,
      }));
    } else if (typeof value === "string") {
      mapped[field] = {
        src: buildFileUrl(resource, record.id, value),
        title: value,
      };
    }
  });

  return mapped;
};

const requestJson = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const baseUrl = getPocketBaseUrl();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const message = await response.text();
    const err = new Error(message || "PocketBase request failed") as Error & {
      status?: number;
    };
    err.status = response.status;
    throw err;
  }
  if (response.status === 204) {
    return {} as T;
  }
  return (await response.json()) as T;
};

const requestForm = async <T>(
  path: string,
  formData: FormData,
  options: RequestInit = {},
): Promise<T> => {
  const baseUrl = getPocketBaseUrl();
  const headers: HeadersInit = {
    ...options.headers,
  };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    body: formData,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "PocketBase request failed");
  }
  if (response.status === 204) {
    return {} as T;
  }
  return (await response.json()) as T;
};

const baseDataProvider: DataProvider = {
  getList: async (resource, params) => {
    const normalized = normalizeResource(resource);
    const { page, perPage } = params.pagination;
    const sort = params.sort?.field
      ? `${params.sort.order === "DESC" ? "-" : ""}${params.sort.field}`
      : undefined;
    const filter = buildFilter(resource, params.filter);
    const search = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
    });
    if (sort) search.set("sort", sort);
    if (filter) search.set("filter", filter);
    const doFetch = async (withSort: boolean) => {
      const qs = new URLSearchParams(search);
      if (!withSort) qs.delete("sort");
      return requestJson<{
        items: Record<string, any>[];
        totalItems: number;
      }>(`/api/collections/${normalized}/records?${qs.toString()}`);
    };

    let response;
    try {
      response = await doFetch(true);
    } catch (e: any) {
      if (sort && e?.status === 400) {
        // 退化：无效排序字段时再试一次不带 sort
        response = await doFetch(false);
      } else {
        throw e;
      }
    }
    return {
      data: response.items.map((record) => mapRecordFiles(normalized, record)),
      total: response.totalItems,
    };
  },
  getOne: async (resource, params) => {
    const normalized = normalizeResource(resource);
    const response = await requestJson<Record<string, any>>(
      `/api/collections/${normalized}/records/${params.id}`,
    );
    return { data: mapRecordFiles(normalized, response) };
  },
  getMany: async (resource, params) => {
    const normalized = normalizeResource(resource);
    const ids = params.ids ?? [];
    if (ids.length === 0) return { data: [] };
    const filter = ids
      .map((id) => `id = ${formatFilterValue(id)}`)
      .join(" || ");
    const search = new URLSearchParams({
      page: "1",
      perPage: String(ids.length),
      filter,
    });
    const response = await requestJson<{
      items: Record<string, any>[];
    }>(`/api/collections/${normalized}/records?${search.toString()}`);
    return {
      data: response.items.map((record) => mapRecordFiles(normalized, record)),
    };
  },
  getManyReference: async (resource, params) => {
    const normalized = normalizeResource(resource);
    const { page, perPage } = params.pagination;
    const sort = params.sort?.field
      ? `${params.sort.order === "DESC" ? "-" : ""}${params.sort.field}`
      : undefined;
    const baseFilter = buildFilter(resource, params.filter);
    const refClause = `${params.target} = ${formatFilterValue(params.id)}`;
    const filter = baseFilter
      ? `(${baseFilter}) && ${refClause}`
      : refClause;
    const search = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
      filter,
    });
    if (sort) search.set("sort", sort);

    const doFetch = async (withSort: boolean) => {
      const qs = new URLSearchParams(search);
      if (!withSort) qs.delete("sort");
      return requestJson<{
        items: Record<string, any>[];
        totalItems: number;
      }>(`/api/collections/${normalized}/records?${qs.toString()}`);
    };

    let response;
    try {
      response = await doFetch(true);
    } catch (e: any) {
      if (sort && e?.status === 400) {
        response = await doFetch(false);
      } else {
        throw e;
      }
    }
    return {
      data: response.items.map((record) => mapRecordFiles(normalized, record)),
      total: response.totalItems,
    };
  },
  create: async (resource, params) => {
    const normalized = normalizeResource(resource);
    const data = { ...params.data };
    if (normalized === "companies" && !data.created_at) {
      data.created_at = new Date().toISOString();
    }
    const uploads = extractFileUploads(normalized, data);
    const response =
      Object.keys(uploads).length > 0
        ? await requestForm<Record<string, any>>(
            `/api/collections/${normalized}/records`,
            toFormData(normalized, data),
            { method: "POST" },
          )
        : await requestJson<Record<string, any>>(
            `/api/collections/${normalized}/records`,
            {
              method: "POST",
              body: JSON.stringify(data),
            },
          );
    return { data: mapRecordFiles(normalized, response) };
  },
  update: async (resource, params) => {
    const normalized = normalizeResource(resource);
    const data = { ...params.data };
    const uploads = extractFileUploads(normalized, data);
    const response =
      Object.keys(uploads).length > 0
        ? await requestForm<Record<string, any>>(
            `/api/collections/${normalized}/records/${params.id}`,
            toFormData(normalized, data),
            { method: "PATCH" },
          )
        : await requestJson<Record<string, any>>(
            `/api/collections/${normalized}/records/${params.id}`,
            {
              method: "PATCH",
              body: JSON.stringify(data),
            },
          );
    return { data: mapRecordFiles(normalized, response) };
  },
  updateMany: async (resource, params) => {
    const updated = await Promise.all(
      params.ids.map((id) =>
        baseDataProvider.update(resource, {
          id,
          data: params.data,
          previousData: params.previousData,
        }),
      ),
    );
    return { data: updated.map((item) => item.data.id) };
  },
  delete: async (resource, params) => {
    const normalized = normalizeResource(resource);
    await requestJson(
      `/api/collections/${normalized}/records/${params.id}`,
      {
        method: "DELETE",
      },
    );
    return { data: { id: params.id } };
  },
  deleteMany: async (resource, params) => {
    await Promise.all(
      params.ids.map((id) =>
        baseDataProvider.delete(resource, { id, previousData: params.previousData }),
      ),
    );
    return { data: params.ids };
  },
};

const dataProviderWithCustomMethods: CrmDataProvider = {
  ...baseDataProvider,
  async signUp({ email, password, first_name, last_name }: SignUpData) {
    const response = await requestJson<Record<string, any>>(
      "/api/collections/sales/records",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          passwordConfirm: password,
          first_name,
          last_name,
        }),
      },
    );

    getIsInitialized._is_initialized_cache = true;

    return {
      id: response.id,
      email,
      password,
    };
  },
  async salesCreate(body: SalesFormData) {
    const response = await requestJson<Record<string, any>>(
      "/api/collections/sales/records",
      {
        method: "POST",
        body: JSON.stringify({
          ...body,
          passwordConfirm: body.password,
        }),
      },
    );
    return response as any;
  },
  async salesUpdate(
    id: Identifier,
    data: Partial<Omit<SalesFormData, "password">>,
  ) {
    await requestJson<Record<string, any>>(
      `/api/collections/sales/records/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    return data;
  },
  async updatePassword(id: Identifier) {
    await requestJson<Record<string, any>>(
      `/api/collections/sales/records/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          password: "demo_newPassword",
          passwordConfirm: "demo_newPassword",
        }),
      },
    );
    return true;
  },
  async unarchiveDeal(deal: Deal) {
    const { data: deals } = await baseDataProvider.getList<Deal>("deals", {
      filter: { stage: deal.stage },
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "index", order: "ASC" },
    });

    const updatedDeals = deals.map((d, index) => ({
      ...d,
      index: d.id === deal.id ? 0 : index + 1,
      archived_at: d.id === deal.id ? null : d.archived_at,
    }));

    return await Promise.all(
      updatedDeals.map((updatedDeal) =>
        baseDataProvider.update("deals", {
          id: updatedDeal.id,
          data: updatedDeal,
          previousData: deals.find((d) => d.id === updatedDeal.id),
        }),
      ),
    );
  },
  async getActivityLog(companyId?: Identifier) {
    return getActivityLog(baseDataProvider, companyId);
  },
  async isInitialized() {
    return getIsInitialized();
  },
  async mergeContacts(sourceId: Identifier, targetId: Identifier) {
    return mergeContacts(sourceId, targetId, baseDataProvider);
  },
};

export const dataProvider = withLifecycleCallbacks(dataProviderWithCustomMethods, [
  {
    resource: "contactNotes",
    beforeSave: async (data: ContactNote) => data,
  },
  {
    resource: "dealNotes",
    beforeSave: async (data: DealNote) => data,
  },
  {
    resource: "contacts",
    beforeCreate: async (params: CreateParams<Contact>) => params,
    beforeUpdate: async (params: UpdateParams<Contact>) => params,
    beforeGetList: async (params) => params,
  },
]);
