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
  const response = await fetch(`${url}/api/admins/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identity: email,
      password,
    }),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Admin auth failed");
  }
  const data = await response.json();
  return data?.token;
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

const ensureTemplatesCollection = async (token) => {
  const list = await requestJson("/api/collections", token);
  const existing = list?.items?.find((item) => item?.name === "templates");
  if (existing) {
    console.log("Collection 'templates' already exists.");
    return;
  }

  const collection = {
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
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
  };

  await requestJson("/api/collections", token, {
    method: "POST",
    body: JSON.stringify(collection),
  });
  console.log("Collection 'templates' created.");
};

const run = async () => {
  const token = await authAdmin();
  if (!token) {
    throw new Error("Missing admin token");
  }
  await ensureTemplatesCollection(token);
  console.log("PocketBase init done.");
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
