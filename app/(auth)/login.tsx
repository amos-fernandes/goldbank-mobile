import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace("/(tabs)");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={["#0D0D0D", "#1A1300", "#0D0D0D"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.kav}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <Text style={styles.backText}>← Voltar</Text>
            </TouchableOpacity>

            <Text style={styles.header}>GOLD BANK</Text>
            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>Entre na sua conta para continuar</Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  placeholderTextColor="#3A2F00"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.passwordWrap}>
                  <TextInput
                    style={[styles.input, { flex: 1, borderWidth: 0 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor="#3A2F00"
                    secureTextEntry={!showPass}
                    autoComplete="password"
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Text style={styles.eyeText}>{showPass ? "🙈" : "👁"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#1A1300" />
                ) : (
                  <Text style={styles.btnText}>Entrar</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem conta? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Criar conta</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 },
  back: { marginBottom: 32 },
  backText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#9A8A50" },
  header: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#C9960C",
    letterSpacing: 4,
    marginBottom: 12,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: "#F5F0E8", marginBottom: 6 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 15, color: "#9A8A50", marginBottom: 36 },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#9A8A50" },
  input: {
    backgroundColor: "#1A1300",
    borderWidth: 1,
    borderColor: "#3A2F00",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#F5F0E8",
  },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1300",
    borderWidth: 1,
    borderColor: "#3A2F00",
    borderRadius: 14,
    overflow: "hidden",
  },
  eyeBtn: { paddingHorizontal: 14 },
  eyeText: { fontSize: 16 },
  errorBox: {
    backgroundColor: "#3D0A0A",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#7A1010",
  },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#E24B4A" },
  btn: {
    backgroundColor: "#C9960C",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#C9960C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#1A1300" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32, paddingBottom: 16 },
  footerText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#9A8A50" },
  footerLink: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#C9960C" },
});
