import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { apiFetch, fetchClients } from '../api/client';
import { CreditCard, PoundSterling, Plus, CheckCircle, FileText, X } from 'lucide-react';

export const FinanceScreen = ({ currentPersona, activeClient }) => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(activeClient?.id || 1);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  useEffect(() => {
    fetchClients().then(data => {
      setClients(data || []);
      if (data && data.length > 0 && !selectedClientId) {
        setSelectedClientId(data[0].id);
      }
    }).catch(console.error);

    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/invoices');
      setInvoices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      await apiFetch(`/invoices/generate?clientId=${selectedClientId}`, {
        method: 'POST'
      });
      loadInvoices();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePay = async () => {
    if (!selectedInvoice || !payAmount) return;
    try {
      await apiFetch(`/invoices/${selectedInvoice.id}/payments?amount=${payAmount}&method=DIRECT_DEBIT&reference=DD-${Date.now() % 10000}`, {
        method: 'POST'
      });
      setPaymentModalVisible(false);
      setPayAmount('');
      loadInvoices();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleIssueInvoice = async (invoiceId) => {
    try {
      await apiFetch(`/invoices/${invoiceId}/status?status=ISSUED`, {
        method: 'PATCH'
      });
      loadInvoices();
      alert(`Invoice #${invoiceId} finalized and marked as ISSUED!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const currentClient = clients.find(c => c.id === selectedClientId) || clients[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <View>
            <Text style={styles.title}>Finance, Invoicing & Automated Billing</Text>
            <Text style={styles.subtitle}>
              Automated invoice generation from completed visits, local authority billing rates, and payment tracking.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Dynamic Client Selector */}
            <View style={styles.clientSelectorContainer}>
              <Text style={styles.selectorLabel}>BILLING CLIENT:</Text>
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

            <TouchableOpacity style={styles.genBtn} onPress={handleGenerateInvoice}>
              <Plus size={16} color={colors.textWhite} />
              <Text style={styles.genBtnText}>Generate Invoice for {currentClient?.firstName}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View style={styles.invoicesList}>
          {invoices.map((inv) => {
            const isPaid = inv.status === 'PAID';
            return (
              <View key={inv.id} style={styles.invoiceCard}>
                <View style={styles.cardTop}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.invNumber}>{inv.invoiceNumber}</Text>
                      <View style={[
                        styles.statusPill,
                        isPaid ? { backgroundColor: colors.successLight } : { backgroundColor: colors.warningLight }
                      ]}>
                        <Text style={[
                          styles.statusPillText,
                          isPaid ? { color: colors.success } : { color: colors.warning }
                        ]}>
                          {inv.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.clientText}>Client: {inv.clientName} • Billed to: {inv.billingTo}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.totalText}>£{inv.totalAmount?.toFixed(2)}</Text>
                    <Text style={styles.paidText}>Paid: £{inv.paidAmount?.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Invoice Lines */}
                <View style={styles.linesBox}>
                  <Text style={styles.linesTitle}>BILLABLE CARE ACTIVITY LINES:</Text>
                  {inv.lines?.map((line, idx) => (
                    <View key={line.id || idx} style={styles.lineRow}>
                      <Text style={styles.lineDesc}>{line.description} ({line.quantityHours} hrs @ £{line.unitRate}/hr)</Text>
                      <Text style={styles.lineTotal}>£{line.lineTotal?.toFixed(2)}</Text>
                    </View>
                  ))}
                </View>

                {/* Footer Actions */}
                <View style={[styles.actionsRow, { gap: 10 }]}>
                  {inv.status === 'DRAFT' && (
                    <TouchableOpacity
                      style={[styles.payBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleIssueInvoice(inv.id)}
                    >
                      <FileText size={13} color={colors.textWhite} />
                      <Text style={styles.payBtnText}>Finalize & Issue Invoice</Text>
                    </TouchableOpacity>
                  )}
                  {!isPaid && (
                    <TouchableOpacity
                      style={styles.payBtn}
                      onPress={() => {
                        setSelectedInvoice(inv);
                        setPayAmount((inv.totalAmount - inv.paidAmount).toString());
                        setPaymentModalVisible(true);
                      }}
                    >
                      <PoundSterling size={13} color={colors.textWhite} />
                      <Text style={styles.payBtnText}>Record Payment</Text>
                    </TouchableOpacity>
                  )}
                  {isPaid && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={14} color={colors.success} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.success }}>Fully Settled via BACS</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Payment Modal */}
      <Modal visible={paymentModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Invoice Payment</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Applying payment for Invoice {selectedInvoice?.invoiceNumber} ({selectedInvoice?.clientName})
            </Text>

            <Text style={styles.inputLabel}>PAYMENT AMOUNT (£)</Text>
            <TextInput
              style={styles.textInput}
              value={payAmount}
              onChangeText={setPayAmount}
              keyboardType="decimal-pad"
            />

            <TouchableOpacity style={styles.payBtnConfirm} onPress={handlePay}>
              <Text style={styles.payBtnText}>Confirm & Post Payment</Text>
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
  clientSelectorContainer: {
    gap: 4,
  },
  selectorLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  clientTabs: {
    flexDirection: 'row',
    gap: 6,
  },
  clientTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: '#F8FAFC',
  },
  clientTabActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  clientTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  clientTabTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  genBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  genBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textWhite,
  },
  invoicesList: {
    gap: 16,
  },
  invoiceCard: {
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
    alignItems: 'flex-start',
  },
  invNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  clientText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  totalText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  paidText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  linesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
  },
  linesTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineDesc: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  lineTotal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.success,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payBtnConfirm: {
    backgroundColor: colors.success,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  payBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textWhite,
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
    maxWidth: 400,
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
  modalDesc: {
    fontSize: 12,
    color: colors.textSecondary,
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
    fontSize: 13,
  },
});
