import { CheckCircle2, Layers, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useNotify, useTranslate } from "ra-core";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  clearStoredTemplateId,
  getStoredTemplateId,
  setStoredTemplateId,
  templates,
} from "./templates";

export const TemplateCenterPage = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const [activeTemplateId, setActiveTemplateId] = useState(
    () => getStoredTemplateId() ?? "general",
  );

  const activeTemplate = useMemo(
    () => templates.find((template) => template.id === activeTemplateId),
    [activeTemplateId],
  );
  const mapItems = (items: string[]) =>
    items.map((item) => translate(item));

  const handleApply = (templateId: string) => {
    setStoredTemplateId(templateId);
    setActiveTemplateId(templateId);
    notify(translate("crm.templates.applied"), { type: "info" });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleReset = () => {
    clearStoredTemplateId();
    setActiveTemplateId("general");
    notify(translate("crm.templates.reset_done"), { type: "info" });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {translate("crm.templates.kicker")}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            {translate("crm.templates.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {translate("crm.templates.subtitle")}
          </p>
        </div>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          {translate("crm.templates.reset")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((template) => {
          const isActive = template.id === activeTemplateId;
          return (
            <Card
              key={template.id}
              className={`border-border/60 bg-card/70 ${
                isActive ? "ring-1 ring-primary/40" : ""
              }`}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-base">
                      {translate(template.nameKey)}
                    </span>
                  </div>
                  {template.badgeKey && (
                    <Badge variant="outline">
                      {translate(template.badgeKey)}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {translate(template.summaryKey)}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <TemplateSection
                  title={translate("crm.templates.sections.highlights")}
                  items={mapItems(template.highlights)}
                />
                <TemplateSection
                  title={translate("crm.templates.sections.pipeline")}
                  items={mapItems(template.pipeline)}
                />
                <TemplateSection
                  title={translate("crm.templates.sections.fields")}
                  items={mapItems(template.fields)}
                />
                <TemplateSection
                  title={translate("crm.templates.sections.tags")}
                  items={mapItems(template.tags)}
                />
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isActive && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {translate("crm.templates.active")}
                    </>
                  )}
                </div>
                <Button
                  variant={isActive ? "secondary" : "default"}
                  onClick={() => handleApply(template.id)}
                >
                  {isActive
                    ? translate("crm.templates.applied_button")
                    : translate("crm.templates.apply")}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {activeTemplate ? (
        <Card className="border-border/60 bg-card/70">
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {translate("crm.templates.active")}
              </p>
              <h2 className="text-lg font-semibold text-foreground">
                {translate(activeTemplate.nameKey)}
              </h2>
              <p className="text-sm text-muted-foreground">
                {translate(activeTemplate.summaryKey)}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {translate("crm.templates.reload_hint")}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

TemplateCenterPage.path = "/templates";

const TemplateSection = ({
  title,
  items,
}: {
  title: string;
  items: string[];
}) => (
  <div className="space-y-2">
    <p className="text-xs uppercase tracking-widest text-muted-foreground">
      {title}
    </p>
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <Badge
          key={`${item}-${index}`}
          variant="secondary"
          className="text-xs font-normal"
        >
          {item}
        </Badge>
      ))}
    </div>
  </div>
);
