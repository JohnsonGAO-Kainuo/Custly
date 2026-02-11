import { add } from "date-fns";
import { datatype, random } from "faker/locale/en_US";

import {
  defaultDealCategories,
  defaultDealStages,
} from "../../../root/defaultConfiguration";
import type { Deal } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

export const generateDeals = (db: Db): Deal[] => {
  const deals = Array.from(Array(50).keys()).map((id) => {
    const company = random.arrayElement(db.companies);
    company.nb_deals++;
    const contacts = random.arrayElements(
      db.contacts.filter((contact) => contact.company_id === company.id),
      datatype.number({ min: 1, max: 3 }),
    );
    const dealNameTemplates = [
      "Enterprise License Agreement",
      "Annual Support Contract",
      "Platform Migration Project",
      "Cloud Infrastructure Upgrade",
      "Digital Transformation Initiative",
      "Software Integration Package",
      "Security Compliance Audit",
      "Data Analytics Solution",
      "Custom Development Sprint",
      "Managed Services Contract",
      "API Integration Project",
      "Mobile App Development",
      "Staff Training Program",
      "Consulting Engagement",
      "Hardware Refresh Cycle",
      "SaaS Platform Rollout",
      "Network Optimization Project",
      "Automation Implementation",
      "Marketing Analytics Suite",
      "Customer Portal Development",
    ];
    const dealDescriptionTemplates = [
      "Client is looking for a comprehensive solution to modernize their existing infrastructure. The project involves multiple phases and cross-department coordination.",
      "Expanding the current service agreement to include additional modules and user licenses. The client has been very satisfied with the initial deployment.",
      "New business opportunity from a referral. The prospect has a clear budget and timeline, and is evaluating two other vendors alongside us.",
      "Renewal of the annual contract with potential upsell. The client wants to add premium support and advanced analytics features.",
      "Strategic partnership opportunity involving technology integration and co-marketing. Both teams are aligned on goals and deliverables.",
      "Pilot project to demonstrate ROI before committing to a full enterprise rollout. Success criteria have been clearly defined.",
      "Competitive displacement opportunity. The client is unhappy with their current provider and actively looking for alternatives.",
      "Multi-year deal with phased implementation. Year one focuses on core deployment, years two and three on expansion and optimization.",
      "Quick-win project with a short sales cycle. Client needs the solution deployed within 30 days to meet regulatory requirements.",
      "Government contract requiring compliance with specific security standards. RFP response submitted and shortlisted.",
    ];
    const dealName = random.arrayElement(dealNameTemplates);
    const created_at = randomDate(new Date(company.created_at)).toISOString();

    const expected_closing_date = randomDate(
      new Date(created_at),
      add(new Date(created_at), { months: 6 }),
    ).toISOString();

    return {
      id,
      name: dealName,
      company_id: company.id,
      contact_ids: contacts.map((contact) => contact.id),
      category: random.arrayElement(defaultDealCategories),
      stage: random.arrayElement(defaultDealStages).value,
      description: random.arrayElement(dealDescriptionTemplates),
      amount: datatype.number(1000) * 100,
      created_at,
      updated_at: randomDate(new Date(created_at)).toISOString(),
      expected_closing_date,
      sales_id: company.sales_id,
      index: 0,
    };
  });
  // compute index based on stage
  defaultDealStages.forEach((stage) => {
    deals
      .filter((deal) => deal.stage === stage.value)
      .forEach((deal, index) => {
        deals[deal.id].index = index;
      });
  });
  return deals;
};
