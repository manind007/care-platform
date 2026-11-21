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
  fetchVirtualWardStays, 
  admitVirtualWardPatient, 
  recordVirtualWardRemoteRound, 
  dischargeVirtualWardPatient,
  fetchClients 
} from '../api/client';
import { 
  Radio, 
  Activity, 
  HeartPulse, 
  Stethoscope, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  LogOut, 
  X, 
  Sparkles,
  Wifi,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

export const VirtualWardScreen = ({ currentPersona, activeClient }) => {
  const [stays, setStays] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [admitModalVisible, setAdmitModalVisible] = useState(false);
  const [roundModalVisible, setRoundModalVisible] = useState(false);
  const [selectedStay, setSelectedStay] = useState(null);

  // Form states - Admit
  const [admitClientId, setAdmitClientId] = useState('1');
  const [admitClientName, setAdmitClientName] = useState('Margaret Higgins');
  const [admitWardName, setAdmitWardName] = useState('Frailty & Step-Down Virtual Ward');
  const [admitConsultant, setAdmitConsultant] = useState('Dr. Sarah Jenkins (Consultant Geriatrician)');
  const [admitNurse, setAdmitNurse] = useState('Clara Oswald, RN');
  const [admitDeviceId, setAdmitDeviceId] = useState('RPM-DOCK-8842');
  const [admitAcuity, setAdmitAcuity] = useState('MEDIUM');

  // Form states - Remote Round
  const [roundNotes, setRoundNotes] = useState('');
  const [roundSpo2, setRoundSpo2] = useState('96');
  const [roundHeartRate, setRoundHeartRate] = useState('74');
  const [roundBp, setRoundBp] = useState('124/82');
  const [roundTemp, setRoundTemp] = useState('36.8');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staysData, clientsData] = await Promise.all([
        fetchVirtualWardStays().catch(() => []),
        fetchClients().catch(() => [])
      ]);
      setStays(staysData || []);
      setClients(clientsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdmit = async () => {
    try {
      await admitVirtualWardPatient({
        clientId: parseInt(admitClientId, 10),
        clientName: admitClientName,
        virtualWardName: admitWardName,
        admittingConsultant: admitConsultant,
        leadCommunityNurse: admitNurse,
        telemetryDeviceId: admitDeviceId,
        acuityLevel: admitAcuity,
        latestSpo2: 97,
        latestHeartRate: 72,
        latestBloodPressure: '120/80',
        latestTemperature: 36.6,
        status: 'ADMITTED'
      });
      setAdmitModalVisible(false);
      loadData();
      alert(`Patient ${admitClientName} admitted to ${admitWardName}!`);
    } catch (err) {
      alert(err.message || 'Admission failed');
    }
  };

  const handleRecordRound = async () => {
    if (!selectedStay) return;
    try {
      await recordVirtualWardRemoteRound(selectedStay.id, {
        notes: roundNotes || 'Remote consultant ward round completed.',
        spo2: parseInt(roundSpo2, 10) || null,
        heartRate: parseInt(roundHeartRate, 10) || null,
        bp: roundBp,
        temp: parseFloat(roundTemp) || null
      });
      setRoundModalVisible(false);
      setRoundNotes('');
      loadData();
      alert(`Remote ward round logged for ${selectedStay.clientName}.`);
    } catch (err) {
      alert(err.message || 'Round recording failed');
    }
  };

  const handleDischarge = async (stay) => {
    if (!confirm(`Discharge ${stay.clientName} from Virtual Ward to standard home care?`)) return;
    try {
      await dischargeVirtualWardPatient(stay.id, 'Patient successfully completed acute step-down monitoring and stepped down to standard home care.');
      loadData();
      alert(`${stay.clientName} discharged from Virtual Ward.`);
    } catch (err) {
      alert(err.message || 'Discharge failed');
    }
  };

  const activeStays = stays.filter(s => s.status !== 'DISCHARGED');
  const highAcuityCount = activeStays.filter(s => s.acuityLevel === 'HIGH' || s.status === 'ESCALATED_TO_ED').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header Card */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.liveBadge}>
                <Wifi size={12} color="#059669" />
                <Text style={styles.liveBadgeText}>LIVE TELEMETRY STREAM</Text>
              </View>
              <View style={[styles.liveBadge, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Radio size={12} color="#1D4ED8" />
                <Text style={[styles.liveBadgeText, { color: '#1D4ED8' }]}>ALAYACARE & EPIC BENCHMARKED</Text>
              </View>
            </View>
            <Text style={styles.title}>Virtual Ward & Hospital-at-Home (HaH) Command Center</Text>
            <Text style={styles.subtitle}>
              Acute inpatient-level care delivered in the patient's residence: continuous biometric monitoring, daily consultant remote ward rounds, and rapid step-down.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.admitBtn}
            onPress={() => setAdmitModalVisible(true)}
          >
            <UserPlus size={16} color="#FFF" />
            <Text style={styles.admitBtnText}>Admit Patient to HaH</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Key Metrics Strip */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>ACTIVE VIRTUAL BEDS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={styles.metricNum}>{activeStays.length}</Text>
            <Text style={styles.metricSub}>Patients at Home</Text>
          </View>
        </View>

        <View style={[styles.metricCard, highAcuityCount > 0 && { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}>
          <Text style={[styles.metricLabel, highAcuityCount > 0 && { color: '#991B1B' }]}>HIGH ACUITY ALERTS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={[styles.metricNum, highAcuityCount > 0 && { color: '#DC2626' }]}>{highAcuityCount}</Text>
            <Text style={[styles.metricSub, highAcuityCount > 0 && { color: '#991B1B' }]}>Requires Consultant Review</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>REMOTE ROUNDS TODAY</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={styles.metricNum}>
              {stays.filter(s => s.lastRemoteRoundTime && new Date(s.lastRemoteRoundTime).toDateString() === new Date().toDateString()).length}
            </Text>
            <Text style={styles.metricSub}>Consultant Signed</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>TOTAL HISTORICAL DISCHARGES</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={styles.metricNum}>{stays.filter(s => s.status === 'DISCHARGED').length}</Text>
            <Text style={styles.metricSub}>Safely Stepped Down</Text>
          </View>
        </View>
      </View>

      {/* 3. Active Virtual Ward Patients */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
      ) : activeStays.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No patients currently admitted to the Virtual Ward.</Text>
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          {activeStays.map(stay => {
            const isCritical = stay.latestSpo2 && stay.latestSpo2 < 92;
            return (
              <View key={stay.id} style={[styles.stayCard, isCritical && styles.stayCardCritical]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.patientName}>{stay.clientName}</Text>
                      <View style={[
                        styles.acuityBadge,
                        stay.acuityLevel === 'HIGH' && { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
                        stay.acuityLevel === 'MEDIUM' && { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
                        stay.acuityLevel === 'LOW' && { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }
                      ]}>
                        <Text style={[
                          styles.acuityText,
                          stay.acuityLevel === 'HIGH' && { color: '#DC2626' },
                          stay.acuityLevel === 'MEDIUM' && { color: '#D97706' },
                          stay.acuityLevel === 'LOW' && { color: '#059669' }
                        ]}>{stay.acuityLevel} ACUITY</Text>
                      </View>
                      <View style={styles.wardTag}>
                        <Text style={styles.wardTagText}>{stay.virtualWardName}</Text>
                      </View>
                    </View>
                    <Text style={styles.doctorText}>
                      Lead Consultant: <Text style={{ fontWeight: '700', color: colors.secondary }}>{stay.admittingConsultant}</Text> • Community RN: {stay.leadCommunityNurse}
                    </Text>
                    <Text style={styles.deviceText}>Telemetry Device: {stay.telemetryDeviceId || 'N/A'}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={styles.roundActionBtn}
                      onPress={() => {
                        setSelectedStay(stay);
                        setRoundSpo2(stay.latestSpo2 ? stay.latestSpo2.toString() : '96');
                        setRoundHeartRate(stay.latestHeartRate ? stay.latestHeartRate.toString() : '74');
                        setRoundBp(stay.latestBloodPressure || '124/82');
                        setRoundTemp(stay.latestTemperature ? stay.latestTemperature.toString() : '36.8');
                        setRoundModalVisible(true);
                      }}
                    >
                      <Stethoscope size={14} color="#FFF" />
                      <Text style={styles.roundActionBtnText}>Conduct Round</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dischargeActionBtn}
                      onPress={() => handleDischarge(stay)}
                    >
                      <LogOut size={14} color="#DC2626" />
                      <Text style={styles.dischargeActionBtnText}>Step Down</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Biometric Telemetry Strip */}
                <View style={styles.telemetryGrid}>
                  <View style={[styles.vitalsBox, stay.latestSpo2 && stay.latestSpo2 < 92 && { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
                    <Text style={styles.vitalLabel}>SpO2 SATURATION</Text>
                    <Text style={[styles.vitalVal, stay.latestSpo2 && stay.latestSpo2 < 92 && { color: '#DC2626' }]}>
                      {stay.latestSpo2 || 96}%
                    </Text>
                    <Text style={styles.vitalSub}>Target: &gt;94%</Text>
                  </View>

                  <View style={styles.vitalsBox}>
                    <Text style={styles.vitalLabel}>HEART RATE</Text>
                    <Text style={styles.vitalVal}>{stay.latestHeartRate || 74} bpm</Text>
                    <Text style={styles.vitalSub}>Target: 60-100</Text>
                  </View>

                  <View style={styles.vitalsBox}>
                    <Text style={styles.vitalLabel}>BLOOD PRESSURE</Text>
                    <Text style={styles.vitalVal}>{stay.latestBloodPressure || '124/82'}</Text>
                    <Text style={styles.vitalSub}>mmHg</Text>
                  </View>

                  <View style={styles.vitalsBox}>
                    <Text style={styles.vitalLabel}>TEMPERATURE</Text>
                    <Text style={styles.vitalVal}>{stay.latestTemperature || 36.8} °C</Text>
                    <Text style={styles.vitalSub}>Target: 36.1-37.5</Text>
                  </View>
                </View>

                {/* Last Round Notes */}
                {stay.remoteRoundNotes && (
                  <View style={styles.roundNotesBox}>
                    <Text style={styles.roundNotesTitle}>
                      LATEST REMOTE WARD ROUND ({stay.lastRemoteRoundTime ? new Date(stay.lastRemoteRoundTime).toLocaleString() : 'Today'}):
                    </Text>
                    <Text style={styles.roundNotesText}>{stay.remoteRoundNotes}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* MODAL 1: ADMIT PATIENT TO VIRTUAL WARD */}
      <Modal visible={admitModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Admit Acute Patient to Virtual Ward</Text>
              <TouchableOpacity onPress={() => setAdmitModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10, marginTop: 10 }}>
              <View>
                <Text style={styles.inputLabel}>PATIENT NAME</Text>
                <TextInput
                  style={styles.textInput}
                  value={admitClientName}
                  onChangeText={setAdmitClientName}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>VIRTUAL WARD SPECIALTY</Text>
                <TextInput
                  style={styles.textInput}
                  value={admitWardName}
                  onChangeText={setAdmitWardName}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>ADMITTING CONSULTANT</Text>
                  <TextInput
                    style={styles.textInput}
                    value={admitConsultant}
                    onChangeText={setAdmitConsultant}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>LEAD COMMUNITY NURSE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={admitNurse}
                    onChangeText={setAdmitNurse}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>TELEMETRY DOCK / SENSOR ID</Text>
                  <TextInput
                    style={styles.textInput}
                    value={admitDeviceId}
                    onChangeText={setAdmitDeviceId}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>ACUITY LEVEL</Text>
                  <TextInput
                    style={styles.textInput}
                    value={admitAcuity}
                    onChangeText={setAdmitAcuity}
                    placeholder="HIGH, MEDIUM, LOW"
                  />
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAdmitModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAdmit}>
                <Text style={styles.submitBtnText}>Admit to Hospital-at-Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: CONDUCT REMOTE CONSULTANT WARD ROUND */}
      <Modal visible={roundModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Conduct Daily Remote Consultant Ward Round</Text>
              <TouchableOpacity onPress={() => setRoundModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Reviewing telemetry and care plan for <Text style={{ fontWeight: '700' }}>{selectedStay?.clientName}</Text>.
            </Text>

            <View style={{ gap: 10, marginTop: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>SpO2 (%)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={roundSpo2}
                    onChangeText={setRoundSpo2}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>PULSE (bpm)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={roundHeartRate}
                    onChangeText={setRoundHeartRate}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>BP (mmHg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={roundBp}
                    onChangeText={setRoundBp}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>TEMP (°C)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={roundTemp}
                    onChangeText={setRoundTemp}
                  />
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>CLINICAL OBSERVATION & CONSULTANT NOTES *</Text>
                <TextInput
                  style={[styles.textInput, { height: 80 }]}
                  multiline
                  value={roundNotes}
                  onChangeText={setRoundNotes}
                  placeholder="Patient reports no shortness of breath. Chest clear to auscultation via virtual visit. Continue oral diuretic."
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setRoundModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleRecordRound}>
                <Text style={styles.submitBtnText}>Sign & Save Ward Round</Text>
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
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
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
  admitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  admitBtnText: {
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
  stayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 14,
  },
  stayCardCritical: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  acuityBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  acuityText: {
    fontSize: 9,
    fontWeight: '800',
  },
  wardTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  wardTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  doctorText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  deviceText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  roundActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  roundActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dischargeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  dischargeActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  vitalsBox: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 2,
  },
  vitalLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  vitalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  vitalSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  roundNotesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 4,
  },
  roundNotesTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  roundNotesText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
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
    maxWidth: 550,
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
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

