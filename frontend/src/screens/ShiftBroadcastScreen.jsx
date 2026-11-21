import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { 
  fetchOpenShiftBroadcasts, 
  broadcastOpenShift, 
  claimOpenShift, 
  cancelShiftBroadcast 
} from '../api/client';
import { 
  Radio, 
  Bell, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Award, 
  PoundSterling, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  Zap 
} from 'lucide-react';

export const ShiftBroadcastScreen = ({ currentPersona }) => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('OPEN'); // OPEN, ALL
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // New Broadcast Form
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('Westminster, London SW1');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('17:30');
  const [endTime, setEndTime] = useState('20:30');
  const [requiredSkills, setRequiredSkills] = useState('DEMENTIA_TIER3, MEDICATION_ADMINISTRATION');
  const [hourlyRate, setHourlyRate] = useState('22.50');
  const [urgency, setUrgency] = useState('CRITICAL_SAME_DAY');
  const [broadcastNotes, setBroadcastNotes] = useState('');

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    try {
      setLoading(true);
      const data = await fetchOpenShiftBroadcasts();
      setBroadcasts(data || []);
    } catch (err) {
      console.error('Failed to load shift broadcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!clientName || !startTime || !endTime) {
      alert('Please fill in Client Name and Shift Times.');
      return;
    }
    try {
      await broadcastOpenShift({
        clientName,
        clientAddress,
        shiftDate,
        startTime,
        endTime,
        requiredSkills,
        hourlyRate: parseFloat(hourlyRate),
        urgency,
        broadcastNotes
      });
      setShowBroadcastModal(false);
      resetForm();
      await loadBroadcasts();
    } catch (err) {
      alert('Error broadcasting shift: ' + err.message);
    }
  };

  const handleClaim = async (broadcast) => {
    const carerName = currentPersona ? currentPersona.name : 'Senior Carer Emily Watson';
    try {
      await claimOpenShift(broadcast.id, { carerName });
      alert(`Shift successfully claimed by ${carerName}! The care visit has been locked and assigned.`);
      await loadBroadcasts();
    } catch (err) {
      alert('Error claiming shift: ' + err.message);
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt('Enter cancellation reason:', 'Shift covered by internal roster adjustment');
    if (!reason) return;
    try {
      await cancelShiftBroadcast(id, reason);
      await loadBroadcasts();
    } catch (err) {
      alert('Error cancelling shift: ' + err.message);
    }
  };

  const resetForm = () => {
    setClientName('');
    setBroadcastNotes('');
    setHourlyRate('22.50');
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL_SAME_DAY':
        return { bg: '#FEE2E2', text: '#991B1B', label: 'CRITICAL SAME-DAY', border: '#F87171' };
      case 'HIGH_PRIORITY':
        return { bg: '#FEF3C7', text: '#92400E', label: 'HIGH PRIORITY', border: '#FBBF24' };
      default:
        return { bg: '#E0F2FE', text: '#075985', label: 'STANDARD OPEN', border: '#BAE6FD' };
    }
  };

  const displayedList = filterMode === 'OPEN' 
    ? broadcasts.filter(b => b.broadcastStatus === 'OPEN') 
    : broadcasts;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Connecting to Open Shift Broadcast Radar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Radio size={24} color="#7C3AED" />
            <Text style={styles.title}>Open Shift Broadcasting & Claiming Engine</Text>
            <View style={styles.benchmarkTag}>
              <Text style={styles.benchmarkText}>AxisCare & CareSmartz360 Benchmark</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Broadcast Unfilled & Sickness Shifts • Real-Time Carer Claiming • Automated Roster Sync & Premium Rates
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadBroadcasts}>
            <RefreshCw size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.newBtn} onPress={() => setShowBroadcastModal(true)}>
            <Plus size={16} color="#FFF" />
            <Text style={styles.newBtnText}>Broadcast Open Shift</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KPI Stats */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiVal, { color: '#7C3AED' }]}>
            {broadcasts.filter(b => b.broadcastStatus === 'OPEN').length}
          </Text>
          <Text style={styles.kpiLabel}>Live Open Broadcasts</Text>
          <Text style={styles.kpiSub}>Awaiting Carer Claiming</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiVal, { color: '#DC2626' }]}>
            {broadcasts.filter(b => b.urgency === 'CRITICAL_SAME_DAY' && b.broadcastStatus === 'OPEN').length}
          </Text>
          <Text style={styles.kpiLabel}>Critical Same-Day Alerts</Text>
          <Text style={styles.kpiSub}>Urgent Short Notice Shifts</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiVal, { color: '#059669' }]}>
            {broadcasts.filter(b => b.broadcastStatus === 'CLAIMED').length}
          </Text>
          <Text style={styles.kpiLabel}>Successfully Covered</Text>
          <Text style={styles.kpiSub}>Zero Unmet Care Visits</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>£21.25/h</Text>
          <Text style={styles.kpiLabel}>Average Premium Rate</Text>
          <Text style={styles.kpiSub}>Incentivized Coverage</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tabChip, filterMode === 'OPEN' && styles.tabChipActive]} 
          onPress={() => setFilterMode('OPEN')}
        >
          <Text style={[styles.tabChipText, filterMode === 'OPEN' && styles.tabChipTextActive]}>
            Available to Claim ({broadcasts.filter(b => b.broadcastStatus === 'OPEN').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabChip, filterMode === 'ALL' && styles.tabChipActive]} 
          onPress={() => setFilterMode('ALL')}
        >
          <Text style={[styles.tabChipText, filterMode === 'ALL' && styles.tabChipTextActive]}>
            All Broadcast Records ({broadcasts.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Broadcast Cards Grid */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {displayedList.length === 0 ? (
          <View style={styles.emptyCard}>
            <CheckCircle2 size={36} color={colors.success} />
            <Text style={styles.emptyTitle}>All Shifts Are Fully Roster-Covered!</Text>
            <Text style={styles.emptySub}>No unassigned or broadcast shifts currently outstanding.</Text>
          </View>
        ) : (
          <View style={styles.cardsGrid}>
            {displayedList.map((item) => {
              const uBadge = getUrgencyBadge(item.urgency);
              const isOpen = item.broadcastStatus === 'OPEN';
              return (
                <View key={item.id} style={[styles.card, { borderTopColor: uBadge.border, borderTopWidth: 4 }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardClient}>{item.clientName}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <MapPin size={12} color="#6B7280" />
                        <Text style={styles.cardAddress}>{item.clientAddress}</Text>
                      </View>
                    </View>
                    <View style={[styles.urgencyBadge, { backgroundColor: uBadge.bg }]}>
                      <Text style={[styles.urgencyText, { color: uBadge.text }]}>{uBadge.label}</Text>
                    </View>
                  </View>

                  <View style={styles.timeStrip}>
                    <Clock size={14} color="#374151" />
                    <Text style={styles.timeText}>
                      {item.shiftDate} • {item.startTime} - {item.endTime}
                    </Text>
                    <View style={styles.rateBadge}>
                      <Text style={styles.rateText}>£{item.hourlyRate?.toFixed(2)}/hr</Text>
                    </View>
                  </View>

                  {item.requiredSkills && (
                    <View style={styles.skillsStrip}>
                      <Award size={13} color="#D97706" />
                      <Text style={styles.skillsText}>Required: {item.requiredSkills}</Text>
                    </View>
                  )}

                  {item.broadcastNotes && (
                    <Text style={styles.notesText} numberOfLines={2}>
                      "{item.broadcastNotes}"
                    </Text>
                  )}

                  <View style={styles.footerRow}>
                    {isOpen ? (
                      <TouchableOpacity 
                        style={styles.claimBtn}
                        onPress={() => handleClaim(item)}
                      >
                        <Zap size={14} color="#FFF" />
                        <Text style={styles.claimBtnText}>Claim This Shift Now</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.claimedPill}>
                        <CheckCircle2 size={14} color="#059669" />
                        <Text style={styles.claimedPillText}>
                          Claimed by {item.claimedByName || 'Carer'}
                        </Text>
                      </View>
                    )}

                    {isOpen && (
                      <TouchableOpacity 
                        style={styles.cancelLink}
                        onPress={() => handleCancel(item.id)}
                      >
                        <Text style={styles.cancelLinkText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal: Broadcast New Shift */}
      <Modal visible={showBroadcastModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Broadcast Open / Urgent Care Shift</Text>
              <Text style={styles.modalSub}>
                Instantly notify qualified care workers to cover unfilled shifts or emergency sickness.
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Client Name *</Text>
                <TextInput style={styles.formInput} placeholder="e.g. Margaret Higgins" value={clientName} onChangeText={setClientName} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Client Location Address</Text>
                <TextInput style={styles.formInput} value={clientAddress} onChangeText={setClientAddress} />
              </View>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Shift Date</Text>
                  <TextInput style={styles.formInput} value={shiftDate} onChangeText={setShiftDate} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Time Window (Start - End) *</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TextInput style={[styles.formInput, { flex: 1 }]} value={startTime} onChangeText={setStartTime} />
                    <TextInput style={[styles.formInput, { flex: 1 }]} value={endTime} onChangeText={setEndTime} />
                  </View>
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Hourly Premium Pay Rate (£/hr)</Text>
                  <TextInput style={styles.formInput} keyboardType="numeric" value={hourlyRate} onChangeText={setHourlyRate} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Urgency Priority</Text>
                  <TextInput style={styles.formInput} value={urgency} onChangeText={setUrgency} />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Required Clinical Competencies</Text>
                <TextInput style={styles.formInput} value={requiredSkills} onChangeText={setRequiredSkills} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Special Notes / Shift Brief</Text>
                <TextInput style={[styles.formInput, { height: 60 }]} multiline placeholder="Explain visit duties and access code details..." value={broadcastNotes} onChangeText={setBroadcastNotes} />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowBroadcastModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleBroadcast}>
                  <Text style={styles.confirmBtnText}>Broadcast to Staff</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    gap: 16
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827'
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  },
  benchmarkTag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  benchmarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED'
  },
  refreshBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF'
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  newBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  kpiVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827'
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginTop: 2
  },
  kpiSub: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  tabChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED'
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563'
  },
  tabChipTextActive: {
    color: '#FFF'
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14
  },
  card: {
    width: '49%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  cardClient: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  cardAddress: {
    fontSize: 11,
    color: '#6B7280'
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  urgencyText: {
    fontSize: 9,
    fontWeight: '800'
  },
  timeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    flex: 1
  },
  rateBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  rateText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669'
  },
  skillsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  skillsText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600'
  },
  notesText: {
    fontSize: 12,
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 16
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  claimBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF'
  },
  claimedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  claimedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D'
  },
  cancelLink: {
    padding: 4
  },
  cancelLinkText: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  emptyCard: {
    backgroundColor: '#FFF',
    padding: 40,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
    marginTop: 20
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151'
  },
  emptySub: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 550,
    gap: 12
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827'
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280'
  },
  formGroup: {
    gap: 4
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151'
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#FFF'
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563'
  },
  confirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#7C3AED'
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF'
  }
});

