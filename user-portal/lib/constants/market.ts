import { MarketAsset } from "@/types";

export const MARKET_ASSETS: MarketAsset[] = [
  { id: "gold", symbol: "GOLD", name: "Gold Rate", price: "₹72,450/10g", change: "+0.42%", positive: true },
  { id: "silver", symbol: "SILVER", name: "Silver Rate", price: "₹89,200/kg", change: "-0.18%", positive: false },
  { id: "usdinr", symbol: "USD/INR", name: "US Dollar", price: "₹83.42", change: "+0.08%", positive: true },
  { id: "eurinr", symbol: "EUR/INR", name: "Euro", price: "₹90.18", change: "-0.12%", positive: false },
  { id: "btc", symbol: "BTC", name: "Bitcoin", price: "₹58,24,800", change: "+2.34%", positive: true },
  { id: "eth", symbol: "ETH", name: "Ethereum", price: "₹3,12,450", change: "+1.87%", positive: true },
  { id: "nifty", symbol: "NIFTY 50", name: "Nifty 50", price: "24,012.60", change: "+0.63%", positive: true },
  { id: "sensex", symbol: "SENSEX", name: "BSE Sensex", price: "79,242.15", change: "+0.71%", positive: true },
  { id: "banknifty", symbol: "BANK NIFTY", name: "Bank Nifty", price: "52,108.35", change: "-0.34%", positive: false },
];
