import {
  CURRENCY_OPTIONS,
  type Currency,
} from "../providers/pocketbase/subscriptionService";

export const CurrencySelector = ({
  value,
  onChange,
}: {
  value: Currency;
  onChange: (currency: Currency) => void;
}) => {
  return (
    <div className="inline-flex items-center rounded-lg border bg-muted p-1 gap-1">
      {CURRENCY_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {option.symbol} {option.label}
        </button>
      ))}
    </div>
  );
};
