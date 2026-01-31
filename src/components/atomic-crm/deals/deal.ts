import type { DealStage } from "../types";

const dealLabelKeyMap: Record<string, string> = {
  Opportunity: "crm.deal_stages.opportunity",
  "Proposal Sent": "crm.deal_stages.proposal_sent",
  "In Negotiation": "crm.deal_stages.in_negotiation",
  Won: "crm.deal_stages.won",
  Lost: "crm.deal_stages.lost",
  Delayed: "crm.deal_stages.delayed",
  Inquiry: "crm.deal_stages.inquiry",
  Assessment: "crm.deal_stages.assessment",
  "Care Plan": "crm.deal_stages.care_plan",
  "Active Care": "crm.deal_stages.active_care",
  Closed: "crm.deal_stages.closed",
  "Follow-up": "crm.deal_stages.follow_up",
  Lead: "crm.deal_stages.lead",
  "Quote Sent": "crm.deal_stages.quote_sent",
  Negotiation: "crm.deal_stages.negotiation",
  Converted: "crm.deal_stages.converted",
  Churned: "crm.deal_stages.churned",
  "Post-sale": "crm.deal_stages.post_sale",
};

const dealCategoryLabelKeyMap: Record<string, string> = {
  Other: "crm.deal_categories.other",
  Copywriting: "crm.deal_categories.copywriting",
  "Print project": "crm.deal_categories.print_project",
  "UI Design": "crm.deal_categories.ui_design",
  "Website design": "crm.deal_categories.website_design",
  Wholesale: "crm.deal_categories.wholesale",
  Subscription: "crm.deal_categories.subscription",
  Fulfillment: "crm.deal_categories.fulfillment",
};

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export const findDealLabel = (
  dealStages: DealStage[],
  dealValue: string,
  translate?: TranslateFn,
) => {
  const label =
    dealStages.find((dealStage) => dealStage.value === dealValue)?.label ??
    dealValue;
  if (!translate) return label;
  const key = dealLabelKeyMap[label] ?? label;
  return translate(key, { _: label });
};

export const findDealCategoryLabel = (
  category?: string,
  translate?: TranslateFn,
) => {
  if (!category) return "";
  if (!translate) return category;
  const key = dealCategoryLabelKeyMap[category] ?? category;
  return translate(key, { _: category });
};
