import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={["#0D0D0D", "#1A1300", "#0D0D0D"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.logoSection}>
            {Platform.OS !== "web" ? (
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.icon}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.iconPlaceholder}>
                <Text style={styles.iconText}>⬡</Text>
              </View>
            )}
            <Text style={styles.title}>GOLD BANK</Text>
            <Text style={styles.subtitle}>Global Cash</Text>
          </View>

          <View style={styles.taglineSection}>
            <Text style={styles.tagline}>
              Sua riqueza. Seus ativos.{"\n"}Tudo em um só lugar.
            </Text>
            <Text style={styles.description}>
              Contas bancárias, cripto e carteira digital integrados com o melhor
              do Open Finance brasileiro.
            </Text>
          </View>

          <View style={styles.actions}>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Entrar</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(auth)/register" asChild>
              <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85}>
                <Text style={styles.secondaryBtnText}>Criar conta</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <Text style={styles.legal}>
            Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  logoSection: { alignItems: "center", marginTop: 48, gap: 8 },
  icon: { width: 80, height: 80, marginBottom: 8 },
  iconPlaceholder: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#2C1800",
    borderRadius: 20,
  },
  iconText: { fontSize: 40, color: "#C9960C" },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: "#C9960C",
    letterSpacing: 4,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#9A8A50",
    letterSpacing: 3,
  },
  taglineSection: { gap: 12, paddingHorizontal: 8 },
  tagline: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: "#F5F0E8",
    lineHeight: 34,
    textAlign: "center",
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#9A8A50",
    textAlign: "center",
    lineHeight: 22,
  },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: "#C9960C",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#C9960C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#1A1300",
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A2F00",
  },
  secondaryBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#F5F0E8",
  },
  legal: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#9A8A50",
    textAlign: "center",
    paddingBottom: 8,
    lineHeight: 16,
  },
});
