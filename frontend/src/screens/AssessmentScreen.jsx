import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { apiFetch, fetchClients } from '../api/client';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck, Award, ShieldAlert, Plus, X, Activity } from 'lucide-react';

export const AssessmentScreen = ({ currentPersona, activeClient }) => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(activeClient?.id || 1);
  const [templates, setTemplates] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [risks, setRisks] = useState([]);
  const [activeView, setActiveView] = useState('assessments'); // 'assessments' | 'risks'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New Risk Form Modal State
  const [riskModalVisible, setRiskModalVisible] = useState(false);
  const [riskCategory, setRiskCategory] = useState('FALLS');
  const [riskDesc, setRiskDesc] = useState('');
  const [riskSeverity, setRiskSeverity] = useState('4');
  const [riskLikelihood, setRiskLikelihood] = useState('4');
  const [riskControls, setRiskControls] = useState('');
  const [riskActionPlan, setRiskActionPlan] = useState('');

  useEffect(() => {
    fetchClients().then(data => {
      setClients(data || []);
      if (data && data.length > 0 && !selectedClientId) {
        setSelectedClientId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadData(selectedClientId);
    }
  }, [selectedClientId]);

  const loadData = async (cId) => {
    try {
      setLoading(true);
      const [tplData, subData, riskData] = await Promise.all([
        apiFetch('/assessments/templates').catch(() => []),
        apiFetch(`/assessments/client/${cId}`).catch(() => []),
        apiFetch(`/risks?clientId=${cId}`).catch(() => [])
      ]);
      setTemplates(tplData || []);
      setSubmissions(subData || []);
      setRisks(riskData || []);
      if (tplData && tplData.length > 0) {
        setSelectedTemplate(tplData[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRisk = async () => {
    if (!riskDesc.trim()) {
      alert('Please enter risk description.');
      return;
    }
    try {
      setSubmitting(true);
      const sev = parseInt(riskSeverity, 10) || 3;
      const lik = parseInt(riskLikelihood, 10) || 3;
      await apiFetch('/risks', {
        method: 'POST',
        body: JSON.stringify({
          clientId: selectedClientId,
          category: riskCategory,
          description: riskDesc,
          severity: sev,
          likelihood: lik,
          controlsAndMitigations: riskControls || 'Standard clinical observations and environmental safety checks.',
          actionPlan: riskActionPlan || 'Review during weekly multidisciplinary team review.',
          ownerName: currentPersona?.name || 'Sarah Jenkins',
          status: 'OPEN'
        })
      });
      setRiskModalVisible(false);
      setRiskDesc('');
      setRiskControls('');
      setRiskActionPlan('');
      loadData(selectedClientId);
      alert('Clinical risk successfully recorded and scored!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRiskStatus = async (riskId, newStatus) => {
    try {
      await apiFetch(`/risks/${riskId}/status?status=${newStatus}`, {
        method: 'PATCH'
      });
      loadData(selectedClientId);
    } catch (err) {
      alert(err.message);
    }
  };

  const calculateCurrentScore = () => {
    let score = 0;
    Object.values(answers).forEach((val) => {
      score += parseInt(val || 0, 10);
    });
    return score;
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) return;
    try {
      setSubmitting(true);
      const score = calculateCurrentScore();
      await apiFetch('/assessments/submit', {
        method: 'POST',
        body: JSON.stringify({
          clientId: selectedClientId,
          templateId: selectedTemplate.id,
          templateTitle: selectedTemplate.title,
          totalScore: score,
          answersJson: JSON.stringify(answers),
          clinicalNotes: notes || 'Assessed independently with client and carer observation.',
          assessorName: currentPersona.name
        })
      });
      alert('Assessment successfully evaluated, scored, and committed to care record!');
      setAnswers({});
      setNotes('');
      loadData(selectedClientId);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const currentClientObj = clients.find(c => c.id === selectedClientId) || clients[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <View>
            <Text style={styles.title}>Clinical Assessments & Risk Scoring</Text>
            <Text style={styles.subtitle}>
              Configurable clinical assessment tools (Falls FRAT, Waterlow Skin Integrity, MUST Nutrition) with automated risk matrices.
            </Text>
          </View>

          {/* Dynamic Client Selector */}
          <View style={styles.clientSelectorContainer}>
            <Text style={styles.selectorLabel}>SELECT ACTIVE CLIENT:</Text>
            <View style={styles.clientTabs}>
              {clients.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.clientTab, selectedClientId === c.id && styles.clientTabActive]}
                  onPress={() => setSelectedClientId(c.id)}
                >
                  <Text style={[styles.clientTabText, selectedClientId === c.id && styles.clientTabTextActive]}>
                    {c.firstName} {c.lastName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* View Switcher: Clinical Tools vs Risk Register */}
      <View style={styles.viewSwitcher}>
        <TouchableOpacity 
          style={[styles.switcherBtn, activeView === 'assessments' && styles.switcherBtnActive]}
          onPress={() => setActiveView('assessments')}
        >
          <FileText size={16} color={activeView === 'assessments' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.switcherText, activeView === 'assessments' && styles.switcherTextActive]}>
            Clinical Assessment Tools & Submissions ({submissions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.switcherBtn, activeView === 'risks' && styles.switcherBtnActive]}
          onPress={() => setActiveView('risks')}
        >
          <ShieldAlert size={16} color={activeView === 'risks' ? colors.danger : colors.textSecondary} />
          <Text style={[styles.switcherText, activeView === 'risks' && { color: colors.danger, fontWeight: '700' }]}>
            Clinical Risk Register & Controls ({risks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : activeView === 'assessments' ? (
        <View style={styles.mainLayout}>
          {/* Active Assessment Form */}
          <View style={styles.leftCol}>
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <View>
                  <Text style={styles.formTitle}>{selectedTemplate?.title}</Text>
                  <Text style={styles.formDesc}>{selectedTemplate?.description}</Text>
                </View>
                <View style={styles.scoreLivePill}>
                  <Text style={styles.scoreLiveVal}>{calculateCurrentScore()}</Text>
                  <Text style={styles.scoreLiveLabel}>Live Score</Text>
                </View>
              </View>

              {/* Questions */}
              <View style={styles.questionList}>
                {selectedTemplate?.questions?.map((q, idx) => {
                  let options = [];
                  try {
                    options = JSON.parse(q.optionsJson || '[]');
                  } catch (e) {
                    options = [{ label: 'Normal', points: 0 }, { label: 'Mild Risk', points: 3 }, { label: 'High Risk', points: 6 }];
                  }

                  return (
                    <View key={q.id || idx} style={styles.qBox}>
                      <Text style={styles.qSection}>{q.sectionName?.toUpperCase()}</Text>
                      <Text style={styles.qText}>{q.questionText}</Text>

                      <View style={styles.optionsRow}>
                        {options.map((opt, oIdx) => {
                          const isSelected = answers[q.id] === opt.points;
                          return (
                            <TouchableOpacity
                              key={oIdx}
                              style={[styles.optBtn, isSelected && styles.optBtnActive]}
                              onPress={() => setAnswers({ ...answers, [q.id]: opt.points })}
                            >
                              <Text style={[styles.optText, isSelected && { color: colors.primary, fontWeight: '700' }]}>
                                {opt.label} (+{opt.points} pts)
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>ASSESSOR CLINICAL NOTES & MITIGATIONS</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter clinical observations, environmental factors, and mitigation actions..."
                multiline
                value={notes}
                onChangeText={setNotes}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Award size={16} color={colors.textWhite} />
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Submitting...' : `Complete Assessment for ${currentClientObj?.firstName}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Column: Historical Completed Assessments */}
          <View style={styles.rightCol}>
            <View style={styles.subCard}>
              <Text style={styles.subCardTitle}>Completed Assessments for {currentClientObj?.firstName} {currentClientObj?.lastName}</Text>
              <View style={{ gap: 10, marginTop: 12 }}>
                {submissions.length === 0 ? (
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>No previous assessments on file for this client.</Text>
                ) : (
                  submissions.map((sub) => (
                    <View key={sub.id} style={styles.historyCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.histTitle}>{sub.templateTitle}</Text>
                        <View style={[
                          styles.riskBadge,
                          sub.riskLevel === 'HIGH' && { backgroundColor: colors.dangerLight },
                          sub.riskLevel === 'MEDIUM' && { backgroundColor: colors.warningLight }
                        ]}>
                          <Text style={[
                            styles.riskBadgeText,
                            sub.riskLevel === 'HIGH' && { color: colors.danger },
                            sub.riskLevel === 'MEDIUM' && { color: colors.warning }
                          ]}>
                            {sub.riskLevel} RISK ({sub.totalScore} pts)
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.histNotes}>{sub.clinicalNotes}</Text>
                      <Text style={styles.histAssessor}>Assessor: {sub.assessorName} • {sub.assessmentDate}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        </View>
      ) : (
        /* Clinical Risk Register & Controls View */
        <View style={styles.riskRegisterContainer}>
          <View style={styles.riskHeaderBar}>
            <View>
              <Text style={styles.riskHeaderTitle}>Clinical Risk Register for {currentClientObj?.firstName} {currentClientObj?.lastName}</Text>
              <Text style={styles.riskHeaderSub}>Documented clinical and environmental risk factors with calculated scoring matrix and active mitigation controls.</Text>
            </View>
            <TouchableOpacity style={styles.addRiskBtn} onPress={() => setRiskModalVisible(true)}>
              <Plus size={16} color={colors.textWhite} />
              <Text style={styles.addRiskBtnText}>Log Clinical Risk</Text>
            </TouchableOpacity>
          </View>

          {risks.length === 0 ? (
            <View style={styles.emptyRiskCard}>
              <Text style={styles.emptyRiskText}>No active clinical risks identified for this client.</Text>
            </View>
          ) : (
            <View style={styles.riskGrid}>
              {risks.map((r) => {
                const score = r.riskScore || (r.severity * r.likelihood);
                const isCritical = score >= 16;
                return (
                  <View key={r.id} style={styles.riskCard}>
                    <View style={styles.riskCardTop}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.riskCatBadge}>
                          <Text style={styles.riskCatText}>{r.category}</Text>
                        </View>
                        <Text style={styles.riskOwnerText}>Owner: {r.ownerName || 'Care Manager'}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <View style={[styles.scoreBadge, isCritical ? styles.scoreBadgeCrit : styles.scoreBadgeWarn]}>
                          <Text style={[styles.scoreBadgeText, isCritical ? { color: colors.danger } : { color: colors.warning }]}>
                            {r.riskLevel || (isCritical ? 'HIGH' : 'MEDIUM')} RISK (Score: {score})
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, r.status === 'MITIGATED' && { backgroundColor: colors.successLight }]}>
                          <Text style={[styles.statusBadgeText, r.status === 'MITIGATED' && { color: colors.success }]}>
                            {r.status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.riskDesc}>{r.description}</Text>

                    <View style={styles.matrixDetailRow}>
                      <Text style={styles.matrixMetric}>Severity: {r.severity} / 5</Text>
                      <Text style={styles.matrixMetric}>•</Text>
                      <Text style={styles.matrixMetric}>Likelihood: {r.likelihood} / 5</Text>
                      <Text style={styles.matrixMetric}>•</Text>
                      <Text style={styles.matrixMetric}>Review Due: {r.reviewDate || 'In 60 days'}</Text>
                    </View>

                    <View style={styles.mitigationBox}>
                      <Text style={styles.mitigationLabel}>CONTROLS & MITIGATIONS:</Text>
                      <Text style={styles.mitigationText}>{r.controlsAndMitigations}</Text>
                    </View>

                    {r.actionPlan && (
                      <View style={[styles.mitigationBox, { backgroundColor: '#F0FDF4' }]}>
                        <Text style={[styles.mitigationLabel, { color: colors.success }]}>ACTION PLAN:</Text>
                        <Text style={styles.mitigationText}>{r.actionPlan}</Text>
                      </View>
                    )}

                    {/* Status Action Buttons */}
                    <View style={styles.riskActionsRow}>
                      {r.status === 'OPEN' && (
                        <TouchableOpacity 
                          style={[styles.riskActionBtn, { backgroundColor: colors.success }]}
                          onPress={() => handleUpdateRiskStatus(r.id, 'MITIGATED')}
                        >
                          <CheckCircle2 size={14} color={colors.textWhite} />
                          <Text style={styles.riskActionText}>Mark as Mitigated</Text>
                        </TouchableOpacity>
                      )}
                      {r.status === 'MITIGATED' && (
                        <TouchableOpacity 
                          style={[styles.riskActionBtn, { backgroundColor: colors.secondary }]}
                          onPress={() => handleUpdateRiskStatus(r.id, 'CLOSED')}
                        >
                          <Text style={styles.riskActionText}>Close Risk Record</Text>
                        </TouchableOpacity>
                      )}
                      {r.status === 'CLOSED' && (
                        <TouchableOpacity 
                          style={[styles.riskActionBtn, { backgroundColor: colors.primary }]}
                          onPress={() => handleUpdateRiskStatus(r.id, 'OPEN')}
                        >
                          <Text style={styles.riskActionText}>Re-Open Assessment</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Log Clinical Risk Modal */}
      <Modal visible={riskModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={18} color={colors.danger} />
                <Text style={styles.modalTitle}>Log & Score Clinical Risk</Text>
              </View>
              <TouchableOpacity onPress={() => setRiskModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <Text style={styles.modalDesc}>
                Identify and record a clinical or environmental risk for {currentClientObj?.firstName} {currentClientObj?.lastName} to calculate risk matrix scores.
              </Text>

              <View>
                <Text style={styles.inputLabel}>CATEGORY *</Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {['FALLS', 'MEDICATION', 'MOBILITY', 'SKIN_INTEGRITY', 'ENVIRONMENTAL'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catBtn, riskCategory === cat && styles.catBtnActive]}
                      onPress={() => setRiskCategory(cat)}
                    >
                      <Text style={[styles.catBtnText, riskCategory === cat && styles.catBtnTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>RISK DESCRIPTION *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Risk of slipping in shower transfers or nighttime disorientation."
                  value={riskDesc}
                  onChangeText={setRiskDesc}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>SEVERITY (1 to 5) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={riskSeverity}
                    onChangeText={setRiskSeverity}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>LIKELIHOOD (1 to 5) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={riskLikelihood}
                    onChangeText={setRiskLikelihood}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CALCULATED SCORE</Text>
                  <View style={[styles.textInput, { backgroundColor: '#F1F5F9', justifyContent: 'center' }]}>
                    <Text style={{ fontWeight: '800', color: colors.danger }}>
                      {(parseInt(riskSeverity, 10) || 0) * (parseInt(riskLikelihood, 10) || 0)} / 25
                    </Text>
                  </View>
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>CONTROLS & MITIGATIONS *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Grab rails installed. Non-slip mats. Standby assistance of 1 carer."
                  value={riskControls}
                  onChangeText={setRiskControls}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>ACTION PLAN</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Weekly monitoring. Multidisciplinary review scheduled."
                  value={riskActionPlan}
                  onChangeText={setRiskActionPlan}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleCreateRisk}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>{submitting ? 'Saving Risk...' : 'Commit Risk Assessment'}</Text>
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
    color: colors.secondary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  clientSelectorContainer: {
    gap: 6,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  clientTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  clientTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: '#F8FAFC',
  },
  clientTabActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  clientTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  clientTabTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  mainLayout: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: 2.2,
    minWidth: 360,
  },
  rightCol: {
    flex: 1.2,
    minWidth: 280,
  },
  formCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    gap: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 14,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  formDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreLivePill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  scoreLiveVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  scoreLiveLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  questionList: {
    gap: 14,
  },
  qBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    gap: 8,
  },
  qSection: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  qText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  optionsRow: {
    gap: 6,
  },
  optBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  optBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    height: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textWhite,
  },
  subCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
  },
  subCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  historyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    gap: 4,
  },
  histTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  riskBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  histNotes: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  histAssessor: {
    fontSize: 10,
    color: colors.textMuted,
  },
  viewSwitcher: {
    flexDirection: 'row',
    gap: 12,
  },
  switcherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  switcherBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  switcherText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  switcherTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  riskRegisterContainer: {
    gap: 16,
  },
  riskHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  riskHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  riskHeaderSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addRiskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addRiskBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textWhite,
  },
  emptyRiskCard: {
    backgroundColor: colors.cardBg,
    padding: 30,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  emptyRiskText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  riskGrid: {
    gap: 14,
  },
  riskCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    gap: 12,
  },
  riskCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  riskCatBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  riskCatText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  riskOwnerText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scoreBadgeCrit: {
    backgroundColor: colors.dangerLight,
  },
  scoreBadgeWarn: {
    backgroundColor: colors.warningLight,
  },
  scoreBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  riskDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  matrixDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matrixMetric: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  mitigationBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 4,
  },
  mitigationLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  mitigationText: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  riskActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  riskActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  riskActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textWhite,
  },
  catBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  catBtnActive: {
    backgroundColor: colors.dangerLight,
  },
  catBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  catBtnTextActive: {
    color: colors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 550,
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 24,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
