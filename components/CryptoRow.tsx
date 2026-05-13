import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { formatBRL, formatPercent } from "@/utils/formatters";

const COIN_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  SOL: "#9945FF",
  XRP: "#0085C0",
  BNB: "#F3BA2F",
  ADA: "#0033AD",
  USDT: "#26A17B",
  MATIC: "#8247E5",
  DOT: "#E6007A",
  DOGE: "#C2A633",
  LTC: "#BFBBBB",
  LINK: "#2A5ADA",
};

const COIN_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  XRP: "Ripple",
  BNB: "BNB",
  ADA: "Cardano",
  USDT: "Tether",
  MATIC: "Polygon",
  DOT: "Polkadot",
  DOGE: "Dogecoin",
  LTC: "Litecoin",
  LINK: "Chainlink",
};

interface CryptoRowProps {
  symbol: string;
  price: number;
  openPrice?: number;
}

export function CryptoRow({ symbol, price, openPrice }: CryptoRowProps) {
  const colors = useColors();
  const coinColor = COIN_COLORS[symbol] ?? colors.gold600;
  const change = openPrice && openPrice > 0 ? ((price - openPrice) / openPrice) * 100 : null;
  const isPositive = change !== null ? change >= 0 : true;
  const displayName = COIN_NAMES[symbol] ?? symbol;

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.coin, { backgroundColor: `${coinColor}22` }]}>
        <Text style={[styles.coinLetter, { color: coinColor }]}>
          {symbol.charAt(0)}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.symbol, { color: colors.foreground }]}>{symbol}</Text>
        <Text style={[styles.name, { color: colors.mutedForeground }]}>{displayName}</Text>
      </View>
      <View style={styles.priceInfo}>
        <Text style={[styles.price, { color: colors.foreground }]}>{formatBRL(price)}</Text>
        {change !== null && (
          <Text style={[styles.change, { color: isPositive ? colors.success : colors.danger }]}>
            {formatPercent(change)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  coin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  coinLetter: { fontFamily: "Inter_700Bold", fontSize: 18 },
  info: { flex: 1, gap: 2 },
  symbol: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  name: { fontFamily: "Inter_400Regular", fontSize: 12 },
  priceInfo: { alignItems: "flex-end", gap: 2 },
  price: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  change: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
