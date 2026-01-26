import { Check } from "lucide-react";
import { useLocaleState, useLocales } from "ra-core";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const LocaleMenuButton = () => {
  const languages = useLocales();
  const [locale, setLocale] = useLocaleState();

  const getNameForLocale = (localeValue: string): string => {
    const language = languages.find((entry) => entry.locale === localeValue);
    return language ? language.name : "";
  };

  const changeLocale = (localeValue: string) => (): void => {
    setLocale(localeValue);
  };

  if (languages.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="min-w-[52px]">
          {locale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.locale}
            onClick={changeLocale(language.locale)}
          >
            {getNameForLocale(language.locale)}
            <Check
              className={cn(
                "ml-auto",
                locale !== language.locale && "hidden",
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
