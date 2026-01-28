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
      hot_contacts: {
        kicker: "Hot contacts",
        title: "Hot Contacts",
        create: "Create contact",
        last_seen: "Last seen %{date}",
        badges: {
          tasks: "%{count} tasks",
          newsletter: "Newsletter",
        },
        actions: {
          email: "Email",
          call: "Call",
        },
        empty_title: "Contacts with a \"hot\" status will appear here.",
        empty_note:
          "Change the status by adding a note to a contact and clicking \"show options\".",
      },
      tasks: {
        kicker: "Tasks",
        title: "Upcoming Tasks",
        progress: "Done %{done} / %{total}",
        filters: {
          overdue: "Overdue",
          today: "Today",
          tomorrow: "Tomorrow",
          this_week: "This week",
          later: "Later",
        },
      },
      activity: {
        kicker: "Activity",
      },
      pipeline: {
        kicker: "Pipeline",
        title: "Upcoming deal revenue",
        window: "Last 6 months",
        legend: {
          won: "Won",
          lost: "Lost",
        },
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
  noteStatus: {
    cold: "Cold",
    warm: "Warm",
    hot: "Hot",
    in_contract: "In contract",
  },
};

export default crmEnglishMessages;
