import { Building, Truck, Users } from "lucide-react";
import { FilterLiveForm, useGetIdentity, useTranslate } from "ra-core";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
import { SearchInput } from "@/components/admin/search-input";

import { FilterCategory } from "../filters/FilterCategory";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { getCompanySectorLabel } from "./sectorLabels";
import { sizes } from "./sizes";

export const CompanyListFilter = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  const { companySectors } = useConfigurationContext();
  const getSectorLabel = (sector: string) =>
    getCompanySectorLabel(sector, translate);
  const sectors = companySectors.map((sector) => ({
    id: sector,
    name: getSectorLabel(sector),
  }));
  return (
    <div className="w-52 min-w-52 flex flex-col gap-8">
      <FilterLiveForm>
        <SearchInput
          source="q"
          placeholder={translate("crm.filters.companies.search_placeholder")}
        />
      </FilterLiveForm>

      <FilterCategory
        icon={<Building className="h-4 w-4" />}
        label={translate("crm.filters.companies.size")}
      >
        {sizes.map((size) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={translate(size.key, { _: size.name })}
            key={size.name}
            value={{ size: size.id }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Truck className="h-4 w-4" />}
        label={translate("crm.filters.companies.sector")}
      >
        {sectors.map((sector) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={sector.name}
            key={sector.name}
            value={{ sector: sector.id }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Users className="h-4 w-4" />}
        label={translate("crm.filters.companies.account_manager")}
      >
        <ToggleFilterButton
          className="w-full justify-between"
          label={translate("crm.filters.companies.me")}
          value={{ sales_id: identity?.id }}
        />
      </FilterCategory>
    </div>
  );
};
