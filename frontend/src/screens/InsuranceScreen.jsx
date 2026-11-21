import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { 
  fetchInsuranceClaims, 
  fetchInsuranceSummary, 
  createInsuranceClaim, 
  updateInsuranceClaimStatus 
} from '../api/client';
import { 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Plus, 
  RefreshCw, 
  Building2, 
  Filter 
} from 'lucide-react';

export const InsuranceScreen = ({ currentPersona }) => {
  const [claims, setClaims] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // New Claim Form
  const [patientName, setPatientName] = useState('');
  const [uhid, setUhid] = useState('UHID-2026-0001');
  const [insuranceCompany, setInsuranceCompany] = useState('Bupa Global Healthcare');
  const [tpaName, setTpaName] = useState('Bupa In-House TPA');
  const [policyNumber, setPolicyNumber] = useState('');
  const [corporateName, setCorporateName] = useState('Standard Corporate Health');
  const [requestedAmount, setRequestedAmount] = useState('3500.00');
  const [coPayPercentage, setCoPayPercentage] = useState('10.00');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');
  const [plannedProcedure, setPlannedProcedure] = useState('');

  // Status Update Form
  const [newStatus, setNewStatus] = useState('INITIAL_PREAUTH_APPROVED');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [preAuthCode, setPreAuthCode] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [claimsData, summaryData] = await Promise.all([
        fetchInsuranceClaims().catch(() => []),
        fetchInsuranceSummary().catch(() => null)
      ]);
      setClaims(claimsData || []);
      setSummary(summaryData);
      if (claimsData && claimsData.length > 0 && !selectedClaim) {
        setSelectedClaim(claimsData[0]);
      }
    } catch (err) {
      console.error('Failed to load insurance claims data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClaim = async () => {
    if (!patientName || !policyNumber || !requestedAmount) {
      alert('Patient Name, Policy Number and Requested Amount are required.');
      return;
    }
    try {
      await createInsuranceClaim({
        uhid: uhid || `UHID-${Date.now() % 10000}`,
        patientName,
        insuranceCompany,
        tpaName,
        policyNumber,
        corporateName,
        requestedAmount: parseFloat(requestedAmount),
        coPayPercentage: coPayPercentage ? parseFloat(coPayPercentage) : 0,
        provisionalDiagnosis,
        plannedProcedure,
        claimStatus: 'SUBMITTED'
      });
      setShowNewModal(false);
      resetForm();
      await loadData();
    } catch (err) {
      alert('Error creating claim: ' + err.message);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedClaim) return;
    try {
      await updateInsuranceClaimStatus(selectedClaim.id, {
        status: newStatus,
        approvedAmount: approvedAmount ? parseFloat(approvedAmount) : selectedClaim.approvedAmount,
        preAuthCode,
        remarks: statusRemarks
      });
      setShowStatusModal(false);
      await loadData();
    } catch (err) {
      alert('Error updating claim: ' + err.message);
    }
  };

  const resetForm = () => {
    setPatientName('');
    setPolicyNumber('');
    setRequestedAmount('3500.00');
    setProvisionalDiagnosis('');
    setPlannedProcedure('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'INITIAL_PREAUTH_APPROVED':
        return { bg: '#DCFCE7', text: '#166534', label: 'PRE-AUTH APPROVED' };
      case 'QUERY_RAISED':
        return { bg: '#FEF9C3', text: '#854D0E', label: 'TPA QUERY RAISED' };
      case 'FINAL_SETTLED':
        return { bg: '#DBEAFE', text: '#1E40AF', label: 'CASHLESS SETTLED' };
      case 'REJECTED':
        return { bg: '#FEE2E2', text: '#991B1B', label: 'REJECTED' };
      default:
        return { bg: '#F3F4F6', text: '#374151', label: 'SUBMITTED' };
    }
  };

  const filteredClaims = filterStatus === 'ALL' 
    ? claims 
    : claims.filter(c => c.claimStatus === filterStatus);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Accessing TPA & Cashless Pre-Auth Desk...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={24} color="#059669" />
            <Text style={styles.title}>TPA & Cashless Insurance Claims Desk</Text>
            <View style={styles.benchmarkTag}>
              <Text style={styles.benchmarkText}>KareXpert, MocDoc & Medinous</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Inpatient Pre-Authorization • Corporate Empanelment • Deductible & Co-Pay Audits • Cashless Discharge Clearance
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadData}>
            <RefreshCw size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.newBtn} onPress={() => setShowNewModal(true)}>
            <Plus size={16} color="#FFF" />
            <Text style={styles.newBtnText}>Submit Pre-Auth</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Financial KPI Summary Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>£{summary?.totalApprovedCashlessAmount?.toLocaleString() || '4,050.00'}</Text>
          <Text style={styles.kpiLabel}>Approved Cashless Credit</Text>
          <Text style={styles.kpiSub}>Pre-Auth Guaranteed by Insurers</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>£{summary?.totalRequestedAmount?.toLocaleString() || '7,300.00'}</Text>
          <Text style={styles.kpiLabel}>Total Claims Submitted</Text>
          <Text style={styles.kpiSub}>{summary?.totalClaimsCount || claims.length} Active Enrolled Policies</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: '#FDE68A' }]}>
          <Text style={[styles.kpiVal, { color: '#B45309' }]}>{summary?.pendingPreAuthCount || 1}</Text>
          <Text style={styles.kpiLabel}>Pending TPA Inquiries</Text>
          <Text style={styles.kpiSub}>Clarifications Required</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiVal, { color: '#059669' }]}>{summary?.settlementRatePercentage || 66.7}%</Text>
          <Text style={styles.kpiLabel}>TPA Approval Ratio</Text>
          <Text style={styles.kpiSub}>Zero Delay Cashless Approvals</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <Filter size={16} color={colors.textSecondary} />
        {['ALL', 'INITIAL_PREAUTH_APPROVED', 'QUERY_RAISED', 'SUBMITTED', 'FINAL_SETTLED'].map((st) => (
          <TouchableOpacity
            key={st}
            style={[styles.filterChip, filterStatus === st && styles.filterChipActive]}
            onPress={() => setFilterStatus(st)}
          >
            <Text style={[styles.filterChipText, filterStatus === st && styles.filterChipTextActive]}>
              {st.replace(/_/g, ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Two-Column Claims Workspace */}
      <View style={styles.layout}>
        {/* Left Column: Claims List */}
        <ScrollView style={styles.listColumn} showsVerticalScrollIndicator={false}>
          {filteredClaims.length === 0 ? (
            <View style={styles.emptyCard}>
              <CheckCircle size={32} color={colors.success} />
              <Text style={styles.emptyTitle}>No Insurance Claims Match Filters</Text>
            </View>
          ) : (
            filteredClaims.map((c) => {
              const badge = getStatusBadge(c.claimStatus);
              const isSelected = selectedClaim?.id === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.claimCard, isSelected && styles.claimCardSelected]}
                  onPress={() => setSelectedClaim(c)}
                  activeOpacity={0.8}
                >
                  <View style={styles.claimCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.claimPatient}>{c.patientName}</Text>
                      <Text style={styles.claimMeta}>{c.uhid} • Policy: {c.policyNumber}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <View style={styles.insurancePill}>
                    <Building2 size={13} color="#1E40AF" />
                    <Text style={styles.insurancePillText}>{c.insuranceCompany} ({c.tpaName})</Text>
                  </View>

                  <View style={styles.amountStrip}>
                    <View>
                      <Text style={styles.amountLabel}>Requested</Text>
                      <Text style={styles.amountVal}>£{c.requestedAmount?.toFixed(2)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.amountLabel}>Approved Cashless</Text>
                      <Text style={[styles.amountVal, { color: '#059669' }]}>
                        {c.approvedAmount > 0 ? `£${c.approvedAmount?.toFixed(2)}` : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Right Column: Claim Dossier & Actions */}
        <View style={styles.dossierColumn}>
          {selectedClaim ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.dossierBox}>
                <View style={styles.dossierTop}>
                  <View>
                    <Text style={styles.dossierPatient}>{selectedClaim.patientName}</Text>
                    <Text style={styles.dossierSub}>
                      Claim Ref: {selectedClaim.claimNumber} • UHID: {selectedClaim.uhid}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBadge(selectedClaim.claimStatus).bg }]}>
                    <Text style={[styles.statusBadgeText, { color: getStatusBadge(selectedClaim.claimStatus).text }]}>
                      {getStatusBadge(selectedClaim.claimStatus).label}
                    </Text>
                  </View>
                </View>

                {/* Pre-Auth Approval Header Banner */}
                {selectedClaim.preAuthApprovalCode && (
                  <View style={styles.approvalBanner}>
                    <CheckCircle size={18} color="#059669" />
                    <View>
                      <Text style={styles.approvalCodeText}>
                        Pre-Authorization Code: {selectedClaim.preAuthApprovalCode}
                      </Text>
                      <Text style={styles.approvalDateText}>
                        Guaranteed Cashless Credit Issued on {selectedClaim.approvalDate}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Financial Ledger Breakdown */}
                <Text style={styles.sectionHeader}>CASHLESS COVERAGE LEDGER</Text>
                <View style={styles.ledgerGrid}>
                  <View style={styles.ledgerBox}>
                    <Text style={styles.ledgerLabel}>Requested Amount</Text>
                    <Text style={styles.ledgerVal}>£{selectedClaim.requestedAmount?.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.ledgerBox, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.ledgerLabel, { color: '#166534' }]}>Approved Cashless</Text>
                    <Text style={[styles.ledgerVal, { color: '#15803D' }]}>£{selectedClaim.approvedAmount?.toFixed(2)}</Text>
                  </View>
                  <View style={styles.ledgerBox}>
                    <Text style={styles.ledgerLabel}>Client Co-Pay %</Text>
                    <Text style={styles.ledgerVal}>{selectedClaim.coPayPercentage || 0}%</Text>
                  </View>
                  <View style={styles.ledgerBox}>
                    <Text style={styles.ledgerLabel}>Deductible / Excess</Text>
                    <Text style={styles.ledgerVal}>£{selectedClaim.deductibleAmount?.toFixed(2) || '0.00'}</Text>
                  </View>
                </View>

                {/* Insurance Policy Details */}
                <Text style={styles.sectionHeader}>POLICY & CORPORATE PANEL PARTICULARS</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>Insurance Underwriter:</Text>
                  <Text style={styles.detailText}>{selectedClaim.insuranceCompany}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>TPA Administrator:</Text>
                  <Text style={styles.detailText}>{selectedClaim.tpaName || 'Direct In-House Desk'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>Policy Certificate #:</Text>
                  <Text style={styles.detailText}>{selectedClaim.policyNumber} (Member: {selectedClaim.memberId || 'N/A'})</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>Corporate Scheme:</Text>
                  <Text style={styles.detailText}>{selectedClaim.corporateName || 'Retail Direct'}</Text>
                </View>

                {/* Clinical Pre-Auth Context */}
                <Text style={styles.sectionHeader}>CLINICAL PRE-AUTHORIZATION CONTEXT</Text>
                <View style={styles.noteBox}>
                  <Text style={styles.noteLabel}>Provisional Diagnosis:</Text>
                  <Text style={styles.noteText}>{selectedClaim.provisionalDiagnosis || 'Inpatient admission workup'}</Text>
                </View>

                {selectedClaim.plannedProcedure && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteLabel}>Planned Surgical / Treatment Regimen:</Text>
                    <Text style={styles.noteText}>{selectedClaim.plannedProcedure}</Text>
                  </View>
                )}

                {selectedClaim.queryRemarks && (
                  <View style={[styles.noteBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                    <Text style={[styles.noteLabel, { color: '#B45309' }]}>Outstanding TPA Query / Requirement:</Text>
                    <Text style={[styles.noteText, { color: '#92400E' }]}>{selectedClaim.queryRemarks}</Text>
                  </View>
                )}

                {/* Action Bar */}
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => {
                      setApprovedAmount(selectedClaim.requestedAmount?.toString());
                      setPreAuthCode(`AUTH-${Date.now() % 100000}`);
                      setShowStatusModal(true);
                    }}
                  >
                    <CreditCard size={16} color="#FFF" />
                    <Text style={styles.actionBtnText}>Update Pre-Auth Status / Approve Cashless</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyDossier}>
              <ShieldCheck size={48} color={colors.textMuted} />
              <Text style={styles.emptyDossierText}>Select an insurance pre-auth file to view cashless breakdown.</Text>
            </View>
          )}
        </View>
      </View>

      {/* Modal: New Pre-Auth Claim */}
      <Modal visible={showNewModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View style={[styles.modalBox, { maxWidth: 650 }]}>
              <Text style={styles.modalTitle}>Submit New TPA Pre-Authorization</Text>
              <Text style={styles.modalSub}>Log cashless hospitalization authorization request with private insurer or corporate panel.</Text>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Patient Name *</Text>
                  <TextInput style={styles.formInput} placeholder="e.g. John Doe" value={patientName} onChangeText={setPatientName} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Patient UHID</Text>
                  <TextInput style={styles.formInput} value={uhid} onChangeText={setUhid} />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Insurance Company *</Text>
                  <TextInput style={styles.formInput} value={insuranceCompany} onChangeText={setInsuranceCompany} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>TPA Administrator</Text>
                  <TextInput style={styles.formInput} value={tpaName} onChangeText={setTpaName} />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Policy Number *</Text>
                  <TextInput style={styles.formInput} placeholder="e.g. BUPA-UK-992" value={policyNumber} onChangeText={setPolicyNumber} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Corporate Panel / Employer</Text>
                  <TextInput style={styles.formInput} value={corporateName} onChangeText={setCorporateName} />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Estimated / Requested Amount (£) *</Text>
                  <TextInput style={styles.formInput} keyboardType="numeric" value={requestedAmount} onChangeText={setRequestedAmount} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Co-Pay Percentage (%)</Text>
                  <TextInput style={styles.formInput} keyboardType="numeric" value={coPayPercentage} onChangeText={setCoPayPercentage} />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Provisional Diagnosis</Text>
                <TextInput style={styles.formInput} placeholder="e.g. Total Hip Replacement, Post-Surgical Step-Down" value={provisionalDiagnosis} onChangeText={setProvisionalDiagnosis} />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNewModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleCreateClaim}>
                  <Text style={styles.confirmBtnText}>Submit Pre-Auth Claim</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Update Claim Status */}
      <Modal visible={showStatusModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Update TPA Pre-Auth Status</Text>
            <Text style={styles.modalSub}>Record insurer pre-authorization decision, approved cashless sum, or query response.</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Status Decision *</Text>
              <TextInput style={styles.formInput} value={newStatus} onChangeText={setNewStatus} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Approved Cashless Amount (£)</Text>
              <TextInput style={styles.formInput} keyboardType="numeric" value={approvedAmount} onChangeText={setApprovedAmount} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Pre-Auth Approval Code</Text>
              <TextInput style={styles.formInput} placeholder="e.g. AUTH-BP-8812" value={preAuthCode} onChangeText={setPreAuthCode} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Remarks / Disallowed Deductions</Text>
              <TextInput style={styles.formInput} placeholder="Notes from insurance adjudicator" value={statusRemarks} onChangeText={setStatusRemarks} />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowStatusModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdateStatus}>
                <Text style={styles.confirmBtnText}>Save Status Decision</Text>
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
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  benchmarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D'
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
    backgroundColor: '#059669',
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  filterChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669'
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563'
  },
  filterChipTextActive: {
    color: '#FFF'
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
    gap: 16
  },
  listColumn: {
    flex: 1.1
  },
  dossierColumn: {
    flex: 1.4
  },
  claimCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8
  },
  claimCardSelected: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4'
  },
  claimCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  claimPatient: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827'
  },
  claimMeta: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  insurancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    padding: 6,
    borderRadius: 6
  },
  insurancePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF'
  },
  amountStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8
  },
  amountLabel: {
    fontSize: 10,
    color: '#6B7280'
  },
  amountVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827'
  },
  dossierBox: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12
  },
  dossierTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12
  },
  dossierPatient: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827'
  },
  dossierSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  approvalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    borderRadius: 10
  },
  approvalCodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46'
  },
  approvalDateText: {
    fontSize: 11,
    color: '#047857'
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginTop: 6
  },
  ledgerGrid: {
    flexDirection: 'row',
    gap: 8
  },
  ledgerBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  ledgerLabel: {
    fontSize: 10,
    color: '#6B7280'
  },
  ledgerVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB'
  },
  detailTitle: {
    fontSize: 12,
    color: '#6B7280'
  },
  detailText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827'
  },
  noteBox: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 2
  },
  noteLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151'
  },
  noteText: {
    fontSize: 12,
    color: '#111827'
  },
  actionRow: {
    marginTop: 8
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13
  },
  emptyCard: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151'
  },
  emptyDossier: {
    backgroundColor: '#FFF',
    padding: 60,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12
  },
  emptyDossierText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center'
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
    backgroundColor: '#059669'
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF'
  }
});

