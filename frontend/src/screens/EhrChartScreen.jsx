import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { colors } from '../theme/colors';
import { 
  fetchLongitudinalRecord, 
  apiFetch, 
  addPatientAllergy, 
  deletePatientAllergy, 
  addPatientProblem, 
  updatePatientProblem, 
  addPatientMedication, 
  addPatientImmunization, 
  addPatientProcedure, 
  createClinicalNote, 
  addClinicalDocument,
  evaluateCds
} from '../api/client';
import { 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Heart, 
  FileText, 
  Pill, 
  Syringe, 
  Scissors, 
  FileCheck, 
  User, 
  Clock, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Stethoscope, 
  Sparkles, 
  Calendar,
  Layers,
  Thermometer,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

export const EhrChartScreen = ({ currentPersona }) => {
  const [patients, setPatients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('STORYBOARD'); // 'STORYBOARD' | 'ALLERGIES' | 'PROBLEMS' | 'MEDS' | 'IMMUNIZATIONS' | 'PROCEDURES' | 'NOTES' | 'DOCS' | 'HISTORIES' | 'CDS'

  // Modals
  const [allergyModal, setAllergyModal] = useState(false);
  const [problemModal, setProblemModal] = useState(false);
  const [medModal, setMedModal] = useState(false);
  const [immModal, setImmModal] = useState(false);
  const [procModal, setProcModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [docModal, setDocModal] = useState(false);

  // Form states
  // Allergy
  const [newAllergen, setNewAllergen] = useState('');
  const [newAllergyType, setNewAllergyType] = useState('DRUG');
  const [newReaction, setNewReaction] = useState('');
  const [newSeverity, setNewSeverity] = useState('MODERATE');

  // Problem
  const [newProblemName, setNewProblemName] = useState('');
  const [newIcdCode, setNewIcdCode] = useState('I10');
  const [newProblemStatus, setNewProblemStatus] = useState('ACTIVE');

  // Medication
  const [newMedName, setNewMedName] = useState('');
  const [newDose, setNewDose] = useState('20 mg');
  const [newRoute, setNewRoute] = useState('ORAL');
  const [newFreq, setNewFreq] = useState('ONCE_DAILY');
  const [newIndication, setNewIndication] = useState('');

  // Immunization
  const [newVaccine, setNewVaccine] = useState('');
  const [newLot, setNewLot] = useState('LOT-2026-9');
  const [newSite, setNewSite] = useState('Left Deltoid IM');

  // Procedure
  const [newProcName, setNewProcName] = useState('');
  const [newCpt, setNewCpt] = useState('99214');
  const [newSurgeon, setNewSurgeon] = useState('Dr. Sarah Jenkins');

  // SOAP Note
  const [noteTitle, setNoteTitle] = useState('Clinical Progress Note');
  const [noteType, setNoteType] = useState('SOAP_NOTE');
  const [subj, setSubj] = useState('');
  const [obj, setObj] = useState('');
  const [assess, setAssess] = useState('');
  const [plan, setPlan] = useState('');

  // Document
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('LAB_REPORT');
  const [docSummary, setDocSummary] = useState('');

  // Interactive CDS Simulation
  const [simProposedMed, setSimProposedMed] = useState('Amoxicillin');
  const [simSbp, setSimSbp] = useState('138');
  const [simHr, setSimHr] = useState('74');
  const [simSpo2, setSimSpo2] = useState('97');
  const [simResp, setSimResp] = useState('16');
  const [simTemp, setSimTemp] = useState('36.6');
  const [cdsAlerts, setCdsAlerts] = useState([]);
  const [evaluatingCds, setEvaluatingCds] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const clientList = await apiFetch('/clients');
      setPatients(clientList || []);
      if (clientList && clientList.length > 0) {
        setSelectedClientId(clientList[0].id);
        await loadChart(clientList[0].id);
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChart = async (clientId) => {
    try {
      setLoading(true);
      const data = await fetchLongitudinalRecord(clientId);
      setRecord(data);
      setCdsAlerts(data.activeBpaAlerts || []);
    } catch (err) {
      console.error('Failed to load EHR chart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (id) => {
    setSelectedClientId(id);
    loadChart(id);
  };

  // Form Submissions
  const handleAddAllergy = async () => {
    if (!newAllergen.trim() || !selectedClientId) return;
    try {
      await addPatientAllergy(selectedClientId, {
        allergenName: newAllergen,
        allergenType: newAllergyType,
        reaction: newReaction || 'Rash, pruritus',
        severity: newSeverity,
        verificationStatus: 'CONFIRMED',
        onsetDate: new Date().toISOString().split('T')[0],
        recordedBy: currentPersona?.name || 'Dr. Sarah Jenkins'
      });
      setAllergyModal(false);
      setNewAllergen('');
      setNewReaction('');
      await loadChart(selectedClientId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAllergy = async (id) => {
    try {
      await deletePatientAllergy(id);
      await loadChart(selectedClientId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddProblem = async () => {
    if (!newProblemName.trim() || !selectedClientId) return;
    try {
      await addPatientProblem(selectedClientId, {
        problemName: newProblemName,
        icdCode: newIcdCode,
        status: newProblemStatus,
        priority: 'PRIMARY',
        onsetDate: new Date().toISOString().split('T')[0],
        diagnosingClinician: currentPersona?.name || 'Attending Physician'
      });
      setProblemModal(false);
      setNewProblemName('');
      await loadChart(selectedClientId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddMedication = async () => {
    if (!newMedName.trim() || !selectedClientId) return;
    try {
      await addPatientMedication(selectedClientId, {
        medicationName: newMedName,
        dose: newDose,
        route: newRoute,
        frequency: newFreq,
        indication: newIndication || 'Therapeutic maintenance',
        reconciliationStatus: 'INPATIENT_ACTIVE',
        startDate: new Date().toISOString().split('T')[0],
        prescribedBy: currentPersona?.name || 'Attending Physician'
      });
      setMedModal(false);
      setNewMedName('');
      await loadChart(selectedClientId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddImmunization = async () => {
    if (!newVaccine.trim() || !selectedClientId) return;
    try {
      await addPatientImmunization(selectedClientId, {
        vaccineName: newVaccine,
        lotNumber: newLot,
        site: newSite,
        administrationDate: new Date().toISOString().split('T')[0],
        administeredBy: currentPersona?.name || 'Clara Oswald, RN',
        status: 'ADMINISTERED'
      });
      setImmModal(false);
      setNewVaccine('');
      await loadChart(selectedClientId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddProcedure = async () => {
    if (!newProcName.trim() || !selectedClientId) return;
    try {
      await addPatientProcedure(selectedClientId, {
        procedureName: newProcName,
        cptCode: newCpt,
        category: 'SURGICAL',
        procedureDate: new Date().toISOString().split('T')[0],
        leadSurgeon: newSurgeon,
        location: 'Hospital OT Suite 1',
        findings: 'Procedure completed without acute complications.'
      });
      setProcModal(false);
      setNewProcName('');
      await loadChart(selectedClientId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateSoapNote = async () => {
    if (!noteTitle.trim() || !selectedClientId) return;
    try {
      await createClinicalNote(selectedClientId, {
        title: noteTitle,
        noteType: noteType,
        subjective: subj,
        objective: obj,
        assessment: assess,
        plan: plan,
        authorName: currentPersona?.name || 'Dr. Sarah Jenkins',
        authorRole: currentPersona?.role || 'Attending Physician',
        status: 'FINAL_SIGNED'
      });
      setNoteModal(false);
      setSubj('');
      setObj('');
      setAssess('');
      setPlan('');
      await loadChart(selectedClientId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddDocument = async () => {
    if (!docTitle.trim() || !selectedClientId) return;
    try {
      await addClinicalDocument(selectedClientId, {
        title: docTitle,
        documentCategory: docCategory,
        documentDate: new Date().toISOString().split('T')[0],
        fileName: `${docTitle.replace(/\\s+/g, '_')}.pdf`,
        mimeType: 'application/pdf',
        fileSizeKb: 450,
        authorOrSource: currentPersona?.name || 'Care Platform Diagnostics',
        summary: docSummary || 'Standard clinical report attachment.'
      });
      setDocModal(false);
      setDocTitle('');
      setDocSummary('');
      await loadChart(selectedClientId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEvaluateCdsSim = async () => {
    if (!selectedClientId) return;
    try {
      setEvaluatingCds(true);
      const res = await evaluateCds({
        clientId: selectedClientId,
        proposedMedicationName: simProposedMed,
        systolicBp: parseInt(simSbp) || null,
        heartRate: parseInt(simHr) || null,
        oxygenSaturation: parseInt(simSpo2) || null,
        respiratoryRate: parseInt(simResp) || null,
        temperature: parseFloat(simTemp) || null
      });
      setCdsAlerts(res || []);
    } catch (err) {
      console.error('CDS evaluation failed:', err);
    } finally {
      setEvaluatingCds(false);
    }
  };

  const client = record?.client;
  const allergies = record?.allergies || [];
  const problems = record?.problems || [];
  const medications = record?.medications || [];
  const immunizations = record?.immunizations || [];
  const procedures = record?.procedures || [];
  const pmh = record?.pastMedicalHistory || [];
  const familyHistory = record?.familyHistory || [];
  const socialHistory = record?.socialHistory;
  const notes = record?.clinicalNotes || [];
  const docs = record?.clinicalDocuments || [];

  return (
    <View style={styles.container}>
      {/* Patient Switcher & Header Controls */}
      <View style={styles.topSelectorRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Stethoscope size={22} color={colors.primary} />
          <Text style={styles.screenHeading}>Epic-Grade Longitudinal EHR & Patient Chart (360°)</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>Patient:</Text>
          {patients.map(p => (
            <TouchableOpacity 
              key={p.id} 
              style={[styles.patientPill, selectedClientId === p.id && styles.patientPillActive]}
              onPress={() => handleSelectPatient(p.id)}
            >
              <Text style={[styles.patientPillText, selectedClientId === p.id && styles.patientPillTextActive]}>
                {p.firstName} {p.lastName} ({p.uhid || p.clientIdentifier})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* EPIC STORYBOARD HEADER / BANNER */}
      {client && (
        <View style={styles.storyboardBanner}>
          <View style={styles.storyboardMain}>
            <View style={styles.patientAvatar}>
              <Text style={styles.avatarText}>{client.firstName.charAt(0)}{client.lastName.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={styles.patientName}>{client.firstName} {client.lastName}</Text>
                {client.preferredName && (
                  <Text style={styles.prefName}>"{client.preferredName}"</Text>
                )}
                <View style={[styles.codeStatusBadge, { backgroundColor: client.resuscitationStatus === 'DNACPR' ? colors.warningLight : colors.successLight }]}>
                  <Text style={[styles.codeStatusText, { color: client.resuscitationStatus === 'DNACPR' ? colors.warning : colors.success }]}>
                    {client.resuscitationStatus || 'CPR FULL CODE'}
                  </Text>
                </View>
                <View style={styles.uhidBadge}>
                  <Text style={styles.uhidText}>{client.uhid || client.clientIdentifier}</Text>
                </View>
              </View>
              <Text style={styles.patientSubtext}>
                DOB: {client.dateOfBirth || '1948-04-12'} | Gender: {client.gender} | NHS: {client.nhsNumber || '943 281 7421'} | PCP: {client.primaryCarePhysician || 'Dr. Campbell (Kensington Practice)'}
              </Text>
              <Text style={styles.payerText}>
                Payer / Coverage: {client.payerName || 'NHS Adult Social Care'} ({client.payerPolicyNumber || 'NHS-CCG-88219'})
              </Text>
            </View>

            {/* Quick Vitals Strip */}
            <View style={styles.vitalsStrip}>
              <View style={styles.vitalCol}>
                <Text style={styles.vitalLabel}>BP</Text>
                <Text style={styles.vitalVal}>138/86</Text>
              </View>
              <View style={styles.vitalCol}>
                <Text style={styles.vitalLabel}>HR</Text>
                <Text style={styles.vitalVal}>74 bpm</Text>
              </View>
              <View style={styles.vitalCol}>
                <Text style={styles.vitalLabel}>SpO2</Text>
                <Text style={styles.vitalVal}>97%</Text>
              </View>
              <View style={styles.vitalCol}>
                <Text style={styles.vitalLabel}>NEWS2</Text>
                <Text style={[styles.vitalVal, { color: colors.success }]}>1 (Low)</Text>
              </View>
            </View>
          </View>

          {/* CRITICAL ALLERGY BANNER (Prominent red alert) */}
          <View style={styles.allergyWarningStrip}>
            <ShieldAlert size={18} color={colors.danger} />
            <Text style={styles.allergyWarningTitle}>ALLERGIES & ADVERSE REACTIONS:</Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 }}>
              {allergies.length === 0 ? (
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>No known drug allergies (NKDA)</Text>
              ) : (
                allergies.map(a => (
                  <View key={a.id} style={[styles.allergyPill, a.severity === 'SEVERE_LIFE_THREATENING' ? styles.allergyPillSevere : styles.allergyPillMod]}>
                    <Text style={styles.allergyPillText}>
                      {a.allergenName} ({a.reaction || a.severity})
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* ACTIVE CDS BPA ALERT BANNER */}
          {cdsAlerts.length > 0 && (
            <View style={styles.bpaBanner}>
              <AlertTriangle size={18} color={colors.warning} />
              <Text style={styles.bpaBannerTitle}>BESTPRACTICE ADVISORIES ({cdsAlerts.length} Active Alerts):</Text>
              <Text style={styles.bpaBannerText} numberOfLines={1}>
                {cdsAlerts[0].title} — {cdsAlerts[0].description}
              </Text>
              <TouchableOpacity onPress={() => setActiveTab('CDS')}>
                <Text style={styles.viewBpaLink}>View All ({cdsAlerts.length}) &rarr;</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* 10 CLINICAL TABS BAR */}
      <View style={styles.tabBar}>
        {[
          { id: 'STORYBOARD', label: '1. Storyboard', icon: Layers },
          { id: 'ALLERGIES', label: '2. Allergies', icon: AlertTriangle, count: allergies.length },
          { id: 'PROBLEMS', label: '3. Problems', icon: FileCheck, count: problems.length },
          { id: 'MEDS', label: '4. Medications', icon: Pill, count: medications.length },
          { id: 'IMMUNIZATIONS', label: '5. Immunizations', icon: Syringe, count: immunizations.length },
          { id: 'PROCEDURES', label: '6. Procedures', icon: Scissors, count: procedures.length },
          { id: 'NOTES', label: '7. SOAP Notes', icon: FileText, count: notes.length },
          { id: 'DOCS', label: '8. Documents', icon: FileSpreadsheet, count: docs.length },
          { id: 'HISTORIES', label: '9. Histories', icon: User },
          { id: 'CDS', label: '10. CDS & BPAs', icon: Sparkles, badge: cdsAlerts.length > 0 ? cdsAlerts.length : null }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <TouchableOpacity 
              key={t.id} 
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(t.id)}
            >
              <Icon size={16} color={isActive ? colors.primary : colors.textSecondary} />
              <Text style={[styles.tabItemText, isActive && styles.tabItemTextActive]}>
                {t.label}
              </Text>
              {t.count !== undefined && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{t.count}</Text>
                </View>
              )}
              {t.badge && (
                <View style={[styles.countBadge, { backgroundColor: colors.danger }]}>
                  <Text style={[styles.countBadgeText, { color: colors.textWhite }]}>{t.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TAB CONTENT AREA */}
      <ScrollView style={styles.tabContentScroll}>
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 12, color: colors.textSecondary }}>Loading Longitudinal Patient Chart...</Text>
          </View>
        ) : (
          <>
            {/* TAB 1: STORYBOARD (360° OVERVIEW) */}
            {activeTab === 'STORYBOARD' && (
              <View style={styles.storyboardGrid}>
                {/* Left Column: Active Problems & Meds */}
                <View style={styles.gridCol}>
                  <View style={styles.sectionCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Active Problem List (ICD-10)</Text>
                      <TouchableOpacity onPress={() => setActiveTab('PROBLEMS')}>
                        <Text style={styles.cardLink}>Manage</Text>
                      </TouchableOpacity>
                    </View>
                    {problems.slice(0, 4).map(p => (
                      <View key={p.id} style={styles.storyboardRow}>
                        <View style={styles.problemTag}>
                          <Text style={styles.problemTagText}>{p.icdCode || 'ICD'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rowTitle}>{p.problemName}</Text>
                          <Text style={styles.rowSubtitle}>Onset: {p.onsetDate || '2021'} | {p.diagnosingClinician}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={styles.sectionCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Active Medications & Reconciliation</Text>
                      <TouchableOpacity onPress={() => setActiveTab('MEDS')}>
                        <Text style={styles.cardLink}>Manage</Text>
                      </TouchableOpacity>
                    </View>
                    {medications.slice(0, 4).map(m => (
                      <View key={m.id} style={styles.storyboardRow}>
                        <Pill size={16} color={colors.primary} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rowTitle}>{m.medicationName} {m.dose} ({m.frequency})</Text>
                          <Text style={styles.rowSubtitle}>{m.indication || 'Maintenance'} — {m.reconciliationStatus}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Right Column: Recent Notes & Immunizations */}
                <View style={styles.gridCol}>
                  <View style={styles.sectionCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Recent Clinical SOAP Notes</Text>
                      <TouchableOpacity onPress={() => setActiveTab('NOTES')}>
                        <Text style={styles.cardLink}>View All</Text>
                      </TouchableOpacity>
                    </View>
                    {notes.slice(0, 2).map(n => (
                      <View key={n.id} style={styles.notePreviewCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={styles.noteTitle}>{n.title}</Text>
                          <Text style={styles.noteAuthor}>{n.authorName}</Text>
                        </View>
                        <Text style={styles.noteSnippet} numberOfLines={2}>{n.assessment || n.subjective}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.sectionCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Immunizations & Preventive Registry</Text>
                      <TouchableOpacity onPress={() => setActiveTab('IMMUNIZATIONS')}>
                        <Text style={styles.cardLink}>View All</Text>
                      </TouchableOpacity>
                    </View>
                    {immunizations.slice(0, 3).map(i => (
                      <View key={i.id} style={styles.storyboardRow}>
                        <Syringe size={16} color={colors.success} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rowTitle}>{i.vaccineName}</Text>
                          <Text style={styles.rowSubtitle}>Administered: {i.administrationDate} | Lot: {i.lotNumber}</Text>
                        </View>
                        <CheckCircle2 size={16} color={colors.success} />
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* TAB 2: ALLERGIES */}
            {activeTab === 'ALLERGIES' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionTopActionRow}>
                  <Text style={styles.sectionHeaderTitle}>Allergies, Intolerances & Adverse Reactions</Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setAllergyModal(true)}>
                    <Plus size={16} color={colors.textWhite} />
                    <Text style={styles.actionBtnText}>Add Allergy</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardTable}>
                  {allergies.map(a => (
                    <View key={a.id} style={styles.tableRow}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.tableItemTitle}>{a.allergenName}</Text>
                          <View style={[styles.badgePill, a.severity === 'SEVERE_LIFE_THREATENING' ? styles.badgeSevere : styles.badgeMod]}>
                            <Text style={styles.badgeText}>{a.severity}</Text>
                          </View>
                          <View style={styles.badgePill}>
                            <Text style={styles.badgeText}>{a.allergenType}</Text>
                          </View>
                        </View>
                        <Text style={styles.tableItemSub}>Reaction: {a.reaction}</Text>
                        <Text style={styles.tableItemSubMuted}>Documented: {a.onsetDate} by {a.recordedBy}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteAllergy(a.id)}>
                        <X size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 3: PROBLEMS */}
            {activeTab === 'PROBLEMS' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionTopActionRow}>
                  <Text style={styles.sectionHeaderTitle}>Longitudinal Problem List (ICD-10 / SNOMED)</Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setProblemModal(true)}>
                    <Plus size={16} color={colors.textWhite} />
                    <Text style={styles.actionBtnText}>Add Problem</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardTable}>
                  {problems.map(p => (
                    <View key={p.id} style={styles.tableRow}>
                      <View style={styles.problemTag}>
                        <Text style={styles.problemTagText}>{p.icdCode}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.tableItemTitle}>{p.problemName}</Text>
                          <View style={[styles.badgePill, { backgroundColor: p.status === 'ACTIVE' || p.status === 'CHRONIC' ? colors.primaryLight : colors.border }]}>
                            <Text style={[styles.badgeText, { color: p.status === 'ACTIVE' || p.status === 'CHRONIC' ? colors.primary : colors.textSecondary }]}>
                              {p.status}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.tableItemSub}>{p.clinicalNotes || 'No additional notes'}</Text>
                        <Text style={styles.tableItemSubMuted}>Diagnosed: {p.onsetDate} by {p.diagnosingClinician}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 4: MEDICATIONS */}
            {activeTab === 'MEDS' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionTopActionRow}>
                  <Text style={styles.sectionHeaderTitle}>Medication Reconciliation & Active Prescription Orders</Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setMedModal(true)}>
                    <Plus size={16} color={colors.textWhite} />
                    <Text style={styles.actionBtnText}>Add Medication</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardTable}>
                  {medications.map(m => (
                    <View key={m.id} style={styles.tableRow}>
                      <Pill size={20} color={colors.primary} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.tableItemTitle}>{m.medicationName} {m.dose}</Text>
                          <View style={styles.badgePill}>
                            <Text style={styles.badgeText}>{m.route} | {m.frequency}</Text>
                          </View>
                          <View style={[styles.badgePill, { backgroundColor: colors.successLight }]}>
                            <Text style={[styles.badgeText, { color: colors.success }]}>{m.reconciliationStatus}</Text>
                          </View>
                        </View>
                        <Text style={styles.tableItemSub}>Indication: {m.indication || 'General condition'}</Text>
                        <Text style={styles.tableItemSubMuted}>Instructions: {m.instructions || 'As directed'} | Prescriber: {m.prescribedBy}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 5: IMMUNIZATIONS */}
            {activeTab === 'IMMUNIZATIONS' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionTopActionRow}>
                  <Text style={styles.sectionHeaderTitle}>Immunizations & Vaccine Administration Registry</Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setImmModal(true)}>
                    <Plus size={16} color={colors.textWhite} />
                    <Text style={styles.actionBtnText}>Record Vaccine</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardTable}>
                  {immunizations.map(i => (
                    <View key={i.id} style={styles.tableRow}>
                      <Syringe size={20} color={colors.success} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tableItemTitle}>{i.vaccineName}</Text>
                        <Text style={styles.tableItemSub}>Administered Date: {i.administrationDate} | Dose #{i.doseNumber || 1}</Text>
                        <Text style={styles.tableItemSubMuted}>Manufacturer: {i.manufacturer || 'Standard'} | Lot: {i.lotNumber} | Site: {i.site} | Clinician: {i.administeredBy}</Text>
                      </View>
                      <View style={[styles.badgePill, { backgroundColor: colors.successLight }]}>
                        <Text style={[styles.badgeText, { color: colors.success }]}>{i.status}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 6: PROCEDURES */}
            {activeTab === 'PROCEDURES' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionTopActionRow}>
                  <Text style={styles.sectionHeaderTitle}>Surgical & Bedside Procedure Logs (CPT)</Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setProcModal(true)}>
                    <Plus size={16} color={colors.textWhite} />
                    <Text style={styles.actionBtnText}>Record Procedure</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardTable}>
                  {procedures.map(pr => (
                    <View key={pr.id} style={styles.tableRow}>
                      <Scissors size={20} color={colors.secondary} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.tableItemTitle}>{pr.procedureName}</Text>
                          <View style={styles.badgePill}>
                            <Text style={styles.badgeText}>CPT: {pr.cptCode}</Text>
                          </View>
                          <View style={styles.badgePill}>
                            <Text style={styles.badgeText}>{pr.category}</Text>
                          </View>
                        </View>
                        <Text style={styles.tableItemSub}>Date: {pr.procedureDate} | Lead Surgeon: {pr.leadSurgeon}</Text>
                        <Text style={styles.tableItemSubMuted}>Findings: {pr.findings || 'Unremarkable'}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 7: CLINICAL NOTES (SOAP) */}
            {activeTab === 'NOTES' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionTopActionRow}>
                  <Text style={styles.sectionHeaderTitle}>Clinical Notes & SOAP Documentation</Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setNoteModal(true)}>
                    <Plus size={16} color={colors.textWhite} />
                    <Text style={styles.actionBtnText}>New SOAP Note</Text>
                  </TouchableOpacity>
                </View>
                {notes.map(n => (
                  <View key={n.id} style={styles.soapCard}>
                    <View style={styles.soapHeader}>
                      <View>
                        <Text style={styles.soapTitle}>{n.title}</Text>
                        <Text style={styles.soapMeta}>{n.noteType} | Author: {n.authorName} ({n.authorRole})</Text>
                      </View>
                      <View style={[styles.badgePill, { backgroundColor: colors.successLight }]}>
                        <Text style={[styles.badgeText, { color: colors.success }]}>{n.status}</Text>
                      </View>
                    </View>
                    <View style={styles.soapBody}>
                      {n.subjective && (
                        <View style={styles.soapSection}>
                          <Text style={styles.soapSectionLabel}>SUBJECTIVE:</Text>
                          <Text style={styles.soapSectionText}>{n.subjective}</Text>
                        </View>
                      )}
                      {n.objective && (
                        <View style={styles.soapSection}>
                          <Text style={styles.soapSectionLabel}>OBJECTIVE:</Text>
                          <Text style={styles.soapSectionText}>{n.objective}</Text>
                        </View>
                      )}
                      {n.assessment && (
                        <View style={styles.soapSection}>
                          <Text style={styles.soapSectionLabel}>ASSESSMENT:</Text>
                          <Text style={styles.soapSectionText}>{n.assessment}</Text>
                        </View>
                      )}
                      {n.plan && (
                        <View style={styles.soapSection}>
                          <Text style={styles.soapSectionLabel}>PLAN:</Text>
                          <Text style={styles.soapSectionText}>{n.plan}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* TAB 8: DOCUMENTS */}
            {activeTab === 'DOCS' && (
              <View style={styles.tabSection}>
                <View style={styles.sectionTopActionRow}>
                  <Text style={styles.sectionHeaderTitle}>Clinical Documents & Media Attachments</Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setDocModal(true)}>
                    <Plus size={16} color={colors.textWhite} />
                    <Text style={styles.actionBtnText}>Attach Document</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardTable}>
                  {docs.map(d => (
                    <View key={d.id} style={styles.tableRow}>
                      <FileSpreadsheet size={22} color={colors.primary} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.tableItemTitle}>{d.title}</Text>
                          <View style={styles.badgePill}>
                            <Text style={styles.badgeText}>{d.documentCategory}</Text>
                          </View>
                        </View>
                        <Text style={styles.tableItemSub}>{d.summary}</Text>
                        <Text style={styles.tableItemSubMuted}>Date: {d.documentDate} | File: {d.fileName} ({d.fileSizeKb} KB) | Source: {d.authorOrSource}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 9: HISTORIES */}
            {activeTab === 'HISTORIES' && (
              <View style={styles.historyGrid}>
                {/* Past Medical History */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardTitle}>Past Medical History (PMHx)</Text>
                  {pmh.map(m => (
                    <View key={m.id} style={styles.storyboardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>{m.conditionName}</Text>
                        <Text style={styles.rowSubtitle}>Onset: {m.onsetDate || 'Historical'} — Status: {m.status}</Text>
                        {m.notes && <Text style={styles.tableItemSubMuted}>{m.notes}</Text>}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Family History */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardTitle}>Family Health History (FHx)</Text>
                  {familyHistory.map(f => (
                    <View key={f.id} style={styles.storyboardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>{f.relationship}: {f.conditionName}</Text>
                        <Text style={styles.rowSubtitle}>Age of Onset: {f.ageOfOnset || 'Unknown'} | Deceased: {f.isDeceased ? 'Yes' : 'No'}</Text>
                        {f.notes && <Text style={styles.tableItemSubMuted}>{f.notes}</Text>}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Social History */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardTitle}>Social History (SHx)</Text>
                  {socialHistory ? (
                    <View style={{ gap: 8 }}>
                      <Text style={styles.rowSubtitle}><Text style={{ fontWeight: '700' }}>Tobacco:</Text> {socialHistory.tobaccoStatus} ({socialHistory.packsPerDay || 0} packs/day for {socialHistory.smokingYears || 0} yrs)</Text>
                      <Text style={styles.rowSubtitle}><Text style={{ fontWeight: '700' }}>Alcohol:</Text> {socialHistory.alcoholUse} ({socialHistory.alcoholUnitsPerWeek || 0} units/week)</Text>
                      <Text style={styles.rowSubtitle}><Text style={{ fontWeight: '700' }}>Living Situation:</Text> {socialHistory.livingSituation}</Text>
                      <Text style={styles.rowSubtitle}><Text style={{ fontWeight: '700' }}>Occupation:</Text> {socialHistory.occupation}</Text>
                      {socialHistory.notes && <Text style={styles.tableItemSubMuted}>{socialHistory.notes}</Text>}
                    </View>
                  ) : (
                    <Text style={{ color: colors.textSecondary }}>No social history recorded.</Text>
                  )}
                </View>
              </View>
            )}

            {/* TAB 10: CLINICAL DECISION SUPPORT & BPAs */}
            {activeTab === 'CDS' && (
              <View style={styles.tabSection}>
                <View style={styles.cdsTesterCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Sparkles size={20} color={colors.primary} />
                    <Text style={styles.cardTitle}>Epic BestPractice Advisories (BPA) Real-Time Simulator</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
                    Simulate real-time clinician prescribing and vital monitoring. The rule engine automatically executes Drug-Allergy checks against documented allergies (e.g. Penicillin &rarr; Amoxicillin), Drug-Drug interaction checks, and National Early Warning Score (NEWS2) deterioration calculations.
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                    <View style={{ flex: 1, minWidth: 200 }}>
                      <Text style={styles.fieldLabel}>Proposed Medication to Prescribe:</Text>
                      <TextInput 
                        style={styles.modalInput} 
                        value={simProposedMed} 
                        onChangeText={setSimProposedMed} 
                        placeholder="e.g. Amoxicillin, Ibuprofen, Warfarin"
                      />
                    </View>
                    <View style={{ width: 110 }}>
                      <Text style={styles.fieldLabel}>Systolic BP</Text>
                      <TextInput style={styles.modalInput} value={simSbp} onChangeText={setSimSbp} keyboardType="numeric" />
                    </View>
                    <View style={{ width: 100 }}>
                      <Text style={styles.fieldLabel}>Heart Rate</Text>
                      <TextInput style={styles.modalInput} value={simHr} onChangeText={setSimHr} keyboardType="numeric" />
                    </View>
                    <View style={{ width: 100 }}>
                      <Text style={styles.fieldLabel}>SpO2 (%)</Text>
                      <TextInput style={styles.modalInput} value={simSpo2} onChangeText={setSimSpo2} keyboardType="numeric" />
                    </View>
                    <View style={{ width: 100 }}>
                      <Text style={styles.fieldLabel}>Resp Rate</Text>
                      <TextInput style={styles.modalInput} value={simResp} onChangeText={setSimResp} keyboardType="numeric" />
                    </View>
                    <View style={{ width: 100 }}>
                      <Text style={styles.fieldLabel}>Temp (°C)</Text>
                      <TextInput style={styles.modalInput} value={simTemp} onChangeText={setSimTemp} keyboardType="numeric" />
                    </View>
                  </View>

                  <TouchableOpacity style={[styles.actionBtn, { alignSelf: 'flex-start', marginTop: 14 }]} onPress={handleEvaluateCdsSim}>
                    {evaluatingCds ? <ActivityIndicator color={colors.textWhite} /> : <Text style={styles.actionBtnText}>Evaluate Clinical Rules</Text>}
                  </TouchableOpacity>
                </View>

                {/* BPA Alerts Output */}
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.sectionHeaderTitle}>Active BestPractice Advisories ({cdsAlerts.length})</Text>
                  {cdsAlerts.length === 0 ? (
                    <View style={styles.emptyCard}>
                      <CheckCircle2 size={32} color={colors.success} />
                      <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '600', color: colors.success }}>No Active Contraindications or Clinical Alerts</Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>Proposed therapy passes all allergy, medication, and vital safety thresholds.</Text>
                    </View>
                  ) : (
                    cdsAlerts.map(bpa => (
                      <View key={bpa.id} style={[styles.bpaCard, bpa.severity === 'CRITICAL' ? styles.bpaCritical : styles.bpaWarning]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {bpa.severity === 'CRITICAL' ? (
                            <ShieldAlert size={22} color={colors.danger} />
                          ) : (
                            <AlertTriangle size={22} color={colors.warning} />
                          )}
                          <Text style={styles.bpaCardTitle}>{bpa.title}</Text>
                          <View style={[styles.badgePill, { backgroundColor: bpa.severity === 'CRITICAL' ? colors.dangerLight : colors.warningLight }]}>
                            <Text style={[styles.badgeText, { color: bpa.severity === 'CRITICAL' ? colors.danger : colors.warning }]}>{bpa.severity}</Text>
                          </View>
                        </View>
                        <Text style={styles.bpaCardDesc}>{bpa.description}</Text>
                        <View style={styles.bpaRecBox}>
                          <Text style={styles.bpaRecLabel}>CLINICAL RECOMMENDATION:</Text>
                          <Text style={styles.bpaRecText}>{bpa.recommendation}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ALLERGY MODAL */}
      <Modal visible={allergyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Document Allergy / Adverse Reaction</Text>
              <TouchableOpacity onPress={() => setAllergyModal(false)}><X size={20} color={colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.fieldLabel}>Allergen Name *</Text>
              <TextInput style={styles.modalInput} value={newAllergen} onChangeText={setNewAllergen} placeholder="e.g. Penicillin, Codeine, Peanuts" />

              <Text style={styles.fieldLabel}>Reaction Description</Text>
              <TextInput style={styles.modalInput} value={newReaction} onChangeText={setNewReaction} placeholder="e.g. Anaphylaxis, Urticaria, Angioedema" />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Severity</Text>
                  <TextInput style={styles.modalInput} value={newSeverity} onChangeText={setNewSeverity} placeholder="MILD, MODERATE, SEVERE_LIFE_THREATENING" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Allergen Type</Text>
                  <TextInput style={styles.modalInput} value={newAllergyType} onChangeText={setNewAllergyType} placeholder="DRUG, FOOD, LATEX, BIOLOGIC" />
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAllergyModal(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddAllergy}><Text style={styles.submitBtnText}>Save Allergy</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PROBLEM MODAL */}
      <Modal visible={problemModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Problem / Diagnosis</Text>
              <TouchableOpacity onPress={() => setProblemModal(false)}><X size={20} color={colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.fieldLabel}>Diagnosis / Condition Name *</Text>
              <TextInput style={styles.modalInput} value={newProblemName} onChangeText={setNewProblemName} placeholder="e.g. Type 2 Diabetes Mellitus" />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 120 }}>
                  <Text style={styles.fieldLabel}>ICD-10 Code</Text>
                  <TextInput style={styles.modalInput} value={newIcdCode} onChangeText={setNewIcdCode} placeholder="e.g. E11.9" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Status</Text>
                  <TextInput style={styles.modalInput} value={newProblemStatus} onChangeText={setNewProblemStatus} placeholder="ACTIVE, CHRONIC, RESOLVED" />
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setProblemModal(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddProblem}><Text style={styles.submitBtnText}>Add Problem</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MEDICATION MODAL */}
      <Modal visible={medModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order / Reconcile Medication</Text>
              <TouchableOpacity onPress={() => setMedModal(false)}><X size={20} color={colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.fieldLabel}>Medication Name *</Text>
              <TextInput style={styles.modalInput} value={newMedName} onChangeText={setNewMedName} placeholder="e.g. Furosemide, Atorvastatin" />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Dose</Text>
                  <TextInput style={styles.modalInput} value={newDose} onChangeText={setNewDose} placeholder="e.g. 40 mg" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Route</Text>
                  <TextInput style={styles.modalInput} value={newRoute} onChangeText={setNewRoute} placeholder="ORAL, IV, SC" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Frequency</Text>
                  <TextInput style={styles.modalInput} value={newFreq} onChangeText={setNewFreq} placeholder="ONCE_DAILY, PRN" />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Clinical Indication</Text>
              <TextInput style={styles.modalInput} value={newIndication} onChangeText={setNewIndication} placeholder="e.g. Congestive Heart Failure" />
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setMedModal(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddMedication}><Text style={styles.submitBtnText}>Save Medication</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SOAP NOTE MODAL */}
      <Modal visible={noteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxWidth: 650 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create & Sign Clinical SOAP Note</Text>
              <TouchableOpacity onPress={() => setNoteModal(false)}><X size={20} color={colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.fieldLabel}>Note Title *</Text>
              <TextInput style={styles.modalInput} value={noteTitle} onChangeText={setNoteTitle} />

              <Text style={styles.fieldLabel}>Subjective (Chief Complaint, History of Present Illness)</Text>
              <TextInput style={[styles.modalInput, { height: 60 }]} multiline value={subj} onChangeText={setSubj} placeholder="Patient reports..." />

              <Text style={styles.fieldLabel}>Objective (Physical Exam, Vitals, Labs)</Text>
              <TextInput style={[styles.modalInput, { height: 60 }]} multiline value={obj} onChangeText={setObj} placeholder="BP 138/86, Chest clear..." />

              <Text style={styles.fieldLabel}>Assessment (Impression, Clinical Reasoning)</Text>
              <TextInput style={[styles.modalInput, { height: 60 }]} multiline value={assess} onChangeText={setAssess} placeholder="Compensated heart failure..." />

              <Text style={styles.fieldLabel}>Plan (Orders, Rx, Next Steps)</Text>
              <TextInput style={[styles.modalInput, { height: 60 }]} multiline value={plan} onChangeText={setPlan} placeholder="Continue loop diuretic..." />
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setNoteModal(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.success }]} onPress={handleCreateSoapNote}>
                <Text style={styles.submitBtnText}>Sign Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* IMMUNIZATION MODAL */}
      <Modal visible={immModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Immunization</Text>
              <TouchableOpacity onPress={() => setImmModal(false)}><X size={20} color={colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.fieldLabel}>Vaccine Name *</Text>
              <TextInput style={styles.modalInput} value={newVaccine} onChangeText={setNewVaccine} placeholder="e.g. COVID-19 mRNA, Influenza, Prevnar 20" />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Lot Number</Text>
                  <TextInput style={styles.modalInput} value={newLot} onChangeText={setNewLot} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Anatomical Site</Text>
                  <TextInput style={styles.modalInput} value={newSite} onChangeText={setNewSite} />
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setImmModal(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddImmunization}><Text style={styles.submitBtnText}>Save Vaccine</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PROCEDURE MODAL */}
      <Modal visible={procModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Surgical / Bedside Procedure</Text>
              <TouchableOpacity onPress={() => setProcModal(false)}><X size={20} color={colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.fieldLabel}>Procedure Name *</Text>
              <TextInput style={styles.modalInput} value={newProcName} onChangeText={setNewProcName} placeholder="e.g. Diagnostic Coronary Angiogram" />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 120 }}>
                  <Text style={styles.fieldLabel}>CPT Code</Text>
                  <TextInput style={styles.modalInput} value={newCpt} onChangeText={setNewCpt} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Lead Surgeon</Text>
                  <TextInput style={styles.modalInput} value={newSurgeon} onChangeText={setNewSurgeon} />
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setProcModal(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddProcedure}><Text style={styles.submitBtnText}>Record Procedure</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DOCUMENT MODAL */}
      <Modal visible={docModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Attach Clinical Document</Text>
              <TouchableOpacity onPress={() => setDocModal(false)}><X size={20} color={colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.fieldLabel}>Document Title *</Text>
              <TextInput style={styles.modalInput} value={docTitle} onChangeText={setDocTitle} placeholder="e.g. 12-Lead ECG Tracing, Discharge Summary" />

              <Text style={styles.fieldLabel}>Category</Text>
              <TextInput style={styles.modalInput} value={docCategory} onChangeText={setDocCategory} placeholder="LAB_REPORT, RADIOLOGY_SCAN, DISCHARGE_SUMMARY" />

              <Text style={styles.fieldLabel}>Summary / Impression</Text>
              <TextInput style={[styles.modalInput, { height: 60 }]} multiline value={docSummary} onChangeText={setDocSummary} placeholder="Key findings from report..." />
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDocModal(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddDocument}><Text style={styles.submitBtnText}>Save Document</Text></TouchableOpacity>
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
    padding: 20,
    backgroundColor: colors.background,
  },
  topSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 10,
  },
  screenHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  patientPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  patientPillActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  patientPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  patientPillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  storyboardBanner: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  storyboardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  patientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  prefName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  codeStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  uhidBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  uhidText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  patientSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  payerText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  vitalsStrip: {
    flexDirection: 'row',
    gap: 16,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingLeft: 16,
  },
  vitalCol: {
    alignItems: 'center',
  },
  vitalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  vitalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  allergyWarningStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#FCA5A5',
  },
  allergyWarningTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.danger,
    letterSpacing: 0.5,
  },
  allergyPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  allergyPillSevere: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  allergyPillMod: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  allergyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
  },
  bpaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#FCD34D',
  },
  bpaBannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  bpaBannerText: {
    fontSize: 12,
    color: '#78350F',
    flex: 1,
  },
  viewBpaLink: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    overflow: 'scroll',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.cardBg,
  },
  tabItemActive: {
    backgroundColor: colors.primaryLight,
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabItemTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabContentScroll: {
    flex: 1,
  },
  storyboardGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  gridCol: {
    flex: 1,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  storyboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  problemTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  problemTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rowSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notePreviewCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  noteAuthor: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  noteSnippet: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  tabSection: {
    gap: 14,
  },
  sectionTopActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '600',
  },
  cardTable: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tableItemSub: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
  },
  tableItemSubMuted: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeSevere: {
    backgroundColor: '#FEE2E2',
  },
  badgeMod: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  soapCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  soapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
    marginBottom: 12,
  },
  soapTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  soapMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  soapBody: {
    gap: 10,
  },
  soapSection: {
    gap: 2,
  },
  soapSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  soapSectionText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  historyGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  cdsTesterCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  bpaCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  bpaCritical: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },
  bpaWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FBBF24',
  },
  bpaCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  bpaCardDesc: {
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 6,
    lineHeight: 18,
  },
  bpaRecBox: {
    backgroundColor: colors.cardBg,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bpaRecLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  bpaRecText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    width: '100%',
    maxWidth: 500,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textWhite,
  },
});
