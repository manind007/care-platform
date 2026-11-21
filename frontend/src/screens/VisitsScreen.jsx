import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { apiFetch, fetchClients } from '../api/client';
import { 
  Clock, 
  MapPin, 
  QrCode, 
  CheckCircle, 
  Play, 
  Square, 
  UserCheck, 
  AlertCircle, 
  Calendar,
  X,
  Plus,
  UserPlus
} from 'lucide-react';

export const VisitsScreen = ({ currentPersona }) => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [checkOutModalVisible, setCheckOutModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  // Clients & Staff for scheduling/assigning
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(1);
  const [staffList] = useState([
    { id: 5, name: 'Emily Watson (Senior Carer)' },
    { id: 6, name: 'James Carter (Care Worker)' }
  ]);
  const [selectedStaffId, setSelectedStaffId] = useState(5);
  const [selectedClientFilter, setSelectedClientFilter] = useState(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');

  // New Visit form state
  const [visitType, setVisitType] = useState('MORNING_CALL');
  const [visitStartTime, setVisitStartTime] = useState('08:00');
  const [visitEndTime, setVisitEndTime] = useState('09:00');
  const [visitNotes, setVisitNotes] = useState('Morning personal hygiene, hydration check, medication prompt.');
  const [submitting, setSubmitting] = useState(false);

  // CheckIn form state
  const [checkInMethod, setCheckInMethod] = useState('GPS');
  const [qrToken, setQrToken] = useState('QR-KEY-WESTMINSTER-1');
  const [lat, setLat] = useState('51.5134');
  const [lng, setLng] = useState('-0.1912');

  // CheckOut form state
  const [careNotes, setCareNotes] = useState('');

  useEffect(() => {
    loadVisits();
    fetchClients().then(data => setClients(data || [])).catch(console.error);
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/visits');
      setVisits(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedVisit) return;
    try {
      await apiFetch(`/visits/${selectedVisit.id}/check-in`, {
        method: 'POST',
        body: JSON.stringify({
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          method: checkInMethod,
          qrToken: checkInMethod === 'QR_CODE' ? qrToken : null
        })
      });
      setCheckInModalVisible(false);
      loadVisits();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedVisit) return;
    try {
      await apiFetch(`/visits/${selectedVisit.id}/check-out`, {
        method: 'POST',
        body: JSON.stringify({
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          careNotes: careNotes || 'All scheduled care tasks completed smoothly.',
          allTasksCompleted: true
        })
      });
      setCheckOutModalVisible(false);
      setCareNotes('');
      loadVisits();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedVisit) return;
    const staff = staffList.find(s => s.id === selectedStaffId);
    try {
      await apiFetch(`/visits/${selectedVisit.id}/assign?staffId=${selectedStaffId}&staffName=${encodeURIComponent(staff?.name || 'Carer')}`, {
        method: 'PATCH'
      });
      setAssignModalVisible(false);
      loadVisits();
      alert(`Visit #${selectedVisit.id} allocated to ${staff?.name}!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleScheduleVisit = async () => {
    const client = clients.find(c => c.id === selectedClientId) || clients[0];
    const staff = staffList.find(s => s.id === selectedStaffId);
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      setSubmitting(true);
      await apiFetch('/visits', {
        method: 'POST',
        body: JSON.stringify({
          visitReference: 'VIS-' + Math.floor(1000 + Math.random() * 9000),
          clientId: selectedClientId,
          clientName: `${client?.firstName} ${client?.lastName}`,
          clientAddress: `${client?.address}, ${client?.postcode}`,
          staffId: selectedStaffId,
          staffName: staff?.name,
          visitType,
          status: 'SCHEDULED',
          scheduledStart: `${todayStr}T${visitStartTime}:00`,
          scheduledEnd: `${todayStr}T${visitEndTime}:00`,
          instructions: visitNotes,
          billable: true,
          billingRate: 25.0
        })
      });
      setScheduleModalVisible(false);
      loadVisits();
      alert('New care visit scheduled and added to daily roster!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <View>
            <Text style={styles.title}>Rostering & Electronic Call Monitoring (ECM)</Text>
            <Text style={styles.subtitle}>
              Manage daily domiciliary visits, verify GPS geolocation and QR codes, allocate staff, and record check-in/out events.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.scheduleBtn}
            onPress={() => setScheduleModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={16} color={colors.textWhite} />
            <Text style={styles.scheduleBtnText}>Schedule Care Visit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        {/* Client Filter */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary }}>Client:</Text>
          <TouchableOpacity
            style={[styles.filterChip, selectedClientFilter === null && styles.filterChipActive]}
            onPress={() => setSelectedClientFilter(null)}
          >
            <Text style={[styles.filterChipText, selectedClientFilter === null && styles.filterChipTextActive]}>
              All Clients ({visits.length})
            </Text>
          </TouchableOpacity>
          {clients.map(c => {
            const count = visits.filter(v => v.clientId === c.id).length;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.filterChip, selectedClientFilter === c.id && styles.filterChipActive]}
                onPress={() => setSelectedClientFilter(c.id)}
              >
                <Text style={[styles.filterChipText, selectedClientFilter === c.id && styles.filterChipTextActive]}>
                  {c.firstName} {c.lastName} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Visit Type Filter */}
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary }}>Type:</Text>
          {['ALL', 'PERSONAL_CARE', 'NUTRITION', 'MEDICATION_ONLY'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, selectedTypeFilter === type && styles.filterChipActive]}
              onPress={() => setSelectedTypeFilter(type)}
            >
              <Text style={[styles.filterChipText, selectedTypeFilter === type && styles.filterChipTextActive]}>
                {type.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Visits List */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.visitsGrid}>
          {visits
            .filter(v => (!selectedClientFilter || v.clientId === selectedClientFilter) && (selectedTypeFilter === 'ALL' || v.visitType === selectedTypeFilter))
            .map((visit) => {
            const isScheduled = visit.status === 'SCHEDULED' || visit.status === 'CONFIRMED';
            const isInProgress = visit.status === 'IN_PROGRESS';
            const isCompleted = visit.status === 'COMPLETED';

            return (
              <View key={visit.id} style={styles.visitCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <View style={styles.refBadge}>
                      <Text style={styles.refText}>{visit.visitReference}</Text>
                    </View>
                    {visit.visitType && (
                      <View style={[styles.refBadge, { backgroundColor: '#F1F5F9' }]}>
                        <Text style={[styles.refText, { color: colors.textSecondary }]}>{visit.visitType.replace('_', ' ')}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[
                    styles.statusPill,
                    isCompleted && { backgroundColor: colors.successLight },
                    isInProgress && { backgroundColor: colors.warningLight },
                    isScheduled && { backgroundColor: colors.infoLight }
                  ]}>
                    <Text style={[
                      styles.statusPillText,
                      isCompleted && { color: colors.success },
                      isInProgress && { color: colors.warning },
                      isScheduled && { color: colors.info }
                    ]}>
                      {visit.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.clientName}>{visit.clientName}</Text>
                <Text style={styles.addressText}>📍 {visit.clientAddress}</Text>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Clock size={13} color={colors.textMuted} />
                    <Text style={styles.detailText}>
                      {visit.scheduledStart?.split('T')[1]?.substring(0, 5)} - {visit.scheduledEnd?.split('T')[1]?.substring(0, 5)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <UserCheck size={13} color={colors.textMuted} />
                    <Text style={styles.detailText}>{visit.staffName || 'Unassigned'}</Text>
                  </View>
                </View>

                {visit.careNotes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>CARE NOTES:</Text>
                    <Text style={styles.notesContent}>{visit.careNotes}</Text>
                  </View>
                )}

                {/* ECM Verification Details */}
                {visit.checkInMethod && (
                  <View style={{ gap: 6 }}>
                    <View style={styles.ecmBadge}>
                      <MapPin size={12} color={colors.primaryDark} />
                      <Text style={styles.ecmBadgeText}>
                        ECM Verified ({visit.checkInMethod}): {visit.checkInLatitude?.toFixed(4)}, {visit.checkInLongitude?.toFixed(4)}
                      </Text>
                    </View>
                    {visit.qrVerificationToken && (
                      <View style={[styles.ecmBadge, { backgroundColor: '#FDF2F8', borderColor: '#FBCFE8' }]}>
                        <QrCode size={12} color="#BE185D" />
                        <Text style={[styles.ecmBadgeText, { color: '#BE185D' }]}>
                          QR Code Token: {visit.qrVerificationToken}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  {isScheduled && (
                    <View style={{ flexDirection: 'row', gap: 8, flex: 1, flexWrap: 'wrap' }}>
                      <TouchableOpacity
                        style={[styles.btn, styles.btnPrimary, { flex: 1, minWidth: 140 }]}
                        onPress={() => {
                          setSelectedVisit(visit);
                          setCheckInModalVisible(true);
                        }}
                      >
                        <Play size={14} color={colors.textWhite} />
                        <Text style={styles.btnText}>Check-In (ECM)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.btn, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: colors.cardBorder }]}
                        onPress={() => {
                          setSelectedVisit(visit);
                          setAssignModalVisible(true);
                        }}
                      >
                        <UserPlus size={14} color={colors.primaryDark} />
                        <Text style={[styles.btnText, { color: colors.primaryDark }]}>Assign</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {isInProgress && (
                    <TouchableOpacity
                      style={[styles.btn, styles.btnWarning]}
                      onPress={() => {
                        setSelectedVisit(visit);
                        setCheckOutModalVisible(true);
                      }}
                    >
                      <Square size={14} color={colors.textWhite} />
                      <Text style={styles.btnText}>Complete & Check-Out</Text>
                    </TouchableOpacity>
                  )}

                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <CheckCircle size={14} color={colors.success} />
                      <Text style={styles.completedText}>Delivery Verified</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Check-In Modal */}
      <Modal visible={checkInModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Electronic Call Monitoring Check-In</Text>
              <TouchableOpacity onPress={() => setCheckInModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Confirm client arrival for {selectedVisit?.clientName} at {selectedVisit?.clientAddress}.
            </Text>

            <Text style={styles.inputLabel}>VERIFICATION METHOD</Text>
            <View style={styles.methodSelector}>
              <TouchableOpacity 
                style={[styles.methodBtn, checkInMethod === 'GPS' && styles.methodBtnActive]}
                onPress={() => setCheckInMethod('GPS')}
              >
                <MapPin size={16} color={checkInMethod === 'GPS' ? colors.primary : colors.textMuted} />
                <Text style={[styles.methodBtnText, checkInMethod === 'GPS' && { color: colors.primary }]}>GPS Geolocation</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.methodBtn, checkInMethod === 'QR_CODE' && styles.methodBtnActive]}
                onPress={() => setCheckInMethod('QR_CODE')}
              >
                <QrCode size={16} color={checkInMethod === 'QR_CODE' ? colors.primary : colors.textMuted} />
                <Text style={[styles.methodBtnText, checkInMethod === 'QR_CODE' && { color: colors.primary }]}>QR Key Safe Code</Text>
              </TouchableOpacity>
            </View>

            {checkInMethod === 'GPS' ? (
              <View style={styles.gpsContainer}>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Captured Location Coordinates:</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primaryDark }}>
                  Latitude: {lat} | Longitude: {lng} (Accuracy: 4.2m)
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.inputLabel}>ENTER / SCAN QR TOKEN</Text>
                <TextInput 
                  style={styles.textInput}
                  value={qrToken}
                  onChangeText={setQrToken}
                  placeholder="Scan key safe door token..."
                />
              </View>
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleCheckIn}>
              <Text style={styles.submitBtnText}>Confirm Check-In (Commence Visit)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Check-Out Modal */}
      <Modal visible={checkOutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Visit Checkout & Care Note Verification</Text>
              <TouchableOpacity onPress={() => setCheckOutModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Complete care service delivery for {selectedVisit?.clientName}. Care notes recorded here will be accessible to coordinators and published to authorized family members.
            </Text>

            <Text style={styles.inputLabel}>CARE OBSERVATIONS & NOTES *</Text>
            <TextInput 
              style={[styles.textInput, { height: 90 }]}
              multiline
              value={careNotes}
              onChangeText={setCareNotes}
              placeholder="e.g. Prepared hot breakfast, prompted morning medication, mobility supported with frame, client in good spirits."
            />

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.warning }]} onPress={handleCheckOut}>
              <Text style={styles.submitBtnText}>Sign Off & Complete Visit (ECM Verified)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Assign Staff Modal */}
      <Modal visible={assignModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Allocate Staff to Visit #{selectedVisit?.visitReference}</Text>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Assign an available qualified frontline carer to deliver service for {selectedVisit?.clientName}.
            </Text>

            <Text style={styles.inputLabel}>SELECT CARE WORKER</Text>
            <View style={{ gap: 8 }}>
              {staffList.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.staffOption, selectedStaffId === s.id && styles.staffOptionActive]}
                  onPress={() => setSelectedStaffId(s.id)}
                >
                  <UserCheck size={16} color={selectedStaffId === s.id ? colors.primary : colors.textMuted} />
                  <Text style={[styles.staffOptionText, selectedStaffId === s.id && { color: colors.primaryDark, fontWeight: '700' }]}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleAssignStaff}>
              <Text style={styles.submitBtnText}>Confirm Staff Assignment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Schedule Visit Modal */}
      <Modal visible={scheduleModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule New Care Visit</Text>
              <TouchableOpacity onPress={() => setScheduleModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 480 }} contentContainerStyle={{ gap: 12 }}>
              <Text style={styles.inputLabel}>SELECT CLIENT</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {clients.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.staffOption, selectedClientId === c.id && styles.staffOptionActive]}
                    onPress={() => setSelectedClientId(c.id)}
                  >
                    <Text style={[styles.staffOptionText, selectedClientId === c.id && { color: colors.primaryDark, fontWeight: '700' }]}>
                      {c.firstName} {c.lastName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>START TIME</Text>
                  <TextInput
                    style={styles.textInput}
                    value={visitStartTime}
                    onChangeText={setVisitStartTime}
                    placeholder="08:00"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>END TIME</Text>
                  <TextInput
                    style={styles.textInput}
                    value={visitEndTime}
                    onChangeText={setVisitEndTime}
                    placeholder="09:00"
                  />
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>VISIT TYPE</Text>
                <TextInput
                  style={styles.textInput}
                  value={visitType}
                  onChangeText={setVisitType}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>CARE INSTRUCTIONS</Text>
                <TextInput
                  style={[styles.textInput, { height: 60 }]}
                  multiline
                  value={visitNotes}
                  onChangeText={setVisitNotes}
                />
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]} 
              onPress={handleScheduleVisit}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Scheduling...' : 'Commit Scheduled Visit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    gap: 20,
  },
  headerCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  scheduleBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  visitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  visitCard: {
    flex: 1,
    minWidth: 320,
    maxWidth: 440,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  refText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  notesBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 10,
    gap: 2,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
  },
  notesContent: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  ecmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 6,
    padding: 6,
  },
  ecmBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  cardActions: {
    marginTop: 4,
    flexDirection: 'row',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnWarning: {
    backgroundColor: colors.warning,
    width: '100%',
  },
  btnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingVertical: 8,
    backgroundColor: colors.successLight,
    borderRadius: 8,
  },
  completedText: {
    color: colors.success,
    fontSize: 12,
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
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    width: '100%',
    maxWidth: 480,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  methodSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  methodBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  methodBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  gpsContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: colors.textPrimary,
  },
  staffOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  staffOptionActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  staffOptionText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
});
