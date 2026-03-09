const normalizeUrl = (value) => {
  if (!value) return "";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const url = normalizeUrl(
  process.env.POCKETBASE_URL || process.env.VITE_POCKETBASE_URL,
);
const email = process.env.POCKETBASE_ADMIN_EMAIL;
const password = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!url || !email || !password) {
  console.error(
    [
      "Missing env vars.",
      "Required:",
      "  POCKETBASE_URL (or VITE_POCKETBASE_URL)",
      "  POCKETBASE_ADMIN_EMAIL",
      "  POCKETBASE_ADMIN_PASSWORD",
    ].join("\n"),
  );
  process.exit(1);
}

const authAdmin = async () => {
  const endpoints = [
    "/api/collections/_superusers/auth-with-password",
    "/api/_superusers/auth-with-password",
    "/api/admins/auth-with-password",
  ];

  for (const endpoint of endpoints) {
    const response = await fetch(`${url}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: email,
        password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data?.token;
    }

    if (response.status === 404) {
      continue;
    }

    const message = await response.text();
    throw new Error(message || "Admin auth failed");
  }

  throw new Error(
    "Admin auth failed (endpoint not found). Check PocketBase version or URL.",
  );
};

const requestJson = async (path, token, options = {}) => {
  const response = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${path}`);
  }
  if (response.status === 204) return null;
  return response.json();
};

const loadCollections = async (token) => {
  const list = await requestJson("/api/collections", token);
  return list?.items ?? [];
};

const resolveSchema = (schema, collections) => {
  const byName = new Map(collections.map((item) => [item.name, item]));
  return schema.map((field) => {
    if (field.type !== "relation" || !field.options?.collectionName) {
      return field;
    }
    const target = byName.get(field.options.collectionName);
    if (!target) {
      throw new Error(
        `Missing relation target '${field.options.collectionName}'`,
      );
    }
    const options = { ...field.options };
    delete options.collectionName;
    options.collectionId = target.id;
    return { ...field, options };
  });
};

const mergeSchema = (existingSchema, desiredSchema) => {
  const map = new Map(
    (existingSchema ?? []).map((field) => [field.name, field]),
  );
  const merged = [...(existingSchema ?? [])];
  desiredSchema.forEach((field) => {
    if (!map.has(field.name)) {
      merged.push(field);
    }
  });
  return merged;
};

const ensureCollection = async (token, definition) => {
  const collections = await loadCollections(token);
  const existing = collections.find((item) => item?.name === definition.name);
  const resolvedSchema = resolveSchema(definition.schema, collections);

  if (!existing) {
    await requestJson("/api/collections", token, {
      method: "POST",
      body: JSON.stringify({
        ...definition,
        schema: resolvedSchema,
      }),
    });
    console.log(`Collection '${definition.name}' created.`);
    return;
  }

  const mergedSchema = mergeSchema(existing.schema, resolvedSchema);
  await requestJson(`/api/collections/${existing.id}`, token, {
    method: "PATCH",
    body: JSON.stringify({
      name: definition.name,
      type: definition.type,
      system: definition.system ?? false,
      schema: mergedSchema,
      indexes: definition.indexes ?? existing.indexes ?? [],
      listRule: definition.listRule ?? existing.listRule,
      viewRule: definition.viewRule ?? existing.viewRule,
      createRule: definition.createRule ?? existing.createRule,
      updateRule: definition.updateRule ?? existing.updateRule,
      deleteRule: definition.deleteRule ?? existing.deleteRule,
      authRule: definition.authRule ?? existing.authRule,
      options: definition.options ?? existing.options,
    }),
  });
  console.log(`Collection '${definition.name}' updated.`);
};

const authRule = '@request.auth.id != ""';

// Multi-tenant isolation: users can only access records they own (via sales_id)
const ownerRule = 'sales_id = @request.auth.id';
const authenticatedRules = {
  listRule: ownerRule,
  viewRule: ownerRule,
  createRule: authRule,
  updateRule: ownerRule,
  deleteRule: ownerRule,
};

