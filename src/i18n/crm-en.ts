import type { TranslationMessages } from "ra-core";

const crmEnglishMessages: TranslationMessages = {
  crm: {
    dashboard: {
      overview: {
        kicker: "Overview",
        title: "Your workbench today",
        subtitle: "Track momentum across the pipeline at a glance.",
        contacts: "Contacts",
        contacts_hint: "Active relationships",
        companies: "Companies",
        companies_hint: "Accounts in play",
        deals: "Deals",
        deals_hint: "Open opportunities",
        tasks: "Tasks",
        tasks_hint: "Next actions",
      },
      latest_activity: "Latest Activity",
      tasks_empty: "Tasks added to your contacts will appear here.",
      welcome: {
        title: "Welcome to Custly",
        description:
          "Custly is a modern CRM designed to help you manage customer relationships with elegance and efficiency.",
        demo_note:
          "This demo runs on a mock API, so you can explore and modify the data freely. It resets on reload.",
        built_with: "Built with React, shadcn/ui, and Tailwind CSS.",
      },
    },
  },
};

export default crmEnglishMessages;
