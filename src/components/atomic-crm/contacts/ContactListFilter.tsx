import { endOfYesterday, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { CheckSquare, Clock, Tag, TrendingUp, Users } from "lucide-react";
import { FilterLiveForm, useGetIdentity, useGetList, useTranslate } from "ra-core";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
import { SearchInput } from "@/components/admin/search-input";
import { Badge } from "@/components/ui/badge";

import { FilterCategory } from "../filters/FilterCategory";
import { Status } from "../misc/Status";
import { useConfigurationContext } from "../root/ConfigurationContext";

export const ContactListFilter = () => {
  const { noteStatuses } = useConfigurationContext();
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  const { data } = useGetList("tags", {
    pagination: { page: 1, perPage: 10 },
    sort: { field: "name", order: "ASC" },
  });

  return (
    <div className="w-52 min-w-52 order-first pt-0.75 flex flex-col gap-4">
      <FilterLiveForm>
        <SearchInput
          source="q"
          placeholder={translate("crm.filters.contacts.search_placeholder")}
        />
      </FilterLiveForm>

      <FilterCategory
        label={translate("crm.filters.contacts.last_activity")}
        icon={<Clock />}
      >
        <ToggleFilterButton
          className="w-full justify-between"
          label={translate("crm.filters.contacts.today")}
          value={{
            "last_seen@gte": endOfYesterday().toISOString(),
            "last_seen@lte": undefined,
          }}
        />
        <ToggleFilterButton
          className="w-full justify-between"
          label={translate("crm.filters.contacts.this_week")}
          value={{
            "last_seen@gte": startOfWeek(new Date()).toISOString(),
            "last_seen@lte": undefined,
          }}
        />
        <ToggleFilterButton
          className="w-full justify-between"
          label={translate("crm.filters.contacts.before_this_week")}
          value={{
            "last_seen@gte": undefined,
            "last_seen@lte": startOfWeek(new Date()).toISOString(),
          }}
        />
        <ToggleFilterButton
          className="w-full justify-between"
          label={translate("crm.filters.contacts.before_this_month")}
          value={{
            "last_seen@gte": undefined,
            "last_seen@lte": startOfMonth(new Date()).toISOString(),
          }}
        />
        <ToggleFilterButton
          className="w-full justify-between"
          label={translate("crm.filters.contacts.before_last_month")}
          value={{
            "last_seen@gte": undefined,
            "last_seen@lte": subMonths(
              startOfMonth(new Date()),
              1,
            ).toISOString(),
          }}
        />
      </FilterCategory>

      <FilterCategory
        label={translate("crm.filters.contacts.status")}
        icon={<TrendingUp />}
      >
        {noteStatuses.map((status) => (
          <ToggleFilterButton
            key={status.value}
            className="w-full justify-between"
            label={
              <span>
                {translate(`noteStatus.${status.value}`, {
                  _: status.label,
                })}{" "}
                <Status status={status.value} />
              </span>
            }
            value={{ status: status.value }}
          />
        ))}
      </FilterCategory>

      <FilterCategory label={translate("crm.filters.contacts.tags")} icon={<Tag />}>
        {data &&
          data.map((record) => (
            <ToggleFilterButton
              className="w-full justify-between"
              key={record.id}
              label={
                <Badge
                  variant="secondary"
                  className="text-black text-xs font-normal cursor-pointer"
                  style={{
                    backgroundColor: record?.color,
                  }}
                >
                  {record?.name}
                </Badge>
              }
              value={{ "tags@cs": `{${record.id}}` }}
            />
          ))}
      </FilterCategory>

      <FilterCategory
        icon={<CheckSquare />}
        label={translate("crm.filters.contacts.tasks")}
      >
        <ToggleFilterButton
          className="w-full justify-between"
          label={translate("crm.filters.contacts.with_pending_tasks")}
          value={{ "nb_tasks@gt": 0 }}
        />
      </FilterCategory>

      <FilterCategory
        icon={<Users />}
        label={translate("crm.filters.contacts.account_manager")}
      >
        <ToggleFilterButton
          className="w-full justify-between"
          label={translate("crm.filters.contacts.me")}
          value={{ sales_id: identity?.id }}
        />
      </FilterCategory>
    </div>
  );
};
