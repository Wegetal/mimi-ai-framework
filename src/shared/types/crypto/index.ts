import { z } from "zod";
import {
  AddressSchema,
  AmountSchema,
  CoinMetadataSchema,
  TokenSymbolSchema,
} from "../../schemas/crypto";

export interface TransactionResult {
  transactionId: string;
  status: "success" | "pending" | "failed";
  details?: Record<string, any>;
}

export interface CoinBalance {
  symbol: TokenSymbol;
  amount: Amount;
}

export type Address = z.infer<typeof AddressSchema>;
export type Amount = z.infer<typeof AmountSchema>;
export type TokenSymbol = z.infer<typeof TokenSymbolSchema>;
export type CoinMetadata = z.infer<typeof CoinMetadataSchema>;
