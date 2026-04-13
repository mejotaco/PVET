import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Button from '../../components/Button'
import { FInput, FSelect, FTextarea } from '../../components/FormField'
import Modal from '../../components/Modal'
import { RADIUS, SPECIES_EMOJI } from '../../constants/theme'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../hooks/useTheme'

const VT_OPTS = ['Rabia','Parvovirus','Moquillo','Hepatitis Canina','Leptospirosis','Bordetella','Leucemia Felina','Herpesvirus Felino','Calicivirus Felino','Panleucopenia','Otra']
  .map(v => ({ label: v, value: v }))
const DOC_OPTS = ['Análisis','Radiografía','Ecografía','Receta','Historia Clínica','Otro']
  .map(d => ({ label: d, value: d }))

const DOC_ICONS: Record<string, any> = {
  'Análisis':       'flask-outline',
  'Radiografía':    'scan-outline',
  'Ecografía':      'pulse-outline',
  'Receta':         'document-text-outline',
  'Historia Clínica':'clipboard-outline',
  'Otro':           'document-outline',
}

const EV = { type: 'Rabia', date: '', nextDate: '', vet: '', batch: '', notes: '' }
const ED = { name: '', type: 'Análisis', date: '', notes: '' }

export default function HealthScreen() {
  const { pets, updatePet } = useApp()
  const { colors } = useTheme()
  const [sel, setSel] = useState<string | null>(null)
  const [showV, setShowV] = useState(false)
  const [showD, setShowD] = useState(false)
  const [vf, setVf] = useState<any>(EV)
  const [df, setDf] = useState<any>(ED)

  const pet   = pets.find((p: any) => p.id === sel)
  const today = new Date().toISOString().split('T')[0]

  const fv = (k: string) => ({ value: vf[k] || '', onChangeText: (v: string) => setVf((p: any) => ({ ...p, [k]: v })) })
  const fd = (k: string) => ({ value: df[k] || '', onChangeText: (v: string) => setDf((p: any) => ({ ...p, [k]: v })) })

  const addVaccine = () => {
    if (!vf.type || !vf.date) return
    updatePet(pet.id, { vaccines: [...(pet.vaccines || []), { ...vf, id: Date.now().toString() }] })
    setShowV(false)
    setVf(EV)
  }

  const addDoc = () => {
    if (!df.name) return
    updatePet(pet.id, { docs: [...(pet.docs || []), { ...df, id: Date.now().toString() }] })
    setShowD(false)
    setDf(ED)
  }

  const selectedAccent = pet?.colorTheme || colors.primary
  const totalVaccines  = pets.reduce((acc: number, p: any) => acc + (p.vaccines?.length || 0), 0)
  const overdueCount   = pets.reduce((acc: number, p: any) => {
    return acc + (p.vaccines?.filter((v: any) => v.nextDate && v.nextDate < today).length || 0)
  }, 0)

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: colors.glassBorder }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Cartilla de Salud</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>Historial médico y vacunas</Text>
        </View>
        {overdueCount > 0 && (
          <View style={[styles.alertBadge, { backgroundColor: '#FF6B6B18', borderColor: '#FF6B6B40' }]}>
            <Ionicons name="alert-circle" size={14} color="#FF6B6B" />
            <Text style={[styles.alertBadgeText, { color: '#FF6B6B' }]}>{overdueCount} vencida{overdueCount !== 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      {/* ── Global stats ───────────────────────────────────────────────────── */}
      {pets.length > 0 && (
        <View style={[styles.globalStats, { borderBottomColor: colors.glassBorder }]}>
          <GlobalStat value={pets.length}      label="Mascotas"  color={colors.primary}  icon="paw-outline"              colors={colors} />
          <View style={[styles.gsDivider, { backgroundColor: colors.glassBorder }]} />
          <GlobalStat value={totalVaccines}    label="Vacunas"   color={colors.success}  icon="shield-checkmark-outline" colors={colors} />
          <View style={[styles.gsDivider, { backgroundColor: colors.glassBorder }]} />
          <GlobalStat value={overdueCount}     label="Vencidas"  color={overdueCount > 0 ? '#FF6B6B' : colors.textMuted} icon="alert-circle-outline" colors={colors} />
        </View>
      )}

      {pets.length === 0 ? (
        <View style={styles.center}>
          <View style={[styles.emptyIconBox, { backgroundColor: colors.primary + '12' }]}>
            <Ionicons name="medkit-outline" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin mascotas</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Registra una mascota primero para gestionar su historial médico
          </Text>
        </View>
      ) : (
        <>
          {/* ── Pet selector ───────────────────────────────────────────────── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ maxHeight: 72 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
          >
            {pets.map((p: any) => {
              const isSelected = sel === p.id
              const accent = p.colorTheme || colors.primary
              const petOverdue = p.vaccines?.some((v: any) => v.nextDate && v.nextDate < today)
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSel(p.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.petChip,
                    { backgroundColor: colors.surface, borderColor: colors.glassBorder },
                    isSelected && { backgroundColor: accent + '18', borderColor: accent },
                  ]}
                >
                  <View style={[styles.petChipAvatar, { backgroundColor: accent + '25' }]}>
                    <Text style={{ fontSize: 16 }}>{SPECIES_EMOJI[p.species] || '🐾'}</Text>
                    {petOverdue && (
                      <View style={[styles.petChipAlert, { backgroundColor: '#FF6B6B', borderColor: isSelected ? accent + '18' : colors.surface }]} />
                    )}
                  </View>
                  <View>
                    <Text style={[styles.petChipName, { color: isSelected ? accent : colors.textPrimary }]}>
                      {p.name}
                    </Text>
                    <Text style={[styles.petChipSub, { color: colors.textMuted }]}>
                      {p.vaccines?.length || 0} vacunas
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {!pet ? (
            <View style={styles.center}>
              <View style={[styles.emptyIconBox, { backgroundColor: colors.primary + '12' }]}>
                <Ionicons name="paw-outline" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Selecciona una mascota para ver su historial
              </Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1, paddingHorizontal: 16 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 110, paddingTop: 6 }}
            >
              {/* ── Pet summary card ─────────────────────────────────────────── */}
              <View style={[styles.petSummaryCard, { backgroundColor: selectedAccent + '12', borderColor: selectedAccent + '25' }]}>
                <View style={[styles.petSummaryAvatar, { backgroundColor: selectedAccent + '25' }]}>
                  <Text style={{ fontSize: 28 }}>{SPECIES_EMOJI[pet.species] || '🐾'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.petSummaryName, { color: colors.textPrimary }]}>{pet.name}</Text>
                  <Text style={[styles.petSummarySub, { color: colors.textSecondary }]}>
                    {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}
                    {pet.age ? ` · ${pet.age} años` : ''}
                  </Text>
                </View>
                <View style={styles.petSummaryStats}>
                  <Text style={[styles.petSummaryStatVal, { color: selectedAccent }]}>{pet.vaccines?.length || 0}</Text>
                  <Text style={[styles.petSummaryStatLabel, { color: colors.textMuted }]}>vacunas</Text>
                </View>
                <View style={{ width: 1, height: 32, backgroundColor: selectedAccent + '30' }} />
                <View style={styles.petSummaryStats}>
                  <Text style={[styles.petSummaryStatVal, { color: colors.primary }]}>{pet.docs?.length || 0}</Text>
                  <Text style={[styles.petSummaryStatLabel, { color: colors.textMuted }]}>docs</Text>
                </View>
              </View>

              {/* ── Vaccines ─────────────────────────────────────────────────── */}
              <SectionHeader
                icon="shield-checkmark-outline"
                title="Vacunas"
                count={pet.vaccines?.length || 0}
                onAdd={() => setShowV(true)}
                colors={colors}
                accent={selectedAccent}
              />

              {(!pet.vaccines || pet.vaccines.length === 0) ? (
                <EmptyBlock icon="shield-outline" text="Sin vacunas registradas" colors={colors} />
              ) : pet.vaccines.map((v: any) => {
                const overdue = v.nextDate && v.nextDate < today
                const soon = v.nextDate && !overdue && (new Date(v.nextDate).getTime() - Date.now()) < 1000 * 60 * 60 * 24 * 30

                return (
                  <View key={v.id} style={[styles.recordCard, {
                    backgroundColor: colors.surface,
                    borderColor: overdue ? '#FF6B6B35' : soon ? '#FFD16635' : colors.glassBorder,
                  }]}>
                    <View style={[styles.recordStripe, {
                      backgroundColor: overdue ? '#FF6B6B' : soon ? '#FFD166' : selectedAccent,
                    }]} />
                    <View style={styles.recordBody}>
                      <View style={[styles.recordIconBox, {
                        backgroundColor: overdue ? '#FF6B6B18' : soon ? '#FFD16618' : selectedAccent + '15',
                      }]}>
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={18}
                          color={overdue ? '#FF6B6B' : soon ? '#FFD166' : selectedAccent}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.recordTitleRow}>
                          <Text style={[styles.recordTitle, { color: colors.textPrimary }]}>{v.type}</Text>
                          {overdue && <StatusTag text="VENCIDA" color="#FF6B6B" />}
                          {soon && !overdue && <StatusTag text="PRONTO" color="#FFD166" />}
                        </View>

                        <View style={styles.recordMeta}>
                          <Ionicons name="calendar-outline" size={11} color={colors.textMuted} />
                          <Text style={[styles.recordMetaText, { color: colors.textSecondary }]}>
                            Aplicada: {v.date}
                          </Text>
                        </View>
                        {v.nextDate && (
                          <View style={styles.recordMeta}>
                            <Ionicons name={overdue ? 'alert-circle-outline' : 'arrow-forward-circle-outline'} size={11} color={overdue ? '#FF6B6B' : colors.textMuted} />
                            <Text style={[styles.recordMetaText, { color: overdue ? '#FF6B6B' : colors.textSecondary }]}>
                              Próxima: {v.nextDate}
                            </Text>
                          </View>
                        )}
                        {v.vet && (
                          <View style={styles.recordMeta}>
                            <Ionicons name="person-outline" size={11} color={colors.textMuted} />
                            <Text style={[styles.recordMetaText, { color: colors.textMuted }]}>{v.vet}</Text>
                          </View>
                        )}
                        {v.batch && (
                          <View style={styles.recordMeta}>
                            <Ionicons name="barcode-outline" size={11} color={colors.textMuted} />
                            <Text style={[styles.recordMetaText, { color: colors.textMuted }]}>Lote: {v.batch}</Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => updatePet(pet.id, { vaccines: pet.vaccines.filter((x: any) => x.id !== v.id) })}
                        style={[styles.deleteBtn, { backgroundColor: '#FF6B6B12', borderColor: '#FF6B6B30' }]}
                      >
                        <Ionicons name="trash-outline" size={14} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              })}

              {/* ── Documents ────────────────────────────────────────────────── */}
              <SectionHeader
                icon="document-text-outline"
                title="Documentos"
                count={pet.docs?.length || 0}
                onAdd={() => setShowD(true)}
                colors={colors}
                accent={selectedAccent}
                style={{ marginTop: 24 }}
              />

              {(!pet.docs || pet.docs.length === 0) ? (
                <EmptyBlock icon="documents-outline" text="Sin documentos subidos" colors={colors} />
              ) : pet.docs.map((doc: any) => (
                <View key={doc.id} style={[styles.recordCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                  <View style={[styles.recordStripe, { backgroundColor: selectedAccent + '60' }]} />
                  <View style={styles.recordBody}>
                    <View style={[styles.recordIconBox, { backgroundColor: selectedAccent + '15' }]}>
                      <Ionicons name={DOC_ICONS[doc.type] || 'document-outline'} size={18} color={selectedAccent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.recordTitle, { color: colors.textPrimary }]}>{doc.name}</Text>
                      <View style={styles.recordMeta}>
                        <Ionicons name="folder-outline" size={11} color={colors.textMuted} />
                        <Text style={[styles.recordMetaText, { color: colors.textSecondary }]}>{doc.type}</Text>
                        {doc.date && (
                          <>
                            <View style={[styles.metaDot, { backgroundColor: colors.glassBorder }]} />
                            <Ionicons name="calendar-outline" size={11} color={colors.textMuted} />
                            <Text style={[styles.recordMetaText, { color: colors.textSecondary }]}>{doc.date}</Text>
                          </>
                        )}
                      </View>
                      {doc.notes && (
                        <Text style={[styles.recordNotes, { color: colors.textMuted }]} numberOfLines={1}>
                          {doc.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}

      {/* ── Vaccine Modal ───────────────────────────────────────────────────── */}
      <Modal isOpen={showV} onClose={() => setShowV(false)} title="Registrar Vacuna">
        <View style={{ gap: 12 }}>
          <FSelect label="Tipo de Vacuna" required value={vf.type} options={VT_OPTS} onChange={v => setVf((p: any) => ({ ...p, type: v }))} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}><FInput label="Fecha Aplicación" required placeholder="YYYY-MM-DD" {...fv('date')} /></View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}><FInput label="Próxima Dosis" placeholder="YYYY-MM-DD" {...fv('nextDate')} /></View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}><FInput label="Veterinario" placeholder="Nombre del vet." {...fv('vet')} /></View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}><FInput label="Lote / Batch" placeholder="Código" {...fv('batch')} /></View>
          </View>
          <FTextarea label="Observaciones" placeholder="Reacciones, dosis especiales..." {...fv('notes')} />
          <View style={styles.modalButtons}>
            <Button variant="secondary" onPress={() => setShowV(false)}>Cancelar</Button>
            <Button onPress={addVaccine} disabled={!vf.type || !vf.date}>Registrar</Button>
          </View>
        </View>
      </Modal>

      {/* ── Document Modal ──────────────────────────────────────────────────── */}
      <Modal isOpen={showD} onClose={() => setShowD(false)} title="Subir Documento">
        <View style={{ gap: 12 }}>
          <FInput label="Nombre del Documento" required placeholder="Ej: Análisis de Sangre Completo" {...fd('name')} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FSelect label="Tipo" value={df.type} options={DOC_OPTS} onChange={v => setDf((p: any) => ({ ...p, type: v }))} />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <FInput label="Fecha" placeholder="YYYY-MM-DD" {...fd('date')} />
            </View>
          </View>
          <FTextarea label="Notas / Resumen" placeholder="Observaciones del veterinario..." {...fd('notes')} />
          <View style={styles.modalButtons}>
            <Button variant="secondary" onPress={() => setShowD(false)}>Cancelar</Button>
            <Button onPress={addDoc} disabled={!df.name}>Guardar</Button>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function GlobalStat({ value, label, color, icon, colors }: any) {
  return (
    <View style={styles.gsItem}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.gsVal, { color }]}>{value}</Text>
      <Text style={[styles.gsLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  )
}

function SectionHeader({ icon, title, count, onAdd, colors, accent, style }: any) {
  return (
    <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={[{ width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: accent + '18' }]}>
          <Ionicons name={icon} size={15} color={accent} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>{title}</Text>
        <View style={[{ backgroundColor: accent, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }]}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{count}</Text>
        </View>
      </View>
      <Button size="sm" onPress={onAdd}>Agregar</Button>
    </View>
  )
}

function EmptyBlock({ icon, text, colors }: any) {
  return (
    <View style={[styles.emptyBlock, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
      <Ionicons name={icon} size={28} color={colors.textMuted} />
      <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6 }}>{text}</Text>
    </View>
  )
}

function StatusTag({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.statusTag, { backgroundColor: color + '18' }]}>
      <Text style={[styles.statusTagText, { color }]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen:      { flex: 1 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  headerSub:   { fontSize: 12, marginTop: 3 },
  alertBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  alertBadgeText: { fontSize: 12, fontWeight: '700' },

  globalStats: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  gsItem:      { flex: 1, alignItems: 'center', gap: 3 },
  gsVal:       { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  gsLabel:     { fontSize: 10, fontWeight: '600' },
  gsDivider:   { width: 1, height: 28 },

  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyIconBox:{ width: 68, height: 68, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  emptyTitle:  { fontSize: 18, fontWeight: '800' },
  emptyText:   { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  petChip:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  petChipAvatar: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  petChipAlert:  { position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
  petChipName:   { fontSize: 13, fontWeight: '700' },
  petChipSub:    { fontSize: 10, marginTop: 1 },

  petSummaryCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 20 },
  petSummaryAvatar:{ width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  petSummaryName:  { fontSize: 15, fontWeight: '800' },
  petSummarySub:   { fontSize: 12, marginTop: 1 },
  petSummaryStats: { alignItems: 'center', paddingHorizontal: 12 },
  petSummaryStatVal:{ fontSize: 20, fontWeight: '800' },
  petSummaryStatLabel:{ fontSize: 9, fontWeight: '600', marginTop: 1 },

  recordCard:    { marginBottom: 10, borderRadius: RADIUS.md, borderWidth: 1, overflow: 'hidden', flexDirection: 'row' },
  recordStripe:  { width: 4 },
  recordBody:    { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  recordIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recordTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' },
  recordTitle:   { fontWeight: '700', fontSize: 14 },
  recordMeta:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  recordMetaText:{ fontSize: 12 },
  metaDot:       { width: 3, height: 3, borderRadius: 2 },
  recordNotes:   { fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  statusTag:     { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  statusTagText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  deleteBtn:     { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBlock:    { alignItems: 'center', padding: 28, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 12, gap: 4 },

  row:           { flexDirection: 'row' },
  modalButtons:  { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
})
