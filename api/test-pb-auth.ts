import type { VercelRequest, VercelResponse } from "@vercel/node";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "https://pb-custly.kainuotech.com";
const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL!;
const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD!;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const diagnostics = {
      pocketbaseUrl: POCKETBASE_URL,
      hasAdminEmail: !!POCKETBASE_ADMIN_EMAIL,
      adminEmail: POCKETBASE_ADMIN_EMAIL?.substring(0, 3) + "***",
      hasAdminPassword: !!POCKETBASE_ADMIN_PASSWORD,
      passwordLength: POCKETBASE_ADMIN_PASSWORD?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    };

    // Try to authenticate
    const authResponse = await fetch(
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

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      return res.status(200).json({
        success: false,
        diagnostics,
        authError: {
          status: authResponse.status,
          message: errorText,
        },
      });
    }

    const authData = await authResponse.json();

    return res.status(200).json({
      success: true,
      diagnostics,
      adminId: authData.admin?.id,
      tokenReceived: !!authData.token,
    });
  } catch (error: unknown) {
    return res.status(200).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