const collectionsToEnsure = [
  {
    name: "sales",
    type: "auth",
    system: false,
    schema: [
      {
        name: "first_name",
        type: "text",
        required: false, // Changed to false for OAuth support (OAuth may not provide names)
        options: { min: 0, max: 80 },
      },
      {
        name: "last_name",
        type: "text",
        required: false, // Changed to false for OAuth support
        options: { min: 0, max: 80 },
      },
      { name: "administrator", type: "bool", required: false },
      { name: "disabled", type: "bool", required: false },
      {
        name: "avatar",
        type: "file",
        required: false,
        options: { maxSelect: 1, maxSize: 5000000 },
      },
    ],
    indexes: [],
    listRule: authRule,
    viewRule: authRule,
    createRule: "",
    // Users can only update their own record; admins can update anyone
    updateRule: 'id = @request.auth.id || @request.auth.administrator = true',
    // Only admins can delete user records
    deleteRule: '@request.auth.administrator = true',
    authRule: "",
  },
  {
    name: "tags",
    type: "base",
    system: false,
    schema: [
      { name: "name", type: "text", required: true, options: { max: 120 } },
      { name: "color", type: "text", required: true, options: { max: 20 } },
    ],
    indexes: [],
    // Tags are shared resources — any authenticated user can manage them
    listRule: authRule,
    viewRule: authRule,
    createRule: authRule,
    updateRule: authRule,
    deleteRule: authRule,
  },
  {
    name: "companies",
    type: "base",
    system: false,
    schema: [
      { name: "name", type: "text", required: true, options: { max: 200 } },
      { name: "sector", type: "text", required: false, options: { max: 120 } },
      { name: "size", type: "number", required: false },
      { name: "linkedin_url", type: "url", required: false },
      { name: "website", type: "url", required: false },
      { name: "phone_number", type: "text", required: false },
      { name: "address", type: "text", required: false },
      { name: "zipcode", type: "text", required: false },
      { name: "city", type: "text", required: false },
      { name: "stateAbbr", type: "text", required: false },
      { name: "country", type: "text", required: false },
      { name: "description", type: "text", required: false },
      { name: "revenue", type: "text", required: false },
      { name: "tax_identifier", type: "text", required: false },
      { name: "context_links", type: "json", required: false },
      {
        name: "logo",
        type: "file",
        required: false,
        options: { maxSelect: 1, maxSize: 5000000 },
      },
      {
        name: "sales_id",
        type: "relation",
        required: false,
        options: { collectionName: "sales", maxSelect: 1 },
      },
    ],
    indexes: [],
    ...authenticatedRules,
  },
  {
    name: "contacts",
    type: "base",
    system: false,
    schema: [
      { name: "first_name", type: "text", required: false },
      { name: "last_name", type: "text", required: false },
      { name: "gender", type: "text", required: false },
      { name: "title", type: "text", required: false },
      { name: "email_jsonb", type: "json", required: false },
      { name: "phone_jsonb", type: "json", required: false },
      { name: "background", type: "text", required: false },
      {
        name: "avatar",
        type: "file",
        required: false,
        options: { maxSelect: 1, maxSize: 5000000 },
      },
      { name: "first_seen", type: "date", required: false },
      { name: "last_seen", type: "date", required: false },
      { name: "has_newsletter", type: "bool", required: false },
      { name: "status", type: "text", required: false },
      { name: "linkedin_url", type: "url", required: false },
      {
        name: "company_id",
        type: "relation",
        required: false,
        options: { collectionName: "companies", maxSelect: 1 },
      },
      {
        name: "sales_id",
        type: "relation",
        required: false,
        options: { collectionName: "sales", maxSelect: 1 },
      },
      {
        name: "tags",
        type: "relation",
        required: false,
        options: { collectionName: "tags", maxSelect: 999 },
      },
    ],
    indexes: [],
    ...authenticatedRules,
  },
  {
    name: "deals",
    type: "base",
    system: false,
    schema: [
      { name: "name", type: "text", required: true, options: { max: 200 } },
      { name: "category", type: "text", required: false },
      { name: "stage", type: "text", required: true },
      { name: "description", type: "text", required: false },
      { name: "amount", type: "number", required: false },
      { name: "expected_closing_date", type: "date", required: false },
      { name: "archived_at", type: "date", required: false },
      { name: "index", type: "number", required: false },
      {
        name: "company_id",
        type: "relation",
        required: false,
        options: { collectionName: "companies", maxSelect: 1 },
      },
      {
        name: "contact_ids",
        type: "relation",
        required: false,
        options: { collectionName: "contacts", maxSelect: 999 },
      },
      {
        name: "sales_id",
        type: "relation",
        required: false,
        options: { collectionName: "sales", maxSelect: 1 },
      },
    ],
    indexes: [],
    ...authenticatedRules,
  },
  {
    name: "tasks",
    type: "base",
    system: false,
    schema: [
      { name: "type", type: "text", required: false },
      { name: "text", type: "text", required: false },
      { name: "due_date", type: "date", required: true },
      { name: "done_date", type: "date", required: false },
      {
        name: "contact_id",
        type: "relation",
        required: true,
        options: { collectionName: "contacts", maxSelect: 1 },
      },
      {
        name: "sales_id",
        type: "relation",
        required: false,
        options: { collectionName: "sales", maxSelect: 1 },
      },
    ],
    indexes: [],
    ...authenticatedRules,
  },
  {
    name: "contactNotes",
    type: "base",
    system: false,
    schema: [
      { name: "text", type: "text", required: false },
      { name: "date", type: "date", required: false },
      { name: "status", type: "text", required: false },
      {
        name: "attachments",
        type: "file",
        required: false,
        options: { maxSelect: 10, maxSize: 8000000 },
      },
      {
        name: "contact_id",
        type: "relation",
        required: true,
        options: { collectionName: "contacts", maxSelect: 1 },
      },
      {
        name: "sales_id",
        type: "relation",
        required: false,
        options: { collectionName: "sales", maxSelect: 1 },
      },
    ],
    indexes: [],
    ...authenticatedRules,
  },
  {
    name: "dealNotes",
    type: "base",
    system: false,
    schema: [
      { name: "type", type: "text", required: false },
      { name: "text", type: "text", required: false },
      { name: "date", type: "date", required: false },
      {
        name: "attachments",
        type: "file",
        required: false,
        options: { maxSelect: 10, maxSize: 8000000 },
      },
      {
        name: "deal_id",
        type: "relation",
        required: true,
        options: { collectionName: "deals", maxSelect: 1 },
      },
      {
        name: "sales_id",
        type: "relation",
        required: false,
        options: { collectionName: "sales", maxSelect: 1 },
      },
    ],
    indexes: [],
    ...authenticatedRules,
  },
  {
    name: "templates",
    type: "base",
    system: false,
    schema: [
      {
        name: "name",
        type: "text",
        required: true,
        options: { min: 1, max: 120 },
      },
      {
        name: "description",
        type: "text",
        required: false,
        options: { max: 500 },
      },
      {
        name: "config",
        type: "json",
        required: true,
        options: { maxSize: 200000 },
      },
    ],
    indexes: [],
    // Templates are shared resources
    listRule: authRule,
    viewRule: authRule,
    createRule: authRule,
    updateRule: authRule,
    deleteRule: authRule,
  },
  {
    name: "subscriptions",
    type: "base",
    system: false,
    schema: [
      {
        name: "sales_id",
        type: "relation",
        required: true,
        options: { collectionName: "sales", maxSelect: 1 },
      },
      { name: "stripe_customer_id", type: "text", required: false },
      { name: "stripe_subscription_id", type: "text", required: false },
      { name: "stripe_price_id", type: "text", required: false },
      { name: "status", type: "text", required: true },
      { name: "plan_type", type: "text", required: false },
      { name: "trial_start", type: "date", required: false },
      { name: "trial_end", type: "date", required: false },
      { name: "current_period_start", type: "date", required: false },
      { name: "current_period_end", type: "date", required: false },
      { name: "cancel_at_period_end", type: "bool", required: false },
    ],
    indexes: [],
    // Users can only view their own subscription; create/update/delete only via admin (webhook)
    listRule: ownerRule,
    viewRule: ownerRule,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  },
];

const run = async () => {
  const token = await authAdmin();
  if (!token) {
    throw new Error("Missing admin token");
  }
  for (const definition of collectionsToEnsure) {
    try {
      await ensureCollection(token, definition);
    } catch (error) {
      console.error(
        `Failed to ensure collection '${definition.name}':`,
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }
  console.log("PocketBase init done.");
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
