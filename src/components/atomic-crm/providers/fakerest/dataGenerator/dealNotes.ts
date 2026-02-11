import { datatype, random } from "faker/locale/en_US";

import type { Db } from "./types";
import { randomDate, randomSentences } from "./utils";

const dealNoteTemplates = [
  "Had a productive call with the client. They're interested in moving forward with the proposal.",
  "Client requested a revised quote with additional features included.",
  "Met with the decision maker today. They need board approval before proceeding.",
  "Sent over the contract for review. Expecting feedback by end of week.",
  "Follow-up meeting scheduled. Client wants to discuss implementation timeline.",
  "Great demo session. The team was impressed with the product capabilities.",
  "Client is comparing us with two other vendors. Need to highlight our unique value.",
  "Budget has been approved on their end. Moving to final negotiations.",
  "Technical team raised some integration concerns. Scheduling a call with our engineers.",
  "Price negotiation ongoing. Client is pushing for a 15% discount.",
  "Stakeholder meeting went well. All departments are aligned on the purchase.",
  "Client wants to start with a pilot program before full rollout.",
  "Sent case studies and references as requested. They want to talk to existing customers.",
  "Proposal accepted! Working on finalizing the paperwork.",
  "Client postponed the decision to next quarter due to budget constraints.",
  "Discussed custom requirements. Our team can accommodate most of their needs.",
  "Competitive analysis shared with the client to show our advantages.",
  "Need to prepare an ROI analysis for the executive team presentation.",
  "Client onboarding plan discussed. They want a phased approach over 3 months.",
  "Legal review of the contract is in progress on the client side.",
];

export const generateDealNotes = (db: Db) => {
  return Array.from(Array(300).keys()).map((id) => {
    const deal = random.arrayElement(db.deals);
    const numSentences = datatype.number({ min: 1, max: 3 });
    return {
      id,
      deal_id: deal.id,
      text: randomSentences(dealNoteTemplates, numSentences),
      date: randomDate(
        new Date(db.deals[deal.id as number].created_at),
      ).toISOString(),
      sales_id: deal.sales_id,
    };
  });
};
