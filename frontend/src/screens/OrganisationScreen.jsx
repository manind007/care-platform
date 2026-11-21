import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { 
  fetchTenants, 
  createTenant, 
  updateTenant, 
  deleteTenant,
  fetchOrganisations, 
  createOrganisation, 
  updateOrganisation, 
  deleteOrganisation,
  fetchBranches, 
  createBranch, 
  updateBranch, 
  deleteBranch,
  fetchUsers, 
  createUser, 
  updateUser, 
  toggleUserStatus, 
  deleteUser,
  setTenantHeader
} from '../api/client';
import { 
  Building2, 
  GitBranch, 
  Users, 
  ShieldCheck, 
  Plus, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Power, 
  Search, 
  Key, 
  Clock, 
  ChevronRight, 
  UserPlus, 
  Shield, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const OrganisationScreen = ({ currentPersona }) => {
  // Navigation Tabs: 'tenants' | 'organisations' | 'users'
  const [activeSubTab, setActiveSubTab] = useState('organisations');

  // Live Data States
  const [tenants, setTenants] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filter States for Users
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');

  // ----------------------------------------------------
  // MODAL STATES FOR TENANT CRUD
  // ----------------------------------------------------
  const [tenantModalVisible, setTenantModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null); // null for create, object for edit
  const [tenantCode, setTenantCode] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantTier, setTenantTier] = useState('ENTERPRISE');
  const [tenantActive, setTenantActive] = useState(true);

  // ----------------------------------------------------
  // MODAL STATES FOR ORGANISATION CRUD
  // ----------------------------------------------------
  const [orgModalVisible, setOrgModalVisible] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [orgName, setOrgName] = useState('');
  const [orgRegNo, setOrgRegNo] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [orgStart, setOrgStart] = useState('07:00');
  const [orgEnd, setOrgEnd] = useState('22:00');
  const [orgTolerance, setOrgTolerance] = useState('15');

  // ----------------------------------------------------
  // MODAL STATES FOR BRANCH CRUD
  // ----------------------------------------------------
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');

  // ----------------------------------------------------
  // MODAL STATES FOR USER CRUD
  // ----------------------------------------------------
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('CARE_WORKER');
  const [userBranchId, setUserBranchId] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [tenantsData, orgsData, branchesData, usersData] = await Promise.all([
        fetchTenants().catch(() => []),
        fetchOrganisations().catch(() => []),
        fetchBranches().catch(() => []),
        fetchUsers().catch(() => [])
      ]);
      setTenants(tenantsData || []);
      setOrganisations(orgsData || []);
      setBranches(branchesData || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error loading administrative data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // TENANT CRUD ACTIONS
  // ====================================================
  const openCreateTenant = () => {
    setEditingTenant(null);
    setTenantCode('TENANT-00' + (tenants.length + 1));
    setTenantName('');
    setTenantTier('ENTERPRISE');
    setTenantActive(true);
    setTenantModalVisible(true);
  };

  const openEditTenant = (t) => {
    setEditingTenant(t);
    setTenantCode(t.tenantId);
    setTenantName(t.name);
    setTenantTier(t.subscriptionTier || 'ENTERPRISE');
    setTenantActive(t.active !== false);
    setTenantModalVisible(true);
  };

  const handleSaveTenant = async () => {
    if (!tenantName.trim()) {
      alert('Please enter a tenant display name.');
      return;
    }
    try {
      setSubmitting(true);
      if (editingTenant) {
        await updateTenant(editingTenant.id, {
          name: tenantName,
          subscriptionTier: tenantTier,
          active: tenantActive
        });
        alert(`Tenant ${tenantName} updated successfully!`);
      } else {
        await createTenant({
          tenantId: tenantCode,
          name: tenantName,
          subscriptionTier: tenantTier,
          active: tenantActive
        });
        alert(`Tenant ${tenantName} provisioned successfully!`);
      }
      setTenantModalVisible(false);
      loadAllData();
    } catch (err) {
      alert('Tenant operation failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTenant = async (t) => {
    if (!confirm(`Are you sure you want to delete or decommission tenant "${t.name}" (${t.tenantId})?`)) {
      return;
    }
    try {
      await deleteTenant(t.id);
      alert(`Tenant ${t.name} deleted.`);
      loadAllData();
    } catch (err) {
      alert('Failed to delete tenant: ' + err.message);
    }
  };

  // ====================================================
  // ORGANISATION CRUD ACTIONS
  // ====================================================
  const openCreateOrg = () => {
    setEditingOrg(null);
    setOrgName('');
    setOrgRegNo('CQC-1-' + Math.floor(100000000 + Math.random() * 900000000));
    setOrgEmail('');
    setOrgPhone('');
    setOrgAddress('');
    setOrgStart('07:00');
    setOrgEnd('22:00');
    setOrgTolerance('15');
    setOrgModalVisible(true);
  };

  const openEditOrg = (org) => {
    setEditingOrg(org);
    setOrgName(org.name || '');
    setOrgRegNo(org.registrationNumber || '');
    setOrgEmail(org.email || '');
    setOrgPhone(org.phone || '');
    setOrgAddress(org.address || '');
    setOrgStart(org.workingHoursStart || '07:00');
    setOrgEnd(org.workingHoursEnd || '22:00');
    setOrgTolerance(org.ecmToleranceMinutes ? String(org.ecmToleranceMinutes) : '15');
    setOrgModalVisible(true);
  };

  const handleSaveOrg = async () => {
    if (!orgName.trim()) {
      alert('Please enter organisation name.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        name: orgName,
        registrationNumber: orgRegNo,
        email: orgEmail,
        phone: orgPhone,
        address: orgAddress,
        timezone: 'Europe/London',
        workingHoursStart: orgStart,
        workingHoursEnd: orgEnd,
        ecmToleranceMinutes: parseInt(orgTolerance, 10) || 15
      };

      if (editingOrg) {
        await updateOrganisation(editingOrg.id, payload);
        alert(`Organisation "${orgName}" updated successfully!`);
      } else {
        await createOrganisation(payload);
        alert(`Organisation "${orgName}" created successfully!`);
      }
      setOrgModalVisible(false);
      loadAllData();
    } catch (err) {
      alert('Organisation operation failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrg = async (org) => {
    if (!confirm(`Are you sure you want to delete organisation "${org.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteOrganisation(org.id);
      alert(`Organisation ${org.name} removed.`);
      loadAllData();
    } catch (err) {
      alert('Failed to delete organisation: ' + err.message);
    }
  };

  // ====================================================
  // BRANCH CRUD ACTIONS
  // ====================================================
  const openCreateBranch = () => {
    setEditingBranch(null);
    setBranchName('');
    setBranchCode('BR-' + Math.floor(100 + Math.random() * 900));
    setBranchAddress('');
    setBranchPhone('');
    setBranchModalVisible(true);
  };

  const openEditBranch = (b) => {
    setEditingBranch(b);
    setBranchName(b.name || '');
    setBranchCode(b.code || '');
    setBranchAddress(b.address || '');
    setBranchPhone(b.phone || '');
    setBranchModalVisible(true);
  };

  const handleSaveBranch = async () => {
    if (!branchName.trim() || !branchCode.trim()) {
      alert('Please provide branch name and code.');
      return;
    }
    const targetOrgId = organisations[0]?.id || 1;
    try {
      setSubmitting(true);
      const payload = {
        name: branchName,
        code: branchCode,
        address: branchAddress,
        phone: branchPhone
      };

      if (editingBranch) {
        await updateBranch(editingBranch.id, payload);
        alert(`Branch "${branchName}" updated successfully!`);
      } else {
        await createBranch(targetOrgId, payload);
        alert(`Branch "${branchName}" registered successfully!`);
      }
      setBranchModalVisible(false);
      loadAllData();
    } catch (err) {
      alert('Branch operation failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBranch = async (b) => {
    if (!confirm(`Delete branch "${b.name}" (${b.code})?`)) return;
    try {
      await deleteBranch(b.id);
      alert(`Branch ${b.name} deleted.`);
      loadAllData();
    } catch (err) {
      alert('Failed to delete branch: ' + err.message);
    }
  };

  // ====================================================
  // USER / WORKFORCE CRUD ACTIONS
  // ====================================================
  const openCreateUser = () => {
    setEditingUser(null);
    setUserName('');
    setUserUsername('');
    setUserEmail('');
    setUserPhone('');
    setUserPassword('password123');
    setUserRole('CARE_WORKER');
    setUserBranchId(branches[0]?.id ? String(branches[0].id) : '');
    setUserModalVisible(true);
  };

  const openEditUser = (u) => {
    setEditingUser(u);
    setUserName(u.fullName || '');
    setUserUsername(u.username || '');
    setUserEmail(u.email || '');
    setUserPhone(u.phone || '');
    setUserPassword(''); // blank means keep current password
    setUserRole(u.role || 'CARE_WORKER');
    setUserBranchId(u.branchId ? String(u.branchId) : '');
    setUserModalVisible(true);
  };

  const handleSaveUser = async () => {
    if (!userName.trim() || !userEmail.trim()) {
      alert('Full name and email are required.');
      return;
    }
    if (!editingUser && !userUsername.trim()) {
      alert('Username is required for new accounts.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        fullName: userName,
        username: userUsername || undefined,
        email: userEmail,
        phone: userPhone,
        role: userRole,
        branchId: userBranchId ? parseInt(userBranchId, 10) : null,
        password: userPassword ? userPassword : (editingUser ? undefined : 'password123'),
        enabled: editingUser ? editingUser.enabled : true
      };

      if (editingUser) {
        await updateUser(editingUser.id, payload);
        alert(`Staff member ${userName} updated successfully!`);
      } else {
        await createUser(payload);
        alert(`Staff member ${userName} created with role ${userRole}!`);
      }
      setUserModalVisible(false);
      loadAllData();
    } catch (err) {
      alert('User operation failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleUser = async (u) => {
    try {
      await toggleUserStatus(u.id);
      loadAllData();
    } catch (err) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!confirm(`Are you sure you want to remove user "${u.fullName}" (@${u.username})?`)) return;
    try {
      await deleteUser(u.id);
      alert(`User ${u.fullName} deleted.`);
      loadAllData();
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const matchesSearch = !userSearch || 
      u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const availableRoles = [
    'CARE_WORKER',
    'CARE_COORDINATOR',
    'CARE_MANAGER',
    'ORG_ADMIN',
    'PLATFORM_ADMIN',
    'FINANCE_ADMIN',
    'FAMILY_MEMBER',
    'AUDIT_TEAM'
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={22} color={colors.primary} />
              <Text style={styles.title}>Administration & Governance Hub</Text>
            </View>
            <Text style={styles.subtitle}>
              Full CRUD management for Multi-Tenant Realms, CQC-Registered Provider Organisations, Operating Branches, and Workforce Users.
            </Text>
          </View>

          {/* Quick Action Button dependent on active tab */}
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {activeSubTab === 'tenants' && (
              <TouchableOpacity style={styles.addBtn} onPress={openCreateTenant} activeOpacity={0.8}>
                <Plus size={16} color={colors.textWhite} />
                <Text style={styles.addBtnText}>Provision New Tenant</Text>
              </TouchableOpacity>
            )}
            {activeSubTab === 'organisations' && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder }]} onPress={openCreateBranch} activeOpacity={0.8}>
                  <GitBranch size={16} color={colors.primaryDark} />
                  <Text style={[styles.addBtnText, { color: colors.primaryDark }]}>+ Register Branch</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={openCreateOrg} activeOpacity={0.8}>
                  <Plus size={16} color={colors.textWhite} />
                  <Text style={styles.addBtnText}>+ Add Organisation</Text>
                </TouchableOpacity>
              </View>
            )}
            {activeSubTab === 'users' && (
              <TouchableOpacity style={styles.addBtn} onPress={openCreateUser} activeOpacity={0.8}>
                <UserPlus size={16} color={colors.textWhite} />
                <Text style={styles.addBtnText}>Onboard New Staff</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Administrative Navigation Tabs */}
        <View style={styles.tabNav}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeSubTab === 'tenants' && styles.tabBtnActive]} 
            onPress={() => setActiveSubTab('tenants')}
          >
            <Layers size={16} color={activeSubTab === 'tenants' ? colors.primary : colors.textMuted} />
            <Text style={[styles.tabText, activeSubTab === 'tenants' && styles.tabTextActive]}>
              1. Tenancy Realms ({tenants.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, activeSubTab === 'organisations' && styles.tabBtnActive]} 
            onPress={() => setActiveSubTab('organisations')}
          >
            <Building2 size={16} color={activeSubTab === 'organisations' ? colors.primary : colors.textMuted} />
            <Text style={[styles.tabText, activeSubTab === 'organisations' && styles.tabTextActive]}>
              2. Organisations & Branches ({organisations.length} / {branches.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, activeSubTab === 'users' && styles.tabBtnActive]} 
            onPress={() => setActiveSubTab('users')}
          >
            <Users size={16} color={activeSubTab === 'users' ? colors.primary : colors.textMuted} />
            <Text style={[styles.tabText, activeSubTab === 'users' && styles.tabTextActive]}>
              3. User & Staff Directory ({users.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* ======================================================== */}
          {/* TAB 1: TENANCY REALMS CRUD                               */}
          {/* ======================================================== */}
          {activeSubTab === 'tenants' && (
            <View style={{ gap: 16 }}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Configured Multi-Tenant Realms</Text>
                  <Text style={styles.sectionSubheading}>
                    Isolated database partitions enforcing strict logical boundary separation per care provider group.
                  </Text>
                </View>
                <TouchableOpacity style={styles.primaryPillBtn} onPress={openCreateTenant}>
                  <Plus size={14} color={colors.textWhite} />
                  <Text style={styles.primaryPillText}>New Tenancy Realm</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tenantsGrid}>
                {tenants.map(t => (
                  <View key={t.id} style={styles.tenantCard}>
                    <View style={styles.cardHeader}>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <View style={styles.tenantIconBadge}>
                          <Shield size={18} color={colors.primary} />
                        </View>
                        <View>
                          <Text style={styles.tenantTitle}>{t.name}</Text>
                          <Text style={styles.tenantCodeTag}>{t.tenantId}</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, t.active ? styles.statusActive : styles.statusDisabled]}>
                        <Text style={[styles.statusBadgeText, t.active ? { color: colors.success } : { color: colors.danger }]}>
                          {t.active ? 'ACTIVE REALM' : 'SUSPENDED'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tenantMetaBox}>
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Subscription Tier:</Text>
                        <View style={styles.tierPill}>
                          <Sparkles size={12} color="#D97706" />
                          <Text style={styles.tierText}>{t.subscriptionTier || 'ENTERPRISE'}</Text>
                        </View>
                      </View>
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Provisioned Date:</Text>
                        <Text style={styles.metaVal}>{t.createdAt ? t.createdAt.split('T')[0] : '2026-09-01'}</Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Active Branches:</Text>
                        <Text style={styles.metaVal}>{branches.filter(b => b.tenantId === t.tenantId).length} locations</Text>
                      </View>
                    </View>

                    {/* Action Bar */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
                        onPress={() => {
                          setTenantHeader(t.tenantId);
                          alert(`Switched active tenant context to ${t.tenantId}!`);
                        }}
                      >
                        <ExternalLink size={14} color={colors.primaryDark} />
                        <Text style={[styles.actionBtnText, { color: colors.primaryDark }]}>Activate</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.editActionBtn]}
                        onPress={() => openEditTenant(t)}
                      >
                        <Edit3 size={14} color={colors.textSecondary} />
                        <Text style={styles.actionBtnText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.deleteActionBtn]}
                        onPress={() => handleDeleteTenant(t)}
                      >
                        <Trash2 size={14} color={colors.danger} />
                        <Text style={[styles.actionBtnText, { color: colors.danger }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ORGANISATIONS & BRANCHES CRUD                     */}
          {/* ======================================================== */}
          {activeSubTab === 'organisations' && (
            <View style={{ gap: 20 }}>
              {/* Organisations Section */}
              <View style={{ gap: 12 }}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionHeading}>Registered Care Provider Entities</Text>
                    <Text style={styles.sectionSubheading}>
                      CQC-regulated provider legal entities registered within this tenant realm.
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.primaryPillBtn} onPress={openCreateOrg}>
                    <Plus size={14} color={colors.textWhite} />
                    <Text style={styles.primaryPillText}>+ Add Organisation</Text>
                  </TouchableOpacity>
                </View>

                {organisations.map(org => (
                  <View key={org.id} style={styles.orgCard}>
                    <View style={styles.cardHeader}>
                      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <Building2 size={24} color={colors.primary} />
                        <View>
                          <Text style={styles.orgCardTitle}>{org.name}</Text>
                          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 2 }}>
                            <View style={styles.cqcBadge}>
                              <ShieldCheck size={12} color={colors.success} />
                              <Text style={styles.cqcText}>CQC: {org.registrationNumber || '1-987654321'}</Text>
                            </View>
                            <Text style={styles.tenantTag}>Tenant: {org.tenantId}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={[styles.actionBtn, styles.editActionBtn]} onPress={() => openEditOrg(org)}>
                          <Edit3 size={14} color={colors.textSecondary} />
                          <Text style={styles.actionBtnText}>Edit Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.deleteActionBtn]} onPress={() => handleDeleteOrg(org)}>
                          <Trash2 size={14} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.orgDetailsGrid}>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>HEADQUARTERS ADDRESS</Text>
                        <Text style={styles.infoValue}>📍 {org.address || 'Not specified'}</Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>CONTACT CHANNELS</Text>
                        <Text style={styles.infoValue}>✉️ {org.email || 'Not specified'}</Text>
                        <Text style={styles.infoValue}>📞 {org.phone || 'Not specified'}</Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>OPERATIONAL PARAMETERS</Text>
                        <Text style={styles.infoValue}>⏰ Working Hours: {org.workingHoursStart || '07:00'} - {org.workingHoursEnd || '22:00'}</Text>
                        <Text style={styles.infoValue}>🛰️ ECM Tolerance: {org.ecmToleranceMinutes || 15} minutes</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Operating Branches Section */}
              <View style={{ gap: 12 }}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionHeading}>Operational Delivery Branches ({branches.length})</Text>
                    <Text style={styles.sectionSubheading}>
                      Geographic hubs from which care workers are scheduled and rostered to visit domiciliary clients.
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.primaryPillBtn} onPress={openCreateBranch}>
                    <Plus size={14} color={colors.textWhite} />
                    <Text style={styles.primaryPillText}>+ Register Branch</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.branchesGrid}>
                  {branches.map(b => (
                    <View key={b.id} style={styles.branchCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.branchName}>{b.name}</Text>
                        <View style={styles.codeBadge}>
                          <Text style={styles.codeText}>{b.code}</Text>
                        </View>
                      </View>

                      <Text style={styles.branchAddress}>📍 {b.address}</Text>
                      <Text style={styles.branchPhone}>📞 {b.phone}</Text>

                      <View style={styles.branchFoot}>
                        <Text style={styles.branchTenantTag}>Tenant: {b.tenantId}</Text>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <TouchableOpacity style={[styles.actionBtn, styles.editActionBtn, { paddingVertical: 4, paddingHorizontal: 8 }]} onPress={() => openEditBranch(b)}>
                            <Edit3 size={12} color={colors.textSecondary} />
                            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.actionBtn, styles.deleteActionBtn, { paddingVertical: 4, paddingHorizontal: 8 }]} onPress={() => handleDeleteBranch(b)}>
                            <Trash2 size={12} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 3: USER & STAFF DIRECTORY CRUD                       */}
          {/* ======================================================== */}
          {activeSubTab === 'users' && (
            <View style={{ gap: 16 }}>
              {/* Search & Filter Toolbar */}
              <View style={styles.toolbarCard}>
                <View style={styles.searchBox}>
                  <Search size={16} color={colors.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, @username, or email..."
                    value={userSearch}
                    onChangeText={setUserSearch}
                  />
                  {userSearch ? (
                    <TouchableOpacity onPress={() => setUserSearch('')}>
                      <X size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Role Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  <TouchableOpacity
                    style={[styles.roleChip, userRoleFilter === 'ALL' && styles.roleChipActive]}
                    onPress={() => setUserRoleFilter('ALL')}
                  >
                    <Text style={[styles.roleChipText, userRoleFilter === 'ALL' && styles.roleChipTextActive]}>
                      All Roles ({users.length})
                    </Text>
                  </TouchableOpacity>
                  {availableRoles.map(role => {
                    const count = users.filter(u => u.role === role).length;
                    return (
                      <TouchableOpacity
                        key={role}
                        style={[styles.roleChip, userRoleFilter === role && styles.roleChipActive]}
                        onPress={() => setUserRoleFilter(role)}
                      >
                        <Text style={[styles.roleChipText, userRoleFilter === role && styles.roleChipTextActive]}>
                          {role.replace('_', ' ')} ({count})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Users Cards Grid */}
              <View style={styles.usersGrid}>
                {filteredUsers.map(u => (
                  <View key={u.id} style={styles.userCard}>
                    <View style={styles.userCardHeader}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.avatarLetter}>
                          {u.fullName?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userName}>{u.fullName}</Text>
                        <Text style={styles.userHandle}>@{u.username}</Text>
                      </View>
                      <View style={[
                        styles.roleBadge,
                        u.role === 'PLATFORM_ADMIN' && { backgroundColor: '#EDE9FE' },
                        u.role === 'ORG_ADMIN' && { backgroundColor: '#E0F2FE' },
                        u.role === 'CARE_MANAGER' && { backgroundColor: '#DCFCE7' },
                        u.role === 'CARE_COORDINATOR' && { backgroundColor: '#FEF3C7' },
                        u.role === 'CARE_WORKER' && { backgroundColor: '#F3E8FF' },
                        u.role === 'FINANCE_ADMIN' && { backgroundColor: '#ECFDF5' },
                        u.role === 'AUDIT_TEAM' && { backgroundColor: '#FEE2E2' }
                      ]}>
                        <Text style={[
                          styles.roleText,
                          u.role === 'PLATFORM_ADMIN' && { color: '#6D28D9' },
                          u.role === 'ORG_ADMIN' && { color: '#0369A1' },
                          u.role === 'CARE_MANAGER' && { color: '#15803D' },
                          u.role === 'CARE_COORDINATOR' && { color: '#B45309' },
                          u.role === 'CARE_WORKER' && { color: '#7E22CE' },
                          u.role === 'FINANCE_ADMIN' && { color: '#047857' },
                          u.role === 'AUDIT_TEAM' && { color: '#B91C1C' }
                        ]}>
                          {u.role?.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.userMetaBox}>
                      <Text style={styles.userMetaItem}>✉️ {u.email}</Text>
                      {u.phone && <Text style={styles.userMetaItem}>📞 {u.phone}</Text>}
                      <Text style={styles.userMetaItem}>
                        🏢 {u.branchId ? `Branch #${u.branchId}` : 'Central HQ'} • Tenant: {u.tenantId}
                      </Text>
                    </View>

                    {/* Footer Actions */}
                    <View style={styles.userFoot}>
                      <TouchableOpacity 
                        style={[styles.statusToggleBtn, u.enabled ? styles.btnActiveStatus : styles.btnInactiveStatus]}
                        onPress={() => handleToggleUser(u)}
                      >
                        <Power size={12} color={u.enabled ? colors.success : colors.danger} />
                        <Text style={[styles.statusToggleText, { color: u.enabled ? colors.success : colors.danger }]}>
                          {u.enabled ? 'ACTIVE' : 'DISABLED'}
                        </Text>
                      </TouchableOpacity>

                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity style={[styles.actionBtn, styles.editActionBtn]} onPress={() => openEditUser(u)}>
                          <Edit3 size={13} color={colors.textSecondary} />
                          <Text style={styles.actionBtnText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionBtn, styles.deleteActionBtn]} onPress={() => handleDeleteUser(u)}>
                          <Trash2 size={13} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: PROVISION / EDIT TENANT                         */}
      {/* ======================================================== */}
      <Modal visible={tenantModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Layers size={18} color={colors.primary} />
                <Text style={styles.modalTitle}>{editingTenant ? 'Edit Tenancy Realm' : 'Provision New Tenant'}</Text>
              </View>
              <TouchableOpacity onPress={() => setTenantModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <View>
                <Text style={styles.inputLabel}>TENANT IDENTIFIER CODE *</Text>
                <TextInput
                  style={[styles.textInput, editingTenant && { backgroundColor: '#F1F5F9', color: colors.textMuted }]}
                  value={tenantCode}
                  onChangeText={setTenantCode}
                  editable={!editingTenant}
                  placeholder="e.g. TENANT-003"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>ORGANISATION / GROUP DISPLAY NAME *</Text>
                <TextInput
                  style={styles.textInput}
                  value={tenantName}
                  onChangeText={setTenantName}
                  placeholder="e.g. Haven Community Care Group"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>SUBSCRIPTION TIER</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {['STANDARD', 'PROFESSIONAL', 'ENTERPRISE'].map(tier => (
                    <TouchableOpacity
                      key={tier}
                      style={[styles.selectorChip, tenantTier === tier && styles.selectorChipActive]}
                      onPress={() => setTenantTier(tier)}
                    >
                      <Text style={[styles.selectorChipText, tenantTier === tier && styles.selectorChipTextActive]}>
                        {tier}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                <Text style={styles.inputLabel}>ACTIVE TENANCY STATUS</Text>
                <TouchableOpacity 
                  style={[styles.togglePill, tenantActive ? styles.togglePillActive : styles.togglePillInactive]}
                  onPress={() => setTenantActive(!tenantActive)}
                >
                  <Text style={[styles.togglePillText, { color: tenantActive ? colors.success : colors.danger }]}>
                    {tenantActive ? 'ACTIVE' : 'SUSPENDED'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSaveTenant}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>{submitting ? 'Saving...' : (editingTenant ? 'Update Tenant' : 'Commit Provisioning')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: CREATE / EDIT ORGANISATION                      */}
      {/* ======================================================== */}
      <Modal visible={orgModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Building2 size={18} color={colors.primary} />
                <Text style={styles.modalTitle}>{editingOrg ? 'Edit Provider Organisation' : 'Register New Organisation'}</Text>
              </View>
              <TouchableOpacity onPress={() => setOrgModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 480 }} contentContainerStyle={{ gap: 12 }}>
              <View>
                <Text style={styles.inputLabel}>LEGAL ENTITY NAME *</Text>
                <TextInput
                  style={styles.textInput}
                  value={orgName}
                  onChangeText={setOrgName}
                  placeholder="e.g. Apex Domiciliary Care Ltd"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>CQC REGISTRATION NUMBER</Text>
                <TextInput
                  style={styles.textInput}
                  value={orgRegNo}
                  onChangeText={setOrgRegNo}
                  placeholder="e.g. CQC-1-987654321"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CONTACT EMAIL</Text>
                  <TextInput
                    style={styles.textInput}
                    value={orgEmail}
                    onChangeText={setOrgEmail}
                    placeholder="ops@care.example"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>TELEPHONE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={orgPhone}
                    onChangeText={setOrgPhone}
                    placeholder="+44 20 7946 0000"
                  />
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>HEADQUARTERS ADDRESS</Text>
                <TextInput
                  style={styles.textInput}
                  value={orgAddress}
                  onChangeText={setOrgAddress}
                  placeholder="e.g. 104 Harley Street, London, W1G 7JE"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>START TIME</Text>
                  <TextInput
                    style={styles.textInput}
                    value={orgStart}
                    onChangeText={setOrgStart}
                    placeholder="07:00"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>END TIME</Text>
                  <TextInput
                    style={styles.textInput}
                    value={orgEnd}
                    onChangeText={setOrgEnd}
                    placeholder="22:00"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>ECM TOLERANCE (MIN)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={orgTolerance}
                    onChangeText={setOrgTolerance}
                    placeholder="15"
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSaveOrg}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Saving...' : (editingOrg ? 'Update Details' : 'Register Organisation')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: CREATE / EDIT BRANCH                            */}
      {/* ======================================================== */}
      <Modal visible={branchModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <GitBranch size={18} color={colors.primary} />
                <Text style={styles.modalTitle}>{editingBranch ? 'Edit Operational Branch' : 'Register Operational Branch'}</Text>
              </View>
              <TouchableOpacity onPress={() => setBranchModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <View>
                <Text style={styles.inputLabel}>BRANCH NAME *</Text>
                <TextInput
                  style={styles.textInput}
                  value={branchName}
                  onChangeText={setBranchName}
                  placeholder="e.g. Central London & Westminster Branch"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>BRANCH CODE *</Text>
                <TextInput
                  style={styles.textInput}
                  value={branchCode}
                  onChangeText={setBranchCode}
                  placeholder="e.g. LON-W1"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>DISPATCH / LOCAL OFFICE ADDRESS</Text>
                <TextInput
                  style={styles.textInput}
                  value={branchAddress}
                  onChangeText={setBranchAddress}
                  placeholder="e.g. 45 Victoria Street, London, SW1H 0EU"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>DIRECT TELEPHONE</Text>
                <TextInput
                  style={styles.textInput}
                  value={branchPhone}
                  onChangeText={setBranchPhone}
                  placeholder="+44 20 7946 0915"
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSaveBranch}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>{submitting ? 'Saving...' : (editingBranch ? 'Update Branch' : 'Confirm Branch Registration')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 4: ONBOARD / EDIT USER                             */}
      {/* ======================================================== */}
      <Modal visible={userModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <UserPlus size={18} color={colors.primary} />
                <Text style={styles.modalTitle}>{editingUser ? 'Edit User Credentials & Role' : 'Onboard Care Worker / Staff'}</Text>
              </View>
              <TouchableOpacity onPress={() => setUserModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 480 }} contentContainerStyle={{ gap: 12 }}>
              <View>
                <Text style={styles.inputLabel}>FULL NAME *</Text>
                <TextInput
                  style={styles.textInput}
                  value={userName}
                  onChangeText={setUserName}
                  placeholder="e.g. Claire Henderson"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>USERNAME *</Text>
                <TextInput
                  style={[styles.textInput, editingUser && { backgroundColor: '#F1F5F9', color: colors.textMuted }]}
                  value={userUsername}
                  onChangeText={setUserUsername}
                  editable={!editingUser}
                  placeholder="e.g. claire_carer"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={userEmail}
                    onChangeText={setUserEmail}
                    placeholder="claire@apexcare.example"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                  <TextInput
                    style={styles.textInput}
                    value={userPhone}
                    onChangeText={setUserPhone}
                    placeholder="+44 7700 900331"
                  />
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>PASSWORD {editingUser ? '(Leave blank to keep unchanged)' : '*'}</Text>
                <TextInput
                  style={styles.textInput}
                  value={userPassword}
                  onChangeText={setUserPassword}
                  placeholder="password123"
                  secureTextEntry
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>ASSIGNED RBAC ROLE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {availableRoles.map(r => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.selectorChip, userRole === r && styles.selectorChipActive]}
                      onPress={() => setUserRole(r)}
                    >
                      <Text style={[styles.selectorChipText, userRole === r && styles.selectorChipTextActive]}>
                        {r.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View>
                <Text style={styles.inputLabel}>ASSIGNED BRANCH LOCATION</Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {branches.map(b => (
                    <TouchableOpacity
                      key={b.id}
                      style={[styles.selectorChip, userBranchId === String(b.id) && styles.selectorChipActive]}
                      onPress={() => setUserBranchId(String(b.id))}
                    >
                      <Text style={[styles.selectorChipText, userBranchId === String(b.id) && styles.selectorChipTextActive]}>
                        {b.name} ({b.code})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSaveUser}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Saving User...' : (editingUser ? 'Update Staff Member' : 'Complete Staff Onboarding')}</Text>
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
    gap: 16,
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
    maxWidth: 700,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  tabNav: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 14,
    flexWrap: 'wrap',
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionSubheading: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  primaryPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textWhite,
  },
  tenantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tenantCard: {
    flex: 1,
    minWidth: 320,
    maxWidth: 480,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tenantIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tenantTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tenantCodeTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: colors.successLight,
  },
  statusDisabled: {
    backgroundColor: colors.dangerLight,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tenantMetaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  editActionBtn: {
    backgroundColor: '#F8FAFC',
  },
  deleteActionBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  orgCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    gap: 14,
  },
  orgCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cqcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cqcText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  tenantTag: {
    fontSize: 11,
    color: colors.textMuted,
  },
  orgDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
  },
  infoCol: {
    flex: 1,
    minWidth: 220,
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
    fontWeight: '500',
  },
  branchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  branchCard: {
    flex: 1,
    minWidth: 280,
    maxWidth: 420,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    gap: 8,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  codeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  branchAddress: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  branchPhone: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  branchFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 4,
  },
  branchTenantTag: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  toolbarCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  roleChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  roleChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  usersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  userCard: {
    flex: 1,
    minWidth: 320,
    maxWidth: 440,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    gap: 10,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userHandle: {
    fontSize: 11,
    color: colors.textMuted,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  userMetaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    gap: 3,
  },
  userMetaItem: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  userFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btnActiveStatus: {
    backgroundColor: colors.successLight,
  },
  btnInactiveStatus: {
    backgroundColor: colors.dangerLight,
  },
  statusToggleText: {
    fontSize: 10,
    fontWeight: '800',
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
    maxWidth: 500,
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
  selectorChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selectorChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  selectorChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  selectorChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  togglePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  togglePillActive: {
    backgroundColor: colors.successLight,
  },
  togglePillInactive: {
    backgroundColor: colors.dangerLight,
  },
  togglePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
});
