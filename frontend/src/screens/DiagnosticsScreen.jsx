import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { 
  fetchDiagnosticOrders, 
  createDiagnosticOrder, 
  collectDiagnosticSample, 
  recordDiagnosticResult 
} from '../api/client';
import { 
  FlaskConical, 
  Plus, 
  Search, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Microscope, 
  Clock, 
  CheckCircle,
  Scan
} from 'lucide-react';

export const DiagnosticsScreen = ({ currentPersona }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // New Order Form State
  const [patientName, setPatientName] = useState('');
  const [uhid, setUhid] = useState('UHID-2026-000' + Math.floor(Math.random() * 90 + 10));
  const [age, setAge] = useState('55');
  const [gender, setGender] = useState('Female');
  const [doctor, setDoctor] = useState('Dr. Sarah Jenkins');
  const [category, setCategory] = useState('PATHOLOGY');
  const [testName, setTestName] = useState('Complete Blood Count (CBC)');
  const [sampleType, setSampleType] = useState('Whole Blood (EDTA)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Result Entry Form State
  const [resultVal, setResultVal] = useState('');
  const [refRange, setRefRange] = useState('');
  const [unit, setUnit] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [verifiedBy, setVerifiedBy] = useState('Dr. Elena Rostova (Pathologist)');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchDiagnosticOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load diagnostic orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrder = async () => {
    if (!patientName.trim() || !testName.trim()) return;
    try {
      setSubmitting(true);
      const payload = {
        patientName,
        uhid,
        age: parseInt(age) || 45,
        gender,
        referringDoctor: doctor,
        testCategory: category,
        testName,
        sampleType,
        clinicalNotes: notes,
        status: 'ORDERED'
      };
      await createDiagnosticOrder(payload);
      setCreateModalVisible(false);
      setPatientName('');
      setNotes('');
      await loadData();
    } catch (err) {
      console.error('Failed to create diagnostic order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCollectSample = async (orderId) => {
    try {
      await collectDiagnosticSample(orderId);
      await loadData();
    } catch (err) {
      console.error('Failed to collect sample:', err);
    }
  };

  const openResultModal = (order) => {
    setSelectedOrder(order);
    setResultVal(order.resultValue || '');
    setRefRange(order.referenceRange || '');
    setUnit(order.unit || '');
    setIsAbnormal(order.isAbnormal || false);
    setResultModalVisible(true);
  };

  const handleSaveResult = async () => {
    if (!selectedOrder || !resultVal.trim()) return;
    try {
      setSubmitting(true);
      await recordDiagnosticResult(selectedOrder.id, {
        resultValue: resultVal,
        referenceRange: refRange,
        unit,
        isAbnormal,
        verifiedBy
      });
      setResultModalVisible(false);
      await loadData();
    } catch (err) {
      console.error('Failed to record result:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.patientName && o.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.uhid && o.uhid.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.testName && o.testName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || o.testCategory === categoryFilter;
    const matchesStat = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesCat && matchesStat;
  });

  const totalOrders = orders.length;
  const pendingCollection = orders.filter(o => o.status === 'ORDERED').length;
  const inProcessing = orders.filter(o => o.status === 'SAMPLE_COLLECTED' || o.status === 'PROCESSING').length;
  const completed = orders.filter(o => o.status === 'COMPLETED').length;
  const abnormalCount = orders.filter(o => o.isAbnormal).length;

  return (
    <View style={styles.container}>
      {/* Top Banner Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TOTAL INVESTIGATIONS</Text>
          <Text style={styles.statValue}>{totalOrders}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
          <Text style={styles.statLabel}>PENDING COLLECTION</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{pendingCollection}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.warning }]}>
          <Text style={styles.statLabel}>IN LAB / PROCESSING</Text>
          <Text style={[styles.statValue, { color: colors.warning }]}>{inProcessing}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
          <Text style={styles.statLabel}>COMPLETED REPORTS</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>{completed}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.danger }]}>
          <Text style={styles.statLabel}>ABNORMAL FINDINGS</Text>
          <Text style={[styles.statValue, { color: colors.danger }]}>{abnormalCount}</Text>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainCard}>
        {/* Header & Controls */}
        <View style={styles.tableHeader}>
          <View>
            <Text style={styles.titleText}>Diagnostics, Pathology & Radiology Hub</Text>
            <Text style={styles.subtitleText}>End-to-end specimen tracking & verified report generation</Text>
          </View>
          <TouchableOpacity 
            style={styles.createBtn}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={16} color={colors.textWhite} />
            <Text style={styles.createBtnText}>Order Diagnostic Test</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Category Filter Bar */}
        <View style={styles.controlsBar}>
          <View style={styles.searchBar}>
            <Search size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by order #, patient name, UHID, or test..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.filterPills}>
            {['ALL', 'PATHOLOGY', 'RADIOLOGY', 'BIOCHEMISTRY', 'CARDIOLOGY'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterPill, categoryFilter === cat && styles.filterPillActive]}
                onPress={() => setCategoryFilter(cat)}
              >
                <Text style={[styles.filterPillText, categoryFilter === cat && styles.filterPillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Orders Table */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.table}>
              <View style={styles.tHead}>
                <Text style={[styles.th, { width: 110 }]}>ORDER #</Text>
                <Text style={[styles.th, { width: 180 }]}>PATIENT & UHID</Text>
                <Text style={[styles.th, { width: 190 }]}>TEST NAME & CATEGORY</Text>
                <Text style={[styles.th, { width: 130 }]}>SAMPLE SPECIMEN</Text>
                <Text style={[styles.th, { width: 140 }]}>STATUS</Text>
                <Text style={[styles.th, { flex: 1 }]}>DIAGNOSTIC RESULT & REPORT</Text>
                <Text style={[styles.th, { width: 130 }]}>ACTIONS</Text>
              </View>

              {filteredOrders.map(order => (
                <View key={order.id} style={styles.tRow}>
                  <View style={{ width: 110 }}>
                    <Text style={styles.orderNum}>{order.orderNumber}</Text>
                    <Text style={styles.doctorName}>{order.referringDoctor}</Text>
                  </View>

                  <View style={{ width: 180 }}>
                    <Text style={styles.patientName}>{order.patientName}</Text>
                    <Text style={styles.uhidMeta}>{order.uhid} • {order.gender}, {order.age}y</Text>
                  </View>

                  <View style={{ width: 190 }}>
                    <Text style={styles.testName}>{order.testName}</Text>
                    <View style={styles.catBadge}>
                      <Text style={styles.catBadgeText}>{order.testCategory}</Text>
                    </View>
                  </View>

                  <View style={{ width: 130 }}>
                    <Text style={styles.sampleText}>{order.sampleType || 'Standard Specimen'}</Text>
                  </View>

                  <View style={{ width: 140 }}>
                    <View style={[
                      styles.statusPill,
                      order.status === 'COMPLETED' ? styles.statusPillCompleted :
                      order.status === 'SAMPLE_COLLECTED' ? styles.statusPillCollected :
                      order.status === 'PROCESSING' ? styles.statusPillProcessing : styles.statusPillOrdered
                    ]}>
                      <Text style={styles.statusPillText}>{order.status.replace('_', ' ')}</Text>
                    </View>
                  </View>

                  <View style={{ flex: 1, paddingRight: 10 }}>
                    {order.resultValue ? (
                      <View>
                        <Text style={[styles.resultValText, order.isAbnormal && { color: colors.danger, fontWeight: '700' }]}>
                          {order.resultValue}
                        </Text>
                        <Text style={styles.refRangeText}>Ref: {order.referenceRange || 'N/A'}</Text>
                        {order.verifiedBy && (
                          <Text style={styles.verifiedByText}>Verified: {order.verifiedBy}</Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.pendingResultText}>Result pending laboratory analysis</Text>
                    )}
                  </View>

                  <View style={{ width: 130 }}>
                    {order.status === 'ORDERED' && (
                      <TouchableOpacity 
                        style={styles.tableActionBtn}
                        onPress={() => handleCollectSample(order.id)}
                      >
                        <FlaskConical size={13} color={colors.textWhite} />
                        <Text style={styles.tableActionBtnText}>Collect Sample</Text>
                      </TouchableOpacity>
                    )}
                    {(order.status === 'SAMPLE_COLLECTED' || order.status === 'PROCESSING') && (
                      <TouchableOpacity 
                        style={[styles.tableActionBtn, { backgroundColor: colors.warning }]}
                        onPress={() => openResultModal(order)}
                      >
                        <FileText size={13} color={colors.textWhite} />
                        <Text style={styles.tableActionBtnText}>Enter Result</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'COMPLETED' && (
                      <TouchableOpacity 
                        style={[styles.tableActionBtn, { backgroundColor: colors.secondary }]}
                        onPress={() => openResultModal(order)}
                      >
                        <CheckCircle size={13} color={colors.textWhite} />
                        <Text style={styles.tableActionBtnText}>View Report</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Order Test Modal */}
      <Modal visible={createModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Diagnostic Investigation</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.fieldLabel}>Patient Name *</Text>
              <TextInput style={styles.modalInput} placeholder="e.g. Margaret Higgins" value={patientName} onChangeText={setPatientName} />

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

              <Text style={styles.fieldLabel}>Referring Doctor</Text>
              <TextInput style={styles.modalInput} value={doctor} onChangeText={setDoctor} />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Test Category</Text>
                  <TextInput style={styles.modalInput} value={category} onChangeText={setCategory} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Sample Specimen Type</Text>
                  <TextInput style={styles.modalInput} value={sampleType} onChangeText={setSampleType} />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Investigation / Test Name *</Text>
              <TextInput style={styles.modalInput} placeholder="e.g. Echocardiogram 2D / Chest X-Ray" value={testName} onChangeText={setTestName} />

              <Text style={styles.fieldLabel}>Clinical Indication / Reason</Text>
              <TextInput style={[styles.modalInput, { minHeight: 60 }]} multiline placeholder="Symptoms, differential diagnoses..." value={notes} onChangeText={setNotes} />
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateOrder} disabled={submitting}>
                {submitting ? <ActivityIndicator color={colors.textWhite} /> : <Text style={styles.submitBtnText}>Submit Order</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Enter Result Modal */}
      <Modal visible={resultModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Diagnostic Result & Verification</Text>
              <TouchableOpacity onPress={() => setResultModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>
                Test: {selectedOrder?.testName} ({selectedOrder?.testCategory})
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>
                Patient: {selectedOrder?.patientName} ({selectedOrder?.uhid})
              </Text>

              <Text style={styles.fieldLabel}>Result Findings & Quantitative Values *</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 70 }]}
                multiline
                placeholder="Enter clinical observations, measurements or report findings..."
                value={resultVal}
                onChangeText={setResultVal}
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Normal Reference Range</Text>
                  <TextInput style={styles.modalInput} placeholder="e.g. 12.0 - 15.5 g/dL" value={refRange} onChangeText={setRefRange} />
                </View>
                <View style={{ width: 100 }}>
                  <Text style={styles.fieldLabel}>Unit</Text>
                  <TextInput style={styles.modalInput} placeholder="g/dL" value={unit} onChangeText={setUnit} />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.checkboxRow, isAbnormal && styles.checkboxRowActive]}
                onPress={() => setIsAbnormal(!isAbnormal)}
              >
                <AlertTriangle size={18} color={isAbnormal ? colors.danger : colors.textMuted} />
                <Text style={[styles.checkboxLabel, isAbnormal && { color: colors.danger, fontWeight: '700' }]}>
                  Flag as Abnormal / Critical Clinical Result
                </Text>
              </TouchableOpacity>

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Verified By (Pathologist / Radiologist)</Text>
              <TextInput style={styles.modalInput} value={verifiedBy} onChangeText={setVerifiedBy} />
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setResultModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSaveResult} disabled={submitting}>
                {submitting ? <ActivityIndicator color={colors.textWhite} /> : <Text style={styles.submitBtnText}>Sign & Complete Report</Text>}
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
  mainCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitleText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createBtnText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  controlsBar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
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
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
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
    fontWeight: '700',
    color: colors.textMuted,
  },
  filterPillTextActive: {
    color: colors.primary,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  th: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  tRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
  orderNum: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  doctorName: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  patientName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  uhidMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  testName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  sampleText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillOrdered: {
    backgroundColor: colors.primaryLight,
  },
  statusPillCollected: {
    backgroundColor: '#EDE9FE',
  },
  statusPillProcessing: {
    backgroundColor: colors.warningLight,
  },
  statusPillCompleted: {
    backgroundColor: colors.successLight,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  resultValText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  refRangeText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  verifiedByText: {
    fontSize: 9,
    fontStyle: 'italic',
    color: colors.success,
    marginTop: 2,
  },
  pendingResultText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  tableActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tableActionBtnText: {
    color: colors.textWhite,
    fontSize: 11,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.background,
    marginTop: 6,
  },
  checkboxRowActive: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  checkboxLabel: {
    fontSize: 12,
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

