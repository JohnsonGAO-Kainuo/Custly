import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default function handler() {
  return new ImageResponse(
    ({
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0F442D 0%, #1B5E20 30%, #2E7D32 60%, #388E3C 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
              },
              children: [
                // Badge
                {
                  type: "div",
                  props: {
                    style: {
                      background: "rgba(255,255,255,0.15)",
                      borderRadius: "9999px",
                      padding: "8px 24px",
                      fontSize: "18px",
                      color: "rgba(255,255,255,0.9)",
                      letterSpacing: "0.05em",
                    },
                    children: "✨ Template-First CRM for Growing Teams",
                  },
                },
                // Title
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "72px",
                      fontWeight: 800,
                      color: "white",
                      textAlign: "center",
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                    },
                    children: "Custly CRM",
                  },
                },
                // Subtitle
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "28px",
                      color: "rgba(255,255,255,0.85)",
                      textAlign: "center",
                      maxWidth: "800px",
                      lineHeight: 1.4,
                    },
                    children: "Pick an industry template. Customize everything. Start managing customer relationships in minutes — not months.",
                  },
                },
                // Features row
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      gap: "32px",
                      marginTop: "24px",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            background: "rgba(255,255,255,0.12)",
                            borderRadius: "12px",
                            padding: "12px 20px",
                            fontSize: "18px",
                            color: "rgba(255,255,255,0.9)",
                          },
                          children: "📇 Contacts & Deals",
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            background: "rgba(255,255,255,0.12)",
                            borderRadius: "12px",
                            padding: "12px 20px",
                            fontSize: "18px",
                            color: "rgba(255,255,255,0.9)",
                          },
                          children: "🧩 Industry Templates",
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            background: "rgba(255,255,255,0.12)",
                            borderRadius: "12px",
                            padding: "12px 20px",
                            fontSize: "18px",
                            color: "rgba(255,255,255,0.9)",
                          },
                          children: "📊 Analytics Dashboard",
                        },
                      },
                    ],
                  },
                },
                // Bottom bar
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      gap: "24px",
                      marginTop: "16px",
                      fontSize: "16px",
                      color: "rgba(255,255,255,0.6)",
                    },
                    children: [
                      { type: "span", props: { children: "14-day free trial" } },
                      { type: "span", props: { children: "•" } },
                      { type: "span", props: { children: "No credit card required" } },
                      { type: "span", props: { children: "•" } },
                      { type: "span", props: { children: "From $20/month" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    }) as React.ReactElement,
    {
      width: 1200,
      height: 630,
    },
  );
}
