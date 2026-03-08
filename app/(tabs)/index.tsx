import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useApp } from '../../context/AppContext'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { COLORS, RADIUS, SPECIES_EMOJI } from '../../constants/theme'

function StatCard({ value, label, icon, color }: any) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  )
}

export default function HomeScreen() {
  const { pets, appointments } = useApp()
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const upcoming = appointments
    .filter((a: any) => a.status === 'scheduled' && a.date >= today)
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .slice(0, 3)

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const totalVaccines = pets.reduce((acc: number, p: any) => acc + (p.vaccines?.length || 0), 0)

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreet}>{greet} 👋</Text>
          <Text style={styles.headerTitle}>
            <Text style={{ color: COLORS.teal }}>P</Text>Vet
          </Text>
        </View>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>🐾</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroOrb} />
          <Text style={styles.heroEmoji}>🐾</Text>
          <Text style={styles.heroTitle}>
            Bienvenido a {'\n'}<Text style={{ color: COLORS.teal }}>P</Text>Vet
          </Text>
          <Text style={styles.heroSub}>
            Tu plataforma veterinaria inteligente. Gestiona la salud de tus mascotas.
          </Text>
          <View style={styles.heroButtons}>
            <Button onPress={() => router.push('/(tabs)/pets')} icon="🐾" size="md">Mis Mascotas</Button>
            <View style={{ width: 10 }} />
            <Button onPress={() => router.push('/(tabs)/appointments')} variant="secondary" icon="📅" size="md">Agendar Cita</Button>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value={pets.length} label="Mascotas" icon="🐾" color={COLORS.teal} />
          <StatCard value={upcoming.length} label="Próximas citas" icon="📅" color={COLORS.amber} />
          <StatCard value={totalVaccines} label="Vacunas" icon="💉" color={COLORS.coral} />
        </View>

        {/* Upcoming appointments */}
        <Text style={styles.sectionTitle}>📅 Próximas Citas</Text>
        {upcoming.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No hay citas próximas</Text>
            <Button onPress={() => router.push('/(tabs)/appointments')} size="sm" style={{ marginTop: 14 }}>
              Agendar ahora
            </Button>
          </Card>
        ) : upcoming.map((a: any) => {
          const pet = pets.find((p: any) => p.id === a.petId)
          return (
            <Card key={a.id} style={styles.apptCard}>
              <View style={styles.apptRow}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateMonth}>
                    {a.date ? new Date(a.date + 'T00:00').toLocaleDateString('es-ES', { month: 'short' }) : '—'}
                  </Text>
                  <Text style={styles.dateDay}>
                    {a.date ? new Date(a.date + 'T00:00').getDate() : '—'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.apptService}>{a.service}</Text>
                  <Text style={styles.apptMeta}>
                    {SPECIES_EMOJI[pet?.species] || '🐾'} {pet?.name || 'N/A'} · {a.time}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Programada</Text>
                </View>
              </View>
            </Card>
          )
        })}

        {/* Pet preview */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>🐾 Mis Mascotas</Text>
        {pets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🐕</Text>
            <Text style={styles.emptyText}>Aún no has registrado mascotas</Text>
            <Button onPress={() => router.push('/(tabs)/pets')} size="sm" style={{ marginTop: 14 }}>
              Registrar mascota
            </Button>
          </Card>
        ) : pets.slice(0, 3).map((pet: any) => (
          <Card key={pet.id} style={styles.petCard} onPress={() => router.push('/(tabs)/pets')}>
            <View style={[styles.petAvatar, { backgroundColor: (pet.colorTheme || COLORS.teal) + '33' }]}>
              <Text style={{ fontSize: 24 }}>{SPECIES_EMOJI[pet.species] || '🐾'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>{pet.species} · {pet.breed || 'Sin raza'}</Text>
            </View>
            <Text style={styles.petAge}>{pet.age} años</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.navy },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: COLORS.navyMid, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder,
  },
  headerGreet: { fontSize: 12, color: COLORS.teal, fontWeight: '600', letterSpacing: 0.5 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  logoBadge: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.teal, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 20 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  hero: {
    marginTop: 20, marginBottom: 20, padding: 24,
    backgroundColor: COLORS.navySoft, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.glassBorder, overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute', right: -40, top: -40, width: 180, height: 180,
    borderRadius: 90, backgroundColor: 'rgba(0,201,177,0.1)',
  },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8, lineHeight: 36 },
  heroSub: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 20 },
  heroButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', padding: 14 },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  emptyCard: { alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
  apptCard: { marginBottom: 10, padding: 14 },
  apptRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateBox: { width: 48, alignItems: 'center', backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.glassBorder, borderRadius: 10, padding: 6 },
  dateMonth: { fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase' },
  dateDay: { fontSize: 20, fontWeight: '800', color: COLORS.teal, lineHeight: 24 },
  apptService: { fontWeight: '600', fontSize: 14, color: COLORS.textPrimary, marginBottom: 2 },
  apptMeta: { fontSize: 12, color: COLORS.textSecondary },
  badge: { backgroundColor: 'rgba(0,201,177,0.15)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, color: COLORS.teal, fontWeight: '600' },
  petCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, padding: 14 },
  petAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  petName: { fontWeight: '600', fontSize: 15, color: COLORS.textPrimary },
  petBreed: { fontSize: 12, color: COLORS.textSecondary },
  petAge: { fontSize: 12, color: COLORS.textMuted },
})
