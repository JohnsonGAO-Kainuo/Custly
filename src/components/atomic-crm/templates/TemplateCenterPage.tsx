import {
  CheckCircle2,
  Layers,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDataProvider, useGetList, useNotify, useTranslate } from "ra-core";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  applyTemplateSelection,
  clearStoredTemplateId,
  clearStoredTemplateConfig,
  deleteCustomTemplateLocal,
  getStoredCustomTemplates,
  getStoredTemplateId,
  isDemoMode,
  saveCustomTemplateLocal,
  templates,
  type CustomTemplate,
  type TemplateConfig,
} from "./templates";
import type { CrmDataProvider } from "../providers/types";
import { useConfigurationContext } from "../root/ConfigurationContext";

export const TemplateCenterPage = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const dataProvider = useDataProvider<CrmDataProvider>();
  const backend = import.meta.env.VITE_BACKEND?.toLowerCase() ?? "supabase";
  const isPocketbase = backend === "pocketbase";
  const [activeTemplateId, setActiveTemplateId] = useState(
    () => getStoredTemplateId() ?? "general",
  );
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(
    () => getStoredCustomTemplates(),
  );
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isDemo = isDemoMode();
  const shouldUseRemote = isPocketbase && !isDemo;
  const {
    companySectors,
    dealCategories,
    dealPipelineStatuses,
    dealStages,
    noteStatuses,
    taskTypes,
  } = useConfigurationContext();

  const {
    data: remoteTemplates,
    error: remoteError,
    isPending: remotePending,
  } = useGetList(
    "templates",
    {
      pagination: { page: 1, perPage: 50 },
      sort: { field: "updated", order: "DESC" },
      filter: {},
    },
    { enabled: shouldUseRemote },
  );

  const normalizeRemoteTemplate = (record: any): CustomTemplate => {
    let config: TemplateConfig;
    if (typeof record.config === "string") {
      try {
        config = JSON.parse(record.config) as TemplateConfig;
      } catch {
        config = {
          companySectors,
          dealCategories,
          dealPipelineStatuses,
          dealStages,
          noteStatuses,
          taskTypes,
        };
      }
    } else {
      config = (record.config ?? {
        companySectors,
        dealCategories,
        dealPipelineStatuses,
        dealStages,
        noteStatuses,
        taskTypes,
      }) as TemplateConfig;
    }
    return {
      id: record.id,
      name: record.name ?? "Template",
      description: record.description ?? "",
      config,
      createdAt: record.created,
      updatedAt: record.updated,
    };
  };

  useEffect(() => {
    if (!shouldUseRemote) return;
    if (remoteTemplates && !remotePending && !remoteError) {
      const mapped = remoteTemplates.map(normalizeRemoteTemplate);
      setCustomTemplates(mapped);
    }
  }, [remoteTemplates, remotePending, remoteError, shouldUseRemote]);

  const activeTemplate = useMemo(
    () => templates.find((template) => template.id === activeTemplateId),
    [activeTemplateId],
  );
  const storageLabel = !shouldUseRemote || remoteError
    ? translate("crm.templates.my.storage_local")
    : translate("crm.templates.my.storage_cloud");
  const mapItems = (items: string[]) =>
    items.map((item) => translate(item));

  const handleApply = (templateId: string, config?: TemplateConfig) => {
    applyTemplateSelection(templateId, config);
    setActiveTemplateId(templateId);
    notify(translate("crm.templates.applied"), { type: "info" });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleReset = () => {
    clearStoredTemplateId();
    clearStoredTemplateConfig();
    setActiveTemplateId("general");
    notify(translate("crm.templates.reset_done"), { type: "info" });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      notify(translate("crm.templates.name_required"), { type: "warning" });
      return;
    }
    const config: TemplateConfig = {
      companySectors,
      dealCategories,
      dealPipelineStatuses,
      dealStages,
      noteStatuses,
      taskTypes,
    };
    const now = new Date().toISOString();
    const localTemplate: CustomTemplate = {
      id: crypto.randomUUID(),
      name: templateName.trim(),
      description: templateDescription.trim(),
      config,
      createdAt: now,
      updatedAt: now,
    };

    if (!shouldUseRemote) {
      const next = saveCustomTemplateLocal(localTemplate);
      setCustomTemplates(next);
      setTemplateName("");
      setTemplateDescription("");
      notify(translate("crm.templates.saved_local"), { type: "info" });
      return;
    }

    setIsSaving(true);
    try {
      const result = await dataProvider.create("templates", {
        data: {
          name: localTemplate.name,
          description: localTemplate.description,
          config: JSON.stringify(config),
        },
      });
      const createdId =
        (result as { data?: { id?: string } })?.data?.id ?? localTemplate.id;
      setCustomTemplates((prev) => [
        { ...localTemplate, id: createdId },
        ...prev,
      ]);
      setTemplateName("");
      setTemplateDescription("");
      notify(translate("crm.templates.saved"), { type: "info" });
    } catch (error) {
      const next = saveCustomTemplateLocal(localTemplate);
      setCustomTemplates(next);
      notify(translate("crm.templates.saved_local"), { type: "warning" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (template: CustomTemplate) => {
    if (!shouldUseRemote) {
      const next = deleteCustomTemplateLocal(template.id);
      setCustomTemplates(next);
      notify(translate("crm.templates.deleted"), { type: "info" });
      return;
    }
    try {
      await dataProvider.delete("templates", { id: template.id });
    } catch (error) {
      // ignore
    }
    const next = deleteCustomTemplateLocal(template.id);
    setCustomTemplates(next);
    notify(translate("crm.templates.deleted"), { type: "info" });
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

      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {translate("crm.templates.my.kicker")}
              </p>
              <h2 className="text-lg font-semibold text-foreground">
                {translate("crm.templates.my.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {translate("crm.templates.my.subtitle")}
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {translate("crm.templates.my.create")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {translate("crm.templates.my.dialog_title")}
                  </DialogTitle>
                  <DialogDescription>
                    {translate("crm.templates.my.dialog_description")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    value={templateName}
                    onChange={(event) => setTemplateName(event.target.value)}
                    placeholder={translate("crm.templates.my.name")}
                  />
                  <Textarea
                    value={templateDescription}
                    onChange={(event) =>
                      setTemplateDescription(event.target.value)
                    }
                    placeholder={translate("crm.templates.my.description")}
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateTemplate}
                    disabled={isSaving}
                  >
                    {translate("crm.templates.my.save")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {customTemplates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
              {translate("crm.templates.my.empty")}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {customTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="border-border/60 bg-card/80"
                >
                  <CardContent className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTemplate(template)}
                        aria-label={translate("crm.templates.my.delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {storageLabel}
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleApply(`custom:${template.id}`, template.config)
                        }
                      >
                        {translate("crm.templates.apply")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
