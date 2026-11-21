import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { apiFetch, fetchClients } from '../api/client';
import { Bot, Sparkles, FileText, CalendarCheck, ShieldAlert, CheckCircle2, ArrowRight, User } from 'lucide-react';

export const AiAssistantScreen = ({ currentPersona, activeClient }) => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(activeClient?.id || 1);
  const [visits, setVisits] = useState([]);
  const [selectedVisitId, setSelectedVisitId] = useState(1);

  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchClients().then(data => {
      setClients(data || []);
      if (data && data.length > 0 && !selectedClientId) {
        setSelectedClientId(data[0].id);
      }
    }).catch(console.error);

    apiFetch('/visits').then(data => {
      setVisits(data || []);
      if (data && data.length > 0) {
        setSelectedVisitId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  const runNoteSummary = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/ai/care-note-summary/${selectedClientId}`);
      setResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runScheduleAssistant = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/ai/schedule-assistance/${selectedVisitId}`);
      setResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runPlanDrafter = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/ai/care-plan-draft/${selectedClientId}?focus=Mobility+and+Independence`);
      setResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runRiskDetector = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/ai/risk-signals/${selectedClientId}`);
      setResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitAiSchedule = async (rec) => {
    try {
      await apiFetch(`/visits/${selectedVisitId}/assign?staffId=${rec.workerId || 5}&staffName=${encodeURIComponent(rec.workerName)}`, {
        method: 'PATCH'
      });
      alert(`Visit #${selectedVisitId} assigned to ${rec.workerName} via AI Recommendation!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdoptAiPlan = async () => {
    if (!result) return;
    try {
      await apiFetch('/care-plans', {
        method: 'POST',
        body: JSON.stringify({
          clientId: selectedClientId,
          title: result.draftTitle || 'AI-Assisted Personal Care Plan',
          summary: result.summary,
          status: 'DRAFT',
          version: 1,
          startDate: new Date().toISOString().split('T')[0],
          reviewDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          medicationInstructions: 'Adhere to scheduled daily medication regimen.',
          mobilitySupportNotes: 'Supported mobility with walking frame.',
          nutritionDietaryRequirements: 'Regular fluid and meal checks.',
          goals: result.recommendedGoals?.map(g => ({
            description: g.description,
            targetDate: new Date(Date.now() + (g.targetDays || 30) * 86400000).toISOString().split('T')[0],
            status: 'IN_PROGRESS'
          })) || []
        })
      });
      alert('AI Care Plan Draft successfully committed to clinical registry in DRAFT status! Ready for Manager Review.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCommitAiNote = async () => {
    if (!result) return;
    try {
      await apiFetch(`/clients/${selectedClientId}/timeline`, {
        method: 'POST',
        body: JSON.stringify({
          eventType: 'CARE_NOTE',
          title: 'SOAP Note (AI-Assisted)',
          description: result.summary,
          severity: 'LOW',
          recordedBy: currentPersona.name,
          visibleToFamily: true
        })
      });
      alert('AI Care Note committed to client longitudinal timeline & family portal!');
    } catch (err) {
      alert(err.message);
    }
  };

  const currentClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const currentVisit = visits.find(v => v.id === selectedVisitId) || visits[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.aiIconBadge}>
              <Sparkles size={22} color="#7C3AED" />
            </View>
            <View>
              <Text style={styles.title}>Assistive AI Operations Copilot</Text>
              <Text style={styles.subtitle}>
                Governed, human-in-the-loop operational intelligence conforming strictly to BRD Section 17 standards.
              </Text>
            </View>
          </View>

          {/* Dynamic Client Selector */}
          <View style={styles.clientSelectorContainer}>
            <Text style={styles.selectorLabel}>TARGET CLIENT (FROM DB):</Text>
            <View style={styles.clientTabs}>
              {clients.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.clientTab, selectedClientId === c.id && styles.clientTabActive]}
                  onPress={() => {
                    setSelectedClientId(c.id);
                    setResult(null);
                  }}
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

      {/* Tabs for 4 BRD AI capabilities */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'summary' && styles.tabBtnActive]}
          onPress={() => {
            setActiveTab('summary');
            setResult(null);
          }}
        >
          <FileText size={15} color={activeTab === 'summary' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabBtnText, activeTab === 'summary' && styles.tabBtnTextActive]}>Care-Note Summary</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'schedule' && styles.tabBtnActive]}
          onPress={() => {
            setActiveTab('schedule');
            setResult(null);
          }}
        >
          <CalendarCheck size={15} color={activeTab === 'schedule' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabBtnText, activeTab === 'schedule' && styles.tabBtnTextActive]}>Schedule Suggester</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'plan' && styles.tabBtnActive]}
          onPress={() => {
            setActiveTab('plan');
            setResult(null);
          }}
        >
          <Bot size={15} color={activeTab === 'plan' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabBtnText, activeTab === 'plan' && styles.tabBtnTextActive]}>Care-Plan Drafter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'risk' && styles.tabBtnActive]}
          onPress={() => {
            setActiveTab('risk');
            setResult(null);
          }}
        >
          <ShieldAlert size={15} color={activeTab === 'risk' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabBtnText, activeTab === 'risk' && styles.tabBtnTextActive]}>Risk Signals</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Execution Area */}
      <View style={styles.playCard}>
        {activeTab === 'summary' && (
          <View style={styles.introBox}>
            <Text style={styles.introTitle}>BRD Capability 1: Care-Note Summary</Text>
            <Text style={styles.introDesc}>
              Summarises multiple chronological visit notes, highlights vital changes, and extracts actionable items requiring human clinical review for {currentClient?.firstName} {currentClient?.lastName}.
            </Text>
            <TouchableOpacity style={styles.runBtn} onPress={runNoteSummary} disabled={loading}>
              <Sparkles size={16} color={colors.textWhite} />
              <Text style={styles.runBtnText}>{loading ? 'Summarising Notes...' : `Generate Care Note Summary for ${currentClient?.firstName}`}</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'schedule' && (
          <View style={styles.introBox}>
            <Text style={styles.introTitle}>BRD Capability 2: Schedule Assistance</Text>
            <Text style={styles.introDesc}>
              Select a visit from the live database to calculate worker affinity scores based on required skill, continuity of care, and travel radius.
            </Text>

            {/* Visit selector from live visits in DB */}
            <View style={{ gap: 6, marginVertical: 8 }}>
              <Text style={styles.selectorLabel}>SELECT VISIT FROM ROSTER:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {visits.slice(0, 4).map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.visitTab, selectedVisitId === v.id && styles.visitTabActive]}
                    onPress={() => {
                      setSelectedVisitId(v.id);
                      setResult(null);
                    }}
                  >
                    <Text style={[styles.visitTabText, selectedVisitId === v.id && { color: colors.primaryDark, fontWeight: '700' }]}>
                      #{v.id}: {v.clientName} ({v.visitType})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.runBtn} onPress={runScheduleAssistant} disabled={loading}>
              <Sparkles size={16} color={colors.textWhite} />
              <Text style={styles.runBtnText}>{loading ? 'Analyzing Availability...' : `Calculate Worker Matches for Visit #${selectedVisitId}`}</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'plan' && (
          <View style={styles.introBox}>
            <Text style={styles.introTitle}>BRD Capability 3: Care-Plan Drafting</Text>
            <Text style={styles.introDesc}>
              Generates a person-centred draft support plan synthesized from client history, assessments, and registered preferences for {currentClient?.firstName} {currentClient?.lastName}.
            </Text>
            <TouchableOpacity style={styles.runBtn} onPress={runPlanDrafter} disabled={loading}>
              <Sparkles size={16} color={colors.textWhite} />
              <Text style={styles.runBtnText}>{loading ? 'Drafting Care Plan...' : `Synthesize Draft Plan for ${currentClient?.firstName}`}</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'risk' && (
          <View style={styles.introBox}>
            <Text style={styles.introTitle}>BRD Capability 4: Risk Signal Detection</Text>
            <Text style={styles.introDesc}>
              Scans care notes, incident reports, and eMAR medication exceptions in the live database for emerging patterns in {currentClient?.firstName}'s care record.
            </Text>
            <TouchableOpacity style={styles.runBtn} onPress={runRiskDetector} disabled={loading}>
              <Sparkles size={16} color={colors.textWhite} />
              <Text style={styles.runBtnText}>{loading ? 'Scanning Records...' : `Scan Live Records for ${currentClient?.firstName}`}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results Presentation */}
        {loading && (
          <View style={{ padding: 30, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        )}

        {result && !loading && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <CheckCircle2 size={18} color="#10B981" />
              <Text style={styles.resultTitle}>Synthesized Intelligence Result (Live Backend API)</Text>
            </View>

            {/* Note Summary Render */}
            {activeTab === 'summary' && (
              <View style={{ gap: 12 }}>
                <Text style={styles.summaryParagraph}>{result.summary}</Text>
                <View style={styles.alertFlagBox}>
                  <Text style={styles.flagLabel}>FLAGGED ACTION ITEMS (FOR HUMAN REVIEW):</Text>
                  {result.flaggedActionItems?.map((item, i) => (
                    <Text key={i} style={styles.flagText}>• {item}</Text>
                  ))}
                </View>
                <TouchableOpacity 
                  style={[styles.runBtn, { backgroundColor: colors.success, alignSelf: 'flex-start', marginTop: 4 }]} 
                  onPress={handleCommitAiNote}
                >
                  <CheckCircle2 size={16} color={colors.textWhite} />
                  <Text style={styles.runBtnText}>Approve & Commit SOAP Note to Timeline</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Schedule Match Render */}
            {activeTab === 'schedule' && (
              <View style={{ gap: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
                  Recommended Carers for Visit #{result.visitId} ({result.requiredCapability}):
                </Text>
                {result.recommendations?.map((rec, i) => (
                  <View key={i} style={styles.recCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.workerName}>{rec.workerName}</Text>
                      <View style={styles.matchScoreBadge}>
                        <Text style={styles.matchScoreText}>{rec.matchScore}% Affinity</Text>
                      </View>
                    </View>
                    <Text style={styles.workerDetail}>📍 {rec.travelDistanceEst} • 🔄 {rec.continuityRate}</Text>
                    <Text style={styles.workerReason}>{rec.reason}</Text>
                    <TouchableOpacity 
                      style={[styles.runBtn, { backgroundColor: colors.primary, paddingVertical: 6, paddingHorizontal: 12, marginTop: 6, alignSelf: 'flex-start' }]} 
                      onPress={() => handleCommitAiSchedule(rec)}
                    >
                      <User size={14} color={colors.textWhite} />
                      <Text style={[styles.runBtnText, { fontSize: 12 }]}>Approve & Assign {rec.workerName}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Care Plan Draft Render */}
            {activeTab === 'plan' && (
              <View style={{ gap: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>{result.draftTitle}</Text>
                <Text style={styles.summaryParagraph}>{result.summary}</Text>
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textMuted }}>RECOMMENDED GOALS:</Text>
                  {result.recommendedGoals?.map((g, i) => (
                    <Text key={i} style={styles.flagText}>🎯 {g.description} ({g.targetDays} days target)</Text>
                  ))}
                </View>
                <TouchableOpacity 
                  style={[styles.runBtn, { backgroundColor: '#7C3AED', alignSelf: 'flex-start', marginTop: 8 }]} 
                  onPress={handleAdoptAiPlan}
                >
                  <Sparkles size={16} color={colors.textWhite} />
                  <Text style={styles.runBtnText}>Adopt as Staged Care Plan Draft (v1.0)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Risk Signals Render */}
            {activeTab === 'risk' && (
              <View style={{ gap: 10 }}>
                <View style={[styles.matchScoreBadge, { backgroundColor: '#FEF3C7', alignSelf: 'flex-start' }]}>
                  <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 11 }}>STATUS: {result.overallAlertStatus}</Text>
                </View>
                {result.riskSignals?.map((sig, i) => (
                  <View key={i} style={[styles.recCard, { borderColor: '#FED7AA', backgroundColor: '#FFFBEB' }]}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#9A3412' }}>{sig}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                ⚠️ Regulatory Notice: {result.disclaimer || result.decisionNotice || result.complianceNote || 'Human review and clinical signoff mandatory.'}
              </Text>
            </View>
          </View>
        )}
      </View>
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
  aiIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.secondary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
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
  visitTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: '#F8FAFC',
  },
  visitTabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  visitTabText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabBtnActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  playCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    gap: 20,
  },
  introBox: {
    gap: 10,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  introDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  runBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  runBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textWhite,
  },
  resultContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    gap: 14,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  summaryParagraph: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  alertFlagBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  flagLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.danger,
  },
  flagText: {
    fontSize: 12,
    color: '#991B1B',
  },
  recCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    gap: 4,
  },
  workerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  matchScoreBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success,
  },
  workerDetail: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  workerReason: {
    fontSize: 11,
    color: colors.primaryDark,
    marginTop: 2,
  },
  disclaimerBox: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
