import { useState } from "react";
import {
  COMPANY_CREATED,
  CONTACT_CREATED,
  CONTACT_NOTE_CREATED,
  DEAL_CREATED,
  DEAL_NOTE_CREATED,
} from "../consts";
import type { Activity } from "../types";
import { ActivityLogCompanyCreated } from "./ActivityLogCompanyCreated";
import { ActivityLogContactCreated } from "./ActivityLogContactCreated";
import { ActivityLogContactNoteCreated } from "./ActivityLogContactNoteCreated";
import { ActivityLogDealCreated } from "./ActivityLogDealCreated";
import { ActivityLogDealNoteCreated } from "./ActivityLogDealNoteCreated";

type ActivityLogIteratorProps = {
  activities: Activity[];
  pageSize: number;
};

export function ActivityLogIterator({
  activities,
  pageSize,
}: ActivityLogIteratorProps) {
  const [activitiesDisplayed, setActivityDisplayed] = useState(pageSize);

  const filteredActivities = activities.slice(0, activitiesDisplayed);

  return (
    <div className="space-y-4">
      {filteredActivities.map((activity, index) => {
        const isLast = index === filteredActivities.length - 1;
        return (
          <div className="flex gap-4" key={activity.id}>
            <div className="flex flex-col items-center">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70 ring-4 ring-primary/10" />
              {!isLast && (
                <span className="mt-2 w-px flex-1 bg-border/70" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <ActivityItem activity={activity} />
            </div>
          </div>
        );
      })}

      {activitiesDisplayed < activities.length && (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActivityDisplayed(
              (activitiesDisplayed) => activitiesDisplayed + pageSize,
            );
          }}
          className="flex w-full justify-center text-sm underline hover:no-underline"
        >
          Load more activity
        </a>
      )}
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  if (activity.type === COMPANY_CREATED) {
    return <ActivityLogCompanyCreated activity={activity} />;
  }

  if (activity.type === CONTACT_CREATED) {
    return <ActivityLogContactCreated activity={activity} />;
  }

  if (activity.type === CONTACT_NOTE_CREATED) {
    return <ActivityLogContactNoteCreated activity={activity} />;
  }

  if (activity.type === DEAL_CREATED) {
    return <ActivityLogDealCreated activity={activity} />;
  }

  if (activity.type === DEAL_NOTE_CREATED) {
    return <ActivityLogDealNoteCreated activity={activity} />;
  }

  return null;
}
