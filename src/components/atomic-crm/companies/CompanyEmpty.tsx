import { useTranslate } from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { Building2 } from "lucide-react";

import useAppBarHeight from "../misc/useAppBarHeight";

export const CompanyEmpty = () => {
  const appbarHeight = useAppBarHeight();
  const translate = useTranslate();
  return (
    <div
      className="flex flex-col justify-center items-center gap-6"
      style={{
        height: `calc(100dvh - ${appbarHeight}px)`,
      }}
    >
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
        <Building2 className="w-12 h-12 text-primary/60" />
      </div>
      <div className="flex flex-col gap-0 items-center">
        <h6 className="text-lg font-bold">
          {translate("crm.companies.empty_title")}
        </h6>
        <p className="text-sm text-center text-muted-foreground mb-4">
          {translate("crm.companies.empty_subtitle")}
        </p>
      </div>
      <div className="flex space-x-2">
        <CreateButton label={translate("crm.actions.new_company")} />
      </div>
    </div>
  );
};
