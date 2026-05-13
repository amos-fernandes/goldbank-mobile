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

type Field = {
  key: string;
  label: string;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "words" | "sentences";
  secure?: boolean;
  autoComplete?: "email" | "name" | "postal-code" | "tel" | "password" | "off";
};

const FIELDS: Field[] = [
  { key: "name", label: "Nome completo", placeholder: "João da Silva", autoCapitalize: "words", autoComplete: "name" },
  { key: "email", label: "E-mail", placeholder: "joao@email.com", keyboardType: "email-address", autoCapitalize: "none", autoComplete: "email" },
  { key: "cpfCnpj", label: "CPF ou CNPJ", placeholder: "000.000.000-00", keyboardType: "numeric", autoComplete: "off" },
  { key: "phone", label: "Telefone", placeholder: "(11) 99999-9999", keyboardType: "phone-pad", autoComplete: "tel" },
  { key: "birthDate", label: "Data de nascimento", placeholder: "AAAA-MM-DD", autoComplete: "off" },
  { key: "address", label: "Endereço (rua)", placeholder: "Rua das Flores", autoCapitalize: "words", autoComplete: "off" },
  { key: "addressNumber", label: "Número", placeholder: "100", keyboardType: "numeric", autoComplete: "off" },
  { key: "complement", label: "Complemento (opcional)", placeholder: "Apto 42", autoCapitalize: "words", autoComplete: "off" },
  { key: "neighborhood", label: "Bairro", placeholder: "Centro", autoCapitalize: "words", autoComplete: "off" },
  { key: "postalCode", label: "CEP", placeholder: "01310-100", keyboardType: "numeric", autoComplete: "postal-code" },
  { key: "password", label: "Senha", placeholder: "Mínimo 8 caracteres", secure: true, autoComplete: "password" },
];

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setValue(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRegister() {
    const required = ["name", "email", "cpfCnpj", "phone", "birthDate", "address", "addressNumber", "neighborhood", "postalCode", "password"];
    for (const k of required) {
      if (!form[k]?.trim()) {
        setError(`Campo obrigatório: ${FIELDS.find((f) => f.key === k)?.label ?? k}`);
        return;
      }
    }
    setError(null);
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email.toLowerCase().trim(),
        cpfCnpj: form.cpfCnpj.replace(/\D/g, ""),
        phone: form.phone.replace(/\D/g, ""),
        birthDate: form.birthDate,
        address: form.address,
        addressNumber: form.addressNumber,
        complement: form.complement ?? "",
        neighborhood: form.neighborhood,
        postalCode: form.postalCode.replace(/\D/g, ""),
        password: form.password,
      });
      router.replace("/(tabs)");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={["#0D0D0D", "#1A1300", "#0D0D0D"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.kav}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <Text style={styles.backText}>← Voltar</Text>
            </TouchableOpacity>

            <Text style={styles.header}>GOLD BANK</Text>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Preencha os dados para abrir sua conta digital</Text>

            <View style={styles.form}>
              {FIELDS.map((f) => (
                <View key={f.key} style={styles.field}>
                  <Text style={styles.label}>{f.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={form[f.key] ?? ""}
                    onChangeText={(v) => setValue(f.key, v)}
                    placeholder={f.placeholder}
                    placeholderTextColor="#3A2F00"
                    keyboardType={f.keyboardType ?? "default"}
                    autoCapitalize={f.autoCapitalize ?? "sentences"}
                    secureTextEntry={f.secure ?? false}
                    autoComplete={f.autoComplete ?? "off"}
                    autoCorrect={false}
                  />
                </View>
              ))}

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#1A1300" />
                ) : (
                  <Text style={styles.btnText}>Criar minha conta</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem conta? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Entrar</Text>
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
  back: { marginBottom: 24 },
  backText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#9A8A50" },
  header: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#C9960C", letterSpacing: 4, marginBottom: 8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: "#F5F0E8", marginBottom: 6 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 15, color: "#9A8A50", marginBottom: 28 },
  form: { gap: 14 },
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
  errorBox: { backgroundColor: "#3D0A0A", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#7A1010" },
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
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28, paddingBottom: 24 },
  footerText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#9A8A50" },
  footerLink: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#C9960C" },
});
