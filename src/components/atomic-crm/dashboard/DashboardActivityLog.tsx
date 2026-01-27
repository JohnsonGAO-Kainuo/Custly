import { useTranslate } from "ra-core";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

import { ActivityLog } from "../activity/ActivityLog";

export function DashboardActivityLog() {
  const translate = useTranslate();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Clock className="text-primary w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {translate("crm.dashboard.activity.kicker")}
          </p>
          <h2 className="text-base font-semibold text-foreground/90">
            {translate("crm.dashboard.latest_activity")}
          </h2>
        </div>
      </div>
      <Card className="mb-2 p-6 border-border/60 bg-card/70">
        <ActivityLog pageSize={10} />
      </Card>
    </div>
  );
}
