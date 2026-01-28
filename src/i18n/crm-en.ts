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
    templates: {
      kicker: "Templates",
      title: "Template Center",
      subtitle: "Choose an industry template to shape your pipeline and fields.",
      active: "Active template",
      apply: "Apply template",
      applied: "Template applied",
      applied_button: "Applied",
      reset: "Reset to default",
      reset_done: "Default template restored",
      reload_hint: "Changes apply after refresh.",
      sections: {
        highlights: "Focus",
        pipeline: "Pipeline",
        fields: "Fields",
        tags: "Tags",
      },
      general: {
        name: "General CRM",
        badge: "Default",
        summary: "A balanced setup for most customer-facing teams.",
        highlights: {
          0: "Unified pipeline",
          1: "Flexible tasks",
          2: "Standard lifecycle",
        },
        pipeline: {
          0: "Opportunity → Proposal → Negotiation",
          1: "Won/Lost tracking",
          2: "Follow-up stage",
        },
        fields: {
          0: "Company size + sector",
          1: "Deal value + expected close",
          2: "Contact roles",
        },
        tags: {
          0: "Inbound",
          1: "Upsell",
          2: "Priority",
        },
      },
      counseling: {
        name: "Counseling Practice",
        badge: "Care",
        summary: "Designed for intake, care plans, and follow-up sessions.",
        highlights: {
          0: "Client intake focus",
          1: "Care plan tracking",
          2: "Session follow-ups",
        },
        pipeline: {
          0: "Inquiry → Assessment → Care plan",
          1: "Active care tracking",
          2: "Follow-up reminders",
        },
        fields: {
          0: "Care urgency",
          1: "Session cadence",
          2: "Referral source",
        },
        tags: {
          0: "High priority",
          1: "Recurring",
          2: "Referral",
        },
      },
      ecommerce: {
        name: "Cross-border Ecommerce",
        badge: "Growth",
        summary: "Optimized for leads, quotes, and post-sale workflows.",
        highlights: {
          0: "Lead-to-order flow",
          1: "Quote follow-up",
          2: "Post-sale touchpoints",
        },
        pipeline: {
          0: "Lead → Quote → Negotiation",
          1: "Converted + churn views",
          2: "Post-sale stage",
        },
        fields: {
          0: "Channel + SKU mix",
          1: "Order value",
          2: "Fulfillment status",
        },
        tags: {
          0: "High margin",
          1: "Wholesale",
          2: "Marketplace",
        },
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
