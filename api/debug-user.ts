import type { VercelRequest, VercelResponse } from "@vercel/node";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "https://pb-custly.kainuotech.com";
const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL!;
const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD!;

async function getPocketBaseAdminToken(): Promise<string> {
  const response = await fetch(
    `${POCKETBASE_URL}/api/admins/auth-with-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: POCKETBASE_ADMIN_EMAIL,
        password: POCKETBASE_ADMIN_PASSWORD,
      }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to authenticate with PocketBase");
  }
  const data = await response.json();
  return data.token;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { email } = req.query;
    
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Missing email parameter" });
    }

    const token = await getPocketBaseAdminToken();

    // Get user by email
    const userResponse = await fetch(
      `${POCKETBASE_URL}/api/collections/users/records?filter=email="${email}"`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      return res.status(500).json({ 
        error: "Failed to fetch user",
        details: errorText
      });
    }

    const userData = await userResponse.json();
    
    if (!userData.items || userData.items.length === 0) {
      return res.status(404).json({ 
        error: "User not found",
        email 
      });
    }

    const user = userData.items[0];

    // Get subscriptions for this user
    const subsResponse = await fetch(
      `${POCKETBASE_URL}/api/collections/subscriptions/records?filter=sales_id="${user.id}"`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    const subsData = await subsResponse.json();

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created: user.created,
        updated: user.updated,
      },
      subscriptions: subsData.items || [],
    });
  } catch (error: unknown) {
    console.error("Debug user error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
