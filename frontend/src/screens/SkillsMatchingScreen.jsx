import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ActivityIndicator 
} from 'react-native';
import { colors } from '../theme/colors';
import { 
  fetchAllCarerSkills, 
  matchCarersForNeeds, 
  addCarerSkill 
} from '../api/client';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Plus, 
  X, 
  UserCheck, 
  ShieldCheck, 
  Filter, 
  Sparkles,
  Users
} from 'lucide-react';

export const SkillsMatchingScreen = ({ currentPersona }) => {
  const [allSkills, setAllSkills] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter skills
  const availableNeeds = [
    { key: 'PEG_FEEDING', label: 'PEG Feeding (Enteral Nutrition)' },
    { key: 'CATHETER_CARE', label: 'Catheter Care (Indwelling / Suprapubic)' },
    { key: 'INSULIN_ADMINISTRATION', label: 'Insulin Administration & Blood Glucose' },
    { key: 'DEMENTIA_TIER_3', label: 'Dementia Tier 3 (Advanced Cognitive Support)' },
    { key: 'TWO_PERSON_HOIST', label: 'Two-Person Mechanical Hoisting' },
    { key: 'TRACHEOSTOMY', label: 'Tracheostomy & Suctioning' },
    { key: 'MEDICATION_ADMINISTRATION', label: 'eMAR Medication Administration' }
  ];

  const [selectedNeeds, setSelectedNeeds] = useState(['PEG_FEEDING', 'CATHETER_CARE', 'TWO_PERSON_HOIST']);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState('5');
  const [carerName, setCarerName] = useState('Emily Watson (Senior Carer)');
  const [skillName, setSkillName] = useState('TRACHEOSTOMY');
  const [certNumber, setCertNumber] = useState('CPD-UK-9921');
  const [verifiedBy, setVerifiedBy] = useState('Marcus Vance (Org Administrator)');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedNeeds.length > 0) {
      matchCarersForNeeds(selectedNeeds).then(data => setMatches(data || [])).catch(console.error);
    }
  }, [selectedNeeds]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [skillsData, matchData] = await Promise.all([
        fetchAllCarerSkills().catch(() => []),
        matchCarersForNeeds(selectedNeeds).catch(() => [])
      ]);
      setAllSkills(skillsData || []);
      setMatches(matchData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleNeed = (key) => {
    if (selectedNeeds.includes(key)) {
      setSelectedNeeds(selectedNeeds.filter(k => k !== key));
    } else {
      setSelectedNeeds([...selectedNeeds, key]);
    }
  };

  const handleAddSkill = async () => {
    try {
      await addCarerSkill({
        userId: parseInt(userId, 10),
        carerName,
        skillName,
        skillCategory: 'CLINICAL',
        certificationNumber: certNumber,
        verifiedBy,
        active: true
      });
      setModalVisible(false);
      loadData();
      alert(`Competency ${skillName} recorded for ${carerName}.`);
    } catch (err) {
      alert(err.message || 'Failed to add skill');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header Card */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.badge}>
                <Award size={12} color="#7C3AED" />
                <Text style={styles.badgeText}>ALAYACARE & HCHB BENCHMARKED</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                <ShieldCheck size={12} color="#059669" />
                <Text style={[styles.badgeText, { color: '#059669' }]}>CQC WELL-LED GOVERNANCE</Text>
              </View>
            </View>
            <Text style={styles.title}>Workforce Skills & Clinical Credential Matching Engine</Text>
            <Text style={styles.subtitle}>
              Intelligent algorithm matching complex patient clinical care packages with verified carer competencies, mandatory training, and background credentials.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={16} color="#FFF" />
            <Text style={styles.addBtnText}>Record Staff Competency</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Care Package Needs Selector */}
      <View style={styles.selectorCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color={colors.primaryDark} />
          <Text style={styles.selectorTitle}>SELECT CLIENT'S REQUIRED CLINICAL COMPETENCIES:</Text>
        </View>
        <Text style={styles.selectorSub}>
          Click competencies to recalculate real-time workforce suitability rankings.
        </Text>

        <View style={styles.chipsRow}>
          {availableNeeds.map(need => {
            const isSelected = selectedNeeds.includes(need.key);
            return (
              <TouchableOpacity
                key={need.key}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => toggleNeed(need.key)}
              >
                {isSelected ? (
                  <CheckCircle2 size={13} color="#FFFFFF" />
                ) : (
                  <Plus size={13} color="#64748B" />
                )}
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {need.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Real-Time Ranked Matching Results */}
      <View style={{ gap: 14 }}>
        <Text style={styles.sectionTitle}>WORKFORCE COMPATIBILITY RANKING ({matches.length} CARERS EVALUATED)</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : matches.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No carers currently meet the selected criteria.</Text>
          </View>
        ) : (
          matches.map(m => (
            <View key={m.userId} style={[styles.matchCard, m.isFullyQualified && styles.matchCardFullyQualified]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.carerName}>{m.carerName}</Text>
                    {m.isFullyQualified ? (
                      <View style={styles.qualifiedBadge}>
                        <CheckCircle2 size={12} color="#059669" />
                        <Text style={styles.qualifiedText}>100% FULLY QUALIFIED</Text>
                      </View>
                    ) : (
                      <View style={styles.gapBadge}>
                        <AlertTriangle size={12} color="#D97706" />
                        <Text style={styles.gapText}>{m.missingSkills.length} SKILLS DEFICIT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.carerMeta}>Total Verified Competencies on File: {m.totalCompetencies}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.scoreText, m.matchPercentage === 100 ? { color: '#059669' } : { color: '#D97706' }]}>
                    {m.matchPercentage}% Match
                  </Text>
                  <Text style={styles.scoreSub}>Suitability Score</Text>
                </View>
              </View>

              {/* Matched vs Missing Skills */}
              <View style={styles.skillsComparisonRow}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={styles.subHeadingGreen}>MATCHED COMPETENCIES ({m.matchedSkills.length}):</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {m.matchedSkills.map(s => (
                      <View key={s} style={styles.matchedTag}>
                        <CheckCircle2 size={11} color="#059669" />
                        <Text style={styles.matchedTagText}>{s.replace(/_/g, ' ')}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {m.missingSkills.length > 0 && (
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={styles.subHeadingRed}>UNVERIFIED / MISSING ({m.missingSkills.length}):</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {m.missingSkills.map(s => (
                        <View key={s} style={styles.missingTag}>
                          <XCircle size={11} color="#DC2626" />
                          <Text style={styles.missingTagText}>{s.replace(/_/g, ' ')}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* 4. Complete Staff Competencies Master Directory */}
      <View style={{ gap: 12, marginTop: 10 }}>
        <Text style={styles.sectionTitle}>ALL ACTIVE STAFF CERTIFICATIONS & CPD LEDGER ({allSkills.length})</Text>
        <View style={styles.skillsTable}>
          <View style={styles.skillsTableHeader}>
            <Text style={[styles.th, { flex: 1.5 }]}>STAFF MEMBER</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>COMPETENCY</Text>
            <Text style={[styles.th, { flex: 1 }]}>CATEGORY</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>CERTIFICATE NO.</Text>
            <Text style={[styles.th, { flex: 1 }]}>EXPIRY DATE</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>VERIFIED BY</Text>
          </View>
          {allSkills.map(s => (
            <View key={s.id} style={styles.skillsTableRow}>
              <Text style={[styles.td, { flex: 1.5, fontWeight: '700' }]}>{s.carerName}</Text>
              <Text style={[styles.td, { flex: 1.5, color: colors.primaryDark, fontWeight: '600' }]}>
                {s.skillName.replace(/_/g, ' ')}
              </Text>
              <Text style={[styles.td, { flex: 1 }]}>{s.skillCategory}</Text>
              <Text style={[styles.td, { flex: 1.2, fontFamily: 'monospace' }]}>{s.certificationNumber || 'N/A'}</Text>
              <Text style={[styles.td, { flex: 1 }]}>{s.expiresAt || 'Active'}</Text>
              <Text style={[styles.td, { flex: 1.5, color: '#64748B' }]}>{s.verifiedBy}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* MODAL: RECORD STAFF COMPETENCY */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Verified Staff Competency</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10, marginTop: 10 }}>
              <View>
                <Text style={styles.inputLabel}>STAFF MEMBER NAME</Text>
                <TextInput
                  style={styles.textInput}
                  value={carerName}
                  onChangeText={setCarerName}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>COMPETENCY / SKILL CODE *</Text>
                <TextInput
                  style={styles.textInput}
                  value={skillName}
                  onChangeText={setSkillName}
                  placeholder="e.g. PEG_FEEDING, TRACHEOSTOMY"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CERTIFICATION NUMBER</Text>
                  <TextInput
                    style={styles.textInput}
                    value={certNumber}
                    onChangeText={setCertNumber}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>VERIFYING MANAGER</Text>
                  <TextInput
                    style={styles.textInput}
                    value={verifiedBy}
                    onChangeText={setVerifiedBy}
                  />
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddSkill}>
                <Text style={styles.submitBtnText}>Verify & Save Skill</Text>
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
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 24,
    gap: 18,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    maxWidth: 900,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 10,
  },
  selectorTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  selectorSub: {
    fontSize: 12,
    color: '#64748B',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chipActive: {
    backgroundColor: '#4338CA',
    borderColor: '#3730A3',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 12,
  },
  matchCardFullyQualified: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  carerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  carerMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  qualifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  qualifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  gapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gapText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '800',
  },
  scoreSub: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  skillsComparisonRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  subHeadingGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  subHeadingRed: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  matchedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  matchedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  missingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  missingTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  skillsTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  skillsTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  th: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  skillsTableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  td: {
    fontSize: 11,
    color: '#1E293B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

