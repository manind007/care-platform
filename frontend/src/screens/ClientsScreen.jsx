import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { colors } from '../theme/colors';
import { apiFetch } from '../api/client';
import { User, Phone, MapPin, Heart, AlertTriangle, ShieldCheck, History, Calendar, Plus, X, CheckCircle, Users, Mail, HeartHandshake } from 'lucide-react';

export const ClientsScreen = ({ onSelectClientForPlan }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [intakeModalVisible, setIntakeModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Emergency Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactRel, setContactRel] = useState('Son (Lasting Power of Attorney - Health & Welfare)');
  const [contactPhone, setContactPhone] = useState('+44 7700 900451');
  const [contactEmail, setContactEmail] = useState('robert.higgins@family.example');
  const [contactPrimary, setContactPrimary] = useState(true);
  const [contactPortal, setContactPortal] = useState(true);

  // New Client Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('1952-05-18');
  const [gender, setGender] = useState('Female');
  const [nhsNumber, setNhsNumber] = useState('984 312 8891');
  const [phone, setPhone] = useState('+44 20 7946 0542');
  const [address, setAddress] = useState('19 Gloucester Terrace, London');
  const [postcode, setPostcode] = useState('W2 3DY');
  const [keySafeCode, setKeySafeCode] = useState('C-8821');
  const [fundingType, setFundingType] = useState('LOCAL_AUTHORITY');
  const [medicalHistory, setMedicalHistory] = useState('Type 2 Diabetes, Mild Osteoarthritis, Hypertension.');
  const [allergies, setAllergies] = useState('Aspirin, Penicillin');
  const [carePreferences, setCarePreferences] = useState('Prefers morning visits at 08:30. Enjoys listening to classical radio.');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/clients');
      setClients(data || []);
      if (data && data.length > 0) {
        selectClient(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectClient = async (client) => {
    setSelectedClient(client);
    try {
      const timelineData = await apiFetch(`/clients/${client.id}/timeline`);
      setTimeline(timelineData || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateClient = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please provide both first and last name.');
      return;
    }
    try {
      setSubmitting(true);
      const newClient = await apiFetch('/clients', {
        method: 'POST',
        body: JSON.stringify({
          clientIdentifier: 'CLI-' + Math.floor(1000 + Math.random() * 9000),
          firstName,
          lastName,
          dateOfBirth: dob,
          gender,
          nhsNumber,
          phone,
          address,
          postcode,
          keySafeCode,
          fundingType,
          medicalHistory,
          allergies,
          carePreferences,
          status: 'ACTIVE'
        })
      });

      setIntakeModalVisible(false);
      // Reset form
      setFirstName('');
      setLastName('');
      // Reload and auto-select
      const data = await apiFetch('/clients');
      setClients(data || []);
      const created = data?.find(c => c.id === newClient.id) || newClient;
      selectClient(created);
      alert(`Client ${newClient.firstName} ${newClient.lastName} successfully registered in care registry!`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddEmergencyContact = async () => {
    if (!contactName.trim() || !selectedClient) {
      alert('Please enter contact full name.');
      return;
    }
    try {
      setSubmitting(true);
      await apiFetch(`/clients/${selectedClient.id}/emergency-contacts`, {
        method: 'POST',
        body: JSON.stringify({
          name: contactName,
          relationship: contactRel || 'Family Proxy',
          phone: contactPhone,
          email: contactEmail,
          primary: contactPrimary,
          hasPortalAccess: contactPortal
        })
      });
      setContactModalVisible(false);
      setContactName('');
      // Reload and re-select
      const data = await apiFetch('/clients');
      setClients(data || []);
      const updated = data?.find(c => c.id === selectedClient.id) || selectedClient;
      selectClient(updated);
      alert(`Emergency contact ${contactName} successfully added!`);
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
            <Text style={styles.title}>Client Longitudinal Care Records</Text>
            <Text style={styles.subtitle}>
              Consolidated profiles, medical histories, allergies, emergency contacts, and chronological care timeline.
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.intakeBtn}
            onPress={() => setIntakeModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={16} color={colors.textWhite} />
            <Text style={styles.intakeBtnText}>New Client Intake / Referral</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainLayout}>
        {/* Left: Client List */}
        <View style={styles.leftCol}>
          <Text style={styles.colTitle}>ACTIVE CLIENTS ({clients.length})</Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={{ gap: 10 }}>
              {clients.map((c) => {
                const isSelected = selectedClient?.id === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.clientCard, isSelected && styles.clientCardActive]}
                    onPress={() => selectClient(c)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.clientAvatar}>
                      <Text style={styles.avatarText}>{c.firstName[0]}{c.lastName[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.clientCardName}>{c.firstName} {c.lastName}</Text>
                        <Text style={styles.clientId}>{c.clientIdentifier}</Text>
                      </View>
                      <Text style={styles.clientFunding}>{c.fundingType?.replace('_', ' ')} • NHS: {c.nhsNumber}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Right: Detailed Client Profile & Longitudinal Timeline */}
        {selectedClient && (
          <View style={styles.rightCol}>
            {/* Top Profile Summary */}
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <View style={styles.bigAvatar}>
                    <Text style={styles.bigAvatarText}>
                      {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.detailName}>{selectedClient.firstName} {selectedClient.lastName}</Text>
                    <Text style={styles.detailSub}>
                      DOB: {selectedClient.dateOfBirth} ({selectedClient.gender}) • NHS: {selectedClient.nhsNumber}
                    </Text>
                  </View>
                </View>

                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>{selectedClient.status}</Text>
                </View>
              </View>

              {/* Allergy Warning Banner if applicable */}
              {selectedClient.allergies && (
                <View style={styles.allergyBanner}>
                  <AlertTriangle size={16} color={colors.danger} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.allergyTitle}>KNOWN ALLERGIES & ADVERSE REACTIONS</Text>
                    <Text style={styles.allergyText}>{selectedClient.allergies}</Text>
                  </View>
                </View>
              )}

              {/* Key Attributes Grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>ADDRESS & ACCESS</Text>
                  <Text style={styles.infoValue}>📍 {selectedClient.address}, {selectedClient.postcode}</Text>
                  <Text style={styles.infoValue}>🔑 KeySafe: {selectedClient.keySafeCode || 'N/A'}</Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>FUNDING & CONTRACT</Text>
                  <Text style={styles.infoValue}>🏛️ Type: {selectedClient.fundingType?.replace('_', ' ')}</Text>
                  <Text style={styles.infoValue}>📋 Ref: {selectedClient.clientIdentifier}</Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>MEDICAL HISTORY</Text>
                  <Text style={styles.infoValue}>{selectedClient.medicalHistory || 'None registered'}</Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>PREFERENCES & ROUTINE</Text>
                  <Text style={styles.infoValue}>⭐ {selectedClient.carePreferences || 'No specific preferences'}</Text>
                </View>
              </View>
            </View>

            {/* Emergency Contacts & Next of Kin Card */}
            <View style={styles.detailCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <HeartHandshake size={18} color={colors.primary} />
                  <Text style={styles.timelineTitle}>Emergency Contacts & Next of Kin (LPA)</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.intakeBtn, { paddingVertical: 6, paddingHorizontal: 12 }]}
                  onPress={() => setContactModalVisible(true)}
                >
                  <Plus size={14} color={colors.textWhite} />
                  <Text style={[styles.intakeBtnText, { fontSize: 11 }]}>Add Contact</Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 10 }}>
                {(!selectedClient.emergencyContacts || selectedClient.emergencyContacts.length === 0) ? (
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>No emergency contacts registered for this client.</Text>
                ) : (
                  selectedClient.emergencyContacts.map((c) => (
                    <View key={c.id} style={styles.contactItemCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View>
                          <Text style={styles.contactItemName}>{c.name}</Text>
                          <Text style={styles.contactItemRel}>{c.relationship}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          {c.primary && (
                            <View style={styles.primaryBadge}>
                              <Text style={styles.primaryBadgeText}>PRIMARY LPA</Text>
                            </View>
                          )}
                          {c.hasPortalAccess && (
                            <View style={styles.portalBadge}>
                              <ShieldCheck size={12} color={colors.success} />
                              <Text style={styles.portalBadgeText}>FAMILY PORTAL ACTIVE</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                        <Text style={styles.contactDetailText}>📞 {c.phone}</Text>
                        <Text style={styles.contactDetailText}>✉️ {c.email}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* Longitudinal Care Timeline Feed */}
            <View style={styles.detailCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <History size={18} color={colors.primary} />
                <Text style={styles.timelineTitle}>Longitudinal Care Timeline & Journal</Text>
              </View>

              <View style={styles.timelineList}>
                {timeline.map((ev, idx) => (
                  <View key={ev.id || idx} style={styles.timelineItem}>
                    <View style={styles.timelineBullet} />
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineTopRow}>
                        <Text style={styles.timelineItemTitle}>{ev.title}</Text>
                        <Text style={styles.timelineTime}>
                          {ev.eventTimestamp ? new Date(ev.eventTimestamp).toLocaleTimeString() : 'Today'}
                        </Text>
                      </View>
                      <Text style={styles.timelineDesc}>{ev.description}</Text>
                      <Text style={styles.timelineAuthor}>Signed by carer: {ev.recordedBy}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* New Client Intake / Referral Modal */}
      <Modal visible={intakeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Plus size={18} color={colors.primary} />
                <Text style={styles.modalTitle}>New Client Intake & Clinical Referral</Text>
              </View>
              <TouchableOpacity onPress={() => setIntakeModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 500 }} contentContainerStyle={{ gap: 12 }}>
              <Text style={styles.modalDesc}>
                Register a new client profile into the tenant care database. This initiates Journey 1: intake, assessment scheduling, and care plan drafting.
              </Text>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>FIRST NAME *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="e.g. Eleanor"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>LAST NAME *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="e.g. Vance"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>DATE OF BIRTH (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={dob}
                    onChangeText={setDob}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>GENDER</Text>
                  <TextInput
                    style={styles.textInput}
                    value={gender}
                    onChangeText={setGender}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>NHS NUMBER</Text>
                  <TextInput
                    style={styles.textInput}
                    value={nhsNumber}
                    onChangeText={setNhsNumber}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>FUNDING TYPE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={fundingType}
                    onChangeText={setFundingType}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.inputLabel}>ADDRESS & POSTCODE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>KEYSAFE CODE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={keySafeCode}
                    onChangeText={setKeySafeCode}
                  />
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>KNOWN ALLERGIES</Text>
                <TextInput
                  style={styles.textInput}
                  value={allergies}
                  onChangeText={setAllergies}
                  placeholder="e.g. Penicillin, Latex"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>MEDICAL HISTORY & DIAGNOSES</Text>
                <TextInput
                  style={[styles.textInput, { height: 60 }]}
                  multiline
                  value={medicalHistory}
                  onChangeText={setMedicalHistory}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>CARE PREFERENCES & ROUTINE</Text>
                <TextInput
                  style={[styles.textInput, { height: 60 }]}
                  multiline
                  value={carePreferences}
                  onChangeText={setCarePreferences}
                />
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleCreateClient}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Registering Client...' : 'Commit Client Intake'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Emergency Contact Modal */}
      <Modal visible={contactModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <HeartHandshake size={18} color={colors.primary} />
                <Text style={styles.modalTitle}>Add Emergency Contact / Next of Kin</Text>
              </View>
              <TouchableOpacity onPress={() => setContactModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <Text style={styles.modalDesc}>
                Register a designated family proxy, lasting power of attorney (LPA), or next of kin for {selectedClient?.firstName} {selectedClient?.lastName}.
              </Text>

              <View>
                <Text style={styles.inputLabel}>FULL NAME *</Text>
                <TextInput
                  style={styles.textInput}
                  value={contactName}
                  onChangeText={setContactName}
                  placeholder="e.g. Robert Higgins"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>RELATIONSHIP & LEGAL STATUS *</Text>
                <TextInput
                  style={styles.textInput}
                  value={contactRel}
                  onChangeText={setContactRel}
                  placeholder="e.g. Son (Lasting Power of Attorney - Health & Welfare)"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>TELEPHONE NUMBER</Text>
                  <TextInput
                    style={styles.textInput}
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    placeholder="+44 7700 900451"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={styles.textInput}
                    value={contactEmail}
                    onChangeText={setContactEmail}
                    placeholder="name@family.example"
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleAddEmergencyContact}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>{submitting ? 'Saving Contact...' : 'Save Emergency Contact'}</Text>
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
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  intakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  intakeBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  mainLayout: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: 1,
    minWidth: 320,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
  },
  colTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  clientCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  clientAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: 13,
  },
  clientCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  clientId: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  clientFunding: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightCol: {
    flex: 2,
    minWidth: 460,
    gap: 16,
  },
  detailCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bigAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigAvatarText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: 16,
  },
  detailName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  detailSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activePill: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activePillText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
  },
  allergyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  allergyTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.danger,
    letterSpacing: 0.5,
  },
  allergyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoBox: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    gap: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  timelineList: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primaryLight,
    paddingLeft: 16,
    marginLeft: 8,
    gap: 16,
  },
  timelineItem: {
    position: 'relative',
  },
  timelineBullet: {
    position: 'absolute',
    left: -22,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  timelineContent: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
  },
  timelineTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timelineTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  timelineDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  timelineAuthor: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 6,
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
  contactItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
  },
  contactItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  contactItemRel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  primaryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  portalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  portalBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.success,
  },
  contactDetailText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
