import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { 
  fetchOtBookings, 
  createOtBooking, 
  updateOtStatus, 
  fetchBloodUnits, 
  addBloodUnit, 
  reserveBloodUnit 
} from '../api/client';
import { 
  Scissors, 
  Droplet, 
  Plus, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  X, 
  Calendar,
  ShieldCheck,
  Activity
} from 'lucide-react';

export const OtBloodBankScreen = ({ currentPersona }) => {
  const [otBookings, setOtBookings] = useState([]);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [otModalVisible, setOtModalVisible] = useState(false);
  const [bloodModalVisible, setBloodModalVisible] = useState(false);
  const [reserveModalVisible, setReserveModalVisible] = useState(false);
  const [selectedBloodUnit, setSelectedBloodUnit] = useState(null);

  // OT Form State
  const [otRoom, setOtRoom] = useState('OT Suite 1 (Major Ortho)');
  const [surgeryName, setSurgeryName] = useState('Total Knee Replacement');
  const [patientName, setPatientName] = useState('Eleanor Vance');
  const [uhid, setUhid] = useState('UHID-2026-0003');
  const [age, setAge] = useState('69');
  const [gender, setGender] = useState('Female');
  const [surgeon, setSurgeon] = useState('Dr. Marcus Vance (FRCS)');
  const [anaesthetist, setAnaesthetist] = useState('Dr. A. Taylor');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Blood Unit Form State
  const [unitCode, setUnitCode] = useState('BB-' + Math.floor(Math.random() * 900 + 100));
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [component, setComponent] = useState('PRBC');
  const [volume, setVolume] = useState('350');
  const [expiry, setExpiry] = useState('2026-12-15');

  // Reserve Form State
  const [resUhid, setResUhid] = useState('UHID-2026-0003');
  const [resPatient, setResPatient] = useState('Eleanor Vance');

  const loadData = async () => {
    try {
      setLoading(true);
      const [loadedOt, loadedBlood] = await Promise.all([
        fetchOtBookings().catch(() => []),
        fetchBloodUnits().catch(() => [])
      ]);
      setOtBookings(loadedOt || []);
      setBloodUnits(loadedBlood || []);
    } catch (err) {
      console.error('Failed to load OT / Blood Bank data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOt = async () => {
    if (!surgeryName.trim() || !patientName.trim()) return;
    try {
      setSubmitting(true);
      const payload = {
        otRoom,
        surgeryName,
        patientName,
        uhid,
        age: parseInt(age) || 45,
        gender,
        leadSurgeon: surgeon,
        anaesthetist,
        scheduledDateTime: new Date().toISOString(),
        pacStatus: 'CLEARED',
        status: 'SCHEDULED',
        operativeNotes: notes
      };
      await createOtBooking(payload);
      setOtModalVisible(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create OT booking:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateOtStatus(id, newStatus, 'Status updated from surgical coordination console');
      await loadData();
    } catch (err) {
      console.error('Failed to update OT status:', err);
    }
  };

  const handleAddBloodUnit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        unitCode,
        bloodGroup,
        componentType: component,
        volumeMl: parseInt(volume) || 350,
        collectionDate: new Date().toISOString().split('T')[0],
        expiryDate: expiry,
        status: 'AVAILABLE'
      };
      await addBloodUnit(payload);
      setBloodModalVisible(false);
      await loadData();
    } catch (err) {
      console.error('Failed to add blood unit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReserve = async () => {
    if (!selectedBloodUnit) return;
    try {
      setSubmitting(true);
      await reserveBloodUnit(selectedBloodUnit.id, resUhid, resPatient);
      setReserveModalVisible(false);
      await loadData();
    } catch (err) {
      console.error('Failed to reserve blood unit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const bloodGroupCounts = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map(bg => {
    const count = bloodUnits.filter(u => u.bloodGroup === bg && u.status === 'AVAILABLE').length;
    return { bg, count };
  });

  const availableUnitsCount = bloodUnits.filter(u => u.status === 'AVAILABLE').length;
  const reservedUnitsCount = bloodUnits.filter(u => u.status === 'RESERVED').length;

  return (
    <View style={styles.container}>
      {/* Top Banner Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>SCHEDULED SURGERIES</Text>
          <Text style={styles.statValue}>{otBookings.length}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
          <Text style={styles.statLabel}>THEATRES ACTIVE</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>2 Suites</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.danger }]}>
          <Text style={styles.statLabel}>TOTAL BLOOD UNITS</Text>
          <Text style={[styles.statValue, { color: colors.danger }]}>{bloodUnits.length}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
          <Text style={styles.statLabel}>AVAILABLE BLOOD</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>{availableUnitsCount}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.warning }]}>
          <Text style={styles.statLabel}>RESERVED FOR SURGERY</Text>
          <Text style={[styles.statValue, { color: colors.warning }]}>{reservedUnitsCount}</Text>
        </View>
      </View>

      {/* Main Two-Panel Layout */}
      <View style={styles.contentLayout}>
        {/* Left Panel: Operation Theatre Suite */}
        <View style={styles.panelLeft}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Operation Theatre (OT) Scheduling</Text>
              <Text style={styles.panelSubtitle}>Surgical suites, lead surgeons & PAC clearance</Text>
            </View>
            <TouchableOpacity 
              style={styles.actionBtnPrimary}
              onPress={() => setOtModalVisible(true)}
            >
              <Plus size={15} color={colors.textWhite} />
              <Text style={styles.actionBtnText}>Schedule Surgery</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <ScrollView style={{ flex: 1 }}>
              {otBookings.map(ot => (
                <View key={ot.id} style={styles.otCard}>
                  <View style={styles.otCardHeader}>
                    <View style={styles.otRoomBadge}>
                      <Text style={styles.otRoomBadgeText}>{ot.otRoom}</Text>
                    </View>
                    <View style={[
                      styles.pacBadge,
                      ot.pacStatus === 'CLEARED' ? styles.pacCleared : styles.pacPending
                    ]}>
                      <Text style={styles.pacBadgeText}>PAC: {ot.pacStatus}</Text>
                    </View>
                  </View>

                  <Text style={styles.surgeryTitle}>{ot.surgeryName}</Text>
                  <Text style={styles.otPatientMeta}>
                    Patient: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{ot.patientName}</Text> ({ot.uhid}) • {ot.gender}, {ot.age}y
                  </Text>
                  <Text style={styles.otSurgeonMeta}>
                    Surgeon: <Text style={{ color: colors.primary, fontWeight: '700' }}>{ot.leadSurgeon}</Text> | Anaesthetist: {ot.anaesthetist || 'On-Call'}
                  </Text>

                  {ot.operativeNotes && (
                    <Text style={styles.otNotesText}>Notes: {ot.operativeNotes}</Text>
                  )}

                  <View style={styles.otActionsRow}>
                    <View style={styles.otStatusPill}>
                      <Clock size={12} color={colors.textSecondary} />
                      <Text style={styles.otStatusPillText}>{ot.status}</Text>
                    </View>

                    {ot.status === 'SCHEDULED' && (
                      <TouchableOpacity 
                        style={[styles.smallBtn, { backgroundColor: colors.warning }]}
                        onPress={() => handleUpdateStatus(ot.id, 'IN_PROGRESS')}
                      >
                        <Text style={styles.smallBtnText}>Start Surgery</Text>
                      </TouchableOpacity>
                    )}

                    {ot.status === 'IN_PROGRESS' && (
                      <TouchableOpacity 
                        style={[styles.smallBtn, { backgroundColor: colors.success }]}
                        onPress={() => handleUpdateStatus(ot.id, 'COMPLETED')}
                      >
                        <CheckCircle2 size={12} color={colors.textWhite} />
                        <Text style={styles.smallBtnText}>Mark Completed</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Right Panel: Blood Bank & Cross-Match */}
        <View style={styles.panelRight}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Blood Bank & Transfusion Matrix</Text>
              <Text style={styles.panelSubtitle}>Real-time inventory by blood group & component</Text>
            </View>
            <TouchableOpacity 
              style={[styles.actionBtnPrimary, { backgroundColor: colors.danger }]}
              onPress={() => setBloodModalVisible(true)}
            >
              <Plus size={15} color={colors.textWhite} />
              <Text style={styles.actionBtnText}>Log Blood Unit</Text>
            </TouchableOpacity>
          </View>

          {/* Blood Group Stock Summary Pills */}
          <View style={styles.bloodGroupRow}>
            {bloodGroupCounts.map(bg => (
              <View key={bg.bg} style={styles.bloodGroupChip}>
                <Droplet size={14} color={colors.danger} />
                <Text style={styles.bloodGroupName}>{bg.bg}</Text>
                <Text style={styles.bloodGroupCount}>{bg.count}u</Text>
              </View>
            ))}
          </View>

          {/* Blood Units Table */}
          <ScrollView style={{ flex: 1, marginTop: 12 }}>
            <View style={styles.table}>
              <View style={styles.tHead}>
                <Text style={[styles.th, { width: 90 }]}>UNIT CODE</Text>
                <Text style={[styles.th, { width: 65 }]}>GROUP</Text>
                <Text style={[styles.th, { width: 90 }]}>TYPE</Text>
                <Text style={[styles.th, { width: 95 }]}>EXPIRY</Text>
                <Text style={[styles.th, { flex: 1 }]}>STATUS & RESERVATION</Text>
                <Text style={[styles.th, { width: 85 }]}>ACTION</Text>
              </View>

              {bloodUnits.map(unit => {
                const isAvail = unit.status === 'AVAILABLE';
                return (
                  <View key={unit.id} style={styles.tRow}>
                    <Text style={styles.unitCodeText}>{unit.unitCode}</Text>
                    <View style={styles.bloodBadgeSmall}>
                      <Text style={styles.bloodBadgeSmallText}>{unit.bloodGroup}</Text>
                    </View>
                    <Text style={styles.metaText}>{unit.componentType}</Text>
                    <Text style={styles.expiryText}>{unit.expiryDate}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.statusText, isAvail ? { color: colors.success } : { color: colors.warning }]}>
                        {unit.status}
                      </Text>
                      {unit.reservedForName && (
                        <Text style={styles.reservedForText}>For: {unit.reservedForName}</Text>
                      )}
                    </View>
                    <View style={{ width: 85 }}>
                      {isAvail ? (
                        <TouchableOpacity
                          style={styles.reserveBtn}
                          onPress={() => {
                            setSelectedBloodUnit(unit);
                            setReserveModalVisible(true);
                          }}
                        >
                          <Text style={styles.reserveBtnText}>Reserve</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.lockedPill}>
                          <Text style={styles.lockedPillText}>Allocated</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Schedule Surgery Modal */}
      <Modal visible={otModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Surgical Procedure</Text>
              <TouchableOpacity onPress={() => setOtModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.fieldLabel}>Surgery / Procedure Name *</Text>
              <TextInput style={styles.modalInput} value={surgeryName} onChangeText={setSurgeryName} placeholder="e.g. Laparoscopic Cholecystectomy" />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>OT Suite Room</Text>
                  <TextInput style={styles.modalInput} value={otRoom} onChangeText={setOtRoom} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Patient Full Name</Text>
                  <TextInput style={styles.modalInput} value={patientName} onChangeText={setPatientName} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>UHID</Text>
                  <TextInput style={styles.modalInput} value={uhid} onChangeText={setUhid} />
                </View>
                <View style={{ width: 80 }}>
                  <Text style={styles.fieldLabel}>Age</Text>
                  <TextInput style={styles.modalInput} value={age} onChangeText={setAge} keyboardType="numeric" />
                </View>
                <View style={{ width: 100 }}>
                  <Text style={styles.fieldLabel}>Gender</Text>
                  <TextInput style={styles.modalInput} value={gender} onChangeText={setGender} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Lead Operating Surgeon</Text>
                  <TextInput style={styles.modalInput} value={surgeon} onChangeText={setSurgeon} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Anaesthetist</Text>
                  <TextInput style={styles.modalInput} value={anaesthetist} onChangeText={setAnaesthetist} />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Pre-Operative Notes & Blood Reserve Requirements</Text>
              <TextInput style={[styles.modalInput, { minHeight: 60 }]} multiline placeholder="PAC findings, cross-match orders..." value={notes} onChangeText={setNotes} />
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setOtModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateOt} disabled={submitting}>
                {submitting ? <ActivityIndicator color={colors.textWhite} /> : <Text style={styles.submitBtnText}>Book Surgery</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Log Blood Unit Modal */}
      <Modal visible={bloodModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Blood Unit into Bank</Text>
              <TouchableOpacity onPress={() => setBloodModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 360 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Unit Code / Barcode</Text>
                  <TextInput style={styles.modalInput} value={unitCode} onChangeText={setUnitCode} />
                </View>
                <View style={{ width: 120 }}>
                  <Text style={styles.fieldLabel}>Blood Group</Text>
                  <TextInput style={styles.modalInput} value={bloodGroup} onChangeText={setBloodGroup} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Component Type</Text>
                  <TextInput style={styles.modalInput} value={component} onChangeText={setComponent} />
                </View>
                <View style={{ width: 120 }}>
                  <Text style={styles.fieldLabel}>Volume (mL)</Text>
                  <TextInput style={styles.modalInput} value={volume} onChangeText={setVolume} keyboardType="numeric" />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Expiry Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.modalInput} value={expiry} onChangeText={setExpiry} />
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setBloodModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.danger }]} onPress={handleAddBloodUnit} disabled={submitting}>
                {submitting ? <ActivityIndicator color={colors.textWhite} /> : <Text style={styles.submitBtnText}>Add Unit to Bank</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reserve Blood Modal */}
      <Modal visible={reserveModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reserve Blood Unit for Patient</Text>
              <TouchableOpacity onPress={() => setReserveModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
              Reserving Unit: <Text style={{ fontWeight: '800', color: colors.danger }}>{selectedBloodUnit?.unitCode}</Text> ({selectedBloodUnit?.bloodGroup} {selectedBloodUnit?.componentType})
            </Text>
            <Text style={styles.fieldLabel}>Patient Full Name</Text>
            <TextInput style={styles.modalInput} value={resPatient} onChangeText={setResPatient} />
            <Text style={styles.fieldLabel}>Patient UHID</Text>
            <TextInput style={styles.modalInput} value={resUhid} onChangeText={setResUhid} />
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setReserveModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.warning }]} onPress={handleReserve} disabled={submitting}>
                {submitting ? <ActivityIndicator color={colors.textWhite} /> : <Text style={styles.submitBtnText}>Confirm Cross-Match & Reserve</Text>}
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
    borderLeftColor: colors.secondary,
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
  panelLeft: {
    flex: 1.1,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
  },
  panelRight: {
    flex: 0.9,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionBtnText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  otCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 12,
  },
  otCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  otRoomBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  otRoomBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  pacBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pacCleared: {
    backgroundColor: colors.successLight,
  },
  pacPending: {
    backgroundColor: colors.warningLight,
  },
  pacBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  surgeryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  otPatientMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  otSurgeonMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
  otNotesText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    backgroundColor: colors.cardBg,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  otActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 8,
    marginTop: 4,
  },
  otStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  otStatusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  smallBtnText: {
    color: colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  bloodGroupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodGroupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  bloodGroupName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  bloodGroupCount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
    marginLeft: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tHead: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  th: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  tRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
  unitCodeText: {
    width: 90,
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  bloodBadgeSmall: {
    width: 65,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  bloodBadgeSmallText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.danger,
  },
  metaText: {
    width: 90,
    fontSize: 10,
    color: colors.textSecondary,
  },
  expiryText: {
    width: 95,
    fontSize: 10,
    color: colors.textMuted,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  reservedForText: {
    fontSize: 9,
    color: colors.textMuted,
  },
  reserveBtn: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  reserveBtnText: {
    color: colors.textWhite,
    fontSize: 10,
    fontWeight: '700',
  },
  lockedPill: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  lockedPillText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: 500,
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
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
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

