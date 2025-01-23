import {
  Address,
  Amount,
  CoinBalance,
  CoinMetadata,
  TokenSymbol,
  TransactionResult,
} from "../shared/types/crypto";

export interface CryptoInterface {
  // Coin Creation
  createCoin(
    metadata: Omit<CoinMetadata, "creationDate">
  ): Promise<TransactionResult>;

  // Transfer
  transferCoins(
    from: Address,
    to: Address,
    amount: Amount,
    symbol: TokenSymbol
  ): Promise<TransactionResult>;

  // Buy Coins
  buyCoins(
    buyer: Address,
    symbol: TokenSymbol,
    amount: Amount,
    paymentSymbol: TokenSymbol
  ): Promise<TransactionResult>;

  // Sell Coins
  sellCoins(
    seller: Address,
    symbol: TokenSymbol,
    amount: Amount,
    paymentSymbol: TokenSymbol
  ): Promise<TransactionResult>;

  // Utility functions
  getBalance(address: Address, symbol: TokenSymbol): Promise<Amount>;
  getAllBalances(address: Address): Promise<CoinBalance[]>;
  getCoinMetadata(symbol: TokenSymbol): Promise<CoinMetadata>;

  // Optional: Price information
  getCurrentPrice(
    symbol: TokenSymbol,
    quoteSymbol: TokenSymbol
  ): Promise<number>;

  // Optional: Transaction history
  getTransactionHistory(address: Address): Promise<TransactionResult[]>;
}
