import { CreateButton } from "@/components/admin/create-button";
import { Users } from "lucide-react";

import useAppBarHeight from "../misc/useAppBarHeight";
import { ContactImportButton } from "./ContactImportButton";

export const ContactEmpty = () => {
  const appbarHeight = useAppBarHeight();
  return (
    <div
      className="flex flex-col justify-center items-center gap-3"
      style={{
        height: `calc(100dvh - ${appbarHeight}px)`,
      }}
    >
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
        <Users className="w-12 h-12 text-primary/60" />
      </div>
      <div className="flex flex-col gap-0 items-center">
        <h6 className="text-lg font-bold">No contacts found</h6>
        <p className="text-sm text-muted-foreground text-center mb-4">
          It seems your contact list is empty.
        </p>
      </div>
      <div className="flex flex-row gap-2">
        <CreateButton label="New Contact" />
        <ContactImportButton />
      </div>
    </div>
  );
};
