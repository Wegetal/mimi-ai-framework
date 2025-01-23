import { z } from "zod";

export const AddressSchema = z.string();
export const AmountSchema = z.number().positive();
export const TokenSymbolSchema = z.string().min(1).max(10);

export const CoinMetadataSchema = z.object({
  name: z.string(),
  symbol: TokenSymbolSchema,
  description: z.string().optional(),
  totalSupply: AmountSchema,
  creator: AddressSchema,
  creationDate: z.date(),
});
