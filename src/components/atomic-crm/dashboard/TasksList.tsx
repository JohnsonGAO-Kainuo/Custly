import {
  endOfToday,
  endOfTomorrow,
  endOfWeek,
  getDay,
  startOfToday,
} from "date-fns";
import { CheckSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslate } from "ra-core";

import { AddTask } from "../tasks/AddTask";
import { TasksListEmpty } from "./TasksListEmpty";
import { TasksListFilter } from "./TasksListFilter";

const today = new Date();
const todayDayOfWeek = getDay(today);
const isBeforeFriday = todayDayOfWeek < 5; // Friday is represented by 5
const startOfTodayDateISO = startOfToday().toISOString();
const endOfTodayDateISO = endOfToday().toISOString();
const endOfTomorrowDateISO = endOfTomorrow().toISOString();
const endOfWeekDateISO = endOfWeek(today, { weekStartsOn: 0 }).toISOString();

const taskFilters = {
  overdue: { "done_date@is": null, "due_date@lt": startOfTodayDateISO },
  today: {
    "done_date@is": null,
    "due_date@gte": startOfTodayDateISO,
    "due_date@lte": endOfTodayDateISO,
  },
  tomorrow: {
    "done_date@is": null,
    "due_date@gt": endOfTodayDateISO,
    "due_date@lt": endOfTomorrowDateISO,
  },
  thisWeek: {
    "done_date@is": null,
    "due_date@gte": endOfTomorrowDateISO,
    "due_date@lte": endOfWeekDateISO,
  },
  later: { "done_date@is": null, "due_date@gt": endOfWeekDateISO },
};

export const TasksList = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <CheckSquare className="text-primary w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {translate("crm.dashboard.tasks.kicker")}
          </p>
          <h2 className="text-base font-semibold text-foreground/90">
            {translate("crm.dashboard.tasks.title")}
          </h2>
        </div>
        <AddTask display="icon" selectContact />
      </div>
      <Card className="p-4 mb-2 border-border/60 bg-card/70">
        <div className="flex flex-col gap-4">
          <TasksListEmpty />
          <TasksListFilter
            title={translate("crm.dashboard.tasks.filters.overdue")}
            filter={taskFilters.overdue}
          />
          <TasksListFilter
            title={translate("crm.dashboard.tasks.filters.today")}
            filter={taskFilters.today}
          />
          <TasksListFilter
            title={translate("crm.dashboard.tasks.filters.tomorrow")}
            filter={taskFilters.tomorrow}
          />
          {isBeforeFriday && (
            <TasksListFilter
              title={translate("crm.dashboard.tasks.filters.this_week")}
              filter={taskFilters.thisWeek}
            />
          )}
          <TasksListFilter
            title={translate("crm.dashboard.tasks.filters.later")}
            filter={taskFilters.later}
          />
        </div>
      </Card>
    </div>
  );
};
