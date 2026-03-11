import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Button from '../../components/Button'
import { RADIUS, SPECIES_EMOJI } from '../../constants/theme'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../hooks/useTheme'

const TABS = ['Inicio', 'Estadísticas', 'Historial']

function QuickAccess({ icon, label, bg, onPress }: any) {
  const { colors } = useTheme()
  return (
    <TouchableOpacity onPress={onPress} style={[styles.quickCard, { backgroundColor: bg }]} activeOpacity={0.75}>
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={[styles.quickLabel, { color: colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const { pets, appointments } = useApp()
  const { colors, isDark } = useTheme()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)

  const today = new Date().toISOString().split('T')[0]
  const upcoming = appointments
    .filter((a: any) => a.status === 'scheduled' && a.date >= today)
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .slice(0, 3)

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Buenos días ☀️' : hour < 18 ? 'Buenas tardes 🌤️' : 'Buenas noches 🌙'
  const totalVaccines = pets.reduce((acc: number, p: any) => acc + (p.vaccines?.length || 0), 0)

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>🐾</Text>
          </View>
          <View>
            <Text style={[styles.greet, { color: colors.textSecondary }]}>{greet}</Text>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>PVet</Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>Asistente Veterinario</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            <Text style={{ fontSize: 18 }}>📅</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.background }]}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(i)}
            style={[
              styles.tab,
              activeTab === i && { backgroundColor: colors.textPrimary }
            ]}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === i ? colors.background : colors.textMuted }
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Dark hero card */}
        <View style={styles.heroSection}>
          <View style={[styles.darkCard, { backgroundColor: colors.darkCard }]}>
            <View style={styles.darkCardOrb} />
            <Text style={styles.darkCardTitle}>PVet App</Text>
            <Text style={styles.darkCardSub}>Tu asistente de mascotas</Text>
            <Text style={styles.darkCardStat}>
              <Text style={{ fontSize: 22, fontWeight: '300' }}>+</Text>
              {pets.length}
            </Text>
            <View style={[styles.darkBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.darkBadgeText}>Mascotas</Text>
            </View>
            <View style={styles.darkCardEmoji}>
              <Text style={{ fontSize: 48 }}>🐾</Text>
            </View>
          </View>
        </View>

        {/* Quick access */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Accesos Rápidos</Text>
          <View style={styles.quickRow}>
            <QuickAccess
              icon="🐾" label="Mis Mascotas"
              bg={colors.quickPets}
              onPress={() => router.push('/(tabs)/pets')}
            />
            <QuickAccess
              icon="📅" label="Citas"
              bg={colors.quickAppointments}
              onPress={() => router.push('/(tabs)/appointments')}
            />
            <QuickAccess
              icon="💉" label="Historial"
              bg={colors.quickHistory}
              onPress={() => router.push('/(tabs)/pets')}
            />
          </View>
        </View>

        {/* Resumen stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Resumen</Text>
          <View style={styles.statsRow}>
            {[
              { icon: '🐾', value: pets.length, label: 'Mascotas', color: colors.primary },
              { icon: '📅', value: upcoming.length, label: 'Citas', color: colors.amber },
              { icon: '✅', value: totalVaccines, label: 'Vacunas', color: colors.success },
            ].map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Próximas citas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>📅 Próximas Citas</Text>
          {upcoming.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay citas próximas</Text>
              <Button onPress={() => router.push('/(tabs)/appointments')} size="sm" style={{ marginTop: 14 }}>
                Agendar ahora
              </Button>
            </View>
          ) : upcoming.map((a: any) => {
            const pet = pets.find((p: any) => p.id === a.petId)
            return (
              <View key={a.id} style={[styles.apptCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                <View style={[styles.dateBox, { backgroundColor: colors.quickAppointments }]}>
                  <Text style={[styles.dateMonth, { color: colors.primary }]}>
                    {a.date ? new Date(a.date + 'T00:00').toLocaleDateString('es-ES', { month: 'short' }) : '—'}
                  </Text>
                  <Text style={[styles.dateDay, { color: colors.primary }]}>
                    {a.date ? new Date(a.date + 'T00:00').getDate() : '—'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.apptService, { color: colors.textPrimary }]}>{a.service}</Text>
                  <Text style={[styles.apptMeta, { color: colors.textSecondary }]}>
                    {SPECIES_EMOJI[pet?.species] || '🐾'} {pet?.name || 'N/A'} · {a.time}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.quickPets }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>Programada</Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Mascotas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>🐾 Mis Mascotas</Text>
          {pets.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
              <Text style={styles.emptyIcon}>🐕</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aún no has registrado mascotas</Text>
              <Button onPress={() => router.push('/(tabs)/pets')} size="sm" style={{ marginTop: 14 }}>
                Registrar mascota
              </Button>
            </View>
          ) : pets.slice(0, 3).map((pet: any) => (
            <TouchableOpacity
              key={pet.id}
              onPress={() => router.push('/(tabs)/pets')}
              style={[styles.petCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
              activeOpacity={0.75}
            >
              <View style={[styles.petAvatar, { backgroundColor: (pet.colorTheme || colors.primary) + '22' }]}>
                <Text style={{ fontSize: 24 }}>{SPECIES_EMOJI[pet.species] || '🐾'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.petName, { color: colors.textPrimary }]}>{pet.name}</Text>
                <Text style={[styles.petBreed, { color: colors.textSecondary }]}>{pet.species} · {pet.breed || 'Sin raza'}</Text>
              </View>
              <Text style={[styles.petAge, { color: colors.textMuted }]}>{pet.age} años</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22 },
  greet: { fontSize: 12, fontWeight: '500' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSub: { fontSize: 12, fontWeight: '400' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },

  tabsContainer: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20,
  },
  tabText: { fontSize: 13, fontWeight: '600' },

  heroSection: { paddingHorizontal: 20, marginBottom: 8 },
  darkCard: {
    borderRadius: RADIUS.lg, padding: 24,
    overflow: 'hidden', minHeight: 140,
  },
  darkCardOrb: {
    position: 'absolute', right: -20, top: -20,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,122,47,0.15)',
  },
  darkCardTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  darkCardSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 },
  darkCardStat: { fontSize: 40, fontWeight: '800', color: '#FFFFFF', lineHeight: 44 },
  darkBadge: {
    alignSelf: 'flex-start', marginTop: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  darkBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  darkCardEmoji: {
    position: 'absolute', right: 20, bottom: 16,
  },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 14 },

  quickRow: { flexDirection: 'row', gap: 12 },
  quickCard: {
    flex: 1, borderRadius: RADIUS.md,
    alignItems: 'center', paddingVertical: 18, gap: 8,
  },
  quickIcon: { fontSize: 26 },
  quickLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, alignItems: 'center', padding: 14,
    borderRadius: RADIUS.md, borderWidth: 1,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2, textAlign: 'center' },

  emptyCard: {
    alignItems: 'center', padding: 32,
    borderRadius: RADIUS.md, borderWidth: 1,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14 },

  apptCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: RADIUS.md,
    borderWidth: 1, marginBottom: 10,
  },
  dateBox: {
    width: 50, alignItems: 'center',
    borderRadius: 12, padding: 8,
  },
  dateMonth: { fontSize: 10, textTransform: 'uppercase', fontWeight: '600' },
  dateDay: { fontSize: 20, fontWeight: '800', lineHeight: 24 },
  apptService: { fontWeight: '600', fontSize: 14, marginBottom: 2 },
  apptMeta: { fontSize: 12 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: '700' },

  petCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: RADIUS.md,
    borderWidth: 1, marginBottom: 10,
  },
  petAvatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  petName: { fontWeight: '700', fontSize: 15 },
  petBreed: { fontSize: 12, marginTop: 2 },
  petAge: { fontSize: 12, fontWeight: '600' },
})