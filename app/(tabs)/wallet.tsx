import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WalletCard } from "@/components/WalletCard";
import { useAuth } from "@/context/auth";
import { useColors } from "@/hooks/useColors";
import { formatBRL } from "@/utils/formatters";
import {
  useCreatePixDeposit,
  useGetWalletBalance,
} from "@workspace/api-client-react";

export default function WalletScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [depositModal, setDepositModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [qrData, setQrData] = useState<{
    qrCodeBase64: string;
    qrCodePayload: string;
    value: number;
    chargeId: string;
  } | null>(null);

  const {
    data: wallet,
    isLoading,
    refetch,
  } = useGetWalletBalance();

  const depositMutation = useCreatePixDeposit();

  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  async function handleDeposit() {
    const val = parseFloat(amount.replace(",", "."));
    if (!val || val < 1) {
      Alert.alert("Valor inválido", "Informe um valor de R$ 1,00 ou mais.");
      return;
    }
    try {
      const result = await depositMutation.mutateAsync({
        data: { amount: val, description: "Depósito via PIX - GOLD BANK" },
      });
      setQrData({
        qrCodeBase64: result.qrCodeBase64,
        qrCodePayload: result.qrCodePayload,
        value: result.value,
        chargeId: result.chargeId,
      });
    } catch (e: unknown) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Erro ao gerar cobrança PIX.");
    }
  }

  return (
    <LinearGradient colors={["#0D0D0D", "#1A1300", "#0D0D0D"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold600} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.screenTitle, { color: colors.gold600 }]}>Carteira GOLD BANK</Text>
          </View>

          {/* Card */}
          <WalletCard
            balance={wallet?.balance ?? 0}
            availableBalance={wallet?.availableBalance}
            userName={user?.name}
            isLoading={isLoading}
          />

          {/* Demo notice */}
          {wallet?.isDemo && (
            <View style={[styles.demoBox, { backgroundColor: colors.deepOre }]}>
              <Text style={[styles.demoText, { color: colors.platina }]}>
                ⚠️ {wallet.message ?? "Saldo demonstrativo — conta Asaas pendente de ativação."}
              </Text>
            </View>
          )}

          {/* Balance details */}
          {wallet && (
            <View style={[styles.balanceDetails, { backgroundColor: colors.darkGold }]}>
              <View style={styles.balanceRow}>
                <Text style={[styles.balLabel, { color: colors.platina }]}>Saldo total</Text>
                <Text style={[styles.balValue, { color: colors.whiteGold }]}>
                  {formatBRL(wallet.balance)}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.borderGold }]} />
              <View style={styles.balanceRow}>
                <Text style={[styles.balLabel, { color: colors.platina }]}>Saldo disponível</Text>
                <Text style={[styles.balValue, { color: colors.success }]}>
                  {formatBRL(wallet.availableBalance)}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.borderGold }]} />
              <View style={styles.balanceRow}>
                <Text style={[styles.balLabel, { color: colors.platina }]}>Total transferido</Text>
                <Text style={[styles.balValue, { color: colors.whiteGold }]}>
                  {formatBRL(wallet.totalTransferValue)}
                </Text>
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.gold600 }]}
              onPress={() => setDepositModal(true)}
              activeOpacity={0.85}
            >
              <Text style={[styles.actionText, { color: "#1A1300" }]}>↓ Depositar via PIX</Text>
            </TouchableOpacity>
          </View>

          {/* Status */}
          <View style={[styles.statusBox, { backgroundColor: colors.darkGold }]}>
            <Text style={[styles.statusLabel, { color: colors.platina }]}>Status da conta</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: user?.asaasStatus === "ACTIVE" ? colors.success : colors.platina },
                ]}
              />
              <Text style={[styles.statusValue, { color: colors.whiteGold }]}>
                {user?.asaasStatus === "ACTIVE"
                  ? "Conta ativa"
                  : user?.asaasStatus === "REJECTED"
                  ? "Conta rejeitada"
                  : "Aguardando ativação"}
              </Text>
            </View>
            {user?.walletId && (
              <Text style={[styles.walletId, { color: colors.platina }]}>
                ID: {user.walletId}
              </Text>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Deposit Modal */}
        <Modal
          visible={depositModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setDepositModal(false);
            setQrData(null);
            setAmount("");
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: colors.darkGold }]}>
              {qrData ? (
                <>
                  <Text style={[styles.modalTitle, { color: colors.gold600 }]}>QR Code PIX</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.platina }]}>
                    Valor: {formatBRL(qrData.value)}
                  </Text>

                  {qrData.qrCodeBase64 ? (
                    <Image
                      source={{ uri: `data:image/png;base64,${qrData.qrCodeBase64}` }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.qrPlaceholder, { backgroundColor: colors.deepOre }]}>
                      <Text style={[styles.qrPlaceholderText, { color: colors.platina }]}>
                        QR Code indisponível
                      </Text>
                    </View>
                  )}

                  <View style={[styles.payloadBox, { backgroundColor: colors.deepOre }]}>
                    <Text style={[styles.payloadText, { color: colors.whiteGold }]} numberOfLines={3}>
                      {qrData.qrCodePayload}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: colors.gold600 }]}
                    onPress={() => {
                      setDepositModal(false);
                      setQrData(null);
                      setAmount("");
                    }}
                  >
                    <Text style={[styles.modalBtnText, { color: "#1A1300" }]}>Fechar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.modalTitle, { color: colors.gold600 }]}>Depositar via PIX</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.platina }]}>
                    Informe o valor a depositar na sua carteira GOLD BANK
                  </Text>

                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.deepOre, color: colors.whiteGold, borderColor: colors.borderGold }]}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0,00"
                    placeholderTextColor={colors.platina}
                    keyboardType="decimal-pad"
                    autoFocus
                  />

                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: colors.gold600 }, depositMutation.isPending && { opacity: 0.6 }]}
                    onPress={handleDeposit}
                    disabled={depositMutation.isPending}
                  >
                    {depositMutation.isPending ? (
                      <ActivityIndicator color="#1A1300" />
                    ) : (
                      <Text style={[styles.modalBtnText, { color: "#1A1300" }]}>Gerar QR Code</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setDepositModal(false)} style={styles.cancelBtn}>
                    <Text style={[styles.cancelText, { color: colors.platina }]}>Cancelar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  screenTitle: { fontFamily: "Inter_700Bold", fontSize: 20, letterSpacing: 1 },
  demoBox: { marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 12 },
  demoText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  balanceDetails: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, gap: 12 },
  balanceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  balLabel: { fontFamily: "Inter_400Regular", fontSize: 14 },
  balValue: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  divider: { height: 1 },
  actions: { marginHorizontal: 16, marginTop: 16, gap: 10 },
  actionBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  actionText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  statusBox: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, gap: 8 },
  statusLabel: { fontFamily: "Inter_500Medium", fontSize: 13, marginBottom: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusValue: { fontFamily: "Inter_500Medium", fontSize: 14 },
  walletId: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  modalSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14 },
  qrImage: { width: 220, height: 220, alignSelf: "center" },
  qrPlaceholder: { width: 220, height: 220, alignSelf: "center", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  qrPlaceholderText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  payloadBox: { borderRadius: 10, padding: 12 },
  payloadText: { fontFamily: "Inter_400Regular", fontSize: 11 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    textAlign: "center",
  },
  modalBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  modalBtnText: { fontFamily: "Inter_700Bold", fontSize: 16 },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelText: { fontFamily: "Inter_500Medium", fontSize: 14 },
});
