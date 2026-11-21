import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ActivityIndicator 
} from 'react-native';
import { colors } from '../theme/colors';
import { 
  fetchFluidHistory, 
  fetchTodayFluidSummary, 
  recordFluidEntry, 
  fetchClients 
} from '../api/client';
import { 
  Droplet, 
  AlertTriangle, 
  CheckCircle2, 
  Coffee, 
  Clock, 
  Plus, 
  X, 
  Utensils, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  User
} from 'lucide-react';

export const FluidBalanceScreen = ({ currentPersona, activeClient }) => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(activeClient?.id || 1);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [entryType, setEntryType] = useState('INTAKE');
  const [volumeMl, setVolumeMl] = useState('250');
  const [fluidDescription, setFluidDescription] = useState('Cup of Tea with skimmed milk');
  const [targetVolume, setTargetVolume] = useState('1800');
  const [dietTexture, setDietTexture] = useState('REGULAR');
  const [fluidThickness, setFluidThickness] = useState('NORMAL');
  const [notes, setNotes] = useState('Offered during morning round; client drank willingly.');

  useEffect(() => {
    fetchClients().then(data => {
      setClients(data || []);
      if (data && data.length > 0 && !selectedClientId) {
        setSelectedClientId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadFluidData(selectedClientId);
    }
  }, [selectedClientId]);

  const loadFluidData = async (cId) => {
    try {
      setLoading(true);
      const [sumData, histData] = await Promise.all([
        fetchTodayFluidSummary(cId).catch(() => null),
        fetchFluidHistory(cId).catch(() => [])
      ]);
      setSummary(sumData);
      setHistory(histData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecord = async () => {
    try {
      await recordFluidEntry(selectedClientId, {
        entryType,
        volumeMl: parseInt(volumeMl, 10) || 200,
        fluidDescription,
        targetDailyVolumeMl: parseInt(targetVolume, 10) || 1800,
        dietTexture,
        fluidThickness,
        recordedBy: currentPersona?.fullName || 'Emily Watson (Senior Carer)',
        notes
      });
      setModalVisible(false);
      loadFluidData(selectedClientId);
      alert(`${entryType === 'INTAKE' ? 'Fluid Intake' : 'Fluid Output'} of ${volumeMl}ml recorded successfully.`);
    } catch (err) {
      alert(err.message || 'Failed to record entry');
    }
  };

  const handleQuickLog = async (type, vol, desc) => {
    try {
      await recordFluidEntry(selectedClientId, {
        entryType: type,
        volumeMl: vol,
        fluidDescription: desc,
        targetDailyVolumeMl: summary?.targetMl || 1800,
        dietTexture,
        fluidThickness,
        recordedBy: currentPersona?.fullName || 'Emily Watson (Senior Carer)',
        notes: `Quick-logged ${desc}`
      });
      loadFluidData(selectedClientId);
      alert(`Quick logged ${vol}ml ${desc}`);
    } catch (err) {
      alert(err.message || 'Quick log failed');
    }
  };

  const currentClientObj = clients.find(c => c.id === selectedClientId) || clients[0];
  const percentAchieved = summary?.percentAchieved || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header Card */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.badge}>
                <Droplet size={12} color="#0284C7" />
                <Text style={styles.badgeText}>BIRDIE & EPIC BENCHMARKED</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                <Utensils size={12} color="#059669" />
                <Text style={[styles.badgeText, { color: '#059669' }]}>IDDSI DYSPHAGIA STANDARDS</Text>
              </View>
            </View>
            <Text style={styles.title}>Hydration, Nutrition & Fluid Balance Ledger</Text>
            <Text style={styles.subtitle}>
              24-hour target fluid volume tracking, intake vs output fluid meter, dehydration risk alerts & IDDSI diet guidelines for home and hospital care.
            </Text>
          </View>

          {/* Client Selector & Log Fluid Action */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <View style={styles.clientSelectorContainer}>
              <Text style={styles.selectorLabel}>PATIENT RECORD:</Text>
              <View style={styles.clientTabs}>
                {clients.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.clientTab, selectedClientId === c.id && styles.clientTabActive]}
                    onPress={() => setSelectedClientId(c.id)}
                  >
                    <User size={13} color={selectedClientId === c.id ? colors.primaryDark : colors.textMuted} />
                    <Text style={[styles.clientTabText, selectedClientId === c.id && styles.clientTabTextActive]}>
                      {c.firstName} {c.lastName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => setModalVisible(true)}
            >
              <Plus size={16} color="#FFF" />
              <Text style={styles.addBtnText}>Log Fluid Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 2. Today's Hydration Target Progress Card */}
      <View style={styles.progressCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <View>
            <Text style={styles.progressTitle}>TODAY'S 24-HOUR HYDRATION PROGRESS ({summary?.date || 'Today'})</Text>
            <Text style={styles.progressSub}>Daily Clinical Target: {summary?.targetMl || 1800} ml / 24 hours</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.percentText}>{percentAchieved}% of Daily Target</Text>
            <Text style={styles.percentSub}>{summary?.totalIntakeMl || 0} ml consumed</Text>
          </View>
        </View>

        {/* Visual Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${Math.min(100, percentAchieved)}%` }]} />
        </View>

        {/* Dehydration Warning Alert */}
        {summary?.dehydrationRiskAlert && (
          <View style={styles.dehydrationAlert}>
            <AlertTriangle size={16} color="#DC2626" />
            <Text style={styles.dehydrationAlertText}>
              DEHYDRATION RISK ALERT: Fluid intake is currently under 50% of the daily minimum requirement. Offer preferred fluids and review with care coordinator.
            </Text>
          </View>
        )}

        {/* Intake vs Output Summary Grid */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ArrowUpRight size={14} color="#059669" />
              <Text style={styles.summaryColLabel}>TOTAL INTAKE</Text>
            </View>
            <Text style={[styles.summaryColVal, { color: '#059669' }]}>{summary?.totalIntakeMl || 0} ml</Text>
          </View>

          <View style={styles.summaryCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ArrowDownRight size={14} color="#D97706" />
              <Text style={styles.summaryColLabel}>TOTAL OUTPUT</Text>
            </View>
            <Text style={[styles.summaryColVal, { color: '#D97706' }]}>{summary?.totalOutputMl || 0} ml</Text>
          </View>

          <View style={styles.summaryCol}>
            <Text style={styles.summaryColLabel}>NET FLUID BALANCE</Text>
            <Text style={[styles.summaryColVal, { color: '#0284C7' }]}>
              {(summary?.netBalanceMl || 0) > 0 ? `+${summary?.netBalanceMl}` : summary?.netBalanceMl || 0} ml
            </Text>
          </View>

          <View style={styles.summaryCol}>
            <Text style={styles.summaryColLabel}>TARGET DEFICIT</Text>
            <Text style={styles.summaryColVal}>{Math.max(0, (summary?.targetMl || 1800) - (summary?.totalIntakeMl || 0))} ml to go</Text>
          </View>
        </View>

        {/* Quick Log Buttons */}
        <View style={styles.quickLogRow}>
          <Text style={styles.quickLogLabel}>QUICK PROMPT:</Text>
          <TouchableOpacity 
            style={styles.quickBtn}
            onPress={() => handleQuickLog('INTAKE', 250, 'Cup of Tea')}
          >
            <Coffee size={13} color="#0284C7" />
            <Text style={styles.quickBtnText}>+250ml Tea</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickBtn}
            onPress={() => handleQuickLog('INTAKE', 200, 'Fresh Water')}
          >
            <Droplet size={13} color="#0284C7" />
            <Text style={styles.quickBtnText}>+200ml Water</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickBtn}
            onPress={() => handleQuickLog('INTAKE', 300, 'Ensure High-Protein Drink')}
          >
            <Utensils size={13} color="#059669" />
            <Text style={[styles.quickBtnText, { color: '#059669' }]}>+300ml Ensure Shake</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickBtn, { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }]}
            onPress={() => handleQuickLog('OUTPUT', 350, 'Urine Void')}
          >
            <ArrowDownRight size={13} color="#D97706" />
            <Text style={[styles.quickBtnText, { color: '#D97706' }]}>-350ml Void</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Fluid Balance Ledger History */}
      <View style={{ gap: 12 }}>
        <Text style={styles.sectionTitle}>FLUID TRANSACTION LEDGER & OBSERVATION NOTES</Text>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : history.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No fluid transactions recorded yet.</Text>
          </View>
        ) : (
          history.map(item => (
            <View key={item.id} style={styles.historyRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[
                  styles.entryTypeBadge,
                  item.entryType === 'INTAKE' && { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
                  item.entryType === 'OUTPUT' && { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }
                ]}>
                  {item.entryType === 'INTAKE' ? (
                    <ArrowUpRight size={14} color="#059669" />
                  ) : (
                    <ArrowDownRight size={14} color="#D97706" />
                  )}
                  <Text style={[
                    styles.entryTypeText,
                    item.entryType === 'INTAKE' ? { color: '#059669' } : { color: '#D97706' }
                  ]}>{item.entryType} ({item.volumeMl}ml)</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.descTitle}>{item.fluidDescription}</Text>
                  <Text style={styles.metaText}>
                    Logged at {new Date(item.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {item.recordedBy}
                  </Text>
                  {item.notes && <Text style={styles.notesText}>{item.notes}</Text>}
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.dietTag}>{item.dietTexture}</Text>
                  <Text style={styles.thicknessTag}>{item.fluidThickness}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* MODAL: LOG FLUID ENTRY */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Hydration & Fluid Transaction</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10, marginTop: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[styles.typeOption, entryType === 'INTAKE' && styles.typeOptionActive]}
                  onPress={() => setEntryType('INTAKE')}
                >
                  <ArrowUpRight size={16} color={entryType === 'INTAKE' ? '#059669' : '#64748B'} />
                  <Text style={[styles.typeOptionText, entryType === 'INTAKE' && { color: '#059669', fontWeight: '800' }]}>
                    Fluid Intake
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeOption, entryType === 'OUTPUT' && styles.typeOptionActive]}
                  onPress={() => setEntryType('OUTPUT')}
                >
                  <ArrowDownRight size={16} color={entryType === 'OUTPUT' ? '#D97706' : '#64748B'} />
                  <Text style={[styles.typeOptionText, entryType === 'OUTPUT' && { color: '#D97706', fontWeight: '800' }]}>
                    Fluid Output
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>VOLUME (ML) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={volumeMl}
                    onChangeText={setVolumeMl}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 2 }}>
                  <Text style={styles.inputLabel}>FLUID / BEVERAGE DESCRIPTION *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={fluidDescription}
                    onChangeText={setFluidDescription}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>DIET TEXTURE (IDDSI)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={dietTexture}
                    onChangeText={setDietTexture}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>FLUID THICKNESS</Text>
                  <TextInput
                    style={styles.textInput}
                    value={fluidThickness}
                    onChangeText={setFluidThickness}
                  />
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>OBSERVATION NOTES</Text>
                <TextInput
                  style={[styles.textInput, { height: 60 }]}
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleRecord}>
                <Text style={styles.submitBtnText}>Commit Entry to Ledger</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 24,
    gap: 18,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    maxWidth: 900,
  },
  clientSelectorContainer: {
    gap: 4,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  clientTabs: {
    flexDirection: 'row',
    gap: 6,
  },
  clientTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  clientTabActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  clientTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  clientTabTextActive: {
    color: '#4338CA',
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    gap: 14,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  percentText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0284C7',
  },
  percentSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 6,
  },
  dehydrationAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 10,
  },
  dehydrationAlertText: {
    fontSize: 11,
    color: '#991B1B',
    fontWeight: '700',
    flex: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  summaryCol: {
    flex: 1,
    minWidth: 130,
    gap: 4,
  },
  summaryColLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  summaryColVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  quickLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  quickLogLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
  historyRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  entryTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  entryTypeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  descTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  notesText: {
    fontSize: 11,
    color: '#334155',
    fontStyle: 'italic',
    marginTop: 2,
  },
  dietTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  thicknessTag: {
    fontSize: 10,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  typeOptionActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0284C7',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

