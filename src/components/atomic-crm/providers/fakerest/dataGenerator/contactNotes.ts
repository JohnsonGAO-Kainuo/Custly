import { datatype, random } from "faker/locale/en_US";

import { defaultNoteStatuses } from "../../../root/defaultConfiguration";
import type { ContactNote } from "../../../types";
import type { Db } from "./types";
import { randomDate, randomSentences } from "./utils";

const contactNoteTemplates = [
  "Spoke with the contact about their current challenges. They're looking for a solution to streamline operations.",
  "Left a voicemail. Will try again tomorrow morning.",
  "Email follow-up sent with product brochure and pricing information.",
  "Contact mentioned they're evaluating several options. Decision expected within 2 weeks.",
  "Had a great introductory call. They seem very interested in our offering.",
  "Contact referred us to their colleague in the purchasing department.",
  "Meeting notes: discussed timeline, budget, and key requirements.",
  "Contact is currently under contract with a competitor. Contract expires in 6 months.",
  "Sent a thank-you email after the lunch meeting. Relationship building going well.",
  "Contact asked for a product demo next week. Scheduling in progress.",
  "Touched base about the upcoming renewal. They're happy with the service so far.",
  "Contact changed roles within the company. Updated their title and phone number.",
  "Discussed potential upsell opportunities. They might need additional licenses.",
  "Contact is attending our upcoming webinar. Good sign of continued interest.",
  "Quick check-in call. Everything is running smoothly on their end.",
  "Contact flagged an issue with delivery. Escalated to the support team.",
  "Annual review meeting completed. They plan to expand usage next quarter.",
  "Contact introduced me to their new team member who will be our day-to-day point of contact.",
  "Shared the latest product updates and roadmap. They're excited about the new features.",
  "Contact requested a formal proposal for the enterprise plan.",
  "Discussed integration requirements with their IT team.",
  "Birthday noted. Sent a personalized greeting card.",
  "Contact is very responsive. Strong potential for a long-term partnership.",
  "Negotiation in progress. They need a custom payment schedule.",
];

export const generateContactNotes = (db: Db): ContactNote[] => {
  return Array.from(Array(1200).keys()).map((id) => {
    const contact = random.arrayElement(db.contacts);
    const date = randomDate(new Date(contact.first_seen));
    contact.last_seen =
      date > new Date(contact.last_seen)
        ? date.toISOString()
        : contact.last_seen;
    const numSentences = datatype.number({ min: 1, max: 3 });
    return {
      id,
      contact_id: contact.id,
      text: randomSentences(contactNoteTemplates, numSentences),
      date: date.toISOString(),
      sales_id: contact.sales_id,
      status: random.arrayElement(defaultNoteStatuses).value,
    };
  });
};
