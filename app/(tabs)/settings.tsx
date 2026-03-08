import React, { useState } from 'react'
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useApp } from '../../context/AppContext'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { COLORS, RADIUS } from '../../constants/theme'

function SRow({ icon, title, desc, children }: any) {
  return (
    <View style={styles.sRow}>
      <View style={styles.sRowIcon}><Text style={{ fontSize: 18 }}>{icon}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sRowTitle}>{title}</Text>
        <Text style={styles.sRowDesc}>{desc}</Text>
      </View>
      {children}
    </View>
  )
}

export default function SettingsScreen() {
  const { notifications, toggleNotifications, pets, appointments } = useApp()
  const [email, setEmail] = useState(true)
  const [push, setPush] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const clearData = () => {
    Alert.alert('¿Eliminar todo?', 'Se borrarán todos tus datos guardados. Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear()
          Alert.alert('Listo', 'Datos eliminados. Reinicia la app.')
        }
      }
    ])
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <Text style={styles.headerSub}>Personaliza tu experiencia</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Profile */}
        <Card glow style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>J</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Juan García</Text>
            <Text style={styles.profileEmail}>juan@ejemplo.com</Text>
            <View style={styles.profileStats}>
              <View style={styles.profileStat}>
                <Text style={[styles.profileStatVal, { color: COLORS.teal }]}>{pets.length}</Text>
                <Text style={styles.profileStatLabel}>Mascotas</Text>
              </View>
              <View style={styles.profileStat}>
                <Text style={[styles.profileStatVal, { color: COLORS.amber }]}>{appointments.length}</Text>
                <Text style={styles.profileStatLabel}>Citas</Text>
              </View>
            </View>
          </View>
          <Button variant="secondary" size="sm" onPress={() => {}}>Editar</Button>
        </Card>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>🔔 Notificaciones</Text>
        <Card style={styles.card}>
          <SRow icon="🔔" title="Notificaciones de citas" desc="Recordatorios de citas próximas">
            <Switch value={notifications} onValueChange={toggleNotifications} trackColor={{ false: COLORS.slate, true: COLORS.teal }} thumbColor="white" />
          </SRow>
          <SRow icon="📧" title="Notificaciones por email" desc="Confirmaciones en tu correo">
            <Switch value={email} onValueChange={setEmail} trackColor={{ false: COLORS.slate, true: COLORS.teal }} thumbColor="white" />
          </SRow>
          <SRow icon="📱" title="Notificaciones push" desc="Alertas en tiempo real">
            <Switch value={push} onValueChange={setPush} trackColor={{ false: COLORS.slate, true: COLORS.teal }} thumbColor="white" />
          </SRow>
          <SRow icon="💉" title="Recordatorio de vacunas" desc="Alerta cuando una vacuna vence">
            <Switch value={notifications} onValueChange={toggleNotifications} trackColor={{ false: COLORS.slate, true: COLORS.teal }} thumbColor="white" />
          </SRow>
        </Card>

        {/* Appearance */}
        <Text style={styles.sectionTitle}>🎨 Apariencia</Text>
        <Card style={styles.card}>
          <SRow icon="🌙" title="Modo oscuro" desc="Interfaz oscura (activo)">
            <Switch value={true} onValueChange={() => {}} trackColor={{ false: COLORS.slate, true: COLORS.teal }} thumbColor="white" />
          </SRow>
        </Card>

        {/* Data */}
        <Text style={styles.sectionTitle}>💾 Datos</Text>
        <Card style={styles.card}>
          <SRow icon="🗑" title="Limpiar datos" desc="Elimina todos los datos guardados">
            <Button size="sm" variant="danger" onPress={clearData}>Limpiar</Button>
          </SRow>
        </Card>

        {/* About */}
        <Text style={styles.sectionTitle}>ℹ️ Acerca de</Text>
        <Card style={styles.card}>
          <View style={styles.aboutRow}>
            <View style={styles.aboutIcon}><Text style={{ fontSize: 28 }}>🐾</Text></View>
            <View>
              <Text style={styles.aboutTitle}><Text style={{ color: COLORS.teal }}>P</Text>Vet</Text>
              <Text style={styles.aboutVersion}>Versión 1.0.0 · Veterinaria Inteligente</Text>
            </View>
          </View>
          <Text style={styles.aboutDesc}>
            PVet es tu plataforma de gestión veterinaria. Registra mascotas, agenda citas, lleva la cartilla de salud y más.
          </Text>
        </Card>

        {/* Save */}
        <View style={styles.saveRow}>
          {saved && <Text style={styles.savedText}>✓ Configuración guardada</Text>}
          <Button onPress={save} size="lg">Guardar Cambios</Button>
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.navy },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: COLORS.navyMid, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  headerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  profileAvatar: { width: 64, height: 64, borderRadius: 18, backgroundColor: COLORS.teal, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 28, fontWeight: '800', color: COLORS.navy },
  profileName: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  profileEmail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  profileStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
  profileStat: { alignItems: 'center' },
  profileStatVal: { fontSize: 20, fontWeight: '800' },
  profileStatLabel: { fontSize: 10, color: COLORS.textMuted },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  card: { marginBottom: 20, padding: 4 },
  sRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  sRowIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: 'center', justifyContent: 'center' },
  sRowTitle: { fontWeight: '600', fontSize: 14, color: COLORS.textPrimary },
  sRowDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12, padding: 14 },
  aboutIcon: { width: 52, height: 52, backgroundColor: COLORS.teal, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  aboutTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  aboutVersion: { fontSize: 12, color: COLORS.textSecondary },
  aboutDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, paddingHorizontal: 14, paddingBottom: 14 },
  saveRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 8 },
  savedText: { color: COLORS.teal, fontSize: 14, fontWeight: '600' },
})
