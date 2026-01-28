import { CalendarClock, Mail, Phone, Plus, Users } from "lucide-react";
import { useGetIdentity, useGetList, useTranslate } from "ra-core";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { SimpleList } from "../simple-list/SimpleList";
import { Avatar } from "../contacts/Avatar";
import type { Contact } from "../types";

export const HotContacts = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  const {
    data: contactData,
    total: contactTotal,
    isPending: contactsLoading,
  } = useGetList<Contact>(
    "contacts",
    {
      pagination: { page: 1, perPage: 10 },
      sort: { field: "last_seen", order: "DESC" },
      filter: { status: "hot", sales_id: identity?.id },
    },
    { enabled: Number.isInteger(identity?.id) },
  );

  const formatLastSeen = (value?: string) => {
    if (!value) return "";
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  };

  const getPrimaryEmail = (contact: Contact) =>
    contact.email_jsonb?.[0]?.email;

  const getPrimaryPhone = (contact: Contact) =>
    contact.phone_jsonb?.[0]?.number;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Users className="text-primary w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {translate("crm.dashboard.hot_contacts.kicker")}
          </p>
          <h2 className="text-base font-semibold text-foreground/90">
            {translate("crm.dashboard.hot_contacts.title")}
          </h2>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-muted-foreground"
                asChild
              >
                <Link to="/contacts/create">
                  <Plus className="w-4 h-4 text-primary" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {translate("crm.dashboard.hot_contacts.create")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Card className="py-0 border-border/60 bg-card/70">
        <SimpleList<Contact>
          linkType="show"
          data={contactData}
          total={contactTotal}
          isPending={contactsLoading}
          resource="contacts"
          className="[&>li:first-child>a]:rounded-t-xl [&>li:last-child>a]:rounded-b-xl"
          primaryText={(contact) =>
            `${contact.first_name} ${contact.last_name}`
          }
          secondaryText={(contact) => (
            <span>
              {contact.title} at {contact.company_name}
            </span>
          )}
          leftAvatar={(contact) => <Avatar record={contact} />}
          rightIcon={(contact) => {
            const email = getPrimaryEmail(contact);
            const phone = getPrimaryPhone(contact);
            const statusLabel = translate(`noteStatus.${contact.status}`, {
              _: contact.status,
            });
            const lastSeen = formatLastSeen(contact.last_seen);

            return (
              <div className="flex flex-col items-end gap-2 pr-1">
                <div className="flex flex-wrap justify-end gap-1 text-[10px] uppercase tracking-wide">
                  <span className="rounded-full border border-border/60 bg-muted/60 px-2 py-0.5 text-foreground/70">
                    {statusLabel}
                  </span>
                  {Number.isInteger(contact.nb_tasks) &&
                    (contact.nb_tasks ?? 0) > 0 && (
                      <span className="rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-foreground/70">
                        {translate("crm.dashboard.hot_contacts.badges.tasks", {
                          count: contact.nb_tasks,
                          _: `${contact.nb_tasks}`,
                        })}
                      </span>
                    )}
                  {contact.has_newsletter && (
                    <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-foreground/70">
                      {translate(
                        "crm.dashboard.hot_contacts.badges.newsletter",
                      )}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {lastSeen && (
                    <span className="hidden md:inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {translate("crm.dashboard.hot_contacts.last_seen", {
                        date: lastSeen,
                        _: lastSeen,
                      })}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    {email && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                window.location.href = `mailto:${email}`;
                              }}
                              className="rounded-full border border-border/60 bg-muted/40 p-1 text-muted-foreground hover:text-foreground"
                              aria-label={translate(
                                "crm.dashboard.hot_contacts.actions.email",
                              )}
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {translate(
                              "crm.dashboard.hot_contacts.actions.email",
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {phone && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                window.location.href = `tel:${phone}`;
                              }}
                              className="rounded-full border border-border/60 bg-muted/40 p-1 text-muted-foreground hover:text-foreground"
                              aria-label={translate(
                                "crm.dashboard.hot_contacts.actions.call",
                              )}
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {translate(
                              "crm.dashboard.hot_contacts.actions.call",
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
          empty={
            <div className="p-4">
              <p className="text-sm mb-4">
                {translate("crm.dashboard.hot_contacts.empty_title")}
              </p>
              <p className="text-sm">
                {translate("crm.dashboard.hot_contacts.empty_note")}
              </p>
            </div>
          }
        />
      </Card>
    </div>
  );
};
