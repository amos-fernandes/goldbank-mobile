import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth";
import { useColors } from "@/hooks/useColors";

type MenuItem = {
  label: string;
  icon: string;
  action?: () => void;
  danger?: boolean;
};

export default function ProfileScreen() {
  const colors = useColors();
  const { user, logout } = useAuth();

  const displayName = user?.name ?? "Usuário";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  function confirmLogout() {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/welcome");
          },
        },
      ],
    );
  }

  const menuItems: MenuItem[] = [
    { label: "Segurança", icon: "🔒" },
    { label: "Notificações", icon: "🔔" },
    { label: "Open Finance", icon: "🏦" },
    { label: "Suporte", icon: "💬" },
    { label: "Sobre o app", icon: "ℹ️" },
    { 
      label: user?.asaasStatus === "ACTIVE" ? "Identidade Verificada" : "Verificar Identidade", 
      icon: "🪪",
      action: () => router.push("/(auth)/kyc")
    },
    { label: "Sair", icon: "🚪", action: confirmLogout, danger: true },
  ];

  return (
    <LinearGradient colors={["#0D0D0D", "#1A1300", "#0D0D0D"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.screenTitle, { color: colors.gold600 }]}>Perfil</Text>
          </View>

          {/* Avatar card */}
          <View style={[styles.avatarCard, { backgroundColor: colors.darkGold }]}>
            <View style={[styles.avatar, { backgroundColor: colors.deepOre }]}>
              <Text style={[styles.avatarText, { color: colors.gold600 }]}>{initials}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.whiteGold }]}>{user?.name}</Text>
              <Text style={[styles.userEmail, { color: colors.platina }]}>{user?.email}</Text>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        user?.asaasStatus === "ACTIVE" ? colors.success : colors.platina,
                    },
                  ]}
                />
                <Text style={[styles.statusText, { color: colors.platina }]}>
                  {user?.asaasStatus === "ACTIVE"
                    ? "Conta ativa"
                    : user?.asaasStatus === "REJECTED"
                    ? "Conta rejeitada"
                    : "Aguardando ativação"}
                </Text>
              </View>
            </View>
          </View>

          {/* Account ID */}
          {user?.walletId && (
            <View style={[styles.idBox, { backgroundColor: colors.darkGold }]}>
              <Text style={[styles.idLabel, { color: colors.platina }]}>ID da Wallet</Text>
              <Text style={[styles.idValue, { color: colors.whiteGold }]}>{user.walletId}</Text>
            </View>
          )}

          {/* Menu */}
          <View style={[styles.menu, { backgroundColor: colors.darkGold }]}>
            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  idx < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderGold },
                ]}
                onPress={item.action}
                activeOpacity={item.action ? 0.7 : 1}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.menuLabel,
                    { color: item.danger ? colors.danger : colors.whiteGold },
                  ]}
                >
                  {item.label}
                </Text>
                {!item.danger && (
                  <Text style={[styles.menuArrow, { color: colors.platina }]}>›</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.version, { color: colors.platina }]}>
            GOLD BANK Global Cash v1.0.0
          </Text>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  screenTitle: { fontFamily: "Inter_700Bold", fontSize: 20, letterSpacing: 1 },
  avatarCard: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 24 },
  userInfo: { flex: 1, gap: 4 },
  userName: { fontFamily: "Inter_700Bold", fontSize: 18 },
  userEmail: { fontFamily: "Inter_400Regular", fontSize: 13 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  idBox: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  idLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },
  idValue: { fontFamily: "Inter_500Medium", fontSize: 13 },
  menu: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15 },
  menuArrow: { fontFamily: "Inter_400Regular", fontSize: 20 },
  version: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
  },
});
