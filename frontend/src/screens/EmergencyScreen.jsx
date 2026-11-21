import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { 
  fetchEmergencyTriage, 
  fetchEmergencyQueue, 
  registerEmergencyTriage, 
  updateEmergencyVitals, 
  fastTrackEmergencyToIpd, 
  transferEmergencyToOt, 
  dischargeEmergencyPatient,
  fetchIpdBeds
} from '../api/client';
import { 
  Flame, 
  AlertTriangle, 
  HeartPulse, 
  Activity, 
  Clock, 
  Bed, 
  Scissors, 
  CheckCircle, 
  Plus, 
  Truck, 
  ShieldAlert, 
  UserPlus, 
  RefreshCw 
} from 'lucide-react';

export const EmergencyScreen = ({ currentPersona }) => {
  const [activeTab, setActiveTab] = useState('QUEUE'); // QUEUE, ALL, INCOMING
  const [queue, setQueue] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState(false);

  // New Case Form
  const [patientName, setPatientName] = useState('');
  const [uhid, setUhid] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('MALE');
  const [arrivalMode, setArrivalMode] = useState('AMBULANCE_PRE_NOTIFIED');
  const [ambulanceVehicle, setAmbulanceVehicle] = useState('');
  const [etaMinutes, setEtaMinutes] = useState('8');
  const [paramedicNotes, setParamedicNotes] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [esiLevel, setEsiLevel] = useState('2');
  const [heartRate, setHeartRate] = useState('105');
  const [bloodPressure, setBloodPressure] = useState('110/70');
  const [respiratoryRate, setRespiratoryRate] = useState('22');
  const [oxygenSaturation, setOxygenSaturation] = useState('95');
  const [temperature, setTemperature] = useState('37.0');
  const [gcs, setGcs] = useState('15');
  const [painScore, setPainScore] = useState('8');
  const [assignedBay, setAssignedBay] = useState('Trauma Bay A');

  // Fast Track Modal
  const [selectedBedId, setSelectedBedId] = useState('');
  const [admittingDoctor, setAdmittingDoctor] = useState('Dr. Robert Sterling');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [queueData, allData, bedsData] = await Promise.all([
        fetchEmergencyQueue().catch(() => []),
        fetchEmergencyTriage().catch(() => []),
        fetchIpdBeds().catch(() => [])
      ]);
      setQueue(queueData || []);
      setAllCases(allData || []);
      setBeds((bedsData || []).filter(b => b.status === 'AVAILABLE'));
      if (queueData && queueData.length > 0 && !selectedCase) {
        setSelectedCase(queueData[0]);
      }
    } catch (err) {
      console.error('Failed to load emergency triage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!patientName || !chiefComplaint) {
      alert('Patient Name and Chief Complaint are mandatory.');
      return;
    }
    try {
      const payload = {
        patientName,
        uhid: uhid || `UHID-ER-${Date.now() % 10000}`,
        age: age ? parseInt(age) : 45,
        gender,
        arrivalMode,
        ambulanceVehicleNumber: arrivalMode.includes('AMBULANCE') ? ambulanceVehicle : null,
        etaMinutes: arrivalMode === 'AMBULANCE_PRE_NOTIFIED' && etaMinutes ? parseInt(etaMinutes) : null,
        paramedicNotes,
        chiefComplaint,
        esiLevel: parseInt(esiLevel),
        heartRate: heartRate ? parseInt(heartRate) : null,
        bloodPressure,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
        oxygenSaturation: oxygenSaturation ? parseInt(oxygenSaturation) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        glasgowComaScale: gcs ? parseInt(gcs) : 15,
        painScore: painScore ? parseInt(painScore) : 0,
        triageNurse: currentPersona ? currentPersona.name : 'Emergency Triage Nurse',
        attendingEmergencyPhysician: 'Dr. Robert Sterling',
        status: arrivalMode === 'AMBULANCE_PRE_NOTIFIED' ? 'PRE_ARRIVAL' : (parseInt(esiLevel) === 1 ? 'IN_RESUSCITATION' : 'WAITING_IN_TRIAGE'),
        assignedBay
      };
      await registerEmergencyTriage(payload);
      setShowRegisterModal(false);
      resetForm();
      await loadData();
    } catch (err) {
      alert('Error registering triage case: ' + err.message);
    }
  };

  const handleFastTrackAdmit = async () => {
    if (!selectedCase || !selectedBedId) {
      alert('Please select an available IPD Bed for fast-track admission.');
      return;
    }
    try {
      await fastTrackEmergencyToIpd(selectedCase.id, {
        bedId: parseInt(selectedBedId),
        admittingDoctor,
        diagnosis: provisionalDiagnosis || selectedCase.chiefComplaint
      });
      setShowAdmitModal(false);
      await loadData();
    } catch (err) {
      alert('Admit to IPD failed: ' + err.message);
    }
  };

  const handleTransferOt = async (c) => {
    const procedure = prompt('Enter Emergency Surgical Procedure:', 'Emergency Exploratory Laparotomy / Trauma Repair');
    if (!procedure) return;
    try {
      await transferEmergencyToOt(c.id, {
        procedureName: procedure,
        surgicalTeam: 'Emergency On-Call Surgical Team (Lead: Dr. Sterling)'
      });
      await loadData();
    } catch (err) {
      alert('OT Transfer failed: ' + err.message);
    }
  };

  const handleDischarge = async (c) => {
    const summary = prompt('Enter Emergency Discharge Summary & Advice:', 'Patient evaluated, stabilized, and discharged home with outpatient follow-up in 48h.');
    if (!summary) return;
    try {
      await dischargeEmergencyPatient(c.id, summary);
      await loadData();
    } catch (err) {
      alert('Discharge failed: ' + err.message);
    }
  };

  const resetForm = () => {
    setPatientName('');
    setUhid('');
    setAge('');
    setChiefComplaint('');
    setParamedicNotes('');
    setAmbulanceVehicle('');
  };

  const getEsiBadgeStyle = (level) => {
    switch (level) {
      case 1: return { bg: '#FEE2E2', text: '#991B1B', label: 'ESI 1: RESUSCITATION', color: '#DC2626' };
      case 2: return { bg: '#FFEDD5', text: '#9A3412', label: 'ESI 2: EMERGENT', color: '#EA580C' };
      case 3: return { bg: '#FEF9C3', text: '#854D0E', label: 'ESI 3: URGENT', color: '#CA8A04' };
      case 4: return { bg: '#DCFCE7', text: '#166534', label: 'ESI 4: LESS URGENT', color: '#16A34A' };
      default: return { bg: '#E0F2FE', text: '#075985', label: 'ESI 5: NON-URGENT', color: '#0284C7' };
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Connecting to Emergency & Trauma Command Center...</Text>
      </View>
    );
  }

  const displayedList = activeTab === 'QUEUE' ? queue : (activeTab === 'INCOMING' ? queue.filter(c => c.status === 'PRE_ARRIVAL') : allCases);

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Flame size={24} color="#DC2626" />
            <Text style={styles.title}>Emergency Department (ED) & Trauma Triage</Text>
            <View style={styles.benchmarkTag}>
              <Text style={styles.benchmarkText}>KareXpert & Medinous HIS</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Emergency Severity Index (ESI Levels 1–5) • Pre-Arrival Ambulance Telemetry • Fast-Track IPD/OT Boarding
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadData}>
            <RefreshCw size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => setShowRegisterModal(true)}>
            <Plus size={16} color="#FFF" />
            <Text style={styles.registerBtnText}>Intake / Pre-Arrival</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Triage KPI Bar */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { borderColor: '#F87171' }]}>
          <Text style={[styles.kpiValue, { color: '#DC2626' }]}>
            {queue.filter(c => c.esiLevel === 1).length}
          </Text>
          <Text style={styles.kpiLabel}>ESI 1 (Resuscitation)</Text>
          <Text style={styles.kpiSub}>Immediate Life-Saving Bay</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: '#FB923C' }]}>
          <Text style={[styles.kpiValue, { color: '#EA580C' }]}>
            {queue.filter(c => c.esiLevel === 2).length}
          </Text>
          <Text style={styles.kpiLabel}>ESI 2 (Emergent)</Text>
          <Text style={styles.kpiSub}>High Acuity Trauma & Stroke</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: '#FACC15' }]}>
          <Text style={[styles.kpiValue, { color: '#CA8A04' }]}>
            {queue.filter(c => c.esiLevel === 3).length}
          </Text>
          <Text style={styles.kpiLabel}>ESI 3 (Urgent)</Text>
          <Text style={styles.kpiSub}>Multi-Resource Workup</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: '#60A5FA' }]}>
          <Text style={[styles.kpiValue, { color: '#2563EB' }]}>
            {queue.filter(c => c.status === 'PRE_ARRIVAL').length}
          </Text>
          <Text style={styles.kpiLabel}>Ambulances Incoming</Text>
          <Text style={styles.kpiSub}>En Route with Pre-Alert</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'QUEUE' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('QUEUE')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'QUEUE' && styles.tabBtnTextActive]}>
            Active Triage Queue ({queue.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'INCOMING' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('INCOMING')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'INCOMING' && styles.tabBtnTextActive]}>
            Incoming Ambulances ({queue.filter(c => c.status === 'PRE_ARRIVAL').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'ALL' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('ALL')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'ALL' && styles.tabBtnTextActive]}>
            All Emergency Encounters ({allCases.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Two-Column Layout */}
      <View style={styles.contentLayout}>
        {/* Left Column: Triage Queue Cards */}
        <ScrollView style={styles.queueColumn} showsVerticalScrollIndicator={false}>
          {displayedList.length === 0 ? (
            <View style={styles.emptyCard}>
              <CheckCircle size={32} color={colors.success} />
              <Text style={styles.emptyTitle}>No Emergency Cases in this Category</Text>
              <Text style={styles.emptySub}>All emergency presentations have been dispositioned or transferred.</Text>
            </View>
          ) : (
            displayedList.map((item) => {
              const esiInfo = getEsiBadgeStyle(item.esiLevel);
              const isSelected = selectedCase?.id === item.id;
              const isIncoming = item.status === 'PRE_ARRIVAL';
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.caseCard,
                    isSelected && styles.caseCardSelected,
                    { borderLeftColor: esiInfo.color, borderLeftWidth: 5 }
                  ]}
                  onPress={() => setSelectedCase(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.caseCardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.casePatientName}>{item.patientName}</Text>
                        {item.gender && (
                          <Text style={styles.caseGender}>{item.gender[0]} • {item.age || 45}y</Text>
                        )}
                      </View>
                      <Text style={styles.caseNumber}>{item.triageNumber} • {item.assignedBay || 'Triage Assessment'}</Text>
                    </View>
                    <View style={[styles.esiBadge, { backgroundColor: esiInfo.bg }]}>
                      <Text style={[styles.esiBadgeText, { color: esiInfo.text }]}>{esiInfo.label}</Text>
                    </View>
                  </View>

                  <Text style={styles.caseComplaint} numberOfLines={2}>
                    {item.chiefComplaint}
                  </Text>

                  {isIncoming && (
                    <View style={styles.incomingBanner}>
                      <Truck size={14} color="#2563EB" />
                      <Text style={styles.incomingText}>
                        En Route ({item.ambulanceVehicleNumber || 'EMS-991'}) • ETA: {item.etaMinutes || 5} mins
                      </Text>
                    </View>
                  )}

                  {/* Vitals Summary Pill Strip */}
                  <View style={styles.vitalsStrip}>
                    <Text style={styles.vitalPill}>HR: <Text style={styles.vitalVal}>{item.heartRate || '--'}</Text></Text>
                    <Text style={styles.vitalPill}>BP: <Text style={styles.vitalVal}>{item.bloodPressure || '--'}</Text></Text>
                    <Text style={styles.vitalPill}>SpO2: <Text style={styles.vitalVal}>{item.oxygenSaturation ? `${item.oxygenSaturation}%` : '--'}</Text></Text>
                    <Text style={styles.vitalPill}>GCS: <Text style={styles.vitalVal}>{item.glasgowComaScale || 15}/15</Text></Text>
                    <Text style={[styles.statusTag, { color: esiInfo.color }]}>{item.status}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Right Column: Case Clinical Dossier & Fast Track Operations */}
        <View style={styles.detailsColumn}>
          {selectedCase ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.dossierCard}>
                {/* Dossier Header */}
                <View style={styles.dossierHeader}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.dossierTitle}>{selectedCase.patientName}</Text>
                      <View style={[styles.esiBadge, { backgroundColor: getEsiBadgeStyle(selectedCase.esiLevel).bg }]}>
                        <Text style={[styles.esiBadgeText, { color: getEsiBadgeStyle(selectedCase.esiLevel).text }]}>
                          {getEsiBadgeStyle(selectedCase.esiLevel).label}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.dossierMeta}>
                      UHID: {selectedCase.uhid || 'NOT REGISTERED'} • {selectedCase.gender} • {selectedCase.age}y • Bay: {selectedCase.assignedBay || 'Triage'}
                    </Text>
                  </View>
                  <View style={styles.statusBadgeLarge}>
                    <Text style={styles.statusBadgeLargeText}>{selectedCase.status}</Text>
                  </View>
                </View>

                {/* Vitals Dashboard */}
                <Text style={styles.sectionHeader}>TRIAGE PHYSIOLOGICAL VITALS</Text>
                <View style={styles.vitalsGrid}>
                  <View style={styles.vitalMetricBox}>
                    <HeartPulse size={18} color="#DC2626" />
                    <Text style={styles.vitalMetricVal}>{selectedCase.heartRate || '--'} bpm</Text>
                    <Text style={styles.vitalMetricLabel}>Heart Rate</Text>
                  </View>
                  <View style={styles.vitalMetricBox}>
                    <Activity size={18} color="#2563EB" />
                    <Text style={styles.vitalMetricVal}>{selectedCase.bloodPressure || '--'}</Text>
                    <Text style={styles.vitalMetricLabel}>Blood Pressure</Text>
                  </View>
                  <View style={styles.vitalMetricBox}>
                    <Flame size={18} color="#059669" />
                    <Text style={styles.vitalMetricVal}>{selectedCase.oxygenSaturation ? `${selectedCase.oxygenSaturation}%` : '--'}</Text>
                    <Text style={styles.vitalMetricLabel}>SpO2 Saturation</Text>
                  </View>
                  <View style={styles.vitalMetricBox}>
                    <AlertTriangle size={18} color="#D97706" />
                    <Text style={styles.vitalMetricVal}>{selectedCase.glasgowComaScale || 15}/15</Text>
                    <Text style={styles.vitalMetricLabel}>Glasgow Coma Scale</Text>
                  </View>
                  <View style={styles.vitalMetricBox}>
                    <Clock size={18} color="#7C3AED" />
                    <Text style={styles.vitalMetricVal}>{selectedCase.painScore || 0}/10</Text>
                    <Text style={styles.vitalMetricLabel}>Pain Severity</Text>
                  </View>
                  <View style={styles.vitalMetricBox}>
                    <ShieldAlert size={18} color="#4B5563" />
                    <Text style={styles.vitalMetricVal}>{selectedCase.temperature || 37.0}°C</Text>
                    <Text style={styles.vitalMetricLabel}>Temperature</Text>
                  </View>
                </View>

                {/* Clinical Notes & Handover */}
                <Text style={styles.sectionHeader}>EMERGENCY PRESENTATION & PARAMEDIC HANDOVER</Text>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Chief Complaint / Emergency Presentation:</Text>
                  <Text style={styles.infoText}>{selectedCase.chiefComplaint}</Text>
                </View>

                {selectedCase.paramedicNotes && (
                  <View style={[styles.infoBlock, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                    <Text style={[styles.infoLabel, { color: '#1E40AF' }]}>
                      Ambulance Paramedic Handover ({selectedCase.ambulanceVehicleNumber || 'EMS-991'}):
                    </Text>
                    <Text style={[styles.infoText, { color: '#1E3A8A' }]}>{selectedCase.paramedicNotes}</Text>
                  </View>
                )}

                {selectedCase.clinicalInterventions && (
                  <View style={[styles.infoBlock, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                    <Text style={[styles.infoLabel, { color: '#166534' }]}>Emergency Interventions Administered:</Text>
                    <Text style={[styles.infoText, { color: '#14532D' }]}>{selectedCase.clinicalInterventions}</Text>
                  </View>
                )}

                {/* Fast-Track Conversion & Disposition Command Bar */}
                <Text style={styles.sectionHeader}>FAST-TRACK DISPOSITION & BOARDING ACTIONS</Text>
                <View style={styles.actionButtonBar}>
                  <TouchableOpacity 
                    style={[styles.cmdBtn, { backgroundColor: '#1E40AF' }]} 
                    onPress={() => {
                      setProvisionalDiagnosis(selectedCase.chiefComplaint);
                      setShowAdmitModal(true);
                    }}
                  >
                    <Bed size={16} color="#FFF" />
                    <Text style={styles.cmdBtnText}>Fast-Track to Inpatient (IPD Bed)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.cmdBtn, { backgroundColor: '#7C3AED' }]} 
                    onPress={() => handleTransferOt(selectedCase)}
                  >
                    <Scissors size={16} color="#FFF" />
                    <Text style={styles.cmdBtnText}>Emergency Transfer to OT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.cmdBtn, { backgroundColor: '#059669' }]} 
                    onPress={() => handleDischarge(selectedCase)}
                  >
                    <CheckCircle size={16} color="#FFF" />
                    <Text style={styles.cmdBtnText}>Discharge Stabilized</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyDossier}>
              <Flame size={48} color={colors.textMuted} />
              <Text style={styles.emptyDossierTitle}>Select a Patient Encounter</Text>
              <Text style={styles.emptyDossierSub}>Choose any case from the triage queue to view physiological vitals and execute fast-track hospital boarding.</Text>
            </View>
          )}
        </View>
      </View>

      {/* Modal: Fast Track Admit to IPD */}
      <Modal visible={showAdmitModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Fast-Track Admit to Inpatient (IPD)</Text>
            <Text style={styles.modalSub}>
              Directly assign {selectedCase?.patientName} to an available hospital ward bed.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Select Available IPD Bed *</Text>
              <View style={styles.bedSelectionRow}>
                {beds.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.bedPill, selectedBedId === b.id.toString() && styles.bedPillActive]}
                    onPress={() => setSelectedBedId(b.id.toString())}
                  >
                    <Text style={[styles.bedPillText, selectedBedId === b.id.toString() && styles.bedPillTextActive]}>
                      {b.wardName} - {b.bedNumber}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Admitting Consultant / Doctor *</Text>
              <TextInput
                style={styles.formInput}
                value={admittingDoctor}
                onChangeText={setAdmittingDoctor}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Provisional Admission Diagnosis</Text>
              <TextInput
                style={styles.formInput}
                value={provisionalDiagnosis}
                onChangeText={setProvisionalDiagnosis}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdmitModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleFastTrackAdmit}>
                <Text style={styles.confirmBtnText}>Confirm Fast-Track Admission</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Register Emergency Intake / Pre-Arrival */}
      <Modal visible={showRegisterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View style={[styles.modalContent, { maxWidth: 650 }]}>
              <Text style={styles.modalTitle}>Register Emergency Presentation / Pre-Alert</Text>
              <Text style={styles.modalSub}>Capture arrival mode, ESI triage priority scoring, and baseline vitals.</Text>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Patient Name *</Text>
                  <TextInput style={styles.formInput} placeholder="e.g. John Doe" value={patientName} onChangeText={setPatientName} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Age / Gender</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput style={[styles.formInput, { width: 70 }]} placeholder="Age" keyboardType="numeric" value={age} onChangeText={setAge} />
                    <TextInput style={[styles.formInput, { flex: 1 }]} placeholder="MALE / FEMALE" value={gender} onChangeText={setGender} />
                  </View>
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Arrival Mode</Text>
                  <TextInput style={styles.formInput} value={arrivalMode} onChangeText={setArrivalMode} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>ESI Acuity Level (1=Highest, 5=Lowest) *</Text>
                  <TextInput style={styles.formInput} value={esiLevel} keyboardType="numeric" onChangeText={setEsiLevel} />
                </View>
              </View>

              {arrivalMode.includes('AMBULANCE') && (
                <View style={styles.twoCol}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Ambulance Vehicle #</Text>
                    <TextInput style={styles.formInput} placeholder="e.g. AMB-LON-881" value={ambulanceVehicle} onChangeText={setAmbulanceVehicle} />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>ETA (Minutes)</Text>
                    <TextInput style={styles.formInput} placeholder="e.g. 8" keyboardType="numeric" value={etaMinutes} onChangeText={setEtaMinutes} />
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Chief Complaint / Symptoms *</Text>
                <TextInput style={[styles.formInput, { height: 60 }]} multiline placeholder="Describe acute emergency presentation..." value={chiefComplaint} onChangeText={setChiefComplaint} />
              </View>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Blood Pressure (mmHg)</Text>
                  <TextInput style={styles.formInput} placeholder="e.g. 118/74" value={bloodPressure} onChangeText={setBloodPressure} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Heart Rate (bpm)</Text>
                  <TextInput style={styles.formInput} placeholder="e.g. 96" keyboardType="numeric" value={heartRate} onChangeText={setHeartRate} />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Oxygen Saturation (SpO2 %)</Text>
                  <TextInput style={styles.formInput} placeholder="e.g. 97" keyboardType="numeric" value={oxygenSaturation} onChangeText={setOxygenSaturation} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Assigned Bay</Text>
                  <TextInput style={styles.formInput} placeholder="e.g. Resuscitation Bay 1" value={assignedBay} onChangeText={setAssignedBay} />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRegisterModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleRegister}>
                  <Text style={styles.confirmBtnText}>Register Emergency Case</Text>
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
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  benchmarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626'
  },
  refreshBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF'
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  registerBtnText: {
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
    borderWidth: 1
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800'
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
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 6
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  tabBtnActive: {
    backgroundColor: '#DC2626'
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563'
  },
  tabBtnTextActive: {
    color: '#FFF',
    fontWeight: '700'
  },
  contentLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: 16
  },
  queueColumn: {
    flex: 1.1
  },
  detailsColumn: {
    flex: 1.4
  },
  caseCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8
  },
  caseCardSelected: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2'
  },
  caseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  casePatientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827'
  },
  caseGender: {
    fontSize: 11,
    color: '#6B7280'
  },
  caseNumber: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1
  },
  esiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  esiBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  caseComplaint: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 17
  },
  incomingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    padding: 6,
    borderRadius: 6
  },
  incomingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF'
  },
  vitalsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8
  },
  vitalPill: {
    fontSize: 11,
    color: '#6B7280'
  },
  vitalVal: {
    fontWeight: '700',
    color: '#111827'
  },
  statusTag: {
    marginLeft: 'auto',
    fontSize: 10,
    fontWeight: '800'
  },
  dossierCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 14
  },
  dossierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 14
  },
  dossierTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827'
  },
  dossierMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  },
  statusBadgeLarge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusBadgeLargeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626'
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginTop: 6
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  vitalMetricBox: {
    width: '31%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4
  },
  vitalMetricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827'
  },
  vitalMetricLabel: {
    fontSize: 10,
    color: '#6B7280'
  },
  infoBlock: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151'
  },
  infoText: {
    fontSize: 12,
    color: '#111827',
    lineHeight: 18
  },
  actionButtonBar: {
    gap: 8,
    marginTop: 4
  },
  cmdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8
  },
  cmdBtnText: {
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
  emptySub: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center'
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
  emptyDossierTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151'
  },
  emptyDossierSub: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 320
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 550,
    gap: 14
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
    gap: 6
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
  bedSelectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  bedPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB'
  },
  bedPillActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF'
  },
  bedPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151'
  },
  bedPillTextActive: {
    color: '#FFF',
    fontWeight: '700'
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
    backgroundColor: '#DC2626'
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF'
  }
});
