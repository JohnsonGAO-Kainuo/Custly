import {
  ListContextProvider,
  ResourceContextProvider,
  useGetIdentity,
  useGetList,
  useList,
  useTranslate,
} from "ra-core";
import { Progress } from "@/components/ui/progress";

import { TasksIterator } from "../tasks/TasksIterator";

export const TasksListFilter = ({
  title,
  filter,
}: {
  title: string;
  filter: any;
}) => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();

  const doneFilter = {
    ...filter,
    "done_date@neq": null,
  } as Record<string, unknown>;
  delete doneFilter["done_date@is"];

  const {
    data: tasks,
    total,
    isPending,
  } = useGetList(
    "tasks",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "due_date", order: "ASC" },
      filter: {
        ...filter,
        sales_id: identity?.id,
      },
    },
    { enabled: !!identity },
  );

  const {
    total: doneTotal,
    isPending: donePending,
  } = useGetList(
    "tasks",
    {
      pagination: { page: 1, perPage: 1 },
      sort: { field: "due_date", order: "ASC" },
      filter: {
        ...doneFilter,
        sales_id: identity?.id,
      },
    },
    { enabled: !!identity },
  );

  const listContext = useList({
    data: tasks ?? [],
    isPending,
    resource: "tasks",
    perPage: 5,
  });

  if (isPending || donePending) return null;

  const pendingTotal = total ?? 0;
  const completedTotal = doneTotal ?? 0;
  const totalTasks = pendingTotal + completedTotal;
  const progressValue =
    totalTasks > 0 ? Math.round((completedTotal / totalTasks) * 100) : 0;

  if (totalTasks === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {title}
        </p>
        <span className="text-xs text-muted-foreground">
          {translate("crm.dashboard.tasks.progress", {
            done: completedTotal,
            total: totalTasks,
            _: `${completedTotal}/${totalTasks}`,
          })}
        </span>
      </div>
      <Progress
        value={progressValue}
        className="h-1.5 bg-muted/50"
      />
      <ResourceContextProvider value="tasks">
        <ListContextProvider value={listContext}>
          {pendingTotal > 0 && <TasksIterator showContact />}
        </ListContextProvider>
      </ResourceContextProvider>
      {pendingTotal > listContext.perPage && (
        <div className="flex justify-center">
          <a
            href="#"
            onClick={(e) => {
              listContext.setPerPage(listContext.perPage + 10);
              e.preventDefault();
            }}
            className="text-sm underline hover:no-underline"
          >
            Load more
          </a>
        </div>
      )}
    </div>
  );
};
