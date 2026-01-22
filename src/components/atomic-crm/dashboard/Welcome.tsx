import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const Welcome = () => (
  <Card className="bg-gradient-to-br from-primary/5 via-card to-card border-primary/20">
    <CardHeader className="px-4 pb-2">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <CardTitle className="text-base">Welcome to Custly</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="px-4 pt-0">
      <p className="text-sm text-muted-foreground mb-3">
        Custly is a modern CRM designed to help you manage customer relationships with elegance and efficiency.
      </p>
      <p className="text-sm text-muted-foreground mb-3">
        This demo runs on a mock API, so you can explore and modify the data freely. It resets on reload.
      </p>
      <p className="text-xs text-muted-foreground/60">
        Built with React, shadcn/ui, and Tailwind CSS.
      </p>
    </CardContent>
  </Card>
);
