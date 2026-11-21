import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { apiFetch } from '../api/client';
import { AlertTriangle, ShieldAlert, Plus, CheckCircle, Clock, X, ArrowRight } from 'lucide-react';

export const IncidentsScreen = ({ currentPersona }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Form
  const [category, setCategory] = useState('FALL');
  const [severity, setSeverity] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [witnesses, setWitnesses] = useState('');

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/incidents');
      setIncidents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    try {
      await apiFetch('/incidents', {
        method: 'POST',
        body: JSON.stringify({
          clientId: 1,
          clientName: 'Margaret Higgins',
          category,
          severity,
          description,
          immediateActionTaken: actionTaken,
          witnesses
        })
      });
      setModalVisible(false);
      setDescription('');
      setActionTaken('');
      setWitnesses('');
      loadIncidents();
    } catch (err) {
      alert(err.message);
    }
  };

  const advanceWorkflow = async (id, nextStatus) => {
    try {
      await apiFetch(`/incidents/${id}/workflow?status=${nextStatus}&notes=Reviewed+and+actioned+by+${currentPersona.name}`, {
        method: 'PATCH'
      });
      loadIncidents();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.title}>Incident, Safeguarding & Risk Governance</Text>
            <Text style={styles.subtitle}>
              Log accidents, falls, medication errors, and near misses with strict investigation and closure lifecycles.
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Plus size={16} color={colors.textWhite} />
            <Text style={styles.addBtnText}>Report Incident</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View style={styles.incidentsList}>
          {incidents.map((inc) => {
            const isCritical = inc.severity === 'CRITICAL' || inc.severity === 'HIGH';
            return (
              <View key={inc.id} style={styles.incidentCard}>
                <View style={styles.cardTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.refBadge}>
                      <Text style={styles.refText}>{inc.incidentReference}</Text>
                    </View>
                    <Text style={styles.categoryTitle}>{inc.category?.replace('_', ' ')}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={[styles.pill, isCritical ? styles.pillDanger : styles.pillWarning]}>
                      <Text style={[styles.pillText, isCritical ? { color: colors.danger } : { color: colors.warning }]}>
                        {inc.severity} SEVERITY
                      </Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.pillText, { color: colors.primaryDark }]}>
                        STATUS: {inc.status}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.clientTag}>Client: {inc.clientName} • Reported by: {inc.reportedBy}</Text>
                <Text style={styles.descText}>{inc.description}</Text>

                {inc.immediateActionTaken && (
                  <View style={styles.actionBox}>
                    <Text style={styles.actionLabel}>IMMEDIATE ACTION TAKEN:</Text>
                    <Text style={styles.actionContent}>{inc.immediateActionTaken}</Text>
                  </View>
                )}

                {/* Workflow Stepper Action */}
                <View style={styles.stepperRow}>
                  {inc.status === 'REPORTED' && (
                    <TouchableOpacity 
                      style={[styles.stepBtn, { backgroundColor: colors.warning }]}
                      onPress={() => advanceWorkflow(inc.id, 'INVESTIGATION')}
                    >
                      <Text style={styles.stepBtnText}>Begin Manager Investigation →</Text>
                    </TouchableOpacity>
                  )}

                  {inc.status === 'INVESTIGATION' && (
                    <TouchableOpacity 
                      style={[styles.stepBtn, { backgroundColor: colors.primary }]}
                      onPress={() => advanceWorkflow(inc.id, 'CORRECTIVE_ACTION')}
                    >
                      <Text style={styles.stepBtnText}>Approve Corrective Actions →</Text>
                    </TouchableOpacity>
                  )}

                  {inc.status === 'CORRECTIVE_ACTION' && (
                    <TouchableOpacity 
                      style={[styles.stepBtn, { backgroundColor: colors.success }]}
                      onPress={() => advanceWorkflow(inc.id, 'CLOSED')}
                    >
                      <CheckCircle size={14} color={colors.textWhite} />
                      <Text style={styles.stepBtnText}>Verify & Close Incident</Text>
                    </TouchableOpacity>
                  )}

                  {inc.status === 'CLOSED' && (
                    <Text style={styles.closedNotice}>✓ Investigation Verified & Case Formally Closed</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Report Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Clinical or Safety Incident</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>INCIDENT CATEGORY</Text>
            <View style={styles.rowSelector}>
              {['FALL', 'MEDICATION_ERROR', 'NEAR_MISS', 'SAFEGUARDING', 'INJURY'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.selectBtn, category === cat && styles.selectBtnActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.selectBtnText, category === cat && { color: colors.primary }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>SEVERITY LEVEL</Text>
            <View style={styles.rowSelector}>
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((sev) => (
                <TouchableOpacity
                  key={sev}
                  style={[styles.selectBtn, severity === sev && styles.selectBtnActive]}
                  onPress={() => setSeverity(sev)}
                >
                  <Text style={[styles.selectBtnText, severity === sev && { color: colors.danger }]}>{sev}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>INCIDENT DESCRIPTION</Text>
            <TextInput
              style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
              placeholder="What happened? Record exact circumstances, location, and condition..."
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.inputLabel}>IMMEDIATE ACTION TAKEN</Text>
            <TextInput
              style={styles.textInput}
              placeholder="First aid administered, GP called, hazard removed, etc..."
              value={actionTaken}
              onChangeText={setActionTaken}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleReport}>
              <Text style={styles.submitBtnText}>Submit Incident Report</Text>
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
    color: colors.secondary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textWhite,
  },
  incidentsList: {
    gap: 16,
  },
  incidentCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  refText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillDanger: {
    backgroundColor: colors.dangerLight,
  },
  pillWarning: {
    backgroundColor: colors.warningLight,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  clientTag: {
    fontSize: 11,
    color: colors.textMuted,
  },
  descText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  actionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  actionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
  },
  actionContent: {
    fontSize: 11,
    color: colors.textPrimary,
    marginTop: 2,
  },
  stepperRow: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  stepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stepBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textWhite,
  },
  closedNotice: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    gap: 12,
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
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  rowSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: '#F8FAFC',
  },
  selectBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  selectBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textWhite,
  },
});
