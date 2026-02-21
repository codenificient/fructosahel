"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type CurrencyCode,
  CURRENCIES,
  convertFromXOF,
  formatAmountFromXOF,
  STORAGE_KEY,
} from "@/lib/currency";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  /** Convert from XOF and format for display */
  formatAmount: (amountInXOF: number) => string;
  /** Raw numeric conversion from XOF */
  convertFromXOF: (amount: number) => number;
  /** Current currency symbol (e.g. "FCFA", "$", "ECO") */
  symbol: string;
  /** Human-readable label (e.g. "West African CFA Franc") */
  currencyLabel: string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("XOF");

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === "XOF" || stored === "USD" || stored === "ECO")) {
      setCurrencyState(stored);
    }
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const formatAmount = useCallback(
    (amountInXOF: number) => formatAmountFromXOF(amountInXOF, currency),
    [currency],
  );

  const convert = useCallback(
    (amount: number) => convertFromXOF(amount, currency),
    [currency],
  );

  const config = CURRENCIES[currency];

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        convertFromXOF: convert,
        symbol: config.symbol,
        currencyLabel: config.label,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
