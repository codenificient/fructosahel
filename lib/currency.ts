export type CurrencyCode = "XOF" | "USD" | "ECO";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  XOF: {
    code: "XOF",
    symbol: "FCFA",
    label: "West African CFA Franc",
    locale: "fr-BF",
    decimals: 0,
  },
  USD: {
    code: "USD",
    symbol: "$",
    label: "US Dollar",
    locale: "en-US",
    decimals: 2,
  },
  ECO: {
    code: "ECO",
    symbol: "ECO",
    label: "ECOWAS Eco",
    locale: "fr-BF",
    decimals: 0,
  },
};

/** Conversion rates from XOF to target currency */
const RATES_FROM_XOF: Record<CurrencyCode, number> = {
  XOF: 1,
  USD: 1 / 615,
  ECO: 1, // pegged 1:1 per ECOWAS plan
};

/** Convert an amount stored in XOF to the target currency */
export function convertFromXOF(
  amountInXOF: number,
  target: CurrencyCode,
): number {
  return amountInXOF * RATES_FROM_XOF[target];
}

/** Format an amount (already in target currency) for display */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: CurrencyCode,
): string {
  const config = CURRENCIES[currencyCode];

  if (currencyCode === "USD") {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(amount);
  }

  // For XOF and ECO, use number formatting + symbol suffix
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  return `${formatted} ${config.symbol}`;
}

/** Convert from XOF and format in one step */
export function formatAmountFromXOF(
  amountInXOF: number,
  currencyCode: CurrencyCode,
): string {
  const converted = convertFromXOF(amountInXOF, currencyCode);
  return formatCurrencyAmount(converted, currencyCode);
}

/** Compact format for chart axis labels (e.g. "1.2M", "$1.2M") */
export function formatCompact(
  amountInXOF: number,
  currencyCode: CurrencyCode,
): string {
  const converted = convertFromXOF(amountInXOF, currencyCode);
  const config = CURRENCIES[currencyCode];
  const abs = Math.abs(converted);

  let compact: string;
  if (abs >= 1_000_000) {
    compact = `${(converted / 1_000_000).toFixed(1)}M`;
  } else if (abs >= 1_000) {
    compact = `${(converted / 1_000).toFixed(0)}K`;
  } else {
    compact = converted.toFixed(config.decimals);
  }

  if (currencyCode === "USD") return `$${compact}`;
  return compact;
}

export const STORAGE_KEY = "fructosahel-currency";
