import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TransactionRow } from "@/components/TransactionRow";
import { WalletCard } from "@/components/WalletCard";
import { useAuth } from "@/context/auth";
import { useColors } from "@/hooks/useColors";
import { formatBRL, formatCompact } from "@/utils/formatters";
import {
  useGetDashboardSummary,
  useGetRecentTransactions,
  useGetWalletBalance,
} from "@/services";

export default function HomeScreen() {
  const colors = useColors();
  const { user } = useAuth();

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useGetDashboardSummary();

  const {
    data: transactions,
    isLoading: txLoading,
    refetch: refetchTx,
  } = useGetRecentTransactions();

  const { data: wallet } = useGetWalletBalance();

  const [refreshing, setRefreshing] = React.useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchTx()]);
    setRefreshing(false);
  }

  const displayName = user?.name?.split(" ")[0] ?? "Cliente";

  return (
    <LinearGradient colors={["#0D0D0D", "#1A1300", "#0D0D0D"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold600} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.platina }]}>
                Olá, {displayName}
              </Text>
              <Text style={[styles.bankName, { color: colors.gold600 }]}>GOLD BANK</Text>
            </View>
            <View style={[styles.avatarWrap, { backgroundColor: colors.deepOre }]}>
              <Text style={[styles.avatar, { color: colors.gold600 }]}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Main balance */}
          {summaryLoading ? (
            <View style={styles.balanceLoading}>
              <ActivityIndicator color={colors.gold600} size="large" />
            </View>
          ) : (
            <View style={styles.totalSection}>
              <Text style={[styles.totalLabel, { color: colors.platina }]}>Patrimônio total</Text>
              <Text style={[styles.totalValue, { color: colors.whiteGold }]}>
                {formatBRL(summary?.totalBalanceBRL ?? 0)}
              </Text>
            </View>
          )}

          {/* Wallet card */}
          <WalletCard
            balance={wallet?.balance ?? 0}
            availableBalance={wallet?.availableBalance}
            userName={user?.name}
            isLoading={!wallet}
          />

          {/* Summary cards */}
          {summary && (
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: colors.darkGold }]}>
                <Text style={[styles.summaryLabel, { color: colors.platina }]}>Bancos</Text>
                <Text style={[styles.summaryValue, { color: colors.whiteGold }]}>
                  {formatCompact(summary.bankBalanceBRL)}
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.darkGold }]}>
                <Text style={[styles.summaryLabel, { color: colors.platina }]}>Cripto</Text>
                <Text style={[styles.summaryValue, { color: colors.whiteGold }]}>
                  {formatCompact(summary.cryptoBalanceBRL)}
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.darkGold }]}>
                <Text style={[styles.summaryLabel, { color: colors.platina }]}>Contas</Text>
                <Text style={[styles.summaryValue, { color: colors.whiteGold }]}>
                  {summary.accountsCount}
                </Text>
              </View>
            </View>
          )}

          {/* Monthly flow */}
          {summary && (
            <View style={[styles.section, { backgroundColor: colors.darkGold }]}>
              <Text style={[styles.sectionTitle, { color: colors.whiteGold }]}>Este mês</Text>
              <View style={styles.flowRow}>
                <View style={styles.flowItem}>
                  <Text style={[styles.flowLabel, { color: colors.platina }]}>↓ Entradas</Text>
                  <Text style={[styles.flowValue, { color: colors.success }]}>
                    {formatBRL(summary.monthlyInflow)}
                  </Text>
                </View>
                <View style={[styles.flowDivider, { backgroundColor: colors.borderGold }]} />
                <View style={styles.flowItem}>
                  <Text style={[styles.flowLabel, { color: colors.platina }]}>↑ Saídas</Text>
                  <Text style={[styles.flowValue, { color: colors.danger }]}>
                    {formatBRL(summary.monthlyOutflow)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Recent transactions */}
          <View style={styles.txSection}>
            <View style={styles.txHeader}>
              <Text style={[styles.sectionTitle, { color: colors.whiteGold }]}>
                Últimas transações
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: colors.gold600 }]}>Ver tudo</Text>
              </TouchableOpacity>
            </View>

            {txLoading ? (
              <ActivityIndicator color={colors.gold600} style={{ padding: 24 }} />
            ) : (transactions?.length ?? 0) === 0 ? (
              <Text style={[styles.emptyText, { color: colors.platina }]}>
                Nenhuma transação ainda
              </Text>
            ) : (
              <View style={[styles.txList, { backgroundColor: colors.darkGold }]}>
                {(transactions ?? []).slice(0, 8).map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { fontFamily: "Inter_400Regular", fontSize: 14, marginBottom: 2 },
  bankName: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: 2 },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: { fontFamily: "Inter_700Bold", fontSize: 18 },
  balanceLoading: { paddingVertical: 28, alignItems: "center" },
  totalSection: { paddingHorizontal: 20, paddingVertical: 16, alignItems: "center" },
  totalLabel: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 4 },
  totalValue: { fontFamily: "Inter_700Bold", fontSize: 38, letterSpacing: -0.5 },
  summaryRow: { flexDirection: "row", marginHorizontal: 16, marginTop: 16, gap: 10 },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  summaryLabel: { fontFamily: "Inter_400Regular", fontSize: 11 },
  summaryValue: { fontFamily: "Inter_700Bold", fontSize: 16 },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 12 },
  flowRow: { flexDirection: "row", alignItems: "center" },
  flowItem: { flex: 1, gap: 4, alignItems: "center" },
  flowLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },
  flowValue: { fontFamily: "Inter_700Bold", fontSize: 18 },
  flowDivider: { width: 1, height: 40, marginHorizontal: 16 },
  txSection: { marginHorizontal: 16, marginTop: 16 },
  txHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAll: { fontFamily: "Inter_500Medium", fontSize: 13 },
  txList: { borderRadius: 16, overflow: "hidden" },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    padding: 32,
  },
});
