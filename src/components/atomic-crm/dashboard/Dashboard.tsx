import { useGetList, useTranslate } from "ra-core";
import { Card } from "@/components/ui/card";

import type { Contact, ContactNote } from "../types";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { DashboardStepper } from "./DashboardStepper";
import { DealsChart } from "./DealsChart";
import { HotContacts } from "./HotContacts";
import { TasksList } from "./TasksList";
import { Welcome } from "./Welcome";

export const Dashboard = () => {
  const translate = useTranslate();
  const {
    data: dataContact,
    total: totalContact,
    isPending: isPendingContact,
  } = useGetList<Contact>("contacts", {
    pagination: { page: 1, perPage: 1 },
  });

  const { total: totalContactNotes, isPending: isPendingContactNotes } =
    useGetList<ContactNote>("contactNotes", {
      pagination: { page: 1, perPage: 1 },
    });

  const { total: totalDeal, isPending: isPendingDeal } = useGetList<Contact>(
    "deals",
    {
      pagination: { page: 1, perPage: 1 },
    },
  );

  const { total: totalCompanies, isPending: isPendingCompanies } = useGetList(
    "companies",
    {
      pagination: { page: 1, perPage: 1 },
    },
  );

  const { total: totalTasks, isPending: isPendingTasks } = useGetList("tasks", {
    pagination: { page: 1, perPage: 1 },
  });

  const isPending =
    isPendingContact ||
    isPendingContactNotes ||
    isPendingDeal ||
    isPendingCompanies ||
    isPendingTasks;

  if (isPending) {
    return null;
  }

  if (!totalContact) {
    return <DashboardStepper step={1} />;
  }

  if (!totalContactNotes) {
    return <DashboardStepper step={2} contactId={dataContact?.[0]?.id} />;
  }

  const overviewCards = [
    {
      label: translate("crm.dashboard.overview.contacts"),
      value: totalContact ?? 0,
      hint: translate("crm.dashboard.overview.contacts_hint"),
    },
    {
      label: translate("crm.dashboard.overview.companies"),
      value: totalCompanies ?? 0,
      hint: translate("crm.dashboard.overview.companies_hint"),
    },
    {
      label: translate("crm.dashboard.overview.deals"),
      value: totalDeal ?? 0,
      hint: translate("crm.dashboard.overview.deals_hint"),
    },
    {
      label: translate("crm.dashboard.overview.tasks"),
      value: totalTasks ?? 0,
      hint: translate("crm.dashboard.overview.tasks_hint"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {translate("crm.dashboard.overview.kicker")}
            </p>
            <h2 className="text-2xl font-semibold text-foreground/90">
              {translate("crm.dashboard.overview.title")}
            </h2>
          </div>
          <div className="text-sm text-muted-foreground">
            {translate("crm.dashboard.overview.subtitle")}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {overviewCards.map((card) => (
            <Card key={card.label} className="border-border/60 bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-semibold text-foreground/90">
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground/70">{card.hint}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <div className="flex flex-col gap-4">
            {import.meta.env.VITE_IS_DEMO === "true" ||
            (typeof window !== "undefined" &&
              window.location.pathname.startsWith("/demo")) ? (
              <Welcome />
            ) : null}
            <HotContacts />
          </div>
        </div>
        <div className="md:col-span-6">
          <div className="flex flex-col gap-6">
            {totalDeal ? <DealsChart /> : null}
            <DashboardActivityLog />
          </div>
        </div>

        <div className="md:col-span-3">
          <TasksList />
        </div>
      </div>
    </div>
  );
};
