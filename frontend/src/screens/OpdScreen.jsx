import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { 
  fetchOpdAppointments, 
  createOpdAppointment, 
  updateOpdConsultation 
} from '../api/client';
import { 
  Stethoscope, 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Pill, 
  Search, 
  X, 
  Activity, 
  Plus,
  Send,
  Calendar
} from 'lucide-react';

export const OpdScreen = ({ currentPersona }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [bookModalVisible, setBookModalVisible] = useState(false);

  // Booking Form State
  const [newPatientName, setNewPatientName] = useState('');
  const [newUhid, setNewUhid] = useState('UHID-2026-000' + Math.floor(Math.random() * 90 + 10));
  const [newAge, setNewAge] = useState('45');
  const [newGender, setNewGender] = useState('Female');
  const [newDoctor, setNewDoctor] = useState('Dr. Sarah Jenkins');
  const [newSpeciality, setNewSpeciality] = useState('Cardiology');
  const [newComplaints, setNewComplaints] = useState('');
  const [newPriority, setNewPriority] = useState('NORMAL');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Consultation Edit State
  const [diagText, setDiagText] = useState('');
  const [notesText, setNotesText] = useState('');
  const [vitalsText, setVitalsText] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFreq, setNewFreq] = useState('OD');
  const [savingConsult, setSavingConsult] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchOpdAppointments();
      setAppointments(data || []);
      if (data && data.length > 0 && !selectedAppt) {
        selectAppointment(data[0]);
      }
    } catch (err) {
      console.error('Failed to load OPD appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectAppointment = (appt) => {
    setSelectedAppt(appt);
    setDiagText(appt.diagnosis || '');
    setNotesText(appt.clinicalNotes || '');
    setVitalsText(appt.vitals || 'BP: 120/80 mmHg | HR: 76 bpm | SpO2: 98% | Temp: 36.6°C');
    try {
      setPrescriptions(appt.prescriptionJson ? JSON.parse(appt.prescriptionJson) : []);
    } catch {
      setPrescriptions([]);
    }
  };

  const handleBookAppointment = async () => {
    if (!newPatientName.trim()) return;
    try {
      setBookingLoading(true);
      const payload = {
        uhid: newUhid,
        patientName: newPatientName,
        age: parseInt(newAge) || 40,
        gender: newGender,
        doctorName: newDoctor,
        speciality: newSpeciality,
        chiefComplaints: newComplaints,
        triagePriority: newPriority,
        status: 'WAITING'
      };
      const created = await createOpdAppointment(payload);
      setAppointments(prev => [created, ...prev]);
      selectAppointment(created);
      setBookModalVisible(false);
      setNewPatientName('');
      setNewComplaints('');
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSaveConsultation = async (newStatus) => {
    if (!selectedAppt) return;
    try {
      setSavingConsult(true);
      const updatedData = {
        diagnosis: diagText,
        clinicalNotes: notesText,
        vitals: vitalsText,
        status: newStatus || selectedAppt.status,
        prescriptionJson: JSON.stringify(prescriptions)
      };
      const res = await updateOpdConsultation(selectedAppt.id, updatedData);
      setSelectedAppt(res);
      setAppointments(prev => prev.map(a => a.id === res.id ? res : a));
    } catch (err) {
      console.error('Failed to update consultation:', err);
    } finally {
      setSavingConsult(false);
    }
  };

  const handleAddPrescription = () => {
    if (!newMedName.trim()) return;
    const item = {
      medicine: newMedName,
      dosage: newDosage || '1 tablet',
      frequency: newFreq,
      duration: '7 days'
    };
    const updated = [...prescriptions, item];
    setPrescriptions(updated);
    setNewMedName('');
    setNewDosage('');
  };

  const filteredAppts = appointments.filter(a => {
    const matchesSearch = 
      (a.patientName && a.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.uhid && a.uhid.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.doctorName && a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const waitingCount = appointments.filter(a => a.status === 'WAITING').length;
  const inConsultCount = appointments.filter(a => a.status === 'IN_CONSULTATION').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const urgentCount = appointments.filter(a => a.triagePriority === 'URGENT' || a.triagePriority === 'EMERGENCY').length;

  return (
    <View style={styles.container}>
      {/* Top Banner Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TOTAL APPOINTMENTS</Text>
          <Text style={styles.statValue}>{appointments.length}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.warning }]}>
          <Text style={styles.statLabel}>WAITING IN QUEUE</Text>
          <Text style={[styles.statValue, { color: colors.warning }]}>{waitingCount}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
          <Text style={styles.statLabel}>IN CONSULTATION</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{inConsultCount}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
          <Text style={styles.statLabel}>COMPLETED</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>{completedCount}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.danger }]}>
          <Text style={styles.statLabel}>URGENT / EMERGENCY</Text>
          <Text style={[styles.statValue, { color: colors.danger }]}>{urgentCount}</Text>
        </View>
      </View>

      {/* Main Workspace Layout */}
      <View style={styles.contentLayout}>
        {/* Left Side: Queue & Patient Selection */}
        <View style={styles.queuePanel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>OPD Patient Queue</Text>
              <Text style={styles.panelSubtitle}>Live doctor clinics & token management</Text>
            </View>
            <TouchableOpacity 
              style={styles.bookButton} 
              onPress={() => setBookModalVisible(true)}
              activeOpacity={0.8}
            >
              <Plus size={16} color={colors.textWhite} />
              <Text style={styles.bookButtonText}>Book OPD</Text>
            </TouchableOpacity>
          </View>

          {/* Search & Filter */}
          <View style={styles.searchBar}>
            <Search size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Patient name, UHID, or Doctor..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.filterPills}>
            {['ALL', 'WAITING', 'IN_CONSULTATION', 'COMPLETED'].map(st => (
              <TouchableOpacity
                key={st}
                style={[styles.filterPill, statusFilter === st && styles.filterPillActive]}
                onPress={() => setStatusFilter(st)}
              >
                <Text style={[styles.filterPillText, statusFilter === st && styles.filterPillTextActive]}>
                  {st.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Queue List */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <ScrollView style={styles.apptList}>
              {filteredAppts.map(appt => {
                const isSelected = selectedAppt?.id === appt.id;
                return (
                  <TouchableOpacity
                    key={appt.id}
                    style={[styles.apptCard, isSelected && styles.apptCardActive]}
                    onPress={() => selectAppointment(appt)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tokenCircle}>
                      <Text style={styles.tokenNum}>#{appt.tokenNumber || '?'}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.patientName}>{appt.patientName}</Text>
                        <View style={[styles.statusBadge, 
                          appt.status === 'COMPLETED' ? styles.statusCompleted :
                          appt.status === 'IN_CONSULTATION' ? styles.statusInConsult : styles.statusWaiting
                        ]}>
                          <Text style={styles.statusBadgeText}>{appt.status.replace('_', ' ')}</Text>
                        </View>
                      </View>
                      <Text style={styles.uhidText}>{appt.uhid} • {appt.gender}, {appt.age} yrs</Text>
                      <Text style={styles.doctorText}>Clinic: {appt.doctorName} ({appt.speciality})</Text>
                      {appt.chiefComplaints && (
                        <Text style={styles.complaintSnippet} numberOfLines={1}>
                          Complaint: {appt.chiefComplaints}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Right Side: Doctor Consultation Workspace */}
        <View style={styles.consultPanel}>
          {selectedAppt ? (
            <ScrollView style={{ flex: 1 }}>
              {/* Patient Banner */}
              <View style={styles.consultHeader}>
                <View style={styles.consultPatientInfo}>
                  <Text style={styles.consultPatientName}>{selectedAppt.patientName}</Text>
                  <Text style={styles.consultMeta}>
                    <Text style={{ fontWeight: '700', color: colors.primary }}>{selectedAppt.uhid}</Text> • 
                    Token #{selectedAppt.tokenNumber} • {selectedAppt.gender}, {selectedAppt.age} yrs • {selectedAppt.speciality}
                  </Text>
                </View>
                <View style={styles.actionRow}>
                  {selectedAppt.status !== 'IN_CONSULTATION' && selectedAppt.status !== 'COMPLETED' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleSaveConsultation('IN_CONSULTATION')}
                      disabled={savingConsult}
                    >
                      <Stethoscope size={15} color={colors.textWhite} />
                      <Text style={styles.actionBtnText}>Start Consult</Text>
                    </TouchableOpacity>
                  )}
                  {selectedAppt.status !== 'COMPLETED' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: colors.success }]}
                      onPress={() => handleSaveConsultation('COMPLETED')}
                      disabled={savingConsult}
                    >
                      <CheckCircle2 size={15} color={colors.textWhite} />
                      <Text style={styles.actionBtnText}>Mark Completed</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Vitals & Triage */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionTitleRow}>
                  <Activity size={18} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Patient Vitals & Triage</Text>
                </View>
                <TextInput
                  style={styles.textInputArea}
                  value={vitalsText}
                  onChangeText={setVitalsText}
                  placeholder="BP: 120/80 mmHg | Heart Rate: 72 bpm | SpO2: 98% | Temp: 36.7°C"
                />
              </View>

              {/* Chief Complaints & Clinical Notes */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionTitleRow}>
                  <FileText size={18} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Clinical Examination & Notes</Text>
                </View>
                <Text style={styles.fieldLabel}>Chief Complaints</Text>
                <Text style={styles.complaintBox}>{selectedAppt.chiefComplaints || 'None recorded'}</Text>
                
                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>ICD-10 Clinical Diagnosis</Text>
                <TextInput
                  style={styles.singleInput}
                  value={diagText}
                  onChangeText={setDiagText}
                  placeholder="e.g. I50.9 - Congestive Heart Failure"
                />

                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Doctor's Clinical Notes</Text>
                <TextInput
                  style={[styles.textInputArea, { minHeight: 80 }]}
                  multiline
                  value={notesText}
                  onChangeText={setNotesText}
                  placeholder="Record examination findings, auscultation, follow-up advice..."
                />
              </View>

              {/* Digital e-Prescriptions */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionTitleRow}>
                  <Pill size={18} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Digital e-Prescriptions (e-Rx)</Text>
                </View>

                {prescriptions.map((rx, idx) => (
                  <View key={idx} style={styles.rxItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rxName}>{rx.medicine}</Text>
                      <Text style={styles.rxMeta}>Dose: {rx.dosage} | Freq: {rx.frequency} | Duration: {rx.duration}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}
                      style={{ padding: 4 }}
                    >
                      <X size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.addRxRow}>
                  <TextInput
                    style={[styles.singleInput, { flex: 2 }]}
                    placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                    value={newMedName}
                    onChangeText={setNewMedName}
                  />
                  <TextInput
                    style={[styles.singleInput, { flex: 1, marginHorizontal: 8 }]}
                    placeholder="Dose (1 tab)"
                    value={newDosage}
                    onChangeText={setNewDosage}
                  />
                  <TextInput
                    style={[styles.singleInput, { width: 80, marginRight: 8 }]}
                    placeholder="Freq (TDS)"
                    value={newFreq}
                    onChangeText={setNewFreq}
                  />
                  <TouchableOpacity style={styles.addRxBtn} onPress={handleAddPrescription}>
                    <Plus size={16} color={colors.textWhite} />
                    <Text style={styles.addRxBtnText}>Add Rx</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveConsultBtn}
                onPress={() => handleSaveConsultation()}
                disabled={savingConsult}
              >
                {savingConsult ? (
                  <ActivityIndicator color={colors.textWhite} />
                ) : (
                  <>
                    <Send size={16} color={colors.textWhite} />
                    <Text style={styles.saveConsultBtnText}>Save Consultation & Update Record</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.emptyConsult}>
              <Stethoscope size={48} color={colors.cardBorder} />
              <Text style={styles.emptyTitle}>Select an OPD patient from the queue</Text>
              <Text style={styles.emptySubtitle}>View vitals, prescribe medications, or document examination findings</Text>
            </View>
          )}
        </View>
      </View>

      {/* Book OPD Appointment Modal */}
      <Modal visible={bookModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book OPD Appointment</Text>
              <TouchableOpacity onPress={() => setBookModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.fieldLabel}>Patient Full Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Eleanor Vance"
                value={newPatientName}
                onChangeText={setNewPatientName}
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>UHID Standard</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newUhid}
                    onChangeText={setNewUhid}
                  />
                </View>
                <View style={{ width: 80 }}>
                  <Text style={styles.fieldLabel}>Age</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newAge}
                    onChangeText={setNewAge}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: 100 }}>
                  <Text style={styles.fieldLabel}>Gender</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newGender}
                    onChangeText={setNewGender}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Consulting Doctor</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newDoctor}
                    onChangeText={setNewDoctor}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Speciality</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newSpeciality}
                    onChangeText={setNewSpeciality}
                  />
                </View>
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 8 }]}>Chief Complaints</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 60 }]}
                multiline
                placeholder="Describe current symptoms or reasons for visit..."
                value={newComplaints}
                onChangeText={setNewComplaints}
              />

              <Text style={[styles.fieldLabel, { marginTop: 8 }]}>Triage Urgency</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['NORMAL', 'URGENT', 'EMERGENCY'].map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityOption, 
                      newPriority === p && styles.priorityOptionActive,
                      newPriority === p && p === 'URGENT' && { borderColor: colors.warning, backgroundColor: colors.warningLight },
                      newPriority === p && p === 'EMERGENCY' && { borderColor: colors.danger, backgroundColor: colors.dangerLight },
                    ]}
                    onPress={() => setNewPriority(p)}
                  >
                    <Text style={[styles.priorityText, newPriority === p && { fontWeight: '700' }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setBookModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleBookAppointment}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator color={colors.textWhite} />
                ) : (
                  <Text style={styles.submitBtnText}>Confirm Booking</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  contentLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
  },
  queuePanel: {
    width: '42%',
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  panelSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 12,
    color: colors.textPrimary,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  filterPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterPillActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterPillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  apptList: {
    flex: 1,
  },
  apptCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 8,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
  },
  apptCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  tokenCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenNum: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: 13,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusWaiting: {
    backgroundColor: colors.warningLight,
  },
  statusInConsult: {
    backgroundColor: colors.primaryLight,
  },
  statusCompleted: {
    backgroundColor: colors.successLight,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  uhidText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  doctorText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  complaintSnippet: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 3,
  },
  consultPanel: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  consultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 14,
    marginBottom: 16,
  },
  consultPatientName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  consultMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionBtnText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  complaintBox: {
    fontSize: 12,
    color: colors.textPrimary,
    backgroundColor: colors.cardBg,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  singleInput: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: colors.textPrimary,
  },
  textInputArea: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    padding: 10,
    fontSize: 12,
    color: colors.textPrimary,
  },
  rxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  rxName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rxMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  addRxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addRxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  addRxBtnText: {
    color: colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  saveConsultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  saveConsultBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyConsult: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: 520,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 12,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  priorityOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 14,
    marginTop: 14,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  submitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  submitBtnText: {
    fontSize: 12,
    color: colors.textWhite,
    fontWeight: '700',
  },
});

