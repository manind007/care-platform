import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { 
  fetchIpdWards, 
  fetchIpdBeds, 
  fetchIpdAdmissions, 
  admitIpdPatient, 
  transferIpdBed, 
  dischargeIpdPatient, 
  updateNursingNotes,
  updateBedTurnaroundStatus
} from '../api/client';
import { 
  Bed as BedIcon, 
  Building2, 
  UserPlus, 
  ArrowRightLeft, 
  LogOut, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Activity,
  Layers
} from 'lucide-react';

export const IpdBedScreen = ({ currentPersona }) => {
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWardId, setSelectedWardId] = useState('ALL');
  const [selectedBed, setSelectedBed] = useState(null);

  // Modals
  const [admitModalVisible, setAdmitModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [dischargeModalVisible, setDischargeModalVisible] = useState(false);

  // Form states
  const [patientName, setPatientName] = useState('');
  const [uhid, setUhid] = useState('UHID-2026-000' + Math.floor(Math.random() * 90 + 10));
  const [age, setAge] = useState('72');
  const [gender, setGender] = useState('Female');
  const [doctor, setDoctor] = useState('Dr. Sarah Jenkins');
  const [targetBedId, setTargetBedId] = useState(null);
  const [provDiagnosis, setProvDiagnosis] = useState('');
  const [nursingNotesInput, setNursingNotesInput] = useState('');
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [dischargeAdvice, setDischargeAdvice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loadedWards, loadedBeds, loadedAdmissions] = await Promise.all([
        fetchIpdWards().catch(() => []),
        fetchIpdBeds().catch(() => []),
        fetchIpdAdmissions().catch(() => [])
      ]);
      setWards(loadedWards || []);
      setBeds(loadedBeds || []);
      setAdmissions(loadedAdmissions || []);
    } catch (err) {
      console.error('Failed to load IPD data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBedClick = (bed) => {
    setSelectedBed(bed);
    if (bed.status === 'AVAILABLE') {
      setTargetBedId(bed.id);
      setAdmitModalVisible(true);
    }
  };

  const handleAdmit = async () => {
    if (!patientName.trim() || !targetBedId) return;
    try {
      setSubmitting(true);
      const payload = {
        uhid,
        patientName,
        age: parseInt(age) || 50,
        gender,
        admittingDoctor: doctor,
        bedId: targetBedId,
        provisionalDiagnosis: provDiagnosis,
        nursingNotes: nursingNotesInput
      };
      await admitIpdPatient(payload);
      setAdmitModalVisible(false);
      setPatientName('');
      setProvDiagnosis('');
      setNursingNotesInput('');
      await loadData();
    } catch (err) {
      console.error('Admission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async (newBedId) => {
    if (!selectedAdmission) return;
    try {
      setSubmitting(true);
      await transferIpdBed(selectedAdmission.id, newBedId);
      setTransferModalVisible(false);
      await loadData();
    } catch (err) {
      console.error('Transfer failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDischarge = async () => {
    if (!selectedAdmission) return;
    try {
      setSubmitting(true);
      await dischargeIpdPatient(selectedAdmission.id, dischargeSummary, dischargeAdvice);
      setDischargeModalVisible(false);
      setSelectedBed(null);
      await loadData();
    } catch (err) {
      console.error('Discharge failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseCleaning = async (bed) => {
    try {
      setSubmitting(true);
      await updateBedTurnaroundStatus(
        bed.id, 
        'AVAILABLE', 
        currentPersona ? currentPersona.name : 'Housekeeping Lead', 
        'Sanitization & terminal cleaning completed'
      );
      alert(`Bed ${bed.bedNumber} sanitized and released to Available!`);
      await loadData();
    } catch (err) {
      alert('Failed to release bed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBeds = selectedWardId === 'ALL'
    ? beds
    : beds.filter(b => b.wardId === selectedWardId);

  const selectedAdmission = selectedBed?.status === 'OCCUPIED'
    ? admissions.find(a => a.uhid === selectedBed.occupiedByUhid && a.status === 'ADMITTED')
    : null;

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
  const availableBeds = beds.filter(b => b.status === 'AVAILABLE').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Top Banner Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>HOSPITAL WARDS</Text>
          <Text style={styles.statValue}>{wards.length}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
          <Text style={styles.statLabel}>TOTAL IPD BEDS</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{totalBeds}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.danger }]}>
          <Text style={styles.statLabel}>OCCUPIED BEDS</Text>
          <Text style={[styles.statValue, { color: colors.danger }]}>{occupiedBeds}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
          <Text style={styles.statLabel}>AVAILABLE BEDS</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>{availableBeds}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.warning }]}>
          <Text style={styles.statLabel}>BED OCCUPANCY</Text>
          <Text style={[styles.statValue, { color: colors.warning }]}>{occupancyRate}%</Text>
        </View>
      </View>

      {/* Main Layout */}
      <View style={styles.contentLayout}>
        {/* Visual Bed Matrix Panel */}
        <View style={styles.matrixPanel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Interactive Visual Bed Management Matrix</Text>
              <Text style={styles.panelSubtitle}>Real-time occupancy states across departments</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={styles.legendText}>Available</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                <Text style={styles.legendText}>Occupied</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                <Text style={styles.legendText}>Cleaning</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.textMuted }]} />
                <Text style={styles.legendText}>Maintenance</Text>
              </View>
            </View>
          </View>

          {/* Ward Filter Pills */}
          <View style={styles.wardPills}>
            <TouchableOpacity
              style={[styles.wardPill, selectedWardId === 'ALL' && styles.wardPillActive]}
              onPress={() => setSelectedWardId('ALL')}
            >
              <Text style={[styles.wardPillText, selectedWardId === 'ALL' && styles.wardPillTextActive]}>
                All Wards ({beds.length})
              </Text>
            </TouchableOpacity>
            {wards.map(w => {
              const wardBedCount = beds.filter(b => b.wardId === w.id).length;
              return (
                <TouchableOpacity
                  key={w.id}
                  style={[styles.wardPill, selectedWardId === w.id && styles.wardPillActive]}
                  onPress={() => setSelectedWardId(w.id)}
                >
                  <Text style={[styles.wardPillText, selectedWardId === w.id && styles.wardPillTextActive]}>
                    {w.wardName} ({wardBedCount})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bed Grid */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <ScrollView style={{ flex: 1 }}>
              <View style={styles.bedGrid}>
                {filteredBeds.map(b => {
                  const isSelected = selectedBed?.id === b.id;
                  const isOccupied = b.status === 'OCCUPIED';
                  const isAvailable = b.status === 'AVAILABLE';
                  const isCleaning = b.status === 'CLEANING';

                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.bedCard,
                        isOccupied && styles.bedCardOccupied,
                        isAvailable && styles.bedCardAvailable,
                        isCleaning && styles.bedCardCleaning,
                        isSelected && styles.bedCardActive
                      ]}
                      onPress={() => handleBedClick(b)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.bedHeader}>
                        <BedIcon 
                          size={18} 
                          color={isOccupied ? colors.danger : isAvailable ? colors.success : colors.warning} 
                        />
                        <Text style={styles.bedNumber}>{b.bedNumber}</Text>
                      </View>
                      <Text style={styles.bedWard}>{b.wardName}</Text>
                      
                      {isOccupied ? (
                        <View style={styles.occupantBox}>
                          <Text style={styles.occupantName} numberOfLines={1}>{b.occupiedByName}</Text>
                          <Text style={styles.occupantUhid}>{b.occupiedByUhid}</Text>
                        </View>
                      ) : (
                        <View style={styles.emptyBedStatus}>
                          <Text style={[
                            styles.emptyBedStatusText,
                            isAvailable && { color: colors.success },
                            isCleaning && { color: colors.warning }
                          ]}>
                            {b.status}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Inpatient Clinical Sidebar */}
        <View style={styles.inpatientSidebar}>
          {selectedBed?.status === 'OCCUPIED' && selectedAdmission ? (
            <ScrollView style={{ flex: 1 }}>
              <View style={styles.inpatientHeader}>
                <Text style={styles.inpatientTitle}>Inpatient Chart</Text>
                <View style={styles.badgeAdmitted}>
                  <Text style={styles.badgeAdmittedText}>ADMITTED</Text>
                </View>
              </View>

              <View style={styles.inpatientProfile}>
                <Text style={styles.ipdPatientName}>{selectedAdmission.patientName}</Text>
                <Text style={styles.ipdMeta}>
                  {selectedAdmission.uhid} • {selectedAdmission.gender}, {selectedAdmission.age} yrs
                </Text>
                <Text style={styles.ipdDoctor}>Admitted by: {selectedAdmission.admittingDoctor}</Text>
                <Text style={styles.ipdBedLocation}>
                  Location: {selectedAdmission.wardName} — Bed {selectedAdmission.bedNumber}
                </Text>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.cardHeaderSmall}>PROVISIONAL DIAGNOSIS</Text>
                <Text style={styles.diagText}>{selectedAdmission.provisionalDiagnosis || 'Clinical observation'}</Text>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.cardHeaderSmall}>NURSING OBSERVATIONS & NOTES</Text>
                <Text style={styles.nursingNotesText}>{selectedAdmission.nursingNotes || 'Routine vitals stable. No acute distress.'}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.sidebarActions}>
                <TouchableOpacity 
                  style={[styles.sidebarBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setTransferModalVisible(true)}
                >
                  <ArrowRightLeft size={16} color={colors.textWhite} />
                  <Text style={styles.sidebarBtnText}>Transfer Bed</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.sidebarBtn, { backgroundColor: colors.danger }]}
                  onPress={() => setDischargeModalVisible(true)}
                >
                  <LogOut size={16} color={colors.textWhite} />
                  <Text style={styles.sidebarBtnText}>Discharge Patient</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : selectedBed?.status === 'AVAILABLE' ? (
            <View style={styles.emptySidebar}>
              <BedIcon size={44} color={colors.success} />
              <Text style={styles.emptyTitle}>Bed {selectedBed.bedNumber} is Available</Text>
              <Text style={styles.emptySubtitle}>{selectedBed.wardName}</Text>
              <TouchableOpacity 
                style={[styles.sidebarBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
                onPress={() => setAdmitModalVisible(true)}
              >
                <UserPlus size={16} color={colors.textWhite} />
                <Text style={styles.sidebarBtnText}>Admit Patient Here</Text>
              </TouchableOpacity>
            </View>
          ) : selectedBed?.status === 'CLEANING' ? (
            <View style={styles.emptySidebar}>
              <BedIcon size={44} color={colors.warning} />
              <Text style={styles.emptyTitle}>Bed {selectedBed.bedNumber} Undergoing Sanitization</Text>
              <Text style={styles.emptySubtitle}>{selectedBed.wardName} • Housekeeping Turnaround</Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>
                Terminal disinfection in progress following patient discharge. Release once ready for immediate patient boarding.
              </Text>
              <TouchableOpacity 
                style={[styles.sidebarBtn, { backgroundColor: colors.success, marginTop: 16 }]}
                onPress={() => handleReleaseCleaning(selectedBed)}
              >
                <CheckCircle2 size={16} color={colors.textWhite} />
                <Text style={styles.sidebarBtnText}>Sanitization Complete • Release to Available</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptySidebar}>
              <BedIcon size={44} color={colors.cardBorder} />
              <Text style={styles.emptyTitle}>Select a bed from the matrix</Text>
              <Text style={styles.emptySubtitle}>Inspect admitted patient charts, execute bed transfers, or admit new patients</Text>
            </View>
          )}
        </View>
      </View>

      {/* Admit Patient Modal */}
      <Modal visible={admitModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Admit Patient to Bed</Text>
              <TouchableOpacity onPress={() => setAdmitModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.fieldLabel}>Patient Full Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Margaret Higgins"
                value={patientName}
                onChangeText={setPatientName}
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>UHID Identifier</Text>
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

              <Text style={styles.fieldLabel}>Admitting Physician</Text>
              <TextInput style={styles.modalInput} value={doctor} onChangeText={setDoctor} />

              <Text style={styles.fieldLabel}>Provisional Diagnosis</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 60 }]}
                multiline
                placeholder="Admission reason and initial clinical evaluation..."
                value={provDiagnosis}
                onChangeText={setProvDiagnosis}
              />

              <Text style={styles.fieldLabel}>Initial Nursing Orders</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 60 }]}
                multiline
                placeholder="e.g. Q4H vitals, NPO post-midnight, IV cannula 18G..."
                value={nursingNotesInput}
                onChangeText={setNursingNotesInput}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAdmitModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAdmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color={colors.textWhite} /> : <Text style={styles.submitBtnText}>Confirm Admission</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Transfer Bed Modal */}
      <Modal visible={transferModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transfer Inpatient to New Bed</Text>
              <TouchableOpacity onPress={() => setTransferModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
              Select an available target bed for <Text style={{ fontWeight: '700' }}>{selectedAdmission?.patientName}</Text>:
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {beds.filter(b => b.status === 'AVAILABLE').map(avail => (
                <TouchableOpacity
                  key={avail.id}
                  style={styles.transferOption}
                  onPress={() => handleTransfer(avail.id)}
                >
                  <View>
                    <Text style={styles.transferBedName}>{avail.bedNumber}</Text>
                    <Text style={styles.transferWardName}>{avail.wardName}</Text>
                  </View>
                  <View style={styles.transferConfirmPill}>
                    <Text style={styles.transferConfirmText}>Transfer Here</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Discharge Summary Modal */}
      <Modal visible={dischargeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Prepare Discharge Summary</Text>
              <TouchableOpacity onPress={() => setDischargeModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.fieldLabel}>Clinical Course & Treatment Summary *</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 90 }]}
                multiline
                placeholder="Document patient hospital recovery course, procedures done, and discharge condition..."
                value={dischargeSummary}
                onChangeText={setDischargeSummary}
              />
              <Text style={styles.fieldLabel}>Discharge Instructions & Medication Advice</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 70 }]}
                multiline
                placeholder="Follow-up instructions, wound care, medication taper schedule..."
                value={dischargeAdvice}
                onChangeText={setDischargeAdvice}
              />
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDischargeModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: colors.danger }]} 
                onPress={handleDischarge}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color={colors.textWhite} /> : <Text style={styles.submitBtnText}>Sign & Discharge Patient</Text>}
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
  matrixPanel: {
    flex: 1,
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
    marginBottom: 14,
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
  legendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  wardPills: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  wardPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  wardPillActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  wardPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  wardPillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  bedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 16,
  },
  bedCard: {
    width: '23.5%',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    padding: 12,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  bedCardAvailable: {
    borderTopWidth: 4,
    borderTopColor: colors.success,
  },
  bedCardOccupied: {
    borderTopWidth: 4,
    borderTopColor: colors.danger,
    backgroundColor: '#FEF2F2',
  },
  bedCardCleaning: {
    borderTopWidth: 4,
    borderTopColor: colors.warning,
    backgroundColor: '#FFFBEB',
  },
  bedCardActive: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  bedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bedNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  bedWard: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  occupantBox: {
    marginTop: 8,
  },
  occupantName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  occupantUhid: {
    fontSize: 10,
    color: colors.textMuted,
  },
  emptyBedStatus: {
    alignItems: 'flex-start',
    marginTop: 10,
  },
  emptyBedStatusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  inpatientSidebar: {
    width: 340,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
  },
  inpatientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inpatientTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  badgeAdmitted: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeAdmittedText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.danger,
  },
  inpatientProfile: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ipdPatientName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  ipdMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  ipdDoctor: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
  },
  ipdBedLocation: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    marginBottom: 10,
  },
  cardHeaderSmall: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  diagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  nursingNotesText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  sidebarActions: {
    gap: 8,
    marginTop: 8,
  },
  sidebarBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sidebarBtnText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  emptySidebar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
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
  transferOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  transferBedName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  transferWardName: {
    fontSize: 11,
    color: colors.textMuted,
  },
  transferConfirmPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  transferConfirmText: {
    color: colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
});

