const normalizeUrl = (value) => {
  if (!value) return "";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const url = normalizeUrl(
  process.env.POCKETBASE_URL || process.env.VITE_POCKETBASE_URL,
);
const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
const userEmail = process.env.POCKETBASE_BOOTSTRAP_EMAIL;
const userPassword = process.env.POCKETBASE_BOOTSTRAP_PASSWORD;
const firstName = process.env.POCKETBASE_BOOTSTRAP_FIRST_NAME || "Admin";
const lastName = process.env.POCKETBASE_BOOTSTRAP_LAST_NAME || "User";

if (!url || !adminEmail || !adminPassword) {
  console.error(
    [
      "Missing admin env vars.",
      "Required:",
      "  POCKETBASE_URL (or VITE_POCKETBASE_URL)",
      "  POCKETBASE_ADMIN_EMAIL",
      "  POCKETBASE_ADMIN_PASSWORD",
    ].join("\n"),
  );
  process.exit(1);
}

if (!userEmail || !userPassword) {
  console.error(
    [
      "Missing bootstrap user env vars.",
      "Required:",
      "  POCKETBASE_BOOTSTRAP_EMAIL",
      "  POCKETBASE_BOOTSTRAP_PASSWORD",
    ].join("\n"),
  );
  process.exit(1);
}

const authAdmin = async () => {
  const response = await fetch(
    `${url}/api/collections/_superusers/auth-with-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: adminEmail,
        password: adminPassword,
      }),
    },
  );
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

const run = async () => {
  const token = await authAdmin();
  if (!token) {
    throw new Error("Missing admin token");
  }

  const existing = await requestJson(
    `/api/collections/sales/records?filter=email="${userEmail}"&perPage=1`,
    token,
  );

  if (existing?.items?.length) {
    console.log(`Sales user already exists: ${userEmail}`);
    return;
  }

  const created = await requestJson("/api/collections/sales/records", token, {
    method: "POST",
    body: JSON.stringify({
      email: userEmail,
      password: userPassword,
      passwordConfirm: userPassword,
      emailVisibility: true,
      first_name: firstName,
      last_name: lastName,
      administrator: true,
      disabled: false,
    }),
  });

  console.log("Created sales admin:", created?.id || created);
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
