import { useTranslate } from "ra-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const Welcome = () => {
  const translate = useTranslate();

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-card border-primary/20">
      <CardHeader className="px-4 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <CardTitle className="text-base">
            {translate("crm.dashboard.welcome.title")}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          {translate("crm.dashboard.welcome.description")}
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          {translate("crm.dashboard.welcome.demo_note")}
        </p>
        <p className="text-xs text-muted-foreground/60">
          {translate("crm.dashboard.welcome.built_with")}
        </p>
      </CardContent>
    </Card>
  );
};
