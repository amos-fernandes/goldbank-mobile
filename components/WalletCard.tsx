import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { formatBRL } from "@/utils/formatters";

interface WalletCardProps {
  balance: number;
  availableBalance?: number;
  userName?: string;
  isLoading?: boolean;
}

export function WalletCard({ balance, availableBalance, userName, isLoading }: WalletCardProps) {
  return (
    <LinearGradient
      colors={["#2C1800", "#7A5500", "#C9960C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.bankName}>GOLD BANK</Text>
        <Text style={styles.cardType}>WALLET</Text>
      </View>

      <View style={styles.balanceSection}>
        {isLoading ? (
          <ActivityIndicator color="#1A1300" />
        ) : (
          <>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <Text style={styles.balance}>
              {formatBRL(availableBalance ?? balance)}
            </Text>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.userName} numberOfLines={1}>
          {userName ?? ""}
        </Text>
        <View style={styles.hexMark}>
          <Text style={styles.hexText}>⬡</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 24,
    marginHorizontal: 16,
    height: 196,
    justifyContent: "space-between",
    shadowColor: "#C9960C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bankName: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#1A1300",
    letterSpacing: 3,
  },
  cardType: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "rgba(26,19,0,0.7)",
    letterSpacing: 2,
  },
  balanceSection: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  balanceLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(26,19,0,0.65)",
  },
  balance: {
    fontFamily: "Inter_700Bold",
    fontSize: 34,
    color: "#1A1300",
    letterSpacing: -0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "rgba(26,19,0,0.75)",
    letterSpacing: 1,
    maxWidth: "80%",
  },
  hexMark: {},
  hexText: {
    fontSize: 22,
    color: "rgba(26,19,0,0.5)",
  },
});
