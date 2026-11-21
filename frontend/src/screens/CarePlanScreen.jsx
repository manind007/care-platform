import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { colors } from '../theme/colors';
import { apiFetch, fetchClients } from '../api/client';
import { 
  ClipboardCheck, 
  CheckCircle, 
  Clock, 
  Target, 
  ListChecks, 
  FileText, 
  GitBranch, 
  ArrowRight,
  ShieldAlert,
  Plus,
  X,
  RotateCcw,
  Archive
} from 'lucide-react';

export const CarePlanScreen = ({ currentPersona }) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientFilter, setClientFilter] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // New Care Plan form state
  const [selectedClientId, setSelectedClientId] = useState(1);
  const [planTitle, setPlanTitle] = useState('Integrated Mobility & Independence Support');
  const [planSummary, setPlanSummary] = useState('Holistic domiciliary care support aimed at maintaining autonomy, preventing falls, and supporting nutrition.');
  const [medInstructions, setMedInstructions] = useState('Prompt and witness morning and evening oral medication. Monitor BP weekly.');
  const [mobilityNotes, setMobilityNotes] = useState('Zimmer frame with wheels for indoor mobilising. Supervise outdoor steps.');
  const [dietaryNotes, setDietaryNotes] = useState('Regular diabetic diet. Ensure fluid intake exceeds 1,500ml daily.');
  const [goalDesc, setGoalDesc] = useState('Safely mobilise to kitchen using walking frame without pain.');
  const [taskTitle, setTaskTitle] = useState('Morning Personal Care & Hydration Check');
  const [taskCategory, setTaskCategory] = useState('PERSONAL_CARE');

  useEffect(() => {
    loadPlans();
    fetchClients().then(data => setClients(data || [])).catch(console.error);
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/care-plans');
      setPlans(data || []);
      if (data && data.length > 0) {
        selectPlan(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectPlan = async (plan) => {
    setSelectedPlan(plan);
    try {
      const vers = await apiFetch(`/care-plans/${plan.id}/versions`);
      setVersions(vers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!selectedPlan) return;
    try {
      await apiFetch(`/care-plans/${selectedPlan.id}/status?status=${newStatus}`, {
        method: 'PATCH'
      });
      loadPlans();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleNewVersion = async () => {
    if (!selectedPlan) return;
    try {
      await apiFetch(`/care-plans/${selectedPlan.id}/new-version`, {
        method: 'POST'
      });
      loadPlans();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCarePlan = async () => {
    if (!planTitle.trim()) {
      alert('Please enter a care plan title.');
      return;
    }
    try {
      setSubmitting(true);
      const newPlan = await apiFetch('/care-plans', {
        method: 'POST',
        body: JSON.stringify({
          clientId: selectedClientId,
          title: planTitle,
          summary: planSummary,
          status: 'DRAFT',
          version: 1,
          startDate: new Date().toISOString().split('T')[0],
          reviewDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          medicationInstructions: medInstructions,
          mobilitySupportNotes: mobilityNotes,
          nutritionDietaryRequirements: dietaryNotes,
          goals: [
            {
              description: goalDesc,
              targetDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
              status: 'IN_PROGRESS'
            }
          ],
          tasks: [
            {
              title: taskTitle,
              category: taskCategory,
              timeOfDay: 'MORNING',
              instructions: 'Assist with warm flannel wash, check footwear, prepare fresh water carafe.'
            }
          ]
        })
      });

      setCreateModalVisible(false);
      loadPlans();
      alert('New person-centred care plan draft successfully created!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <View>
            <Text style={styles.title}>Person-Centred Care Planning & Governance</Text>
            <Text style={styles.subtitle}>
              Needs, preferences, routines, goals, categorized tasks, versioning audit history, and approval workflows.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.createBtn}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={16} color={colors.textWhite} />
            <Text style={styles.createBtnText}>Draft New Care Plan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Client Filter Tabs */}
      <View style={styles.planSelectorRow}>
        <Text style={styles.selectorLabel}>FILTER BY CLIENT:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <TouchableOpacity
            style={[styles.planTab, clientFilter === null && styles.planTabActive]}
            onPress={() => {
              setClientFilter(null);
              if (plans.length > 0) selectPlan(plans[0]);
            }}
          >
            <Text style={[styles.planTabText, clientFilter === null && styles.planTabTextActive]}>
              All Clients ({plans.length})
            </Text>
          </TouchableOpacity>
          {clients.map(c => {
            const clientPlans = plans.filter(p => p.clientId === c.id);
            const isSelected = clientFilter === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.planTab, isSelected && styles.planTabActive]}
                onPress={() => {
                  setClientFilter(c.id);
                  if (clientPlans.length > 0) {
                    selectPlan(clientPlans[0]);
                  } else {
                    setSelectedPlan(null);
                  }
                }}
              >
                <Text style={[styles.planTabText, isSelected && styles.planTabTextActive]}>
                  {c.firstName} {c.lastName} ({clientPlans.length})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Available Plans Tabs */}
      {(clientFilter ? plans.filter(p => p.clientId === clientFilter) : plans).length > 1 && (
        <View style={styles.planSelectorRow}>
          <Text style={styles.selectorLabel}>AVAILABLE CARE PLANS:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {(clientFilter ? plans.filter(p => p.clientId === clientFilter) : plans).map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.planTab, selectedPlan?.id === p.id && styles.planTabActive]}
                onPress={() => selectPlan(p)}
              >
                <Text style={[styles.planTabText, selectedPlan?.id === p.id && styles.planTabTextActive]}>
                  #{p.id}: {p.title} (v{p.version}.0) - {p.status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : selectedPlan && (
        <View style={styles.mainLayout}>
          {/* Main Plan View */}
          <View style={styles.leftCol}>
            <View style={styles.planCard}>
              <View style={styles.planTopRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={styles.planTitle}>{selectedPlan.title}</Text>
                    <View style={styles.versionBadge}>
                      <Text style={styles.versionText}>Version {selectedPlan.version}.0</Text>
                    </View>
                  </View>
                  <Text style={styles.planDates}>
                    Active since: {selectedPlan.startDate} • Review Due: {selectedPlan.reviewDate}
                  </Text>
                </View>

                <View style={[
                  styles.statusBadge,
                  selectedPlan.status === 'ACTIVE' && styles.statusBadgeActive,
                  selectedPlan.status === 'DRAFT' && styles.statusBadgeDraft,
                  selectedPlan.status === 'UNDER_REVIEW' && { backgroundColor: '#FEF3C7' }
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    selectedPlan.status === 'ACTIVE' && { color: colors.success },
                    selectedPlan.status === 'DRAFT' && { color: colors.warning },
                    selectedPlan.status === 'UNDER_REVIEW' && { color: '#B45309' }
                  ]}>
                    {selectedPlan.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.summaryText}>{selectedPlan.summary}</Text>

              {/* Special Instructions Grid */}
              <View style={styles.specGrid}>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>MEDICATION GUIDANCE</Text>
                  <Text style={styles.specVal}>{selectedPlan.medicationInstructions || 'None recorded'}</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>MOBILITY & HANDLING</Text>
                  <Text style={styles.specVal}>{selectedPlan.mobilitySupportNotes || 'Standard handling'}</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>DIETARY & NUTRITION</Text>
                  <Text style={styles.specVal}>{selectedPlan.nutritionDietaryRequirements || 'Normal fluids'}</Text>
                </View>
              </View>

              {/* Goals Section */}
              <View style={styles.subSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Target size={16} color={colors.primary} />
                  <Text style={styles.subTitle}>PERSON-CENTRED GOALS & OUTCOMES</Text>
                </View>
                {selectedPlan.goals?.map((g, idx) => (
                  <View key={g.id || idx} style={styles.goalCard}>
                    <CheckCircle size={16} color={colors.success} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.goalDesc}>{g.description}</Text>
                      <Text style={styles.goalDate}>Target Date: {g.targetDate} • Status: {g.status}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Categorized Tasks Section */}
              <View style={styles.subSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <ListChecks size={16} color={colors.primary} />
                  <Text style={styles.subTitle}>SCHEDULED DAILY CARE TASKS</Text>
                </View>
                {selectedPlan.tasks?.map((t, idx) => (
                  <View key={t.id || idx} style={styles.taskCard}>
                    <View style={styles.taskCategoryPill}>
                      <Text style={styles.taskCategoryText}>{t.category} ({t.timeOfDay})</Text>
                    </View>
                    <Text style={styles.taskTitle}>{t.title}</Text>
                    <Text style={styles.taskInstructions}>{t.instructions}</Text>
                  </View>
                ))}
              </View>

              {/* Governance & Workflow Action Buttons */}
              <View style={styles.governanceActions}>
                {selectedPlan.status === 'DRAFT' && (
                  <TouchableOpacity
                    style={[styles.govBtn, { backgroundColor: colors.warning }]}
                    onPress={() => updateStatus('UNDER_REVIEW')}
                  >
                    <Text style={styles.govBtnText}>Submit for Clinical Review</Text>
                  </TouchableOpacity>
                )}

                {selectedPlan.status === 'UNDER_REVIEW' && (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={[styles.govBtn, { backgroundColor: colors.success }]}
                      onPress={() => updateStatus('ACTIVE')}
                    >
                      <Text style={styles.govBtnText}>Approve & Activate Plan (Manager Sign-Off)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.govBtn, { backgroundColor: colors.dangerLight }]}
                      onPress={() => updateStatus('DRAFT')}
                    >
                      <Text style={[styles.govBtnText, { color: colors.danger }]}>Request Revisions (Return to Draft)</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedPlan.status === 'ACTIVE' && (
                  <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                    <TouchableOpacity
                      style={[styles.govBtn, { backgroundColor: colors.primary }]}
                      onPress={handleNewVersion}
                    >
                      <GitBranch size={14} color={colors.textWhite} />
                      <Text style={styles.govBtnText}>Fork & Create New Version (v{selectedPlan.version + 1})</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.govBtn, { backgroundColor: '#F1F5F9' }]}
                      onPress={() => updateStatus('ARCHIVED')}
                    >
                      <Archive size={14} color={colors.textSecondary} />
                      <Text style={[styles.govBtnText, { color: colors.textSecondary }]}>Archive Plan</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Right Column: Version History & Audit Trail */}
          <View style={styles.rightCol}>
            <View style={styles.versionCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <GitBranch size={18} color={colors.primary} />
                <Text style={styles.versionCardTitle}>Version History & Diffs</Text>
              </View>

              <Text style={styles.versionSub}>
                Every clinical iteration creates an immutable branch preserving the previous standard of care.
              </Text>

              <View style={styles.versionTree}>
                {versions.map((ver, idx) => (
                  <View key={ver.id || idx} style={styles.versionItem}>
                    <View style={styles.versionDot} />
                    <View style={styles.versionContent}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.versionTag}>Version {ver.versionNumber}.0</Text>
                        <Text style={styles.versionDate}>
                          {ver.effectiveFrom ? new Date(ver.effectiveFrom).toLocaleDateString() : 'Active'}
                        </Text>
                      </View>
                      <Text style={styles.versionReason}>{ver.changeReason || 'Initial baseline care plan sign-off.'}</Text>
                      <Text style={styles.versionAuthor}>Approved By: {ver.approvedBy || 'Registered Care Manager'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Draft New Care Plan Modal */}
      <Modal visible={createModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Plus size={18} color={colors.primary} />
                <Text style={styles.modalTitle}>Author New Person-Centred Care Plan</Text>
              </View>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ gap: 12 }}>
              <Text style={styles.modalDesc}>
                Synthesizes needs, clinical risks, and client preferences into a version 1.0 baseline plan requiring registered manager sign-off.
              </Text>

              <View>
                <Text style={styles.inputLabel}>SELECT CLIENT</Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {clients.map(c => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.clientChip, selectedClientId === c.id && styles.clientChipActive]}
                      onPress={() => setSelectedClientId(c.id)}
                    >
                      <Text style={[styles.clientChipText, selectedClientId === c.id && styles.clientChipTextActive]}>
                        {c.firstName} {c.lastName} ({c.clientIdentifier})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>PLAN TITLE *</Text>
                <TextInput
                  style={styles.textInput}
                  value={planTitle}
                  onChangeText={setPlanTitle}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>SUMMARY & CLINICAL INTENT</Text>
                <TextInput
                  style={[styles.textInput, { height: 60 }]}
                  multiline
                  value={planSummary}
                  onChangeText={setPlanSummary}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>MEDICATION GUIDANCE & ADMINISTRATION SCHEDULE</Text>
                <TextInput
                  style={styles.textInput}
                  value={medInstructions}
                  onChangeText={setMedInstructions}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>MOBILITY SUPPORT, TRANSFERS & AIDS</Text>
                <TextInput
                  style={styles.textInput}
                  value={mobilityNotes}
                  onChangeText={setMobilityNotes}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>NUTRITION, HYDRATION & DIETARY REQUIREMENTS</Text>
                <TextInput
                  style={styles.textInput}
                  value={dietaryNotes}
                  onChangeText={setDietaryNotes}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>PRIMARY REHABILITATION / SUPPORT GOAL</Text>
                <TextInput
                  style={styles.textInput}
                  value={goalDesc}
                  onChangeText={setGoalDesc}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.inputLabel}>PRIMARY SCHEDULED TASK</Text>
                  <TextInput
                    style={styles.textInput}
                    value={taskTitle}
                    onChangeText={setTaskTitle}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>TASK CATEGORY</Text>
                  <TextInput
                    style={styles.textInput}
                    value={taskCategory}
                    onChangeText={setTaskCategory}
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleCreateCarePlan}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Creating Care Plan...' : 'Commit Care Plan Draft (v1.0)'}</Text>
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
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  planSelectorRow: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    gap: 8,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  planTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  planTabActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  planTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  planTabTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  mainLayout: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: 2,
    minWidth: 480,
  },
  rightCol: {
    flex: 1,
    minWidth: 280,
  },
  planCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    gap: 16,
  },
  planTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  versionBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  versionText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  planDates: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeActive: {
    backgroundColor: colors.successLight,
  },
  statusBadgeDraft: {
    backgroundColor: colors.warningLight,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  summaryText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  specGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  specBox: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 10,
    gap: 4,
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  specVal: {
    fontSize: 11,
    color: colors.textPrimary,
    lineHeight: 15,
  },
  subSection: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 16,
  },
  subTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    marginBottom: 8,
  },
  goalDesc: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  goalDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  taskCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    marginBottom: 8,
    gap: 4,
  },
  taskCategoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taskCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  taskInstructions: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  governanceActions: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 16,
  },
  govBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  govBtnText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  versionCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    gap: 12,
  },
  versionCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  versionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  versionTree: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primaryLight,
    paddingLeft: 14,
    marginLeft: 6,
    gap: 14,
    marginTop: 8,
  },
  versionItem: {
    position: 'relative',
  },
  versionDot: {
    position: 'absolute',
    left: -19,
    top: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  versionContent: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 10,
    gap: 4,
  },
  versionTag: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  versionDate: {
    fontSize: 10,
    color: colors.textMuted,
  },
  versionReason: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  versionAuthor: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
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
    maxWidth: 580,
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
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: colors.textPrimary,
  },
  clientChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  clientChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  clientChipText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  clientChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
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
