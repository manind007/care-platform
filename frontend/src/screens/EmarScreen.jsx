import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { colors } from '../theme/colors';
import {
  apiFetch,
  fetchClients,
  fetchMedications,
  prescribeMedication,
  recordAdministration,
  fetchEmarHistory,
  fetchEmarExceptions,
  recordPrnEffectiveness,
  resolveMedicationException,
  updateMedicationStatus,
  reorderRepeatPrescription,
  receiveMedicationStock,
  fetchMedicationReconciliations,
  createMedicationReconciliation,
  fetchMonthlyMarGrid
} from '../api/client';
import {
  Pill,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  History,
  X,
  UserCheck,
  Plus,
  AlertCircle,
  FileText,
  Calendar,
  RotateCcw,
  Package,
  Check,
  RefreshCw,
  Send,
  ChevronRight,
  User,
  HeartPulse,
  Sparkles,
  MapPin,
  Search,
  Eye,
  Lock,
  FileCheck,
  CheckSquare,
  Square
} from 'lucide-react';

export const EmarScreen = ({ currentPersona, activeClient, onSelectClient }) => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(activeClient?.id || 1);
  const [medications, setMedications] = useState([]);
  const [history, setHistory] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [reconciliations, setReconciliations] = useState([]);
  const [monthlyGrid, setMonthlyGrid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TODAY_MAR');

  // Administration Modal State
  const [selectedMed, setSelectedMed] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [outcome, setOutcome] = useState('ADMINISTERED');
  const [scheduledSlot, setScheduledSlot] = useState('MORNING');
  const [doseGiven, setDoseGiven] = useState('');
  const [outcomeReason, setOutcomeReason] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [witnessRole, setWitnessRole] = useState('Registered Nurse');
  const [digitalSignature, setDigitalSignature] = useState('Sarah Walker, Senior Carer (SCW-9041)');
  const [topicalSiteApplied, setTopicalSiteApplied] = useState('');
  const [prnReason, setPrnReason] = useState('');
  const [prnEffectivenessInput, setPrnEffectivenessInput] = useState('');
  const [sixRightsChecked, setSixRightsChecked] = useState({
    patient: false,
    drug: false,
    dose: false,
    route: false,
    time: false,
    doc: false
  });

  // PRN Effectiveness Modal State
  const [selectedAdminForEffectiveness, setSelectedAdminForEffectiveness] = useState(null);
  const [effectivenessModalVisible, setEffectivenessModalVisible] = useState(false);
  const [effectivenessNote, setEffectivenessNote] = useState('');

  // Exception Resolution Modal State
  const [selectedExceptionForResolve, setSelectedExceptionForResolve] = useState(null);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Stock Receive Modal State
  const [selectedMedForStock, setSelectedMedForStock] = useState(null);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [receivedQty, setReceivedQty] = useState('28');

  // Prescription Modal State
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [prescName, setPrescName] = useState('');
  const [prescGeneric, setPrescGeneric] = useState('');
  const [prescDosageForm, setPrescDosageForm] = useState('Tablet');
  const [prescStrength, setPrescStrength] = useState('5mg');
  const [prescDose, setPrescDose] = useState('1 tablet');
  const [prescRoute, setPrescRoute] = useState('Oral');
  const [prescFreq, setPrescFreq] = useState('Once daily (Morning)');
  const [prescScheduleType, setPrescScheduleType] = useState('REGULAR');
  const [prescScheduledDays, setPrescScheduledDays] = useState('');
  const [prescScheduledTimes, setPrescScheduledTimes] = useState('08:00');
  const [prescTimeCritical, setPrescTimeCritical] = useState(false);
  const [prescTimeWindow, setPrescTimeWindow] = useState('60');
  const [prescControlledDrug, setPrescControlledDrug] = useState(false);
  const [prescRequiresWitness, setPrescRequiresWitness] = useState(false);
  const [prescMinInterval, setPrescMinInterval] = useState('4');
  const [prescMaxDoses, setPrescMaxDoses] = useState('4');
  const [prescPrnIndication, setPrescPrnIndication] = useState('');
  const [prescTopicalSite, setPrescTopicalSite] = useState('');
  const [prescInstructions, setPrescInstructions] = useState('Take with a full glass of water after food.');
  const [prescPharmacyName, setPrescPharmacyName] = useState('Boots Pharmacy Central');
  const [prescPharmacyPhone, setPrescPharmacyPhone] = useState('020 7946 0912');
  const [prescPharmacyRx, setPrescPharmacyRx] = useState('RX-BP-9921');
  const [prescPrescriber, setPrescPrescriber] = useState('Dr. P. Thornton (GP)');
  const [prescStockQty, setPrescStockQty] = useState('28');
  const [prescReorderLevel, setPrescReorderLevel] = useState('7');

  // Reconciliation Modal State
  const [reconciliationModalVisible, setReconciliationModalVisible] = useState(false);
  const [recSource, setRecSource] = useState("St Mary's NHS Trust - Hospital Discharge Summary (Ward 4B)");
  const [recReconciledBy, setRecReconciledBy] = useState('Dr. Sarah Jenkins & Rachel Green');
  const [recNotes, setRecNotes] = useState('Full post-discharge audit executed. Blister packs aligned with GP prescription.');
  const [recDiscrepancies, setRecDiscrepancies] = useState(
    JSON.stringify([
      { medicationName: "Furosemide", type: "DOSE_INCREASE", preAdmission: "20mg daily", discharge: "40mg daily", reason: "Fluid overload management" },
      { medicationName: "Codeine", type: "DISCONTINUED", preAdmission: "30mg QDS", discharge: "STOPPED", reason: "Constipation & fall risk" }
    ], null, 2)
  );

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
      loadEmarData(selectedClientId);
    }
  }, [selectedClientId]);

  const loadEmarData = async (cId) => {
    try {
      setLoading(true);
      const [medsData, historyData, exceptionsData, recsData, gridData] = await Promise.all([
        fetchMedications(cId).catch(() => []),
        fetchEmarHistory(cId).catch(() => []),
        fetchEmarExceptions().catch(() => []),
        fetchMedicationReconciliations(cId).catch(() => []),
        fetchMonthlyMarGrid(cId).catch(() => null)
      ]);
      setMedications(medsData || []);
      setHistory(historyData || []);
      setExceptions(exceptionsData || []);
      setReconciliations(recsData || []);
      setMonthlyGrid(gridData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentClientObj = clients.find(c => c.id === selectedClientId) || clients[0];

  // Helper: Open Administration Modal with Presets
  const openAdminModal = (med, defaultOutcome = 'ADMINISTERED', slot = 'MORNING') => {
    setSelectedMed(med);
    setOutcome(defaultOutcome);
    setScheduledSlot(slot);
    setDoseGiven(med.dose || '');
    setOutcomeReason('');
    setWitnessName('');
    setWitnessRole('Registered Nurse');
    setTopicalSiteApplied(med.topicalSite || '');
    setPrnReason(med.prnIndication || '');
    setPrnEffectivenessInput('');
    setSixRightsChecked({
      patient: false,
      drug: false,
      dose: false,
      route: false,
      time: false,
      doc: false
    });
    setActionModalVisible(true);
  };

  // Helper: Submit Administration
  const handleRecordAdministration = async () => {
    if (!selectedMed) return;

    if (outcome === 'ADMINISTERED' && selectedMed.controlledDrug && !witnessName.trim()) {
      alert('SAFETY ALERT: Controlled Drug (Schedule 2/3) requires mandatory second witness signature.');
      return;
    }

    try {
      await recordAdministration({
        clientId: selectedClientId,
        medicationId: selectedMed.id,
        doseGiven: doseGiven || selectedMed.dose,
        outcome: outcome,
        scheduledSlot: scheduledSlot,
        outcomeReason: outcomeReason || (outcome === 'ADMINISTERED' ? 'Administered per prescribed regimen' : 'Omission noted'),
        witnessName: witnessName.trim() ? witnessName : null,
        witnessRole: witnessName.trim() ? witnessRole : null,
        digitalSignature: digitalSignature.trim() ? digitalSignature : 'Signed by Carer',
        topicalSiteApplied: selectedMed.route === 'Topical' ? topicalSiteApplied : null,
        prnReason: (selectedMed.prn || selectedMed.scheduleType === 'PRN') ? prnReason : null,
        prnEffectiveness: prnEffectivenessInput.trim() ? prnEffectivenessInput : null,
        escalationNotes: outcome !== 'ADMINISTERED' ? `Raised during ${scheduledSlot} round: ${outcomeReason}` : null
      });

      setActionModalVisible(false);
      loadEmarData(selectedClientId);
      alert(`eMAR successfully recorded: ${selectedMed.name} marked as ${outcome}.`);
    } catch (err) {
      alert(err.message || 'Failed to record administration');
    }
  };

  // Helper: Submit PRN Effectiveness
  const handleSavePrnEffectiveness = async () => {
    if (!selectedAdminForEffectiveness || !effectivenessNote.trim()) {
      alert('Please enter clinical evaluation note.');
      return;
    }
    try {
      await recordPrnEffectiveness(selectedAdminForEffectiveness.id, effectivenessNote);
      setEffectivenessModalVisible(false);
      setEffectivenessNote('');
      loadEmarData(selectedClientId);
      alert('PRN effectiveness evaluation logged successfully.');
    } catch (err) {
      alert(err.message || 'Failed to update PRN effectiveness');
    }
  };

  // Helper: Submit Exception Resolution
  const handleResolveException = async () => {
    if (!selectedExceptionForResolve || !resolutionNotes.trim()) {
      alert('Please enter clinical resolution notes.');
      return;
    }
    try {
      await resolveMedicationException(selectedExceptionForResolve.id, resolutionNotes);
      setResolveModalVisible(false);
      setResolutionNotes('');
      loadEmarData(selectedClientId);
      alert('Medication exception alert successfully resolved.');
    } catch (err) {
      alert(err.message || 'Failed to resolve exception');
    }
  };

  // Helper: Submit Reorder
  const handleReorder = async (medId, medName) => {
    try {
      await reorderRepeatPrescription(medId);
      loadEmarData(selectedClientId);
      alert(`Repeat prescription for ${medName} submitted to GP / Community Pharmacy.`);
    } catch (err) {
      alert(err.message || 'Failed to reorder prescription');
    }
  };

  // Helper: Submit Receive Stock
  const handleReceiveStock = async () => {
    if (!selectedMedForStock) return;
    const qty = parseInt(receivedQty, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid stock quantity.');
      return;
    }
    try {
      await receiveMedicationStock(selectedMedForStock.id, qty);
      setStockModalVisible(false);
      loadEmarData(selectedClientId);
      alert(`Received ${qty} units of ${selectedMedForStock.name}. Stock updated.`);
    } catch (err) {
      alert(err.message || 'Failed to receive stock');
    }
  };

  // Helper: Toggle Status
  const handleToggleStatus = async (medId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateMedicationStatus(medId, nextStatus);
      loadEmarData(selectedClientId);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Helper: Create Prescription
  const handleCreatePrescription = async () => {
    if (!prescName.trim()) {
      alert('Please enter drug name.');
      return;
    }
    try {
      await prescribeMedication({
        clientId: selectedClientId,
        name: prescName,
        genericName: prescGeneric || prescName,
        dosageForm: prescDosageForm,
        strength: prescStrength,
        dose: prescDose,
        route: prescRoute,
        frequency: prescFreq,
        scheduleType: prescScheduleType,
        scheduledDays: prescScheduleType === 'WEEKLY' ? prescScheduledDays : null,
        scheduledTimes: prescScheduledTimes,
        timeCritical: prescTimeCritical,
        timeWindowMinutes: parseInt(prescTimeWindow, 10) || 60,
        controlledDrug: prescControlledDrug,
        requiresWitness: prescControlledDrug || prescRequiresWitness,
        minIntervalHours: parseInt(prescMinInterval, 10) || 4,
        maxDosesPerDay: parseInt(prescMaxDoses, 10) || 4,
        prnIndication: prescPrnIndication,
        topicalSite: prescTopicalSite,
        instructions: prescInstructions,
        prn: prescScheduleType === 'PRN',
        stockQuantity: parseInt(prescStockQty, 10) || 28,
        reorderLevel: parseInt(prescReorderLevel, 10) || 7,
        repeatStatus: 'NOT_DUE',
        pharmacyName: prescPharmacyName,
        pharmacyPhone: prescPharmacyPhone,
        pharmacyRxNumber: prescPharmacyRx,
        prescriberDetails: prescPrescriber,
        startDate: new Date().toISOString().split('T')[0],
        active: true,
        status: 'ACTIVE'
      });

      setPrescriptionModalVisible(false);
      setPrescName('');
      loadEmarData(selectedClientId);
      alert(`Prescription for ${prescName} successfully committed to eMAR!`);
    } catch (err) {
      alert(err.message || 'Failed to create prescription');
    }
  };

  // Helper: Create Reconciliation
  const handleCreateReconciliation = async () => {
    if (!recSource.trim()) {
      alert('Please enter source of reconciliation.');
      return;
    }
    try {
      await createMedicationReconciliation(selectedClientId, {
        source: recSource,
        reconciledBy: recReconciledBy,
        discrepanciesJson: recDiscrepancies,
        clinicalNotes: recNotes,
        status: 'APPROVED_AND_APPLIED'
      });

      setReconciliationModalVisible(false);
      loadEmarData(selectedClientId);
      alert('Medication reconciliation recorded and applied.');
    } catch (err) {
      alert(err.message || 'Failed to save reconciliation');
    }
  };

  // PRN Interval & 24h count calculator
  const getPrnSafetyStatus = (med) => {
    const medAdmins = history.filter(h => h.medicationId === med.id && h.outcome === 'ADMINISTERED');
    const now = new Date().getTime();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const dosesLast24h = medAdmins.filter(h => new Date(h.administrationTime).getTime() > oneDayAgo).length;
    const maxDoses = med.maxDosesPerDay || 4;
    const minHours = med.minIntervalHours || 4;

    if (medAdmins.length === 0) {
      return { ready: true, lastTime: 'Never', dosesLast24h, maxDoses, hoursAgo: 999 };
    }

    const lastAdmin = medAdmins[0];
    const lastTimeMs = new Date(lastAdmin.administrationTime).getTime();
    const hoursSinceLast = (now - lastTimeMs) / (1000 * 60 * 60);

    const ready = hoursSinceLast >= minHours && dosesLast24h < maxDoses;
    const remainingMinutes = Math.max(0, Math.ceil((minHours - hoursSinceLast) * 60));

    return {
      ready,
      lastTime: new Date(lastAdmin.administrationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hoursAgo: hoursSinceLast.toFixed(1),
      remainingMinutes,
      dosesLast24h,
      maxDoses
    };
  };

  // Metrics summary
  const totalMeds = medications.length;
  const activeExceptionsCount = exceptions.filter(e => e.escalationStatus !== 'RESOLVED').length;
  const prnMeds = medications.filter(m => m.prn || m.scheduleType === 'PRN');
  const lowStockMeds = medications.filter(m => (m.stockQuantity || 0) <= (m.reorderLevel || 7));
  const cdMeds = medications.filter(m => m.controlledDrug);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header Card with UK NHS/CQC Standards */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.headerBadge}>
                <ShieldCheck size={14} color="#047857" />
                <Text style={styles.headerBadgeText}>NICE SC1 & CQC SAFE S4 COMPLIANT</Text>
              </View>
              <View style={[styles.headerBadge, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Clock size={14} color="#1D4ED8" />
                <Text style={[styles.headerBadgeText, { color: '#1D4ED8' }]}>REAL-TIME AUDIT TRAIL</Text>
              </View>
            </View>
            <Text style={styles.title}>Electronic Medication Administration Record (eMAR)</Text>
            <Text style={styles.subtitle}>
              Full UK domiciliary medication lifecycle: round management, 28-day MAR inspection grid, PRN intervals, hospital discharge reconciliation & Controlled Drugs register.
            </Text>
          </View>

          {/* Client Selector & Add Prescription Action */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <View style={styles.clientSelectorContainer}>
              <Text style={styles.selectorLabel}>ACTIVE CLIENT RECORD:</Text>
              <View style={styles.clientTabs}>
                {clients.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.clientTab, selectedClientId === c.id && styles.clientTabActive]}
                    onPress={() => setSelectedClientId(c.id)}
                  >
                    <User size={13} color={selectedClientId === c.id ? colors.primaryDark : colors.textMuted} />
                    <Text style={[styles.clientTabText, selectedClientId === c.id && styles.clientTabTextActive]}>
                      {c.firstName} {c.lastName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.prescribeBtn}
              onPress={() => setPrescriptionModalVisible(true)}
              activeOpacity={0.8}
            >
              <Plus size={16} color={colors.textWhite} />
              <Text style={styles.prescribeBtnText}>Add Prescription</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Patient Storyboard / Demographics Banner */}
        <View style={styles.storyboardBanner}>
          <View style={styles.sbCol}>
            <Text style={styles.sbLabel}>PATIENT UHID / NHS NUMBER</Text>
            <Text style={styles.sbValue}>{currentClientObj?.uhid || 'NHS-884-201-94'}</Text>
          </View>
          <View style={styles.sbCol}>
            <Text style={styles.sbLabel}>DOB / AGE</Text>
            <Text style={styles.sbValue}>{currentClientObj?.dateOfBirth || '14 Mar 1948'} ({currentClientObj?.age || 78}y)</Text>
          </View>
          <View style={styles.sbCol}>
            <Text style={styles.sbLabel}>PRIMARY CARE PHYSICIAN</Text>
            <Text style={styles.sbValue}>{currentClientObj?.primaryCarePhysician || 'Dr. Sarah Jenkins (GP)'}</Text>
          </View>
          <View style={styles.sbCol}>
            <Text style={styles.sbLabel}>RESUSCITATION CODE</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <HeartPulse size={13} color="#DC2626" />
              <Text style={[styles.sbValue, { color: '#DC2626', fontWeight: '800' }]}>
                {currentClientObj?.resuscitationStatus || 'CPR FULL CODE'}
              </Text>
            </View>
          </View>
          <View style={[styles.sbCol, { flex: 1.5 }]}>
            <Text style={styles.sbLabel}>KNOWN ALLERGIES & CONTRAINDICATIONS</Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
              <View style={styles.allergyTag}>
                <AlertTriangle size={11} color="#991B1B" />
                <Text style={styles.allergyTagText}>Penicillins (Anaphylaxis)</Text>
              </View>
              <View style={styles.allergyTag}>
                <AlertTriangle size={11} color="#991B1B" />
                <Text style={styles.allergyTagText}>Aspirin / NSAIDs (Mild Bronchospasm)</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Top Safety Metrics Strip */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>PRESCRIBED MEDICINES</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={styles.metricNum}>{totalMeds}</Text>
            <Text style={styles.metricSub}>Active</Text>
          </View>
        </View>

        <View style={[styles.metricCard, activeExceptionsCount > 0 && { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}>
          <Text style={[styles.metricLabel, activeExceptionsCount > 0 && { color: '#991B1B' }]}>ACTIVE EXCEPTIONS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={[styles.metricNum, activeExceptionsCount > 0 && { color: '#DC2626' }]}>{activeExceptionsCount}</Text>
            <Text style={[styles.metricSub, activeExceptionsCount > 0 && { color: '#991B1B' }]}>Requires Office Action</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>PRN PROTOCOLS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={styles.metricNum}>{prnMeds.length}</Text>
            <Text style={styles.metricSub}>Interval Tracked</Text>
          </View>
        </View>

        <View style={[styles.metricCard, lowStockMeds.length > 0 && { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }]}>
          <Text style={[styles.metricLabel, lowStockMeds.length > 0 && { color: '#92400E' }]}>REPEAT RX / LOW STOCK</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={[styles.metricNum, lowStockMeds.length > 0 && { color: '#D97706' }]}>{lowStockMeds.length}</Text>
            <Text style={[styles.metricSub, lowStockMeds.length > 0 && { color: '#92400E' }]}>Due for Reorder</Text>
          </View>
        </View>

        <View style={[styles.metricCard, cdMeds.length > 0 && { borderColor: '#DDD6FE', backgroundColor: '#F5F3FF' }]}>
          <Text style={[styles.metricLabel, cdMeds.length > 0 && { color: '#5B21B6' }]}>CONTROLLED DRUGS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={[styles.metricNum, cdMeds.length > 0 && { color: '#7C3AED' }]}>{cdMeds.length}</Text>
            <Text style={[styles.metricSub, cdMeds.length > 0 && { color: '#5B21B6' }]}>Schedule 2/3 (Witness Req)</Text>
          </View>
        </View>
      </View>

      {/* 3. Tab Navigation Bar */}
      <View style={styles.tabsContainer}>
        {[
          { key: 'TODAY_MAR', label: "Today's Rounds Matrix", icon: Clock },
          { key: 'MONTHLY_GRID', label: '28-Day CQC MAR Grid', icon: FileText },
          { key: 'PRN_WORKFLOW', label: 'PRN Protocol & Effectiveness', icon: HeartPulse },
          { key: 'EXCEPTIONS', label: `Exceptions & Escalations (${exceptions.length})`, icon: AlertTriangle },
          { key: 'MED_PROFILES', label: 'Medication Profiles & Stock', icon: Pill },
          { key: 'HOSPITAL_MED_REC', label: 'Hospital Med Rec (TTO)', icon: FileCheck },
          { key: 'CONTROLLED_DRUGS', label: 'Controlled Drugs Register', icon: Lock },
          { key: 'CALENDAR', label: 'Weekly Schedule', icon: Calendar },
          { key: 'AUDIT_HISTORY', label: 'Full Audit Trail', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Icon size={14} color={isActive ? colors.primaryDark : colors.textMuted} />
              <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. Tab Content Views */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading eMAR clinical dataset...</Text>
        </View>
      ) : (
        <>
          {/* TAB 1: TODAY'S ROUNDS MATRIX */}
          {activeTab === 'TODAY_MAR' && (
            <View style={{ gap: 20 }}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>MEDICATION ROUNDS MATRIX FOR TODAY</Text>
                  <Text style={styles.sectionSub}>Daily scheduled administration slots with time window tracking.</Text>
                </View>
                <TouchableOpacity
                  style={styles.actionPillBtn}
                  onPress={() => setPrescriptionModalVisible(true)}
                >
                  <Plus size={14} color={colors.primary} />
                  <Text style={styles.actionPillBtnText}>Add Prescribed Drug</Text>
                </TouchableOpacity>
              </View>

              {['MORNING (08:00)', 'LUNCH (12:00)', 'TEA (17:00)', 'BED (21:00)'].map((slotTitle) => {
                const slotKey = slotTitle.split(' ')[0];
                const medsInSlot = medications.filter(m => {
                  if (m.prn || m.scheduleType === 'PRN') return false;
                  if (slotKey === 'MORNING' && (m.scheduledTimes?.includes('08:00') || m.frequency?.toLowerCase().includes('morning') || m.frequency?.toLowerCase().includes('once daily'))) return true;
                  if (slotKey === 'LUNCH' && (m.scheduledTimes?.includes('12:00') || m.scheduledTimes?.includes('13:00') || m.frequency?.toLowerCase().includes('twice') || m.frequency?.toLowerCase().includes('three'))) return true;
                  if (slotKey === 'TEA' && (m.scheduledTimes?.includes('17:00') || m.scheduledTimes?.includes('18:00') || m.frequency?.toLowerCase().includes('three') || m.frequency?.toLowerCase().includes('four'))) return true;
                  if (slotKey === 'BED' && (m.scheduledTimes?.includes('20:00') || m.scheduledTimes?.includes('21:00') || m.frequency?.toLowerCase().includes('bed') || m.frequency?.toLowerCase().includes('night') || m.frequency?.toLowerCase().includes('twice'))) return true;
                  return false;
                });

                return (
                  <View key={slotTitle} style={styles.roundCard}>
                    <View style={styles.roundHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Clock size={16} color={colors.primaryDark} />
                        <Text style={styles.roundTitle}>{slotTitle} ROUND</Text>
                        <View style={styles.roundCountBadge}>
                          <Text style={styles.roundCountText}>{medsInSlot.length} scheduled</Text>
                        </View>
                      </View>
                      <Text style={styles.roundWindowText}>Allowable Window: ±60 mins</Text>
                    </View>

                    {medsInSlot.length === 0 ? (
                      <View style={styles.emptySlotBox}>
                        <Text style={styles.emptySlotText}>No medications scheduled for this round.</Text>
                      </View>
                    ) : (
                      <View style={styles.roundMedsGrid}>
                        {medsInSlot.map(med => {
                          const todayAdmins = history.filter(h =>
                            h.medicationId === med.id &&
                            h.scheduledSlot === slotKey &&
                            new Date(h.administrationTime).toDateString() === new Date().toDateString()
                          );
                          const lastAdmin = todayAdmins[0];
                          const isGiven = lastAdmin && lastAdmin.outcome === 'ADMINISTERED';
                          const isRefused = lastAdmin && lastAdmin.outcome === 'REFUSED';

                          return (
                            <View key={med.id} style={[styles.roundMedItem, isGiven && styles.roundMedItemGiven, isRefused && styles.roundMedItemRefused]}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View style={{ flex: 1 }}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <Text style={styles.roundMedName}>{med.name} {med.strength}</Text>
                                    {med.timeCritical && (
                                      <View style={styles.timeCriticalBadge}>
                                        <Text style={styles.timeCriticalText}>TIME CRITICAL (±30m)</Text>
                                      </View>
                                    )}
                                    {med.controlledDrug && (
                                      <View style={styles.cdBadge}>
                                        <Lock size={10} color="#7C3AED" />
                                        <Text style={styles.cdText}>CD SCHED 2</Text>
                                      </View>
                                    )}
                                  </View>
                                  <Text style={styles.roundMedSub}>{med.genericName} • {med.dose} • {med.route} • {med.dosageForm}</Text>
                                  <Text style={styles.roundMedInstructions}>{med.instructions}</Text>
                                  {med.topicalSite && (
                                    <View style={styles.topicalPill}>
                                      <MapPin size={11} color="#0D9488" />
                                      <Text style={styles.topicalPillText}>Application Site: {med.topicalSite}</Text>
                                    </View>
                                  )}
                                </View>

                                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                                  {isGiven ? (
                                    <View style={styles.givenStatusBadge}>
                                      <CheckCircle2 size={13} color="#059669" />
                                      <Text style={styles.givenStatusText}>
                                        GIVEN ({new Date(lastAdmin.administrationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                      </Text>
                                    </View>
                                  ) : isRefused ? (
                                    <View style={styles.refusedStatusBadge}>
                                      <XCircle size={13} color="#DC2626" />
                                      <Text style={styles.refusedStatusText}>REFUSED / ESCALATED</Text>
                                    </View>
                                  ) : (
                                    <View style={{ flexDirection: 'row', gap: 6 }}>
                                      <TouchableOpacity
                                        style={styles.administerActionBtn}
                                        onPress={() => openAdminModal(med, 'ADMINISTERED', slotKey)}
                                      >
                                        <CheckCircle2 size={13} color="#FFF" />
                                        <Text style={styles.administerActionBtnText}>Administer</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        style={styles.refuseActionBtn}
                                        onPress={() => openAdminModal(med, 'REFUSED', slotKey)}
                                      >
                                        <XCircle size={13} color="#DC2626" />
                                        <Text style={styles.refuseActionBtnText}>Omit</Text>
                                      </TouchableOpacity>
                                    </View>
                                  )}
                                  <Text style={styles.stockRemainingText}>Stock: {med.stockQuantity || 0} left</Text>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* TAB 2: 28-DAY MONTHLY MAR GRID (CQC AUDIT FORMAT) */}
          {activeTab === 'MONTHLY_GRID' && (
            <View style={{ gap: 16 }}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>28-DAY MONTHLY MAR CHART GRID (CQC AUDIT FORMAT)</Text>
                  <Text style={styles.sectionSub}>
                    Traditional multi-day matrix compliant with CQC Regulation 12 (Safe Care and Treatment) & RPS Guidelines.
                  </Text>
                </View>
              </View>

              {/* Legend Strip */}
              <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748B' }}>INSPECTION LEGEND:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ backgroundColor: '#DCFCE7', borderColor: '#86EFAC', borderWidth: 1, width: 22, height: 22, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#059669' }}>A</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#475569' }}>Administered</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: 1, width: 22, height: 22, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#DC2626' }}>R</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#475569' }}>Refused</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ backgroundColor: '#FEF3C7', borderColor: '#FDE68A', borderWidth: 1, width: 22, height: 22, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#D97706' }}>M</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#475569' }}>Missed</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ backgroundColor: '#F1F5F9', borderColor: '#CBD5E1', borderWidth: 1, width: 22, height: 22, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748B' }}>W</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#475569' }}>Withheld</Text>
                </View>
              </View>

              {/* Scrollable 28-day Grid */}
              <ScrollView horizontal style={{ backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 10 }}>
                <View>
                  {/* Table Header: Days 1 to 28/31 */}
                  <View style={{ flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#CBD5E1', paddingBottom: 8, alignItems: 'center' }}>
                    <View style={{ width: 220, paddingRight: 10 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#0F172A' }}>MEDICATION & DOSAGE REGIMEN</Text>
                    </View>
                    {Array.from({ length: monthlyGrid?.daysInMonth || 28 }, (_, i) => i + 1).map(day => (
                      <View key={day} style={{ width: 34, alignItems: 'center' }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#475569' }}>{day}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Medication Rows */}
                  {(!monthlyGrid?.medications || monthlyGrid.medications.length === 0) ? (
                    <View style={{ padding: 20 }}>
                      <Text style={{ fontSize: 12, color: '#64748B' }}>No prescribed medications loaded for monthly grid.</Text>
                    </View>
                  ) : (
                    monthlyGrid.medications.map(med => (
                      <View key={med.medicationId} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingVertical: 10, alignItems: 'center' }}>
                        <View style={{ width: 220, paddingRight: 10 }}>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>{med.name} {med.strength}</Text>
                          <Text style={{ fontSize: 11, color: '#64748B' }}>{med.dose} • {med.route} • {med.frequency}</Text>
                        </View>
                        {Array.from({ length: monthlyGrid.daysInMonth || 28 }, (_, i) => i + 1).map(day => {
                          const cellAdmins = med.days ? med.days[day] || [] : [];
                          const primaryAdmin = cellAdmins[0];
                          const code = primaryAdmin ? primaryAdmin.code : null;

                          return (
                            <View key={day} style={{ width: 34, alignItems: 'center', justifyContent: 'center' }}>
                              {code ? (
                                <View style={[
                                  { width: 26, height: 26, borderRadius: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
                                  code === 'A' && { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
                                  code === 'R' && { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
                                  code === 'M' && { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
                                  code === 'W' && { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }
                                ]}>
                                  <Text style={[
                                    { fontSize: 11, fontWeight: '800' },
                                    code === 'A' && { color: '#059669' },
                                    code === 'R' && { color: '#DC2626' },
                                    code === 'M' && { color: '#D97706' },
                                    code === 'W' && { color: '#64748B' }
                                  ]}>{code}</Text>
                                </View>
                              ) : (
                                <Text style={{ fontSize: 11, color: '#CBD5E1' }}>-</Text>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>
          )}

          {/* TAB 3: PRN PROTOCOL & EFFECTIVENESS */}
          {activeTab === 'PRN_WORKFLOW' && (
            <View style={{ gap: 20 }}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>PRN (AS REQUIRED) MEDICATION SAFETY CONSOLE</Text>
                  <Text style={styles.sectionSub}>Strict minimum interval enforcement, 24-hour dose limits, and post-administration clinical effectiveness follow-ups.</Text>
                </View>
              </View>

              <View style={styles.prnNoticeCard}>
                <AlertCircle size={16} color="#0284C7" />
                <Text style={styles.prnNoticeText}>
                  PRN Protocol Rule: Carers must verify client indication, confirm previous dose time is beyond minimum interval ({'>'}4 hrs), and evaluate outcome after 45 minutes.
                </Text>
              </View>

              <View style={styles.prnGrid}>
                {prnMeds.length === 0 ? (
                  <View style={styles.emptySlotBox}>
                    <Text style={styles.emptySlotText}>No PRN medications prescribed for this client.</Text>
                  </View>
                ) : (
                  prnMeds.map(med => {
                    const status = getPrnSafetyStatus(med);
                    return (
                      <View key={med.id} style={styles.prnCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={styles.prnDrugName}>{med.name} {med.strength}</Text>
                              {med.controlledDrug && (
                                <View style={styles.cdBadge}>
                                  <Lock size={10} color="#7C3AED" />
                                  <Text style={styles.cdText}>CD SCHED 2</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.prnSubText}>{med.dose} • {med.route} • {med.genericName}</Text>
                          </View>

                          {status.ready ? (
                            <View style={styles.prnReadyBadge}>
                              <CheckCircle2 size={12} color="#059669" />
                              <Text style={styles.prnReadyText}>SAFE TO ADMINISTER</Text>
                            </View>
                          ) : (
                            <View style={styles.prnBlockedBadge}>
                              <Clock size={12} color="#D97706" />
                              <Text style={styles.prnBlockedText}>WAIT {status.remainingMinutes}m (INTERVAL)</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.prnDetailsBox}>
                          <Text style={styles.prnIndicationLabel}>AUTHORIZED INDICATION:</Text>
                          <Text style={styles.prnIndicationText}>{med.prnIndication || 'Pain rated >= 5/10, pyrexia, or breakthrough symptoms'}</Text>

                          <View style={styles.prnStatsRow}>
                            <View>
                              <Text style={styles.prnStatLabel}>MIN INTERVAL</Text>
                              <Text style={styles.prnStatVal}>{med.minIntervalHours || 4} Hours</Text>
                            </View>
                            <View>
                              <Text style={styles.prnStatLabel}>LAST GIVEN</Text>
                              <Text style={styles.prnStatVal}>{status.lastTime} ({status.hoursAgo}h ago)</Text>
                            </View>
                            <View>
                              <Text style={styles.prnStatLabel}>24H DOSE COUNT</Text>
                              <Text style={styles.prnStatVal}>{status.dosesLast24h} of {status.maxDoses} max</Text>
                            </View>
                            <View>
                              <Text style={styles.prnStatLabel}>STOCK REMAINING</Text>
                              <Text style={styles.prnStatVal}>{med.stockQuantity || 0} units</Text>
                            </View>
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                          <TouchableOpacity
                            style={[styles.prnAdminBtn, !status.ready && { opacity: 0.6 }]}
                            onPress={() => openAdminModal(med, 'ADMINISTERED', 'PRN')}
                          >
                            <Pill size={14} color="#FFF" />
                            <Text style={styles.prnAdminBtnText}>Administer PRN Dose</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              {/* Pending PRN Follow-up Evaluations */}
              <View style={{ marginTop: 10 }}>
                <Text style={styles.subSectionTitle}>PENDING PRN EFFECTIVENESS EVALUATIONS (POST 45-MINUTES)</Text>
                {history.filter(h => h.scheduledSlot === 'PRN' && h.outcome === 'ADMINISTERED' && !h.prnEffectiveness).length === 0 ? (
                  <View style={styles.emptySlotBox}>
                    <Text style={styles.emptySlotText}>All recorded PRN administrations have clinical outcome documentation.</Text>
                  </View>
                ) : (
                  <View style={{ gap: 10, marginTop: 8 }}>
                    {history.filter(h => h.scheduledSlot === 'PRN' && h.outcome === 'ADMINISTERED' && !h.prnEffectiveness).map(admin => (
                      <View key={admin.id} style={styles.pendingEvalCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.pendingEvalDrug}>{admin.medicationName} ({admin.doseGiven})</Text>
                          <Text style={styles.pendingEvalMeta}>
                            Given at {new Date(admin.administrationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {admin.workerName} • Reason: {admin.prnReason || 'Pain relief'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.recordEvalBtn}
                          onPress={() => {
                            setSelectedAdminForEffectiveness(admin);
                            setEffectivenessNote('');
                            setEffectivenessModalVisible(true);
                          }}
                        >
                          <Sparkles size={13} color="#FFF" />
                          <Text style={styles.recordEvalBtnText}>Record Outcome (Pain Score)</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* TAB 4: EXCEPTIONS & ESCALATION LEDGER */}
          {activeTab === 'EXCEPTIONS' && (
            <View style={{ gap: 16 }}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>MEDICATION EXCEPTIONS & ESCALATION REGISTER</Text>
                  <Text style={styles.sectionSub}>Real-time log of refused, missed, or unavailable medications requiring coordinator investigation and GP escalation.</Text>
                </View>
              </View>

              {exceptions.length === 0 ? (
                <View style={styles.emptySlotBox}>
                  <CheckCircle2 size={24} color="#059669" />
                  <Text style={[styles.emptySlotText, { color: '#059669', fontWeight: '700' }]}>Zero Active Exceptions</Text>
                  <Text style={styles.emptySlotSub}>All prescribed doses today have been safely administered according to care plan.</Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {exceptions.map(exc => (
                    <View key={exc.id} style={styles.exceptionCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={[styles.outcomeTag, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
                              <XCircle size={12} color="#DC2626" />
                              <Text style={[styles.outcomeTagText, { color: '#DC2626' }]}>{exc.outcome}</Text>
                            </View>
                            <Text style={styles.exceptionMedName}>{exc.medicationName}</Text>
                            <Text style={styles.exceptionSlot}>Round: {exc.scheduledSlot}</Text>
                          </View>
                          <Text style={styles.exceptionReason}>Reported Reason: {exc.outcomeReason}</Text>
                          <Text style={styles.exceptionMeta}>
                            Logged by {exc.workerName} at {new Date(exc.administrationTime).toLocaleString()}
                          </Text>
                          {exc.escalationNotes && (
                            <View style={styles.escalationNoteBox}>
                              <Text style={styles.escalationNoteText}>Escalation Notes: {exc.escalationNotes}</Text>
                            </View>
                          )}
                        </View>

                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                          <View style={[styles.statusBadge, exc.escalationStatus === 'RESOLVED' ? styles.statusBadgeGreen : styles.statusBadgeRed]}>
                            <Text style={[styles.statusBadgeText, exc.escalationStatus === 'RESOLVED' ? styles.statusTextGreen : styles.statusTextRed]}>
                              {exc.escalationStatus || 'FLAGGED_TO_OFFICE'}
                            </Text>
                          </View>
                          {exc.escalationStatus !== 'RESOLVED' && (
                            <TouchableOpacity
                              style={styles.resolveBtn}
                              onPress={() => {
                                setSelectedExceptionForResolve(exc);
                                setResolutionNotes('');
                                setResolveModalVisible(true);
                              }}
                            >
                              <FileCheck size={13} color="#FFF" />
                              <Text style={styles.resolveBtnText}>Office Resolve</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB 5: MEDICATION PROFILES & STOCK MANAGEMENT */}
          {activeTab === 'MED_PROFILES' && (
            <View style={{ gap: 20 }}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>PATIENT MEDICATION REGIMENS & INVENTORY</Text>
                  <Text style={styles.sectionSub}>Prescriber authorizations, community pharmacy linkages, repeat prescriptions, and stock tracking.</Text>
                </View>
                <TouchableOpacity
                  style={styles.actionPillBtn}
                  onPress={() => setPrescriptionModalVisible(true)}
                >
                  <Plus size={14} color={colors.primary} />
                  <Text style={styles.actionPillBtnText}>New Prescription</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.profilesGrid}>
                {medications.map(med => {
                  const isLowStock = (med.stockQuantity || 0) <= (med.reorderLevel || 7);
                  return (
                    <View key={med.id} style={styles.profileCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <Text style={styles.profileMedName}>{med.name} {med.strength}</Text>
                            <View style={[styles.statusBadge, med.active ? styles.statusBadgeGreen : styles.statusBadgeGray]}>
                              <Text style={[styles.statusBadgeText, med.active ? styles.statusTextGreen : styles.statusTextGray]}>
                                {med.status || (med.active ? 'ACTIVE' : 'SUSPENDED')}
                              </Text>
                            </View>
                            {med.controlledDrug && (
                              <View style={styles.cdBadge}>
                                <Lock size={10} color="#7C3AED" />
                                <Text style={styles.cdText}>CONTROLLED DRUG</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.profileGeneric}>Generic: {med.genericName} • Dosage Form: {med.dosageForm || 'Tablet'}</Text>
                          <Text style={styles.profileDose}>Regimen: {med.dose} • {med.route} • {med.frequency}</Text>
                          <Text style={styles.profileTimes}>Scheduled Slots: {med.scheduledTimes}</Text>
                        </View>

                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          <View style={[styles.stockBadge, isLowStock ? styles.stockBadgeRed : styles.stockBadgeGreen]}>
                            <Package size={12} color={isLowStock ? '#DC2626' : '#059669'} />
                            <Text style={[styles.stockBadgeText, isLowStock ? styles.stockTextRed : styles.stockTextGreen]}>
                              Stock: {med.stockQuantity || 0} Units
                            </Text>
                          </View>
                          <Text style={styles.repeatStatusText}>Repeat: {med.repeatStatus || 'NOT_DUE'}</Text>
                        </View>
                      </View>

                      <View style={styles.profileDetailsRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.profileSubLabel}>PRESCRIBER:</Text>
                          <Text style={styles.profileSubVal}>{med.prescriberDetails || 'GP Surgery'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.profileSubLabel}>COMMUNITY PHARMACY:</Text>
                          <Text style={styles.profileSubVal}>{med.pharmacyName || 'Central Pharmacy'} ({med.pharmacyPhone || 'N/A'})</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.profileSubLabel}>NEXT REVIEW DATE:</Text>
                          <Text style={styles.profileSubVal}>{med.nextReviewDate || 'Within 6 months'}</Text>
                        </View>
                      </View>

                      <Text style={styles.profileInstructions}>Instructions: {med.instructions}</Text>

                      <View style={styles.profileActionsRow}>
                        <TouchableOpacity
                          style={styles.reorderBtn}
                          onPress={() => handleReorder(med.id, med.name)}
                        >
                          <RotateCcw size={13} color="#1D4ED8" />
                          <Text style={styles.reorderBtnText}>Reorder Repeat Rx</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.receiveStockBtn}
                          onPress={() => {
                            setSelectedMedForStock(med);
                            setReceivedQty('28');
                            setStockModalVisible(true);
                          }}
                        >
                          <Package size={13} color="#059669" />
                          <Text style={styles.receiveStockBtnText}>Receive Stock (+28)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.suspendBtn}
                          onPress={() => handleToggleStatus(med.id, med.status)}
                        >
                          <Text style={styles.suspendBtnText}>{med.active ? 'Suspend Regimen' : 'Resume Regimen'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* TAB 6: HOSPITAL DISCHARGE MEDICATION RECONCILIATION */}
          {activeTab === 'HOSPITAL_MED_REC' && (
            <View style={{ gap: 20 }}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>HOSPITAL DISCHARGE MEDICATION RECONCILIATION (TTO)</Text>
                  <Text style={styles.sectionSub}>Compare pre-admission medications with hospital discharge TTO prescriptions to prevent adverse drug events and double-dosing.</Text>
                </View>
                <TouchableOpacity
                  style={styles.actionPillBtn}
                  onPress={() => setReconciliationModalVisible(true)}
                >
                  <Plus size={14} color={colors.primary} />
                  <Text style={styles.actionPillBtnText}>New Med Rec Audit</Text>
                </TouchableOpacity>
              </View>

              {reconciliations.length === 0 ? (
                <View style={styles.emptySlotBox}>
                  <Text style={styles.emptySlotText}>No reconciliation records found for this client.</Text>
                </View>
              ) : (
                reconciliations.map(rec => {
                  let items = [];
                  try {
                    items = JSON.parse(rec.discrepanciesJson || '[]');
                  } catch (e) {
                    items = [];
                  }

                  return (
                    <View key={rec.id} style={styles.recCard}>
                      <View style={styles.recHeader}>
                        <View>
                          <Text style={styles.recSource}>{rec.source}</Text>
                          <Text style={styles.recMeta}>Reconciled by: {rec.reconciledBy} • Date: {rec.reconciliationDate}</Text>
                        </View>
                        <View style={styles.approvedBadge}>
                          <CheckCircle2 size={13} color="#059669" />
                          <Text style={styles.approvedBadgeText}>{rec.status}</Text>
                        </View>
                      </View>

                      <Text style={styles.recNotesText}>Clinical Notes: {rec.clinicalNotes}</Text>

                      <View style={styles.recTable}>
                        <View style={styles.recTableHeader}>
                          <Text style={[styles.recTh, { flex: 1.5 }]}>MEDICATION</Text>
                          <Text style={[styles.recTh, { flex: 1 }]}>CHANGE TYPE</Text>
                          <Text style={[styles.recTh, { flex: 1.5 }]}>PRE-ADMISSION</Text>
                          <Text style={[styles.recTh, { flex: 1.5 }]}>DISCHARGE TTO</Text>
                          <Text style={[styles.recTh, { flex: 2 }]}>CLINICAL RATIONALE</Text>
                        </View>
                        {items.map((it, idx) => (
                          <View key={idx} style={styles.recTableRow}>
                            <Text style={[styles.recTd, { flex: 1.5, fontWeight: '700' }]}>{it.medicationName}</Text>
                            <View style={{ flex: 1 }}>
                              <View style={[
                                styles.changeTypeBadge,
                                it.type === 'DOSE_INCREASE' && { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' },
                                it.type === 'DISCONTINUED' && { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
                                it.type === 'CONTINUED' && { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }
                              ]}>
                                <Text style={styles.changeTypeText}>{it.type}</Text>
                              </View>
                            </View>
                            <Text style={[styles.recTd, { flex: 1.5 }]}>{it.preAdmission}</Text>
                            <Text style={[styles.recTd, { flex: 1.5, fontWeight: '600', color: colors.primaryDark }]}>{it.discharge}</Text>
                            <Text style={[styles.recTd, { flex: 2, color: colors.textSecondary }]}>{it.reason}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* TAB 7: CONTROLLED DRUGS REGISTER */}
          {activeTab === 'CONTROLLED_DRUGS' && (
            <View style={{ gap: 20 }}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>UK CONTROLLED DRUGS (SCHEDULE 2/3) REGISTER</Text>
                  <Text style={styles.sectionSub}>Statutory Misuse of Drugs Regulations register with mandatory witness double-signing and stock reconciliation.</Text>
                </View>
              </View>

              <View style={styles.cdWarningBanner}>
                <Lock size={16} color="#7C3AED" />
                <Text style={styles.cdWarningText}>
                  Controlled Drugs Mandate: Morphine and high-potency Schedule 2 opioids require locked metal CD cabinet storage, running balance checks, and mandatory 2nd carer or registered nurse double-signing.
                </Text>
              </View>

              <View style={{ gap: 16 }}>
                {cdMeds.length === 0 ? (
                  <View style={styles.emptySlotBox}>
                    <Text style={styles.emptySlotText}>No Schedule 2 or 3 Controlled Drugs prescribed for this client.</Text>
                  </View>
                ) : (
                  cdMeds.map(cd => (
                    <View key={cd.id} style={styles.cdCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                          <Text style={styles.cdCardTitle}>{cd.name} ({cd.strength})</Text>
                          <Text style={styles.cdCardSub}>{cd.genericName} • {cd.dosageForm} • {cd.route} • Schedule 2 CD</Text>
                          <Text style={styles.cdInstructions}>Rx Instructions: {cd.instructions}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                          <View style={styles.cdStockBadge}>
                            <Text style={styles.cdStockText}>RUNNING BALANCE: {cd.stockQuantity} UNITS</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.cdAdminBtn}
                            onPress={() => openAdminModal(cd, 'ADMINISTERED', 'PRN')}
                          >
                            <ShieldCheck size={14} color="#FFF" />
                            <Text style={styles.cdAdminBtnText}>Administer with Witness</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={{ marginTop: 12 }}>
                        <Text style={styles.cdHistoryHeader}>CONTROLLED DRUGS TRANSACTION AUDIT LOG</Text>
                        <View style={{ gap: 8, marginTop: 6 }}>
                          {history.filter(h => h.medicationId === cd.id).map(h => (
                            <View key={h.id} style={styles.cdLogRow}>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.cdLogDose}>Dose Administered: {h.doseGiven} ({h.scheduledSlot})</Text>
                                <Text style={styles.cdLogMeta}>Date & Time: {new Date(h.administrationTime).toLocaleString()}</Text>
                                <Text style={styles.cdLogReason}>Indication: {h.prnReason || 'Pain relief'}</Text>
                                {h.prnEffectiveness && (
                                  <Text style={styles.cdLogEffectiveness}>Clinical Outcome: {h.prnEffectiveness}</Text>
                                )}
                              </View>
                              <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.cdLogSign}>{h.digitalSignature}</Text>
                                <View style={styles.cdWitnessTag}>
                                  <UserCheck size={11} color="#059669" />
                                  <Text style={styles.cdWitnessText}>Witness: {h.witnessName} ({h.witnessRole})</Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}

          {/* TAB 8: WEEKLY & TOPICAL CALENDAR */}
          {activeTab === 'CALENDAR' && (
            <View style={{ gap: 20 }}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>WEEKLY REGIMENS & BODY MAP SITE ROTATION</Text>
                  <Text style={styles.sectionSub}>Weekly medicines (e.g. Bisphosphonates, Methotrexate) and topical patch/cream site rotation map.</Text>
                </View>
              </View>

              <View style={styles.calendarGrid}>
                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
                  const dayMeds = medications.filter(m => {
                    if (m.scheduleType === 'WEEKLY') {
                      return m.scheduledDays?.toUpperCase().includes(day);
                    }
                    return false;
                  });

                  return (
                    <View key={day} style={styles.calDayBox}>
                      <View style={styles.calDayHeader}>
                        <Text style={styles.calDayTitle}>{day}</Text>
                      </View>
                      <View style={{ padding: 10, gap: 6 }}>
                        {dayMeds.length === 0 ? (
                          <Text style={styles.calEmptyText}>No weekly medicines</Text>
                        ) : (
                          dayMeds.map(m => (
                            <View key={m.id} style={styles.calMedPill}>
                              <Pill size={11} color="#0284C7" />
                              <Text style={styles.calMedText}>{m.name} {m.strength}</Text>
                            </View>
                          ))
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.bodyMapCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} color="#0D9488" />
                  <Text style={styles.bodyMapTitle}>TOPICAL CREAM & TRANSDERMAL PATCH ROTATION PROTOCOL</Text>
                </View>
                <Text style={styles.bodyMapSub}>
                  To avoid skin irritation, breakdown, and contact dermatitis, topical applications must alternate sites across rounds.
                </Text>

                <View style={styles.bodyMapSites}>
                  <View style={styles.bodyMapSiteCard}>
                    <Text style={styles.siteName}>SITE 1: LEFT KNEE</Text>
                    <Text style={styles.siteTime}>Scheduled: Morning (08:00)</Text>
                    <Text style={styles.siteDesc}>Intact skin over left patella. Rub gently until absorbed.</Text>
                  </View>
                  <View style={styles.bodyMapSiteCard}>
                    <Text style={styles.siteName}>SITE 2: RIGHT KNEE</Text>
                    <Text style={styles.siteTime}>Scheduled: Evening / Bed (20:00)</Text>
                    <Text style={styles.siteDesc}>Intact skin over right patella. Wash hands post-application.</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* TAB 9: FULL AUDIT TRAIL */}
          {activeTab === 'AUDIT_HISTORY' && (
            <View style={{ gap: 16 }}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>TAMPER-EVIDENT eMAR AUDIT TRAIL</Text>
                  <Text style={styles.sectionSub}>Immutable log of all medication administration events, carer signatures, exceptions, and witness records.</Text>
                </View>
              </View>

              <View style={{ gap: 10 }}>
                {history.map(item => (
                  <View key={item.id} style={styles.auditRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={[
                        styles.auditOutcomeBadge,
                        item.outcome === 'ADMINISTERED' && { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
                        item.outcome === 'REFUSED' && { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
                        item.outcome === 'MISSED' && { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }
                      ]}>
                        <Text style={[
                          styles.auditOutcomeText,
                          item.outcome === 'ADMINISTERED' && { color: '#059669' },
                          item.outcome === 'REFUSED' && { color: '#DC2626' },
                          item.outcome === 'MISSED' && { color: '#D97706' }
                        ]}>{item.outcome}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.auditMedName}>{item.medicationName} ({item.doseGiven})</Text>
                        <Text style={styles.auditMeta}>
                          Slot: {item.scheduledSlot} • Time: {new Date(item.administrationTime).toLocaleString()} • Carer: {item.workerName}
                        </Text>
                        {item.outcomeReason && (
                          <Text style={styles.auditReason}>Notes: {item.outcomeReason}</Text>
                        )}
                        {item.prnReason && (
                          <Text style={styles.auditReason}>PRN Reason: {item.prnReason}</Text>
                        )}
                        {item.prnEffectiveness && (
                          <Text style={styles.auditEffectiveness}>Clinical Outcome: {item.prnEffectiveness}</Text>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Text style={styles.auditSignature}>{item.digitalSignature}</Text>
                        {item.witnessName && (
                          <View style={styles.witnessBadge}>
                            <UserCheck size={11} color="#059669" />
                            <Text style={styles.witnessBadgeText}>Witness: {item.witnessName}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: 6-RIGHTS MEDICATION ADMINISTRATION & EXCEPTION MODAL */}
      {/* ============================================================== */}
      <Modal visible={actionModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Pill size={20} color={colors.primaryDark} />
                  <Text style={styles.modalTitle}>Record Medication Round Outcome</Text>
                </View>
                <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Administering for: <Text style={{ fontWeight: '700', color: colors.secondary }}>{currentClientObj?.firstName} {currentClientObj?.lastName}</Text> (UHID: {currentClientObj?.uhid || 'NHS-884-201-94'})
              </Text>

              {/* Selected Drug Banner */}
              <View style={styles.modalDrugCard}>
                <Text style={styles.modalDrugName}>{selectedMed?.name} {selectedMed?.strength}</Text>
                <Text style={styles.modalDrugSub}>{selectedMed?.genericName} • {selectedMed?.dose} • {selectedMed?.route} • {selectedMed?.dosageForm}</Text>
                <Text style={styles.modalDrugInst}>Instructions: {selectedMed?.instructions}</Text>
                {selectedMed?.controlledDrug && (
                  <View style={[styles.cdBadge, { marginTop: 6, alignSelf: 'flex-start' }]}>
                    <Lock size={12} color="#7C3AED" />
                    <Text style={styles.cdText}>UK CONTROLLED DRUG (SCHEDULE 2) - MANDATORY WITNESS REQUIRED</Text>
                  </View>
                )}
              </View>

              {/* 6 Rights Checklist (Interactive Verification) */}
              <View style={styles.sixRightsChecklistBox}>
                <Text style={styles.sixRightsChecklistTitle}>VERIFY THE 6 RIGHTS OF MEDICATION:</Text>
                <View style={styles.checklistGrid}>
                  {[
                    { key: 'patient', label: `1. Right Patient (${currentClientObj?.firstName})` },
                    { key: 'drug', label: `2. Right Drug (${selectedMed?.name})` },
                    { key: 'dose', label: `3. Right Dose (${selectedMed?.dose})` },
                    { key: 'route', label: `4. Right Route (${selectedMed?.route})` },
                    { key: 'time', label: `5. Right Time (${scheduledSlot})` },
                    { key: 'doc', label: '6. Right Documentation (eMAR)' }
                  ].map(item => (
                    <TouchableOpacity
                      key={item.key}
                      style={styles.checkItem}
                      onPress={() => setSixRightsChecked(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    >
                      {sixRightsChecked[item.key] ? (
                        <CheckSquare size={16} color="#059669" />
                      ) : (
                        <Square size={16} color={colors.textMuted} />
                      )}
                      <Text style={[styles.checkItemText, sixRightsChecked[item.key] && { color: '#059669', fontWeight: '700' }]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Outcome Selection Radio Group */}
              <View style={{ gap: 6 }}>
                <Text style={styles.inputLabel}>ADMINISTRATION OUTCOME *</Text>
                <View style={styles.outcomeButtonGroup}>
                  {[
                    { key: 'ADMINISTERED', label: 'Administered', color: '#059669' },
                    { key: 'REFUSED', label: 'Refused', color: '#DC2626' },
                    { key: 'MISSED', label: 'Missed', color: '#D97706' },
                    { key: 'WITHHELD', label: 'Withheld', color: '#4B5563' },
                    { key: 'NOT_AVAILABLE', label: 'Not Available', color: '#DC2626' }
                  ].map(btn => (
                    <TouchableOpacity
                      key={btn.key}
                      style={[styles.outcomeOption, outcome === btn.key && { borderColor: btn.color, backgroundColor: btn.color + '15' }]}
                      onPress={() => setOutcome(btn.key)}
                    >
                      <Text style={[styles.outcomeOptionText, outcome === btn.key && { color: btn.color, fontWeight: '800' }]}>
                        {btn.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Dose Given & Scheduled Slot */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>DOSE GIVEN</Text>
                  <TextInput
                    style={styles.textInput}
                    value={doseGiven}
                    onChangeText={setDoseGiven}
                    placeholder="e.g. 1 tablet"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>SCHEDULED ROUND</Text>
                  <TextInput
                    style={styles.textInput}
                    value={scheduledSlot}
                    onChangeText={setScheduledSlot}
                    placeholder="MORNING, LUNCH, etc."
                  />
                </View>
              </View>

              {/* Topical Site Input (if Topical) */}
              {selectedMed?.route === 'Topical' && (
                <View>
                  <Text style={styles.inputLabel}>TOPICAL APPLICATION SITE (ROTATED)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={topicalSiteApplied}
                    onChangeText={setTopicalSiteApplied}
                    placeholder="e.g. Left Knee (Rotated from Right Knee)"
                  />
                </View>
              )}

              {/* PRN Reason Input (if PRN) */}
              {(selectedMed?.prn || selectedMed?.scheduleType === 'PRN') && (
                <View>
                  <Text style={styles.inputLabel}>PRN INDICATION / PAIN RATING *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={prnReason}
                    onChangeText={setPrnReason}
                    placeholder="e.g. Client reported knee pain rated 7/10"
                  />
                </View>
              )}

              {/* Notes / Reason for Omission */}
              <View>
                <Text style={styles.inputLabel}>{outcome === 'ADMINISTERED' ? 'CLINICAL OBSERVATION NOTES' : 'REASON FOR OMISSION / REFUSAL *'}</Text>
                <TextInput
                  style={[styles.textInput, { height: 60 }]}
                  multiline
                  value={outcomeReason}
                  onChangeText={setOutcomeReason}
                  placeholder={outcome === 'ADMINISTERED' ? 'Taken smoothly with glass of water.' : 'Reason patient declined or dose omitted...'}
                />
              </View>

              {/* Witness Section (Mandatory if Controlled Drug) */}
              {selectedMed?.controlledDrug && (
                <View style={styles.witnessBox}>
                  <Text style={styles.witnessBoxTitle}>SCHEDULE 2 CONTROLLED DRUG WITNESS DOUBLE-SIGN:</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.inputLabel}>WITNESS NAME *</Text>
                      <TextInput
                        style={styles.textInput}
                        value={witnessName}
                        onChangeText={setWitnessName}
                        placeholder="e.g. Clara Oswald, RN"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>WITNESS ROLE</Text>
                      <TextInput
                        style={styles.textInput}
                        value={witnessRole}
                        onChangeText={setWitnessRole}
                        placeholder="RN / Second Carer"
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Digital Signature */}
              <View>
                <Text style={styles.inputLabel}>CARER DIGITAL SIGNATURE</Text>
                <TextInput
                  style={styles.textInput}
                  value={digitalSignature}
                  onChangeText={setDigitalSignature}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setActionModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleRecordAdministration}>
                  <CheckCircle2 size={16} color="#FFF" />
                  <Text style={styles.submitBtnText}>Sign & Commit eMAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL 2: PRN EFFECTIVENESS EVALUATION MODAL */}
      <Modal visible={effectivenessModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxWidth: 500 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record PRN Effectiveness (45m Follow-Up)</Text>
              <TouchableOpacity onPress={() => setEffectivenessModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Document post-dose clinical outcome for <Text style={{ fontWeight: '700' }}>{selectedAdminForEffectiveness?.medicationName}</Text>.
            </Text>

            <View style={{ gap: 10, marginTop: 10 }}>
              <Text style={styles.inputLabel}>PATIENT OUTCOME & PAIN RATING *</Text>
              <TextInput
                style={[styles.textInput, { height: 80 }]}
                multiline
                value={effectivenessNote}
                onChangeText={setEffectivenessNote}
                placeholder="e.g. Pain score reduced from 7/10 to 2/10. Client resting comfortably in armchair with no nausea."
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEffectivenessModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSavePrnEffectiveness}>
                <Text style={styles.submitBtnText}>Save Evaluation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: EXCEPTION RESOLUTION MODAL */}
      <Modal visible={resolveModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxWidth: 500 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Office Resolution of Medication Exception</Text>
              <TouchableOpacity onPress={() => setResolveModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Resolving alert for <Text style={{ fontWeight: '700' }}>{selectedExceptionForResolve?.medicationName}</Text> ({selectedExceptionForResolve?.outcome}).
            </Text>

            <View style={{ gap: 10, marginTop: 10 }}>
              <Text style={styles.inputLabel}>CLINICAL / OFFICE RESOLUTION ACTION *</Text>
              <TextInput
                style={[styles.textInput, { height: 80 }]}
                multiline
                value={resolutionNotes}
                onChangeText={setResolutionNotes}
                placeholder="e.g. Contacted GP surgery and family. BP checked and found satisfactory. Carer instructed to re-offer medication at tea round."
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setResolveModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleResolveException}>
                <Text style={styles.submitBtnText}>Resolve Exception Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: RECEIVE STOCK MODAL */}
      <Modal visible={stockModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxWidth: 450 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Receive Medication Stock from Pharmacy</Text>
              <TouchableOpacity onPress={() => setStockModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Receiving delivered batch for <Text style={{ fontWeight: '700' }}>{selectedMedForStock?.name} {selectedMedForStock?.strength}</Text>.
            </Text>

            <View style={{ gap: 10, marginTop: 10 }}>
              <Text style={styles.inputLabel}>QUANTITY RECEIVED (UNITS / TABLETS) *</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={receivedQty}
                onChangeText={setReceivedQty}
                placeholder="28"
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setStockModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleReceiveStock}>
                <Text style={styles.submitBtnText}>Confirm Delivery & Update Stock</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: ADD NEW PRESCRIPTION MODAL */}
      <Modal visible={prescriptionModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Plus size={20} color={colors.primaryDark} />
                  <Text style={styles.modalTitle}>Register New Prescription Regimen</Text>
                </View>
                <TouchableOpacity onPress={() => setPrescriptionModalVisible(false)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Register authorized prescription for <Text style={{ fontWeight: '700' }}>{currentClientObj?.firstName} {currentClientObj?.lastName}</Text>.
              </Text>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.inputLabel}>DRUG BRAND / DISPLAY NAME *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={prescName}
                    onChangeText={setPrescName}
                    placeholder="e.g. Ramipril"
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.inputLabel}>GENERIC NAME</Text>
                  <TextInput
                    style={styles.textInput}
                    value={prescGeneric}
                    onChangeText={setPrescGeneric}
                    placeholder="e.g. Ramipril ACE Inhibitor"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>DOSAGE FORM</Text>
                  <TextInput
                    style={styles.textInput}
                    value={prescDosageForm}
                    onChangeText={setPrescDosageForm}
                    placeholder="Tablet, Liquid, etc."
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>STRENGTH</Text>
                  <TextInput
                    style={styles.textInput}
                    value={prescStrength}
                    onChangeText={setPrescStrength}
                    placeholder="5mg"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>DOSE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={prescDose}
                    onChangeText={setPrescDose}
                    placeholder="1 tablet"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>ROUTE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={prescRoute}
                    onChangeText={setPrescRoute}
                    placeholder="Oral, Topical"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>SCHEDULE TYPE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={prescScheduleType}
                    onChangeText={setPrescScheduleType}
                    placeholder="REGULAR, PRN, WEEKLY"
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.inputLabel}>FREQUENCY</Text>
                  <TextInput
                    style={styles.textInput}
                    value={prescFreq}
                    onChangeText={setPrescFreq}
                    placeholder="Once daily morning"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>SCHEDULED SLOTS</Text>
                  <TextInput
                    style={styles.textInput}
                    value={prescScheduledTimes}
                    onChangeText={setPrescScheduledTimes}
                    placeholder="08:00, 18:00"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>MIN INTERVAL (HRS)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={prescMinInterval}
                    onChangeText={setPrescMinInterval}
                    placeholder="4"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>MAX DOSES / 24H</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={prescMaxDoses}
                    onChangeText={setPrescMaxDoses}
                    placeholder="4"
                  />
                </View>
                <View style={{ flex: 2 }}>
                  <Text style={styles.inputLabel}>PRN INDICATION (IF PRN)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={prescPrnIndication}
                    onChangeText={setPrescPrnIndication}
                    placeholder="e.g. Pain score >= 5/10"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  onPress={() => setPrescTimeCritical(!prescTimeCritical)}
                >
                  {prescTimeCritical ? <CheckSquare size={16} color="#DC2626" /> : <Square size={16} color={colors.textMuted} />}
                  <Text style={[styles.inputLabel, { marginBottom: 0 }]}>Is Time-Critical (Parkinson's, Insulin)?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  onPress={() => setPrescControlledDrug(!prescControlledDrug)}
                >
                  {prescControlledDrug ? <CheckSquare size={16} color="#7C3AED" /> : <Square size={16} color={colors.textMuted} />}
                  <Text style={[styles.inputLabel, { marginBottom: 0 }]}>Is UK Controlled Drug (Schedule 2/3)?</Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text style={styles.inputLabel}>ADMINISTRATION INSTRUCTIONS</Text>
                <TextInput
                  style={[styles.textInput, { height: 60 }]}
                  multiline
                  value={prescInstructions}
                  onChangeText={setPrescInstructions}
                  placeholder="Take with food and full glass of water."
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.inputLabel}>PRESCRIBER DETAILS</Text>
                  <TextInput
                    style={styles.textInput}
                    value={prescPrescriber}
                    onChangeText={setPrescPrescriber}
                    placeholder="Dr. P. Thornton (GP)"
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.inputLabel}>COMMUNITY PHARMACY</Text>
                  <TextInput
                    style={styles.textInput}
                    value={prescPharmacyName}
                    onChangeText={setPrescPharmacyName}
                    placeholder="Boots Pharmacy Central"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>INITIAL STOCK</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={prescStockQty}
                    onChangeText={setPrescStockQty}
                    placeholder="28"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setPrescriptionModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleCreatePrescription}>
                  <CheckCircle2 size={16} color="#FFF" />
                  <Text style={styles.submitBtnText}>Commit Prescription to eMAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL 6: NEW MEDICATION RECONCILIATION MODAL */}
      <Modal visible={reconciliationModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <FileCheck size={20} color={colors.primaryDark} />
                  <Text style={styles.modalTitle}>Execute Medication Reconciliation Audit</Text>
                </View>
                <TouchableOpacity onPress={() => setReconciliationModalVisible(false)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Cross-checking pre-admission vs discharge TTO prescriptions for <Text style={{ fontWeight: '700' }}>{currentClientObj?.firstName} {currentClientObj?.lastName}</Text>.
              </Text>

              <View style={{ gap: 10, marginTop: 10 }}>
                <View>
                  <Text style={styles.inputLabel}>SOURCE DISCHARGE SUMMARY / CLINIC *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={recSource}
                    onChangeText={setRecSource}
                    placeholder="e.g. St Mary's Hospital NHS Trust Ward 4B TTO"
                  />
                </View>

                <View>
                  <Text style={styles.inputLabel}>RECONCILED BY (CLINICIAN / CARE MANAGER) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={recReconciledBy}
                    onChangeText={setRecReconciledBy}
                    placeholder="Dr. Sarah Jenkins & Rachel Green"
                  />
                </View>

                <View>
                  <Text style={styles.inputLabel}>DISCREPANCIES & CHANGES (JSON FORMAT)</Text>
                  <TextInput
                    style={[styles.textInput, { height: 120, fontFamily: 'monospace' }]}
                    multiline
                    value={recDiscrepancies}
                    onChangeText={setRecDiscrepancies}
                  />
                </View>

                <View>
                  <Text style={styles.inputLabel}>CLINICAL ACTION NOTES</Text>
                  <TextInput
                    style={[styles.textInput, { height: 70 }]}
                    multiline
                    value={recNotes}
                    onChangeText={setRecNotes}
                    placeholder="Community pharmacy informed. Old codeine packs disposed of safely."
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setReconciliationModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleCreateReconciliation}>
                  <Text style={styles.submitBtnText}>Approve & Apply Reconciliation</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    gap: 14,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
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
    marginTop: 4,
    maxWidth: 900,
  },
  clientSelectorContainer: {
    gap: 6,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  clientTabs: {
    flexDirection: 'row',
    gap: 6,
  },
  clientTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  clientTabActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  clientTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  clientTabTextActive: {
    color: '#4338CA',
    fontWeight: '700',
  },
  prescribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  prescribeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storyboardBanner: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    gap: 16,
    flexWrap: 'wrap',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  sbCol: {
    gap: 2,
  },
  sbLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  sbValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  allergyTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#991B1B',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 6,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  metricNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionPillBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  roundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  roundTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  roundCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roundCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  roundWindowText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  emptySlotBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  emptySlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  emptySlotSub: {
    fontSize: 11,
    color: '#64748B',
  },
  roundMedsGrid: {
    gap: 10,
  },
  roundMedItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  roundMedItemGiven: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  roundMedItemRefused: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  roundMedName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  roundMedSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  roundMedInstructions: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  timeCriticalBadge: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  timeCriticalText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  cdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  cdText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7C3AED',
  },
  topicalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  topicalPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
  },
  givenStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  givenStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  refusedStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  refusedStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  administerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  administerActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  refuseActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refuseActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  stockRemainingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  prnNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    padding: 12,
  },
  prnNoticeText: {
    fontSize: 12,
    color: '#0369A1',
    flex: 1,
    lineHeight: 18,
  },
  prnGrid: {
    gap: 14,
  },
  prnCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 12,
  },
  prnDrugName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  prnSubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  prnReadyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  prnReadyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  prnBlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  prnBlockedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  prnDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 8,
  },
  prnIndicationLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  prnIndicationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  prnStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    flexWrap: 'wrap',
    gap: 10,
  },
  prnStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  prnStatVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  prnAdminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  prnAdminBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  pendingEvalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  pendingEvalDrug: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  pendingEvalMeta: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  recordEvalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  recordEvalBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exceptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 16,
  },
  outcomeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  outcomeTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  exceptionMedName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  exceptionSlot: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  exceptionReason: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
    marginTop: 4,
  },
  exceptionMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  escalationNoteBox: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
    padding: 6,
    marginTop: 6,
    borderRadius: 4,
  },
  escalationNoteText: {
    fontSize: 11,
    color: '#991B1B',
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeGreen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  statusBadgeRed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  statusBadgeGray: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextGreen: {
    color: '#059669',
  },
  statusTextRed: {
    color: '#DC2626',
  },
  statusTextGray: {
    color: '#64748B',
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  resolveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profilesGrid: {
    gap: 14,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
  },
  profileMedName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileGeneric: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  profileDose: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
  },
  profileTimes: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockBadgeGreen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  stockBadgeRed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stockTextGreen: {
    color: '#059669',
  },
  stockTextRed: {
    color: '#DC2626',
  },
  repeatStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  profileDetailsRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileSubLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
  },
  profileSubVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  profileInstructions: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
  },
  profileActionsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  reorderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  receiveStockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  receiveStockBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  suspendBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  suspendBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  recCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 12,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  recSource: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  recMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  approvedBadge: {
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
  approvedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  recNotesText: {
    fontSize: 12,
    color: '#334155',
    fontStyle: 'italic',
  },
  recTable: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  recTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  recTh: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  recTableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  recTd: {
    fontSize: 11,
    color: '#1E293B',
  },
  changeTypeBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  changeTypeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1E293B',
  },
  cdWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 10,
    padding: 12,
  },
  cdWarningText: {
    fontSize: 12,
    color: '#6B21A8',
    flex: 1,
    lineHeight: 18,
  },
  cdCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
  },
  cdCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cdCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cdInstructions: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    fontStyle: 'italic',
  },
  cdStockBadge: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cdStockText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7C3AED',
  },
  cdAdminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cdAdminBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cdHistoryHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  cdLogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 10,
  },
  cdLogDose: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  cdLogMeta: {
    fontSize: 11,
    color: '#64748B',
  },
  cdLogReason: {
    fontSize: 11,
    color: '#334155',
  },
  cdLogEffectiveness: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  cdLogSign: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  cdWitnessTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cdWitnessText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  calendarGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  calDayBox: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  calDayHeader: {
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  calDayTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  calEmptyText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 10,
  },
  calMedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 6,
    borderRadius: 6,
  },
  calMedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
  },
  bodyMapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
  },
  bodyMapTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.5,
  },
  bodyMapSub: {
    fontSize: 12,
    color: '#475569',
  },
  bodyMapSites: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  bodyMapSiteCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  siteName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  siteTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#115E59',
  },
  siteDesc: {
    fontSize: 11,
    color: '#134E4A',
  },
  auditRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  auditOutcomeBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  auditOutcomeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  auditMedName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  auditMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  auditReason: {
    fontSize: 11,
    color: '#334155',
    marginTop: 2,
  },
  auditEffectiveness: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    marginTop: 2,
  },
  auditSignature: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  witnessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  witnessBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  modalDrugCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
  },
  modalDrugName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalDrugSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  modalDrugInst: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  sixRightsChecklistBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  sixRightsChecklistTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  checklistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '48%',
  },
  checkItemText: {
    fontSize: 11,
    color: '#334155',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  outcomeButtonGroup: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  outcomeOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  outcomeOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
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
  witnessBox: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  witnessBoxTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B21A8',
    letterSpacing: 0.5,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
