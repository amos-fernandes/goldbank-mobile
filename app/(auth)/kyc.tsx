import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/context/auth";
import { useColors } from "@/hooks/useColors";
import { api } from "@/services/api";

export default function KYCScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (type: 'front' | 'back' | 'selfie') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'selfie' ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'front') setFrontImage(result.assets[0].uri);
      if (type === 'back') setBackImage(result.assets[0].uri);
      if (type === 'selfie') setSelfieImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!frontImage || !backImage || !selfieImage) {
      Alert.alert("Documentação incompleta", "Por favor, envie todas as fotos solicitadas.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      // Em um cenário real, converteríamos as URIs para blobs/files
      // Para o exemplo, simulamos a estrutura que o Asaas/Backend esperaria
      formData.append('front', { uri: frontImage, name: 'front.jpg', type: 'image/jpeg' } as any);
      formData.append('back', { uri: backImage, name: 'back.jpg', type: 'image/jpeg' } as any);
      formData.append('selfie', { uri: selfieImage, name: 'selfie.jpg', type: 'image/jpeg' } as any);

      await api.post('/api/user/kyc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alert.alert("Sucesso!", "Seus documentos foram enviados para análise.");
      router.replace("/(tabs)/profile");
    } catch (e: unknown) {
      Alert.alert("Erro", "Não foi possível enviar os documentos no momento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0D0D0D", "#1A1300", "#0D0D0D"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.title, { color: colors.whiteGold }]}>Verificação de Identidade (KYC)</Text>
          <Text style={[styles.subtitle, { color: colors.platina }]}>
            Para sua segurança e conformidade com o Banco Central, precisamos validar sua identidade.
          </Text>

          <View style={styles.uploadGrid}>
            {[
              { label: "Frente do Documento (RG/CNH)", uri: frontImage, type: 'front' },
              { label: "Verso do Documento", uri: backImage, type: 'back' },
              { label: "Selfie com o Documento", uri: selfieImage, type: 'selfie' },
            ].map((item) => (
              <View key={item.type} style={styles.uploadItem}>
                <Text style={[styles.label, { color: colors.platina }]}>{item.label}</Text>
                <TouchableOpacity
                  style={[styles.dropzone, { backgroundColor: colors.deepOre, borderColor: colors.borderGold }]}
                  onPress={() => pickImage(item.type as any)}
                >
                  {item.uri ? (
                    <Image source={{ uri: item.uri }} style={styles.preview} />
                  ) : (
                    <Text style={[styles.plus, { color: colors.gold600 }]}>+</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.gold600 }, loading && { opacity: 0.6 }]}
            onPress={handleUpload}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#1A1300" /> : <Text style={styles.btnText}>Enviar para Análise</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.platina }]}>Voltar</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 24, gap: 20 },
  title: { fontFamily: "Inter_700Bold", fontSize: 24, marginBottom: 8 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, marginBottom: 12 },
  uploadGrid: { gap: 20 },
  uploadItem: { gap: 10 },
  label: { fontFamily: "Inter_500Medium", fontSize: 14 },
  dropzone: {
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  preview: { width: '100%', height: '100%' },
  plus: { fontSize: 40, fontFamily: "Inter_400Regular" },
  btn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 10 },
  btnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#1A1300" },
  backBtn: { alignItems: 'center', paddingVertical: 10 },
  backText: { fontFamily: "Inter_500Medium", fontSize: 14 },
});
