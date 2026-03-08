import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useApp } from '../../context/AppContext'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import { FInput, FSelect, FTextarea } from '../../components/FormField'
import { COLORS, RADIUS, SPECIES_EMOJI } from '../../constants/theme'

const SERVICES = ['Consulta General','Vacunación','Desparasitación','Cirugía','Grooming','Odontología','Radiografía','Análisis de Sangre','Control de Peso','Urgencias']
const VETS = ['Dr. Martínez','Dra. Rodríguez','Dr. López','Dra. García']
const TIMES = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00']

const SERVICES_OPTS = SERVICES.map(s => ({ label: s, value: s }))
const VETS_OPTS = VETS.map(v => ({ label: v, value: v }))
const TIMES_OPTS = TIMES.map(t => ({ label: t, value: t }))

const EA = { petId: '', service: 'Consulta General', date: '', time: '09:00', vet: 'Dr. Martínez', notes: '' }

const ST: Record<string, any> = {
  scheduled: { bg: 'rgba(0,201,177,0.12)', color: COLORS.teal, label: 'Programada' },
  cancelled: { bg: 'rgba(255,107,107,0.12)', color: COLORS.coral, label: 'Cancelada' },
  completed: { bg: 'rgba(255,179,71,0.12)', color: COLORS.amber, label: 'Completada' },
}

export default function AppointmentsScreen() {
  const { pets, appointments, addAppointment, cancelAppointment } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<any>(EA)
  const [filter, setFilter] = useState('all')
  const today = new Date().toISOString().split('T')[0]

  const f = (k: string) => ({
    value: form[k] || '',
    onChangeText: (v: string) => setForm((p: any) => ({ ...p, [k]: v })),
  })

  const filtered = appointments.filter((a: any) => {
    if (filter === 'upcoming') return a.status === 'scheduled' && a.date >= today
    if (filter === 'past') return a.date < today || a.status !== 'scheduled'
    if (filter === 'cancelled') return a.status === 'cancelled'
    return true
  }).sort((a: any, b: any) => b.date.localeCompare(a.date))

  const submit = () => {
    if (!form.petId || !form.date || !form.time) {
      Alert.alert('Campos requeridos', 'Selecciona mascota, fecha y hora')
      return
    }
    addAppointment(form)
    setShowModal(false)
    setForm(EA)
  }

  const petsOpts = pets.map((p: any) => ({ label: `${p.name} (${p.species})`, value: p.id }))

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Citas</Text>
          <Text style={styles.headerSub}>{appointments.length} registrada{appointments.length !== 1 ? 's' : ''}</Text>
        </View>
        <Button onPress={() => setShowModal(true)} icon="+" size="sm">Nueva</Button>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {[['all','Todas'],['upcoming','Próximas'],['past','Pasadas'],['cancelled','Canceladas']].map(([v,l]) => (
          <TouchableOpacity key={v} onPress={() => setFilter(v)}
            style={[styles.filterBtn, filter === v && styles.filterBtnActive]}>
            <Text style={[styles.filterText, filter === v && styles.filterTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {filtered.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Sin citas</Text>
            <Text style={styles.emptyText}>No hay citas en esta categoría</Text>
            <Button onPress={() => setShowModal(true)} icon="+" style={{ marginTop: 16 }}>Agendar Cita</Button>
          </Card>
        ) : filtered.map((appt: any) => {
          const pet = pets.find((p: any) => p.id === appt.petId)
          const st = ST[appt.status] || ST.scheduled
          const isPast = appt.date < today
          const d = appt.date ? new Date(appt.date + 'T00:00') : null
          return (
            <Card key={appt.id} style={styles.apptCard}>
              <View style={styles.apptRow}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateMonth}>{d ? d.toLocaleDateString('es-ES', { month: 'short' }) : '—'}</Text>
                  <Text style={[styles.dateDay, { color: isPast ? COLORS.textMuted : COLORS.teal }]}>{d ? d.getDate() : '—'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.apptTitleRow}>
                    <Text style={styles.apptService}>{appt.service}</Text>
                    <View style={[styles.badge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.apptMeta}>🐾 {pet?.name || 'N/A'} · 🕐 {appt.time} · 👨‍⚕️ {appt.vet}</Text>
                  {appt.notes ? <Text style={styles.apptNotes}>📝 {appt.notes}</Text> : null}
                </View>
              </View>
              <View style={styles.apptBtns}>
                {appt.status === 'scheduled' && (
                  <Button size="sm" variant="danger" onPress={() => cancelAppointment(appt.id)}>Cancelar</Button>
                )}
              </View>
            </Card>
          )
        })}
      </ScrollView>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Agendar Nueva Cita">
        {pets.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Primero registra una mascota</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <FSelect label="Mascota" required value={form.petId} options={petsOpts} onChange={v => setForm((p: any) => ({ ...p, petId: v }))} />
            <FSelect label="Servicio" required value={form.service} options={SERVICES_OPTS} onChange={v => setForm((p: any) => ({ ...p, service: v }))} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}><FInput label="Fecha (YYYY-MM-DD)" required placeholder={today} {...f('date')} /></View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <FSelect label="Hora" required value={form.time} options={TIMES_OPTS} onChange={v => setForm((p: any) => ({ ...p, time: v }))} />
              </View>
            </View>
            <FSelect label="Veterinario" value={form.vet} options={VETS_OPTS} onChange={v => setForm((p: any) => ({ ...p, vet: v }))} />
            <FTextarea label="Notas adicionales" placeholder="Síntomas, motivo..." {...f('notes')} />
            <View style={styles.modalButtons}>
              <Button variant="secondary" onPress={() => setShowModal(false)}>Cancelar</Button>
              <Button onPress={submit} disabled={!form.petId || !form.date}>Agendar</Button>
            </View>
          </View>
        )}
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.navy },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: COLORS.navyMid, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  headerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  filterScroll: { paddingVertical: 14, maxHeight: 56 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.glassBorder },
  filterBtnActive: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  filterText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.navy },
  emptyCard: { alignItems: 'center', padding: 48, marginTop: 20 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
  apptCard: { marginBottom: 12, padding: 16 },
  apptRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  dateBox: { width: 50, alignItems: 'center', backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.glassBorder, borderRadius: 10, padding: 6 },
  dateMonth: { fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase' },
  dateDay: { fontSize: 22, fontWeight: '800', lineHeight: 26 },
  apptTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' },
  apptService: { fontWeight: '600', fontSize: 14, color: COLORS.textPrimary },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  apptMeta: { fontSize: 12, color: COLORS.textSecondary },
  apptNotes: { fontSize: 11, color: COLORS.textMuted, marginTop: 3 },
  apptBtns: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 8 },
  row: { flexDirection: 'row' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
})
