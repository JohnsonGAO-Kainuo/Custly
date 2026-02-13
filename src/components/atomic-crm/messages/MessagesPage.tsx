import { useState } from "react";
import { useTranslate } from "ra-core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ExternalLink,
  Settings,
  Maximize2,
  Minimize2,
  AlertCircle,
} from "lucide-react";

const CHATWOOT_URL = import.meta.env.VITE_CHATWOOT_BASE_URL || "";

export const MessagesPage = () => {
  const translate = useTranslate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatwootUrl, setChatwootUrl] = useState(CHATWOOT_URL);
  const [inputUrl, setInputUrl] = useState("");

  // If no Chatwoot URL is configured, show setup instructions
  if (!chatwootUrl) {
    return <SetupGuide onConnect={(url) => setChatwootUrl(url)} />;
  }

  // Ensure the URL points to the dashboard
  const dashboardUrl = chatwootUrl.replace(/\/+$/, "") + "/app";

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="font-semibold">
              {translate("crm.messages.title", { _: "Messages" })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(dashboardUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <iframe
          src={dashboardUrl}
          className="w-full border-0"
          style={{ height: "calc(100vh - 49px)" }}
          title="Chatwoot Messages"
          allow="microphone; camera; notifications"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {translate("crm.messages.title", { _: "Messages" })}
          </h1>
          <p className="text-muted-foreground text-sm">
            {translate("crm.messages.subtitle", {
              _: "Manage all customer conversations in one place",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(dashboardUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {translate("crm.messages.open_external", {
              _: "Open in new tab",
            })}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            {translate("crm.messages.fullscreen", { _: "Fullscreen" })}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <iframe
          src={dashboardUrl}
          className="w-full border-0"
          style={{ height: "calc(100vh - 220px)", minHeight: "600px" }}
          title="Chatwoot Messages"
          allow="microphone; camera; notifications"
        />
      </Card>
    </div>
  );
};

// Setup guide shown when VITE_CHATWOOT_BASE_URL is not configured
const SetupGuide = ({
  onConnect,
}: {
  onConnect: (url: string) => void;
}) => {
  const translate = useTranslate();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleConnect = () => {
    if (!url.trim()) {
      setError("Please enter a Chatwoot URL");
      return;
    }
    try {
      const parsed = new URL(url.trim());
      if (!parsed.protocol.startsWith("http")) {
        setError("URL must start with http:// or https://");
        return;
      }
      onConnect(parsed.origin);
    } catch {
      setError("Please enter a valid URL");
    }
  };

  const channels = [
    {
      name: "Email",
      description: translate("crm.messages.channels.email", {
        _: "Receive and reply to customer emails",
      }),
      emoji: "📧",
    },
    {
      name: "WhatsApp",
      description: translate("crm.messages.channels.whatsapp", {
        _: "WhatsApp Business conversations",
      }),
      emoji: "💬",
    },
    {
      name: "Facebook",
      description: translate("crm.messages.channels.facebook", {
        _: "Facebook Messenger messages",
      }),
      emoji: "👤",
    },
    {
      name: "Instagram",
      description: translate("crm.messages.channels.instagram", {
        _: "Instagram direct messages",
      }),
      emoji: "📷",
    },
    {
      name: "Telegram",
      description: translate("crm.messages.channels.telegram", {
        _: "Telegram bot messages",
      }),
      emoji: "✈️",
    },
    {
      name: "Live Chat",
      description: translate("crm.messages.channels.livechat", {
        _: "Website live chat widget",
      }),
      emoji: "🌐",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {translate("crm.messages.setup.title", {
            _: "Connect Your Message Channels",
          })}
        </h1>
        <p className="text-muted-foreground mt-2">
          {translate("crm.messages.setup.subtitle", {
            _: "Custly integrates with Chatwoot to bring all your customer conversations into one place.",
          })}
        </p>
      </div>

      {/* Supported Channels */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {channels.map((channel) => (
          <Card key={channel.name} className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{channel.emoji}</span>
              <div>
                <p className="font-medium text-sm">{channel.name}</p>
                <p className="text-xs text-muted-foreground">
                  {channel.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Setup Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {translate("crm.messages.setup.connect_title", {
              _: "Connect Chatwoot Instance",
            })}
          </CardTitle>
          <CardDescription>
            {translate("crm.messages.setup.connect_description", {
              _: "Enter the URL of your Chatwoot instance to get started. Don't have one yet? You can create a free account or self-host.",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://app.chatwoot.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              className="flex-1"
            />
            <Button onClick={handleConnect}>
              {translate("crm.messages.setup.connect_button", {
                _: "Connect",
              })}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          )}

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">
              {translate("crm.messages.setup.options_title", {
                _: "Don't have a Chatwoot instance?",
              })}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open("https://app.chatwoot.com/auth/signup", "_blank")
                }
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                {translate("crm.messages.setup.cloud_signup", {
                  _: "Free Chatwoot Cloud account",
                })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    "https://www.chatwoot.com/docs/self-hosted",
                    "_blank"
                  )
                }
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                {translate("crm.messages.setup.self_host", {
                  _: "Self-host guide",
                })}
              </Button>
            </div>
          </div>

          {/* Permanent config hint */}
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="flex items-start gap-2">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>
                {translate("crm.messages.setup.env_hint", {
                  _: "To make this permanent, set VITE_CHATWOOT_BASE_URL in your environment variables.",
                })}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesPage;
