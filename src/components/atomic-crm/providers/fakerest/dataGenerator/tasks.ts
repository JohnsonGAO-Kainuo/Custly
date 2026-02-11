import { datatype, random } from "faker/locale/en_US";

import { defaultTaskTypes } from "../../../root/defaultConfiguration";
import type { Task } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

type TaskType = (typeof defaultTaskTypes)[number];

export const type: TaskType[] = [
  "Email",
  "Email",
  "Email",
  "Email",
  "Email",
  "Email",
  "Call",
  "Call",
  "Call",
  "Call",
  "Call",
  "Call",
  "Call",
  "Call",
  "Call",
  "Call",
  "Call",
  "Demo",
  "Lunch",
  "Meeting",
  "Follow-up",
  "Follow-up",
  "Thank you",
  "Ship",
  "None",
];

const taskTexts = [
  "Send follow-up email with pricing details",
  "Schedule a product demo call",
  "Prepare proposal document",
  "Review contract terms with legal",
  "Send thank-you note after meeting",
  "Follow up on outstanding invoice",
  "Share case study and testimonials",
  "Coordinate with technical team on requirements",
  "Confirm meeting time for next week",
  "Send onboarding materials to new contact",
  "Update CRM with latest call notes",
  "Check in on project progress",
  "Arrange lunch meeting to discuss partnership",
  "Prepare quarterly business review slides",
  "Discuss renewal options before contract expires",
  "Introduce contact to customer success manager",
  "Send product roadmap update",
  "Follow up on demo feedback",
  "Request referral from satisfied customer",
  "Schedule annual review meeting",
  "Ship product samples to prospect",
  "Send holiday greeting to key accounts",
  "Verify contact information is up to date",
  "Draft custom solution proposal",
  "Follow up on support ticket resolution",
];

export const generateTasks = (db: Db) => {
  return Array.from(Array(400).keys()).map<Task>((id) => {
    const contact = random.arrayElement(db.contacts);
    contact.nb_tasks++;
    return {
      id,
      contact_id: contact.id,
      type: random.arrayElement(defaultTaskTypes),
      text: random.arrayElement(taskTexts),
      due_date: randomDate(
        datatype.boolean() ? new Date() : new Date(contact.first_seen),
        new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
      ).toISOString(),
      done_date: undefined,
      sales_id: 0,
    };
  });
};
