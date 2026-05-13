import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

import { CryptoRow } from "@/components/CryptoRow";
import { useColors } from "@/hooks/useColors";
import { formatBRL } from "@/utils/formatters";
import {
  useBuyCrypto,
  useGetBinancePrices,
  useGetMbPrices,
  useSaveMbCredentials,
} from "@workspace/api-client-react";

const BUYABLE = ["BTC", "ETH", "SOL", "XRP", "BNB", "ADA", "USDT"];

export default function CryptoScreen() {
  const colors = useColors();
  const [tab, setTab] = useState<"binance" | "mb">("mb");
  const [buyModal, setBuyModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [amountBRL, setAmountBRL] = useState("");
  const [credModal, setCredModal] = useState(false);
  const [mbKey, setMbKey] = useState("");
  const [mbSecret, setMbSecret] = useState("");
  const [mbAccount, setMbAccount] = useState("");

  const { data: binancePrices, isLoading: binanceLoading, refetch: refetchBinance } = useGetBinancePrices();
  const { data: mbPrices, isLoading: mbLoading, refetch: refetchMb } = useGetMbPrices();

  const buyMutation = useBuyCrypto();
  const credMutation = useSaveMbCredentials();

  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchBinance(), refetchMb()]);
    setRefreshing(false);
  }

  async function handleBuy() {
    if (!selectedCoin) return;
    const val = parseFloat(amountBRL.replace(",", "."));
    if (!val || val < 10) {
      Alert.alert("Valor mínimo", "O valor mínimo para compra é R$ 10,00.");
      return;
    }
    try {
      const result = await buyMutation.mutateAsync({
        data: { coin: selectedCoin, amountBRL: val },
      });
      Alert.alert(
        "Compra realizada!",
        `${result.estimatedCoinAmount.toFixed(8)} ${result.coin}\nPor ${formatBRL(result.amountBRL)}`,
      );
      setBuyModal(false);
      setAmountBRL("");
    } catch (e: unknown) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Erro ao comprar cripto.");
    }
  }

  async function handleSaveCred() {
    if (!mbKey.trim() || !mbSecret.trim() || !mbAccount.trim()) {
      Alert.alert("Preencha todos os campos");
      return;
    }
    try {
      await credMutation.mutateAsync({
        data: { mbApiKey: mbKey.trim(), mbApiSecret: mbSecret.trim(), mbAccountId: mbAccount.trim() },
      });
      Alert.alert("Credenciais salvas!", "Suas credenciais Mercado Bitcoin foram salvas.");
      setCredModal(false);
    } catch (e: unknown) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Erro ao salvar credenciais.");
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
            <Text style={[styles.screenTitle, { color: colors.gold600 }]}>Cripto</Text>
            <TouchableOpacity
              style={[styles.credBtn, { borderColor: colors.borderGold }]}
              onPress={() => setCredModal(true)}
            >
              <Text style={[styles.credBtnText, { color: colors.platina }]}>⚙ MB API</Text>
            </TouchableOpacity>
          </View>

          {/* Tab switcher */}
          <View style={[styles.tabs, { backgroundColor: colors.darkGold }]}>
            {(["mb", "binance"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tabItem, tab === t && { backgroundColor: colors.gold600 }]}
                onPress={() => setTab(t)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: tab === t ? "#1A1300" : colors.platina },
                  ]}
                >
                  {t === "mb" ? "Mercado Bitcoin" : "Binance"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price list */}
          {tab === "mb" ? (
            mbLoading ? (
              <ActivityIndicator color={colors.gold600} style={{ padding: 40 }} />
            ) : (
              <View style={[styles.list, { backgroundColor: colors.darkGold }]}>
                {(mbPrices ?? []).map((p) => (
                  <TouchableOpacity
                    key={p.coin}
                    onPress={() => {
                      if (BUYABLE.includes(p.coin)) {
                        setSelectedCoin(p.coin);
                        setBuyModal(true);
                      }
                    }}
                    activeOpacity={BUYABLE.includes(p.coin) ? 0.75 : 1}
                  >
                    <CryptoRow
                      symbol={p.coin}
                      price={p.last}
                      openPrice={p.open}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )
          ) : binanceLoading ? (
            <ActivityIndicator color={colors.gold600} style={{ padding: 40 }} />
          ) : (
            <View style={[styles.list, { backgroundColor: colors.darkGold }]}>
              {(binancePrices ?? []).map((p) => (
                <CryptoRow
                  key={p.symbol}
                  symbol={p.symbol.replace("USDT", "").replace("BRL", "")}
                  price={p.price}
                />
              ))}
            </View>
          )}

          <Text style={[styles.hint, { color: colors.platina }]}>
            {tab === "mb"
              ? "Toque em uma moeda para comprar via Mercado Bitcoin"
              : "Dados da Binance (somente visualização)"}
          </Text>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Buy Modal */}
        <Modal visible={buyModal} transparent animationType="slide" onRequestClose={() => setBuyModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: colors.darkGold }]}>
              <Text style={[styles.modalTitle, { color: colors.gold600 }]}>
                Comprar {selectedCoin}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.platina }]}>
                Informe o valor em BRL (mín. R$ 10,00)
              </Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.deepOre, color: colors.whiteGold, borderColor: colors.borderGold }]}
                value={amountBRL}
                onChangeText={setAmountBRL}
                placeholder="0,00"
                placeholderTextColor={colors.platina}
                keyboardType="decimal-pad"
                autoFocus
              />
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.gold600 }, buyMutation.isPending && { opacity: 0.6 }]}
                onPress={handleBuy}
                disabled={buyMutation.isPending}
              >
                {buyMutation.isPending ? (
                  <ActivityIndicator color="#1A1300" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: "#1A1300" }]}>Confirmar compra</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setBuyModal(false)} style={styles.cancelBtn}>
                <Text style={[styles.cancelText, { color: colors.platina }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Credentials Modal */}
        <Modal visible={credModal} transparent animationType="slide" onRequestClose={() => setCredModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: colors.darkGold }]}>
              <Text style={[styles.modalTitle, { color: colors.gold600 }]}>Credenciais Mercado Bitcoin</Text>
              <Text style={[styles.modalSubtitle, { color: colors.platina }]}>
                Suas chaves ficam armazenadas com criptografia AES-256.
              </Text>
              {[
                { label: "API Key", value: mbKey, set: setMbKey, placeholder: "Sua MB API Key" },
                { label: "API Secret", value: mbSecret, set: setMbSecret, placeholder: "Seu MB API Secret", secure: true },
                { label: "Account ID", value: mbAccount, set: setMbAccount, placeholder: "ID da conta MB" },
              ].map((f) => (
                <View key={f.label} style={{ gap: 4 }}>
                  <Text style={[styles.fieldLabel, { color: colors.platina }]}>{f.label}</Text>
                  <TextInput
                    style={[styles.credInput, { backgroundColor: colors.deepOre, color: colors.whiteGold, borderColor: colors.borderGold }]}
                    value={f.value}
                    onChangeText={f.set}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.platina}
                    secureTextEntry={f.secure}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.gold600 }, credMutation.isPending && { opacity: 0.6 }]}
                onPress={handleSaveCred}
                disabled={credMutation.isPending}
              >
                {credMutation.isPending ? (
                  <ActivityIndicator color="#1A1300" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: "#1A1300" }]}>Salvar credenciais</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCredModal(false)} style={styles.cancelBtn}>
                <Text style={[styles.cancelText, { color: colors.platina }]}>Cancelar</Text>
              </TouchableOpacity>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  screenTitle: { fontFamily: "Inter_700Bold", fontSize: 20, letterSpacing: 1 },
  credBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12 },
  credBtnText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  tabs: { flexDirection: "row", marginHorizontal: 16, marginVertical: 12, borderRadius: 14, padding: 4, gap: 4 },
  tabItem: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  list: { marginHorizontal: 16, borderRadius: 16, overflow: "hidden" },
  hint: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center", marginTop: 12, paddingHorizontal: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  modalSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14 },
  modalInput: { borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, fontFamily: "Inter_700Bold", fontSize: 28, textAlign: "center" },
  modalBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  modalBtnText: { fontFamily: "Inter_700Bold", fontSize: 16 },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  credInput: { borderWidth: 1, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, fontFamily: "Inter_400Regular", fontSize: 14 },
});
