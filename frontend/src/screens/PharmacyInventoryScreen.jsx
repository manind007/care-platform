import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { 
  fetchPharmacyMedicines, 
  createPharmacyMedicine, 
  fetchPharmacyBatches, 
  addPharmacyBatch, 
  fetchPharmacyDispensations, 
  dispensePharmacyMedicine, 
  fetchExpiringBatches 
} from '../api/client';
import { 
  Pill, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Plus, 
  X, 
  ShoppingBag, 
  Layers,
  Calendar
} from 'lucide-react';

export const PharmacyInventoryScreen = ({ currentPersona }) => {
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [dispensations, setDispensations] = useState([]);
  const [expiringBatches, setExpiringBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('CATALOG'); // 'CATALOG' | 'BATCHES' | 'DISPENSE_LOG'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [addMedModal, setAddMedModal] = useState(false);
  const [addBatchModal, setAddBatchModal] = useState(false);
  const [dispenseModal, setDispenseModal] = useState(false);

  // Form states: New Medicine
  const [brandName, setBrandName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [itemCode, setItemCode] = useState('MED-' + Math.floor(Math.random() * 900 + 100));
  const [category, setCategory] = useState('Antibiotic');
  const [dosageForm, setDosageForm] = useState('Tablet');
  const [strength, setStrength] = useState('500 mg');
  const [unitPrice, setUnitPrice] = useState('1.50');
  const [reorderLevel, setReorderLevel] = useState('50');

  // Form states: New Batch
  const [selectedMedId, setSelectedMedId] = useState(null);
  const [selectedMedName, setSelectedMedName] = useState('');
  const [batchNum, setBatchNum] = useState('B-' + Math.floor(Math.random() * 9000 + 1000));
  const [batchQty, setBatchQty] = useState('200');
  const [expDate, setExpDate] = useState('2027-06-30');
  const [supplier, setSupplier] = useState('Novartis Pharma');

  // Form states: Dispensation
  const [dispPatient, setDispPatient] = useState('Margaret Higgins');
  const [dispUhid, setDispUhid] = useState('UHID-2026-0001');
  const [dispMedName, setDispMedName] = useState('Paracetamol (Panadol)');
  const [dispBatch, setDispBatch] = useState('B-PAR-2401');
  const [dispQty, setDispQty] = useState('10');
  const [dispPrice, setDispPrice] = useState('0.50');
  const [dispensing, setDispensing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loadedMeds, loadedBatches, loadedDisps, loadedExp] = await Promise.all([
        fetchPharmacyMedicines().catch(() => []),
        fetchPharmacyBatches().catch(() => []),
        fetchPharmacyDispensations().catch(() => []),
        fetchExpiringBatches(30).catch(() => [])
      ]);
      setMedicines(loadedMeds || []);
      setBatches(loadedBatches || []);
      setDispensations(loadedDisps || []);
      setExpiringBatches(loadedExp || []);
    } catch (err) {
      console.error('Failed to load pharmacy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMedicine = async () => {
    if (!brandName.trim() || !genericName.trim()) return;
    try {
      setDispensing(true);
      const payload = {
        brandName,
        genericName,
        itemCode,
        category,
        dosageForm,
        strength,
        unitPrice: parseFloat(unitPrice) || 1.0,
        reorderLevel: parseInt(reorderLevel) || 30,
        totalStock: 0
      };
      await createPharmacyMedicine(payload);
      setAddMedModal(false);
      setBrandName('');
      setGenericName('');
      await loadData();
    } catch (err) {
      console.error('Failed to add medicine:', err);
    } finally {
      setDispensing(false);
    }
  };

  const handleAddBatch = async () => {
    if (!selectedMedName.trim() || !batchNum.trim()) return;
    try {
      setDispensing(true);
      const payload = {
        medicineId: selectedMedId,
        medicineName: selectedMedName,
        batchNumber: batchNum,
        quantity: parseInt(batchQty) || 100,
        expiryDate: expDate,
        supplier,
        purchasePrice: 0.50
      };
      await addPharmacyBatch(payload);
      setAddBatchModal(false);
      await loadData();
    } catch (err) {
      console.error('Failed to add batch:', err);
    } finally {
      setDispensing(false);
    }
  };

  const handleDispense = async () => {
    if (!dispPatient.trim() || !dispMedName.trim()) return;
    try {
      setDispensing(true);
      const qty = parseInt(dispQty) || 1;
      const price = parseFloat(dispPrice) || 0.5;
      const payload = {
        uhid: dispUhid,
        patientName: dispPatient,
        medicineName: dispMedName,
        batchNumber: dispBatch,
        quantityDispensed: qty,
        unitPrice: price,
        totalAmount: qty * price,
        dispensedBy: currentPersona?.name || 'Lead Pharmacist'
      };
      await dispensePharmacyMedicine(payload);
      setDispenseModal(false);
      await loadData();
    } catch (err) {
      console.error('Failed to dispense medicine:', err);
    } finally {
      setDispensing(false);
    }
  };

  const totalStockUnits = medicines.reduce((acc, m) => acc + (m.totalStock || 0), 0);
  const lowStockCount = medicines.filter(m => (m.totalStock || 0) <= (m.reorderLevel || 20)).length;

  const filteredMeds = medicines.filter(m => 
    (m.brandName && m.brandName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.genericName && m.genericName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.itemCode && m.itemCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {/* Top Banner Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>MEDICINE FORMULATIONS</Text>
          <Text style={styles.statValue}>{medicines.length}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
          <Text style={styles.statLabel}>TOTAL STOCK UNITS</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{totalStockUnits}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.danger }]}>
          <Text style={styles.statLabel}>LOW STOCK ALERTS</Text>
          <Text style={[styles.statValue, { color: colors.danger }]}>{lowStockCount}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.warning }]}>
          <Text style={styles.statLabel}>EXPIRING BATCHES (&lt;30D)</Text>
          <Text style={[styles.statValue, { color: colors.warning }]}>{expiringBatches.length}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
          <Text style={styles.statLabel}>PRESCRIPTIONS DISPENSED</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>{dispensations.length}</Text>
        </View>
      </View>

      {/* Critical Expiry Alert Banner (if any) */}
      {expiringBatches.length > 0 && (
        <View style={styles.alertBanner}>
          <AlertTriangle size={18} color={colors.danger} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.alertBannerTitle}>CRITICAL EXPIRY WARNING ({expiringBatches.length} Batches)</Text>
            <Text style={styles.alertBannerText}>
              {expiringBatches.map(b => `${b.medicineName} (Batch ${b.batchNumber} - Exp: ${b.expiryDate})`).join(', ')}
            </Text>
          </View>
        </View>
      )}

      {/* Main Container Card */}
      <View style={styles.mainCard}>
        {/* Header & Main Actions */}
        <View style={styles.tableHeader}>
          <View>
            <Text style={styles.titleText}>Pharmacy & Medical Inventory Management</Text>
            <Text style={styles.subtitleText}>Automated batch tracking, expiry monitoring & counter dispensing</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
              onPress={() => setAddBatchModal(true)}
            >
              <Package size={15} color={colors.textWhite} />
              <Text style={styles.actionBtnText}>Receive Batch Stock</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => setAddMedModal(true)}
            >
              <Plus size={15} color={colors.textWhite} />
              <Text style={styles.actionBtnText}>Add New Medicine</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.success }]}
              onPress={() => setDispenseModal(true)}
            >
              <ShoppingBag size={15} color={colors.textWhite} />
              <Text style={styles.actionBtnText}>Dispense Rx</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab & Search Bar */}
        <View style={styles.tabBarRow}>
          <View style={styles.tabButtons}>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'CATALOG' && styles.tabBtnActive]}
              onPress={() => setActiveTab('CATALOG')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'CATALOG' && styles.tabBtnTextActive]}>
                Medicine Master Catalog ({medicines.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'BATCHES' && styles.tabBtnActive]}
              onPress={() => setActiveTab('BATCHES')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'BATCHES' && styles.tabBtnTextActive]}>
                Batches & Expiry Tracker ({batches.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'DISPENSE_LOG' && styles.tabBtnActive]}
              onPress={() => setActiveTab('DISPENSE_LOG')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'DISPENSE_LOG' && styles.tabBtnTextActive]}>
                Dispensation Register ({dispensations.length})
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'CATALOG' && (
            <View style={styles.searchBar}>
              <Search size={15} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by brand, generic, or code..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          )}
        </View>

        {/* Tab 1: Catalog */}
        {activeTab === 'CATALOG' && (
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.table}>
              <View style={styles.tHead}>
                <Text style={[styles.th, { width: 120 }]}>ITEM CODE</Text>
                <Text style={[styles.th, { flex: 1 }]}>BRAND & GENERIC FORMULATION</Text>
                <Text style={[styles.th, { width: 150 }]}>DOSAGE & STRENGTH</Text>
                <Text style={[styles.th, { width: 130 }]}>CATEGORY</Text>
                <Text style={[styles.th, { width: 100 }]}>UNIT PRICE</Text>
                <Text style={[styles.th, { width: 130 }]}>STOCK ON HAND</Text>
                <Text style={[styles.th, { width: 110 }]}>STATUS</Text>
              </View>

              {filteredMeds.map(med => {
                const isLow = (med.totalStock || 0) <= (med.reorderLevel || 20);
                return (
                  <View key={med.id} style={styles.tRow}>
                    <Text style={styles.codeText}>{med.itemCode}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.medBrandText}>{med.brandName}</Text>
                      <Text style={styles.medGenericText}>{med.genericName}</Text>
                    </View>
                    <Text style={styles.metaText}>{med.dosageForm} • {med.strength}</Text>
                    <Text style={styles.metaText}>{med.category || 'General'}</Text>
                    <Text style={styles.priceText}>${parseFloat(med.unitPrice || 0).toFixed(2)}</Text>
                    <View style={{ width: 130 }}>
                      <Text style={[styles.stockText, isLow && { color: colors.danger, fontWeight: '800' }]}>
                        {med.totalStock || 0} units
                      </Text>
                      <Text style={styles.reorderText}>Reorder @ {med.reorderLevel || 20}</Text>
                    </View>
                    <View style={{ width: 110 }}>
                      <View style={[styles.statusPill, isLow ? styles.statusPillLow : styles.statusPillHealthy]}>
                        <Text style={[styles.statusPillText, isLow ? { color: colors.danger } : { color: colors.success }]}>
                          {isLow ? 'LOW STOCK' : 'IN STOCK'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* Tab 2: Batches */}
        {activeTab === 'BATCHES' && (
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.table}>
              <View style={styles.tHead}>
                <Text style={[styles.th, { width: 130 }]}>BATCH NUMBER</Text>
                <Text style={[styles.th, { flex: 1 }]}>MEDICINE NAME</Text>
                <Text style={[styles.th, { width: 140 }]}>EXPIRY DATE</Text>
                <Text style={[styles.th, { width: 120 }]}>QUANTITY</Text>
                <Text style={[styles.th, { width: 160 }]}>SUPPLIER</Text>
                <Text style={[styles.th, { width: 130 }]}>EXPIRY STATUS</Text>
              </View>

              {batches.map(b => {
                const isExpiring = expiringBatches.some(eb => eb.id === b.id);
                return (
                  <View key={b.id} style={styles.tRow}>
                    <Text style={styles.batchNumText}>{b.batchNumber}</Text>
                    <Text style={[styles.medBrandText, { flex: 1 }]}>{b.medicineName}</Text>
                    <Text style={[styles.expiryDateText, isExpiring && { color: colors.danger, fontWeight: '800' }]}>
                      {b.expiryDate}
                    </Text>
                    <Text style={styles.stockText}>{b.quantity} units</Text>
                    <Text style={styles.metaText}>{b.supplier || 'Standard Supply'}</Text>
                    <View style={{ width: 130 }}>
                      <View style={[styles.statusPill, isExpiring ? styles.statusPillExpiring : styles.statusPillHealthy]}>
                        <Text style={[styles.statusPillText, isExpiring ? { color: colors.danger } : { color: colors.success }]}>
                          {isExpiring ? 'EXPIRING SOON' : 'ACTIVE / VALID'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* Tab 3: Dispensation Log */}
        {activeTab === 'DISPENSE_LOG' && (
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.table}>
              <View style={styles.tHead}>
                <Text style={[styles.th, { width: 130 }]}>DISPENSE ID</Text>
                <Text style={[styles.th, { width: 180 }]}>PATIENT & UHID</Text>
                <Text style={[styles.th, { flex: 1 }]}>MEDICINE & BATCH</Text>
                <Text style={[styles.th, { width: 100 }]}>QUANTITY</Text>
                <Text style={[styles.th, { width: 110 }]}>TOTAL COST</Text>
                <Text style={[styles.th, { width: 160 }]}>DISPENSED BY</Text>
              </View>

              {dispensations.map(disp => (
                <View key={disp.id} style={styles.tRow}>
                  <Text style={styles.codeText}>{disp.dispensationCode}</Text>
                  <View style={{ width: 180 }}>
                    <Text style={styles.patientName}>{disp.patientName}</Text>
                    <Text style={styles.uhidMeta}>{disp.uhid}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.medBrandText}>{disp.medicineName}</Text>
                    <Text style={styles.reorderText}>Batch: {disp.batchNumber || 'Auto-Allocated'}</Text>
                  </View>
                  <Text style={styles.stockText}>{disp.quantityDispensed} units</Text>
                  <Text style={styles.priceText}>${parseFloat(disp.totalAmount || 0).toFixed(2)}</Text>
                  <View style={{ width: 160 }}>
                    <Text style={styles.metaText}>{disp.dispensedBy}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Add Medicine Modal */}
      <Modal visible={addMedModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medicine Formulation</Text>
              <TouchableOpacity onPress={() => setAddMedModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.fieldLabel}>Brand Name *</Text>
              <TextInput style={styles.modalInput} placeholder="e.g. Lipitor / Panadol" value={brandName} onChangeText={setBrandName} />

              <Text style={styles.fieldLabel}>Generic Name (Active Ingredient) *</Text>
              <TextInput style={styles.modalInput} placeholder="e.g. Atorvastatin Calcium" value={genericName} onChangeText={setGenericName} />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Item Code</Text>
                  <TextInput style={styles.modalInput} value={itemCode} onChangeText={setItemCode} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Category</Text>
                  <TextInput style={styles.modalInput} value={category} onChangeText={setCategory} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Dosage Form</Text>
                  <TextInput style={styles.modalInput} value={dosageForm} onChangeText={setDosageForm} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Strength</Text>
                  <TextInput style={styles.modalInput} value={strength} onChangeText={setStrength} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Unit Price ($)</Text>
                  <TextInput style={styles.modalInput} value={unitPrice} onChangeText={setUnitPrice} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Reorder Threshold</Text>
                  <TextInput style={styles.modalInput} value={reorderLevel} onChangeText={setReorderLevel} keyboardType="numeric" />
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddMedModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddMedicine} disabled={dispensing}>
                {dispensing ? <ActivityIndicator color={colors.textWhite} /> : <Text style={styles.submitBtnText}>Save Medicine</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Batch Modal */}
      <Modal visible={addBatchModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Receive Medicine Batch Stock</Text>
              <TouchableOpacity onPress={() => setAddBatchModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.fieldLabel}>Select Medicine Formulation *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {medicines.map(m => (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.medChoicePill, selectedMedId === m.id && styles.medChoicePillActive]}
                    onPress={() => {
                      setSelectedMedId(m.id);
                      setSelectedMedName(m.brandName);
                    }}
                  >
                    <Text style={[styles.medChoicePillText, selectedMedId === m.id && styles.medChoicePillTextActive]}>
                      {m.brandName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Batch / Lot Number *</Text>
                  <TextInput style={styles.modalInput} value={batchNum} onChangeText={setBatchNum} />
                </View>
                <View style={{ width: 120 }}>
                  <Text style={styles.fieldLabel}>Quantity (Units)</Text>
                  <TextInput style={styles.modalInput} value={batchQty} onChangeText={setBatchQty} keyboardType="numeric" />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Expiry Date (YYYY-MM-DD) *</Text>
              <TextInput style={styles.modalInput} value={expDate} onChangeText={setExpDate} />

              <Text style={styles.fieldLabel}>Supplier / Manufacturer</Text>
              <TextInput style={styles.modalInput} value={supplier} onChangeText={setSupplier} />
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddBatchModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddBatch} disabled={dispensing}>
                {dispensing ? <ActivityIndicator color={colors.textWhite} /> : <Text style={styles.submitBtnText}>Add Batch to Stock</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dispense Rx Modal */}
      <Modal visible={dispenseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dispense Prescription Medication</Text>
              <TouchableOpacity onPress={() => setDispenseModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Patient Full Name</Text>
                  <TextInput style={styles.modalInput} value={dispPatient} onChangeText={setDispPatient} />
                </View>
                <View style={{ width: 140 }}>
                  <Text style={styles.fieldLabel}>UHID</Text>
                  <TextInput style={styles.modalInput} value={dispUhid} onChangeText={setDispUhid} />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Medicine to Dispense</Text>
              <TextInput style={styles.modalInput} value={dispMedName} onChangeText={setDispMedName} />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Batch Number</Text>
                  <TextInput style={styles.modalInput} value={dispBatch} onChangeText={setDispBatch} />
                </View>
                <View style={{ width: 100 }}>
                  <Text style={styles.fieldLabel}>Quantity</Text>
                  <TextInput style={styles.modalInput} value={dispQty} onChangeText={setDispQty} keyboardType="numeric" />
                </View>
                <View style={{ width: 100 }}>
                  <Text style={styles.fieldLabel}>Unit Price ($)</Text>
                  <TextInput style={styles.modalInput} value={dispPrice} onChangeText={setDispPrice} keyboardType="numeric" />
                </View>
              </View>
              <Text style={{ fontSize: 11, color: colors.textMuted, fontStyle: 'italic', marginTop: 4 }}>
                Dispensing will automatically deduct the quantity from active batch inventory and record audit trail.
              </Text>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDispenseModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: colors.success }]} 
                onPress={handleDispense}
                disabled={dispensing}
              >
                {dispensing ? <ActivityIndicator color={colors.textWhite} /> : <Text style={styles.submitBtnText}>Confirm Dispense</Text>}
              </TouchableOpacity>
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
    padding: 24,
    backgroundColor: colors.background,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  alertBannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.danger,
    letterSpacing: 0.5,
  },
  alertBannerText: {
    fontSize: 11,
    color: colors.textPrimary,
    marginTop: 2,
  },
  mainCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitleText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  tabBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 12,
    marginBottom: 16,
  },
  tabButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabBtnTextActive: {
    color: colors.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    width: 280,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 12,
    color: colors.textPrimary,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tHead: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  th: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  tRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
  codeText: {
    width: 120,
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  medBrandText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  medGenericText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metaText: {
    width: 150,
    fontSize: 11,
    color: colors.textSecondary,
  },
  priceText: {
    width: 100,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reorderText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusPillHealthy: {
    backgroundColor: colors.successLight,
  },
  statusPillLow: {
    backgroundColor: colors.dangerLight,
  },
  statusPillExpiring: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  batchNumText: {
    width: 130,
    fontSize: 12,
    fontWeight: '800',
    color: colors.secondary,
  },
  expiryDateText: {
    width: 140,
    fontSize: 12,
    color: colors.textPrimary,
  },
  patientName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  uhidMeta: {
    fontSize: 10,
    color: colors.textMuted,
  },
  medChoicePill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  medChoicePillActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  medChoicePillText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  medChoicePillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: 500,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 12,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 14,
    marginTop: 14,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  submitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  submitBtnText: {
    fontSize: 12,
    color: colors.textWhite,
    fontWeight: '700',
  },
});

