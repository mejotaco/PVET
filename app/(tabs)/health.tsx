import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useApp } from '../../context/AppContext'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import { FInput, FSelect, FTextarea } from '../../components/FormField'
import { COLORS, RADIUS } from '../../constants/theme'

const VT = ['Rabia','Parvovirus','Moquillo','Hepatitis Canina','Leptospirosis','Bordetella','Leucemia Felina','Herpesvirus Felino','Calicivirus Felino','Panleucopenia','Otra']
const VT_OPTS = VT.map(v => ({ label: v, value: v }))
const DOC_TYPES = ['Análisis','Radiografía','Ecografía','Receta','Historia Clínica','Otro']
const DOC_OPTS = DOC_TYPES.map(d => ({ label: d, value: d }))

export default function HealthScreen() {
  const { pets, updatePet } = useApp()
  const [sel, setSel] = useState<string | null>(null)
  const [showV, setShowV] = useState(false)
  const [showD, setShowD] = useState(false)
  const [vf, setVf] = useState({ type: 'Rabia', date: '', nextDate: '', vet: '', batch: '', notes: '' })
  const [df, setDf] = useState({ name: '', type: 'Análisis', date: '', notes: '' })

  const pet = pets.find((p: any) => p.id === sel)
  const today = new Date().toISOString().split('T')[0]

  const fv = (k: string) => ({ value: (vf as any)[k] || '', onChangeText: (v: string) => setVf(p => ({ ...p, [k]: v })) })
  const fd = (k: string) => ({ value: (df as any)[k] || '', onChangeText: (v: string) => setDf(p => ({ ...p, [k]: v })) })

  const addVaccine = () => {
    if (!vf.type || !vf.date) return
    updatePet(pet.id, { vaccines: [...(pet.vaccines || []), { ...vf, id: Date.now().toString() }] })
    setShowV(false)
    setVf({ type: 'Rabia', date: '', nextDate: '', vet: '', batch: '', notes: '' })
  }

  const delVaccine = (id: string) => {
    updatePet(pet.id, { vaccines: (pet.vaccines || []).filter((v: any) => v.id !== id) })
  }

  const addDoc = () => {
    if (!df.name) return
    updatePet(pet.id, { docs: [...(pet.docs || []), { ...df, id: Date.now().toString() }] })
    setShowD(false)
    setDf({ name: '', type: 'Análisis', date: '', notes: '' })
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cartilla de Salud</Text>
        <Text style={styles.headerSub}>Historial médico y vacunas</Text>
      </View>

      {pets.length === 0 ? (
        <View style={styles.center}>
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>💉</Text>
            <Text style={styles.emptyTitle}>Sin mascotas</Text>
            <Text style={styles.emptyText}>Registra mascotas primero</Text>
          </Card>
        </View>
      ) : (
        <>
          {/* Pet selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {pets.map((p: any) => (
              <TouchableOpacity key={p.id} onPress={() => setSel(p.id)}
                style={[styles.selectorBtn, sel === p.id && styles.selectorBtnActive]}>
                <Text style={[styles.selectorText, sel === p.id && styles.selectorTextActive]}>🐾 {p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {!pet ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>Selecciona una mascota</Text>
            </View>
          ) : (
            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
              {/* Vaccines */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>💉 Vacunas</Text>
                  <View style={styles.countBadge}><Text style={styles.countText}>{pet.vaccines?.length || 0}</Text></View>
                </View>
                <Button size="sm" onPress={() => setShowV(true)} icon="+">Agregar</Button>
              </View>

              {(!pet.vaccines || pet.vaccines.length === 0) ? (
                <Card style={styles.emptyCard}><Text style={styles.emptyIcon}>💉</Text><Text style={styles.emptyText}>Sin vacunas registradas</Text></Card>
              ) : pet.vaccines.map((v: any) => {
                const overdue = v.nextDate && v.nextDate < today
                return (
                  <Card key={v.id} style={styles.itemCard}>
                    <View style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.itemTitleRow}>
                          <Text style={styles.itemTitle}>{v.type}</Text>
                          {overdue && <View style={styles.overdueTag}><Text style={styles.overdueText}>VENCIDA</Text></View>}
                        </View>
                        <Text style={styles.itemMeta}>📅 {v.date}{v.nextDate ? ` → Próxima: ${v.nextDate}` : ''}</Text>
                        {v.vet ? <Text style={styles.itemMeta}>👨‍⚕️ {v.vet}</Text> : null}
                        {v.batch ? <Text style={styles.itemMeta}>🔖 Lote: {v.batch}</Text> : null}
                      </View>
                      <TouchableOpacity onPress={() => delVaccine(v.id)}>
                        <Text style={{ fontSize: 18 }}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                )
              })}

              {/* Documents */}
              <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>📋 Documentos</Text>
                  <View style={styles.countBadge}><Text style={styles.countText}>{pet.docs?.length || 0}</Text></View>
                </View>
                <Button size="sm" onPress={() => setShowD(true)} icon="↑">Subir</Button>
              </View>

              {(!pet.docs || pet.docs.length === 0) ? (
                <Card style={styles.emptyCard}><Text style={styles.emptyIcon}>📋</Text><Text style={styles.emptyText}>Sin documentos subidos</Text></Card>
              ) : pet.docs.map((doc: any) => (
                <Card key={doc.id} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <View style={styles.docIcon}>
                      <Text style={{ fontSize: 20 }}>{doc.type === 'Análisis' ? '🔬' : doc.type === 'Radiografía' ? '🩻' : '📄'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{doc.name}</Text>
                      <Text style={styles.itemMeta}>{doc.type} · {doc.date || 'Sin fecha'}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </ScrollView>
          )}
        </>
      )}

      {/* Vaccine Modal */}
      <Modal isOpen={showV} onClose={() => setShowV(false)} title="Registrar Vacuna">
        <View style={{ gap: 12 }}>
          <FSelect label="Tipo de Vacuna" required value={vf.type} options={VT_OPTS} onChange={v => setVf(p => ({ ...p, type: v }))} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}><FInput label="Fecha Aplicación" required placeholder="YYYY-MM-DD" {...fv('date')} /></View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}><FInput label="Próxima Dosis" placeholder="YYYY-MM-DD" {...fv('nextDate')} /></View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}><FInput label="Veterinario" placeholder="Nombre" {...fv('vet')} /></View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}><FInput label="Lote/Batch" placeholder="Código" {...fv('batch')} /></View>
          </View>
          <FTextarea label="Notas" placeholder="Observaciones..." {...fv('notes')} />
          <View style={styles.modalButtons}>
            <Button variant="secondary" onPress={() => setShowV(false)}>Cancelar</Button>
            <Button onPress={addVaccine}>Registrar</Button>
          </View>
        </View>
      </Modal>

      {/* Document Modal */}
      <Modal isOpen={showD} onClose={() => setShowD(false)} title="Subir Documento">
        <View style={{ gap: 12 }}>
          <FInput label="Nombre del Documento" required placeholder="Ej: Análisis de Sangre" {...fd('name')} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}><FSelect label="Tipo" value={df.type} options={DOC_OPTS} onChange={v => setDf(p => ({ ...p, type: v }))} /></View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}><FInput label="Fecha" placeholder="YYYY-MM-DD" {...fd('date')} /></View>
          </View>
          <FTextarea label="Notas" placeholder="Observaciones..." {...fd('notes')} />
          <View style={styles.modalButtons}>
            <Button variant="secondary" onPress={() => setShowD(false)}>Cancelar</Button>
            <Button onPress={addDoc}>Guardar</Button>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.navy },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: COLORS.navyMid, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  headerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  selectorScroll: { paddingVertical: 14, maxHeight: 56 },
  selectorBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.glass },
  selectorBtnActive: { backgroundColor: 'rgba(0,201,177,0.12)', borderColor: COLORS.teal },
  selectorText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  selectorTextActive: { color: COLORS.teal },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  countBadge: { backgroundColor: COLORS.teal, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 1 },
  countText: { fontSize: 12, fontWeight: '700', color: COLORS.navy },
  emptyCard: { alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
  itemCard: { marginBottom: 10, padding: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  itemTitle: { fontWeight: '600', fontSize: 14, color: COLORS.textPrimary },
  itemMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  overdueTag: { backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  overdueText: { fontSize: 10, color: COLORS.coral, fontWeight: '700' },
  docIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(0,201,177,0.1)', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
})
