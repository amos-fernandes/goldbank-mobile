import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { formatBRL, formatDate } from "@/utils/formatters";
import type { Transaction } from "@/services";

interface TransactionRowProps {
  transaction: Transaction;
}

const CATEGORY_ICONS: Record<string, string> = {
  pix: "→",
  compra: "◈",
  deposito: "↓",
  saque: "↑",
  transferencia: "⇄",
  transfer: "⇄",
  crypto: "₿",
  receita: "↓",
  despesa: "↑",
  "depósito pix": "↓",
};

export function TransactionRow({ transaction }: TransactionRowProps) {
  const colors = useColors();
  const isCredit = transaction.type === "INFLOW";
  const catKey = transaction.category?.toLowerCase() ?? "";
  const icon = CATEGORY_ICONS[catKey] ?? "•";

  return (
    <View style={[styles.row, { borderBottomColor: colors.borderGold }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.deepOre }]}>
        <Text style={[styles.icon, { color: colors.gold600 }]}>{icon}</Text>
      </View>
      <View style={styles.details}>
        <Text style={[styles.description, { color: colors.whiteGold }]} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={[styles.meta, { color: colors.platina }]}>
          {formatDate(transaction.date)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: isCredit ? colors.success : colors.danger }]}>
        {isCredit ? "+" : "-"}
        {formatBRL(Math.abs(transaction.amount))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: { fontSize: 16 },
  details: { flex: 1, marginRight: 8, gap: 2 },
  description: { fontFamily: "Inter_500Medium", fontSize: 14 },
  meta: { fontFamily: "Inter_400Regular", fontSize: 11 },
  amount: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});

