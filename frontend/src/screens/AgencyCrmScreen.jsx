import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { 
  fetchClientLeads, 
  fetchCrmSummary, 
  createClientLead, 
  updateLeadStage, 
  convertLeadToClient 
} from '../api/client';
import { 
  TrendingUp, 
  Users, 
  UserPlus, 
  Building2, 
  Calendar, 
  Phone, 
  CheckCircle, 
  Plus, 
  RefreshCw, 
  ArrowRight, 
  FileText 
} from 'lucide-react';

export const AgencyCrmScreen = ({ currentPersona, onNavigateToClient }) => {
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  // New Lead Form
  const [prospectName, setProspectName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('Westminster, London SW1');
  const [primaryContactPerson, setPrimaryContactPerson] = useState('');
  const [referralSource, setReferralSource] = useState('HOSPITAL_DISCHARGE');
  const [referringOrganisation, setReferringOrganisation] = useState('St. Thomas\' Hospital Discharge Lounge');
  const [careTypeNeeded, setCareTypeNeeded] = useState('POST_SURGICAL_STEP_DOWN');
  const [estimatedHours, setEstimatedHours] = useState('20');
  const [budgetPerHour, setBudgetPerHour] = useState('26.00');
  const [clinicalNeeds, setClinicalNeeds] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, summaryData] = await Promise.all([
        fetchClientLeads().catch(() => []),
        fetchCrmSummary().catch(() => null)
      ]);
      setLeads(leadsData || []);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async () => {
    if (!prospectName || !contactPhone) {
      alert('Prospect Name and Contact Phone are required.');
      return;
    }
    try {
      await createClientLead({
        prospectName,
        contactPhone,
        contactEmail,
        address,
        primaryContactPerson,
        referralSource,
        referringOrganisation,
        careTypeNeeded,
        estimatedHoursPerWeek: estimatedHours ? parseInt(estimatedHours) : null,
        budgetPerHour: budgetPerHour ? parseFloat(budgetPerHour) : null,
        clinicalNeedsSummary: clinicalNeeds,
        pipelineStage: 'NEW_INQUIRY'
      });
      setShowNewModal(false);
      resetForm();
      await loadData();
    } catch (err) {
      alert('Error creating lead: ' + err.message);
    }
  };

  const handleAdvanceStage = async (lead, nextStage) => {
    try {
      await updateLeadStage(lead.id, nextStage, `Advanced to ${nextStage} by ${currentPersona ? currentPersona.name : 'Care Manager'}`);
      await loadData();
    } catch (err) {
      alert('Error advancing stage: ' + err.message);
    }
  };

  const handleConvert = async (lead) => {
    try {
      const client = await convertLeadToClient(lead.id);
      alert(`Success! Lead converted to active Client profile: ${client.firstName} ${client.lastName} (${client.clientIdentifier})`);
      await loadData();
    } catch (err) {
      alert('Error converting lead: ' + err.message);
    }
  };

  const resetForm = () => {
    setProspectName('');
    setContactPhone('');
    setContactEmail('');
    setPrimaryContactPerson('');
    setClinicalNeeds('');
  };

  const STAGES = [
    { id: 'NEW_INQUIRY', label: 'New Inquiries', color: '#3B82F6', bg: '#EFF6FF' },
    { id: 'HOME_ASSESSMENT_BOOKED', label: 'Assessment Scheduled', color: '#F59E0B', bg: '#FFFBEB' },
    { id: 'PROPOSAL_SENT', label: 'Proposal & Care Plan', color: '#8B5CF6', bg: '#F5F3FF' },
    { id: 'CONVERTED_TO_CLIENT', label: 'Active Onboarded', color: '#10B981', bg: '#ECFDF5' }
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Accessing Home Care Agency CRM Pipeline...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={24} color="#2563EB" />
            <Text style={styles.title}>Home Care Agency CRM & Growth Pipeline</Text>
            <View style={styles.benchmarkTag}>
              <Text style={styles.benchmarkText}>AxisCare & CareSmartz360 Benchmark</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Inquiry Intake • Hospital Step-Down Referrals • Assessment Scheduling • 1-Click Client Onboarding
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadData}>
            <RefreshCw size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.newBtn} onPress={() => setShowNewModal(true)}>
            <Plus size={16} color="#FFF" />
            <Text style={styles.newBtnText}>New Care Inquiry</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KPI Funnel Stats */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>{summary?.totalLeads || leads.length}</Text>
          <Text style={styles.kpiLabel}>Total Prospect Pipeline</Text>
          <Text style={styles.kpiSub}>Multi-Channel Referral Inquiries</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: '#93C5FD' }]}>
          <Text style={[styles.kpiVal, { color: '#2563EB' }]}>{summary?.newInquiries || 1}</Text>
          <Text style={styles.kpiLabel}>New Uncontacted Leads</Text>
          <Text style={styles.kpiSub}>Under 24h Response Target</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: '#FDE68A' }]}>
          <Text style={[styles.kpiVal, { color: '#D97706' }]}>{summary?.inAssessment || 1}</Text>
          <Text style={styles.kpiLabel}>Clinical Assessments</Text>
          <Text style={styles.kpiSub}>Manager Home Visits Booked</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: '#A7F3D0' }]}>
          <Text style={[styles.kpiVal, { color: '#059669' }]}>{summary?.conversionRatePercentage || 50.0}%</Text>
          <Text style={styles.kpiLabel}>Inquiry-to-Care Conversion</Text>
          <Text style={styles.kpiSub}>{summary?.convertedActive || 1} Active Clients Onboarded</Text>
        </View>
      </View>

      {/* Kanban Board Grid */}
      <View style={styles.kanbanBoard}>
        {STAGES.map((col) => {
          const colLeads = leads.filter(l => l.pipelineStage === col.id);
          return (
            <View key={col.id} style={styles.kanbanCol}>
              <View style={[styles.colHeader, { borderTopColor: col.color, borderTopWidth: 3 }]}>
                <Text style={styles.colTitle}>{col.label}</Text>
                <View style={[styles.countBadge, { backgroundColor: col.bg }]}>
                  <Text style={[styles.countBadgeText, { color: col.color }]}>{colLeads.length}</Text>
                </View>
              </View>

              <ScrollView style={styles.cardList} showsVerticalScrollIndicator={false}>
                {colLeads.map((item) => (
                  <View key={item.id} style={styles.leadCard}>
                    <View style={styles.leadHeader}>
                      <Text style={styles.leadName}>{item.prospectName}</Text>
                      <View style={styles.referralPill}>
                        <Building2 size={11} color="#6B7280" />
                        <Text style={styles.referralText}>{item.referralSource?.replace('_', ' ')}</Text>
                      </View>
                    </View>

                    <Text style={styles.careNeedText}>
                      Need: {item.careTypeNeeded?.replace(/_/g, ' ')} ({item.estimatedHoursPerWeek || 14} hrs/wk)
                    </Text>

                    <View style={styles.contactRow}>
                      <Phone size={12} color="#374151" />
                      <Text style={styles.contactText}>{item.contactPhone}</Text>
                    </View>

                    {item.referringOrganisation && (
                      <Text style={styles.orgText} numberOfLines={1}>
                        Ref: {item.referringOrganisation}
                      </Text>
                    )}

                    {item.clinicalNeedsSummary && (
                      <Text style={styles.summarySnippet} numberOfLines={2}>
                        "{item.clinicalNeedsSummary}"
                      </Text>
                    )}

                    {/* Stage Transition Action Bar */}
                    <View style={styles.actionRow}>
                      {col.id === 'NEW_INQUIRY' && (
                        <TouchableOpacity 
                          style={[styles.stageBtn, { backgroundColor: '#F59E0B' }]}
                          onPress={() => handleAdvanceStage(item, 'HOME_ASSESSMENT_BOOKED')}
                        >
                          <Calendar size={12} color="#FFF" />
                          <Text style={styles.stageBtnText}>Book Assessment</Text>
                        </TouchableOpacity>
                      )}

                      {col.id === 'HOME_ASSESSMENT_BOOKED' && (
                        <TouchableOpacity 
                          style={[styles.stageBtn, { backgroundColor: '#8B5CF6' }]}
                          onPress={() => handleAdvanceStage(item, 'PROPOSAL_SENT')}
                        >
                          <FileText size={12} color="#FFF" />
                          <Text style={styles.stageBtnText}>Send Proposal</Text>
                        </TouchableOpacity>
                      )}

                      {col.id === 'PROPOSAL_SENT' && (
                        <TouchableOpacity 
                          style={[styles.stageBtn, { backgroundColor: '#10B981' }]}
                          onPress={() => handleConvert(item)}
                        >
                          <UserPlus size={12} color="#FFF" />
                          <Text style={styles.stageBtnText}>1-Click Convert to Client</Text>
                        </TouchableOpacity>
                      )}

                      {col.id === 'CONVERTED_TO_CLIENT' && (
                        <View style={styles.convertedBadge}>
                          <CheckCircle size={12} color="#059669" />
                          <Text style={styles.convertedText}>Active Client Enrolled</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          );
        })}
      </View>

      {/* Modal: New Inquiry */}
      <Modal visible={showNewModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Capture New Care Inquiry</Text>
              <Text style={styles.modalSub}>
                Log incoming client referral from hospital discharge, social services, or family.
              </Text>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Prospect Client Name *</Text>
                  <TextInput style={styles.formInput} placeholder="e.g. Eleanor Vance" value={prospectName} onChangeText={setProspectName} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Contact Phone *</Text>
                  <TextInput style={styles.formInput} placeholder="e.g. 07700 900881" value={contactPhone} onChangeText={setContactPhone} />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Contact Email</Text>
                  <TextInput style={styles.formInput} value={contactEmail} onChangeText={setContactEmail} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Primary Contact / Family Member</Text>
                  <TextInput style={styles.formInput} placeholder="e.g. Patricia Vance (Daughter)" value={primaryContactPerson} onChangeText={setPrimaryContactPerson} />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Referral Source</Text>
                  <TextInput style={styles.formInput} value={referralSource} onChangeText={setReferralSource} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Care Type Needed</Text>
                  <TextInput style={styles.formInput} value={careTypeNeeded} onChangeText={setCareTypeNeeded} />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Estimated Hours/Week</Text>
                  <TextInput style={styles.formInput} keyboardType="numeric" value={estimatedHours} onChangeText={setEstimatedHours} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Agreed / Budget Rate (£/hr)</Text>
                  <TextInput style={styles.formInput} keyboardType="numeric" value={budgetPerHour} onChangeText={setBudgetPerHour} />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Referring Hospital / Organisation</Text>
                <TextInput style={styles.formInput} value={referringOrganisation} onChangeText={setReferringOrganisation} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Clinical & Social Needs Summary</Text>
                <TextInput style={[styles.formInput, { height: 60 }]} multiline placeholder="Describe mobility, post-surgical assistance, or dementia support..." value={clinicalNeeds} onChangeText={setClinicalNeeds} />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNewModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleCreateLead}>
                  <Text style={styles.confirmBtnText}>Create Lead in CRM</Text>
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
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  benchmarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF'
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
    backgroundColor: '#2563EB',
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
  kanbanBoard: {
    flex: 1,
    flexDirection: 'row',
    gap: 12
  },
  kanbanCol: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 10,
    gap: 10
  },
  colHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8
  },
  colTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937'
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  cardList: {
    flex: 1
  },
  leadCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  leadName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827'
  },
  referralPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  referralText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4B5563'
  },
  careNeedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF'
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  contactText: {
    fontSize: 11,
    color: '#374151'
  },
  orgText: {
    fontSize: 10,
    color: '#6B7280'
  },
  summarySnippet: {
    fontSize: 11,
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 15
  },
  actionRow: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 6
  },
  stageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderRadius: 6
  },
  stageBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF'
  },
  convertedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
    paddingVertical: 4
  },
  convertedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669'
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
    maxWidth: 600,
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
    backgroundColor: '#2563EB'
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF'
  }
});

