type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

const sectorLabelKeyMap: Record<string, string> = {
  "Communication Services": "crm.sectors.communication_services",
  "Consumer Discretionary": "crm.sectors.consumer_discretionary",
  "Consumer Staples": "crm.sectors.consumer_staples",
  Energy: "crm.sectors.energy",
  Financials: "crm.sectors.financials",
  "Health Care": "crm.sectors.health_care",
  Industrials: "crm.sectors.industrials",
  "Information Technology": "crm.sectors.information_technology",
  Materials: "crm.sectors.materials",
  "Real Estate": "crm.sectors.real_estate",
  Utilities: "crm.sectors.utilities",
  "Mental health": "crm.sectors.mental_health",
  Wellness: "crm.sectors.wellness",
  "Community services": "crm.sectors.community_services",
  Education: "crm.sectors.education",
  Healthcare: "crm.sectors.healthcare",
  "Cross-border": "crm.sectors.cross_border",
  Retail: "crm.sectors.retail",
  Marketplaces: "crm.sectors.marketplaces",
  Logistics: "crm.sectors.logistics",
  "Consumer goods": "crm.sectors.consumer_goods",
};

export const getCompanySectorLabel = (
  sector: string,
  translate?: TranslateFn,
) => {
  if (!sector) return "";
  if (!translate) return sector;
  const key = sectorLabelKeyMap[sector] ?? sector;
  return translate(key, { _: sector });
};
