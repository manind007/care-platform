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
  fetchClientWounds, 
  fetchAllWounds, 
  recordWoundAssessment, 
  fetchClients 
} from '../api/client';
import { 
  Crosshair, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  Plus, 
  X, 
  Activity, 
  CheckCircle2, 
  TrendingUp, 
  FileText,
  User
} from 'lucide-react';

export const WoundCareScreen = ({ currentPersona, activeClient }) => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(activeClient?.id || 1);
  const [wounds, setWounds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [anatomicalLocation, setAnatomicalLocation] = useState('Sacrum');
  const [woundType, setWoundType] = useState('PRESSURE_ULCER');
  const [stage, setStage] = useState('STAGE_2');
  const [lengthCm, setLengthCm] = useState('2.0');
  const [widthCm, setWidthCm] = useState('1.5');
  const [depthCm, setDepthCm] = useState('0.3');
  const [exudateAmount, setExudateAmount] = useState('LOW');
  const [exudateType, setExudateType] = useState('SEROUS');
  const [tissueType, setTissueType] = useState('GRANULATION');
  const [dressingType, setDressingType] = useState('Mepilex Border Sacrum & Barrier Film');
  const [dressingFreq, setDressingFreq] = useState('EVERY_3_DAYS');
  const [healingStatus, setHealingStatus] = useState('IMPROVING');
  const [clinicalNotes, setClinicalNotes] = useState('Granulation bed clean and healthy pink. Periwound skin intact.');

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
      loadWounds(selectedClientId);
    }
  }, [selectedClientId]);

  const loadWounds = async (cId) => {
    try {
      setLoading(true);
      const data = await fetchClientWounds(cId);
      setWounds(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWound = async () => {
    try {
      await recordWoundAssessment({
        clientId: selectedClientId,
        woundNumber: `WOUND-${wounds.length + 1}`,
        anatomicalLocation,
        woundType,
        stage,
        lengthCm: parseFloat(lengthCm) || 1.0,
        widthCm: parseFloat(widthCm) || 1.0,
        depthCm: parseFloat(depthCm) || 0.1,
        exudateAmount,
        exudateType,
        tissueType,
        dressingType,
        dressingFrequency: dressingFreq,
        healingStatus,
        assessedBy: 'Clara Oswald, RN (Tissue Viability Nurse)',
        clinicalNotes
      });

      setModalVisible(false);
      loadWounds(selectedClientId);
      alert('Wound assessment successfully documented in tissue viability ledger.');
    } catch (err) {
      alert(err.message || 'Failed to record wound');
    }
  };

  const currentClientObj = clients.find(c => c.id === selectedClientId) || clients[0];
  const stage3or4Count = wounds.filter(w => w.stage === 'STAGE_3' || w.stage === 'STAGE_4' || w.stage === 'UNSTAGEABLE').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header Card */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.badge}>
                <Crosshair size={12} color="#0D9488" />
                <Text style={styles.badgeText}>BIRDIE & PASS CARE BENCHMARKED</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <ShieldCheck size={12} color="#1D4ED8" />
                <Text style={[styles.badgeText, { color: '#1D4ED8' }]}>NPUAP / EPUAP STAGING</Text>
              </View>
            </View>
            <Text style={styles.title}>Wound Care & Tissue Viability Management</Text>
            <Text style={styles.subtitle}>
              Anatomical body map location tracking, ulcer staging, photographic dimension progression, and dressing protocols for hospital and home care.
            </Text>
          </View>

          {/* Client Selector & Add Assessment Button */}
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
              <Text style={styles.addBtnText}>New Wound Assessment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 2. Metrics Strip */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>ACTIVE WOUNDS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={styles.metricNum}>{wounds.length}</Text>
            <Text style={styles.metricSub}>Recorded Sites</Text>
          </View>
        </View>

        <View style={[styles.metricCard, stage3or4Count > 0 && { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}>
          <Text style={[styles.metricLabel, stage3or4Count > 0 && { color: '#991B1B' }]}>HIGH SEVERITY (STAGE 3/4)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={[styles.metricNum, stage3or4Count > 0 && { color: '#DC2626' }]}>{stage3or4Count}</Text>
            <Text style={[styles.metricSub, stage3or4Count > 0 && { color: '#991B1B' }]}>Requires Tissue Viability Lead</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>HEALING PROGRESSION</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={styles.metricNum}>
              {wounds.filter(w => w.healingStatus === 'IMPROVING').length}
            </Text>
            <Text style={styles.metricSub}>Improving Trajectory</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>DRESSING PROTOCOL</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={[styles.metricNum, { fontSize: 18, color: '#0D9488' }]}>Every 3 Days</Text>
            <Text style={styles.metricSub}>Silver Hydrofiber</Text>
          </View>
        </View>
      </View>

      {/* 3. Anatomical Body Map Guide Banner */}
      <View style={styles.bodyMapBanner}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MapPin size={18} color="#0F766E" />
          <Text style={styles.bodyMapTitle}>ANATOMICAL PRESSURE POINT SURVEILLANCE MATRIX</Text>
        </View>
        <Text style={styles.bodyMapSub}>
          Common pressure ulcer vulnerability sites: Sacrum / Coccyx • Left/Right Ischial Tuberosity • Left/Right Greater Trochanter • Bilateral Calcaneous (Heels) • Lateral Malleoli.
        </Text>
      </View>

      {/* 4. Wounds Ledger */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
      ) : wounds.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No active wounds documented for {currentClientObj?.firstName} {currentClientObj?.lastName}. Skin integrity fully intact.</Text>
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          {wounds.map(wound => (
            <View key={wound.id} style={styles.woundCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={styles.locationTitle}>{wound.anatomicalLocation} ({wound.woundNumber})</Text>
                    <View style={[
                      styles.stageBadge,
                      wound.stage === 'STAGE_1' && { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
                      wound.stage === 'STAGE_2' && { backgroundColor: '#FFEDD5', borderColor: '#FDBA74' },
                      wound.stage === 'STAGE_3' && { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
                      wound.stage === 'STAGE_4' && { backgroundColor: '#7F1D1D', borderColor: '#991B1B' }
                    ]}>
                      <Text style={[
                        styles.stageText,
                        wound.stage === 'STAGE_1' && { color: '#B45309' },
                        wound.stage === 'STAGE_2' && { color: '#C2410C' },
                        wound.stage === 'STAGE_3' && { color: '#DC2626' },
                        wound.stage === 'STAGE_4' && { color: '#FFFFFF' }
                      ]}>{wound.stage.replace('_', ' ')}</Text>
                    </View>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{wound.woundType.replace('_', ' ')}</Text>
                    </View>
                  </View>
                  <Text style={styles.dimensionsText}>
                    Dimensions: <Text style={{ fontWeight: '700', color: colors.secondary }}>{wound.lengthCm}cm (L) x {wound.widthCm}cm (W) x {wound.depthCm}cm (D)</Text>
                  </Text>
                  <Text style={styles.exudateText}>
                    Exudate: {wound.exudateAmount} {wound.exudateType} • Tissue Bed: {wound.tissueType}
                  </Text>
                  <Text style={styles.dressingText}>
                    Dressing Plan: <Text style={{ fontWeight: '700', color: '#0F766E' }}>{wound.dressingType}</Text> ({wound.dressingFrequency.replace('_', ' ')})
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={[styles.healingBadge, wound.healingStatus === 'IMPROVING' ? styles.healingBadgeGreen : styles.healingBadgeAmber]}>
                    <TrendingUp size={12} color={wound.healingStatus === 'IMPROVING' ? '#059669' : '#D97706'} />
                    <Text style={[styles.healingText, wound.healingStatus === 'IMPROVING' ? styles.healingTextGreen : styles.healingTextAmber]}>
                      {wound.healingStatus}
                    </Text>
                  </View>
                  <Text style={styles.assessorText}>Assessed by: {wound.assessedBy}</Text>
                  <Text style={styles.assessorDate}>Date: {wound.assessmentDate}</Text>
                </View>
              </View>

              {wound.clinicalNotes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>CLINICAL OBSERVATION & TISSUE VIABILITY NOTES:</Text>
                  <Text style={styles.notesBody}>{wound.clinicalNotes}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* MODAL: RECORD WOUND ASSESSMENT */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Document Wound Assessment & Staging</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Recording clinical wound profile for <Text style={{ fontWeight: '700' }}>{currentClientObj?.firstName} {currentClientObj?.lastName}</Text>.
              </Text>

              <View style={{ gap: 10, marginTop: 10 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.inputLabel}>ANATOMICAL SITE *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={anatomicalLocation}
                      onChangeText={setAnatomicalLocation}
                      placeholder="Sacrum, Left Heel, etc."
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>WOUND TYPE</Text>
                    <TextInput
                      style={styles.textInput}
                      value={woundType}
                      onChangeText={setWoundType}
                      placeholder="PRESSURE_ULCER"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>STAGE (I - IV)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={stage}
                      onChangeText={setStage}
                      placeholder="STAGE_2"
                    />
                  </View>
                </View>

                {/* Dimensions */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>LENGTH (cm)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={lengthCm}
                      onChangeText={setLengthCm}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>WIDTH (cm)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={widthCm}
                      onChangeText={setWidthCm}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>DEPTH (cm)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={depthCm}
                      onChangeText={setDepthCm}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Exudate & Tissue */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>EXUDATE AMOUNT</Text>
                    <TextInput
                      style={styles.textInput}
                      value={exudateAmount}
                      onChangeText={setExudateAmount}
                      placeholder="LOW, MODERATE, HEAVY"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>EXUDATE TYPE</Text>
                    <TextInput
                      style={styles.textInput}
                      value={exudateType}
                      onChangeText={setExudateType}
                      placeholder="SEROUS, PURULENT"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>TISSUE BED</Text>
                    <TextInput
                      style={styles.textInput}
                      value={tissueType}
                      onChangeText={setTissueType}
                      placeholder="GRANULATION"
                    />
                  </View>
                </View>

                {/* Dressing */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.inputLabel}>PRIMARY & SECONDARY DRESSING *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={dressingType}
                      onChangeText={setDressingType}
                      placeholder="e.g. Aquacel Ag & Mepilex Border"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>FREQUENCY</Text>
                    <TextInput
                      style={styles.textInput}
                      value={dressingFreq}
                      onChangeText={setDressingFreq}
                      placeholder="EVERY_3_DAYS"
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.inputLabel}>CLINICAL OBSERVATION NOTES</Text>
                  <TextInput
                    style={[styles.textInput, { height: 70 }]}
                    multiline
                    value={clinicalNotes}
                    onChangeText={setClinicalNotes}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleCreateWound}>
                  <Text style={styles.submitBtnText}>Commit Wound Assessment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
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
    backgroundColor: '#0D9488',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  metricNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  bodyMapBanner: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  bodyMapTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.5,
  },
  bodyMapSub: {
    fontSize: 12,
    color: '#134E4A',
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  woundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  stageBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stageText: {
    fontSize: 10,
    fontWeight: '800',
  },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  dimensionsText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  },
  exudateText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dressingText: {
    fontSize: 12,
    color: '#334155',
    marginTop: 4,
  },
  healingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  healingBadgeGreen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  healingBadgeAmber: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  healingText: {
    fontSize: 10,
    fontWeight: '800',
  },
  healingTextGreen: {
    color: '#059669',
  },
  healingTextAmber: {
    color: '#D97706',
  },
  assessorText: {
    fontSize: 11,
    color: '#64748B',
  },
  assessorDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 3,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  notesBody: {
    fontSize: 12,
    color: '#334155',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 600,
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
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
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
    backgroundColor: '#0D9488',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

