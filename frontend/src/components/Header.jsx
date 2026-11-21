import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Building2, Shield, Wifi, WifiOff, Bell, UserCircle2, LogOut } from 'lucide-react';

export const Header = ({ 
  currentPersona, 
  onSelectPersona, 
  personas = [], 
  currentTenant, 
  onSelectTenant, 
  organisations = [], 
  tenants = [],
  isOnline = true,
  onLogout
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = React.useState(false);
  const [showTenantMenu, setShowTenantMenu] = React.useState(false);

  const orgName = organisations.find(o => o.tenantId === currentTenant)?.name 
    || tenants.find(t => t.tenantId === currentTenant)?.name 
    || currentTenant;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Building2 size={20} color={colors.textWhite} />
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>Care Platform</Text>
            <View style={styles.enterpriseBadge}>
              <Text style={styles.enterpriseText}>MULTI-TENANT</Text>
            </View>
          </View>
          <Text style={styles.brandSubtitle}>Integrated Digital Care Management</Text>
        </View>
      </View>

      {/* Right controls */}
      <View style={styles.controlsRow}>
        {/* Real-Time Sync Status */}
        <View style={[styles.statusPill, isOnline ? styles.onlinePill : styles.offlinePill]}>
          {isOnline ? <Wifi size={13} color={colors.success} /> : <WifiOff size={13} color={colors.danger} />}
          <Text style={[styles.statusText, { color: isOnline ? colors.success : colors.danger }]}>
            {isOnline ? 'Online (API Connected)' : 'Offline Mode'}
          </Text>
        </View>

        {/* Tenant / Organisation Selector Dropdown */}
        <View style={{ position: 'relative' }}>
          <TouchableOpacity 
            style={styles.tenantPill}
            onPress={() => setShowTenantMenu(!showTenantMenu)}
            activeOpacity={0.8}
          >
            <Shield size={14} color={colors.primary} />
            <View>
              <Text style={styles.tenantText}>{orgName}</Text>
              <Text style={{ fontSize: 9, color: colors.textMuted }}>{currentTenant}</Text>
            </View>
            <Text style={{ fontSize: 10, color: colors.textMuted, marginLeft: 4 }}>▼</Text>
          </TouchableOpacity>

          {showTenantMenu && (
            <View style={[styles.personaDropdown, { width: 280, right: 'auto', left: 0 }]}>
              <Text style={styles.dropdownHeader}>SWITCH MULTI-TENANT REALM</Text>
              {tenants && tenants.length > 0 ? (
                tenants.map((t) => {
                  const isSelected = currentTenant === t.tenantId;
                  return (
                    <TouchableOpacity
                      key={t.tenantId}
                      style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                      onPress={() => {
                        onSelectTenant(t.tenantId);
                        setShowTenantMenu(false);
                      }}
                    >
                      <View style={[styles.avatarCircleSmall, isSelected && { backgroundColor: colors.primary }]}>
                        <Building2 size={14} color={isSelected ? colors.textWhite : colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{t.name}</Text>
                        <Text style={styles.itemRole}>{t.tenantId} • {t.subscriptionTier}</Text>
                      </View>
                      {isSelected && <View style={styles.activeDot} />}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={{ padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>No tenants available</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Dynamic Persona Switcher */}
        <View style={{ position: 'relative' }}>
          <TouchableOpacity 
            style={styles.personaButton}
            onPress={() => setShowPersonaMenu(!showPersonaMenu)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{currentPersona?.avatar || 'U'}</Text>
            </View>
            <View style={styles.personaInfo}>
              <Text style={styles.personaName}>{currentPersona?.name || 'Loading...'}</Text>
              <Text style={styles.personaRole}>{currentPersona?.label || 'Stakeholder'}</Text>
            </View>
            <Text style={{ fontSize: 10, color: colors.textMuted, marginLeft: 6 }}>▼</Text>
          </TouchableOpacity>

          {showPersonaMenu && (
            <View style={styles.personaDropdown}>
              <Text style={styles.dropdownHeader}>SWITCH STAKEHOLDER PERSONA (LIVE DB)</Text>
              {personas.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.dropdownItem, currentPersona?.id === p.id && styles.dropdownItemActive]}
                  onPress={() => {
                    onSelectPersona(p);
                    setShowPersonaMenu(false);
                  }}
                >
                  <View style={[styles.avatarCircleSmall, currentPersona?.id === p.id && { backgroundColor: colors.primary }]}>
                    <Text style={[styles.avatarTextSmall, currentPersona?.id === p.id && { color: colors.textWhite }]}>{p.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{p.name}</Text>
                    <Text style={styles.itemRole}>{p.label}</Text>
                  </View>
                  {currentPersona?.id === p.id && (
                    <View style={styles.activeDot} />
                  )}
                </TouchableOpacity>
              ))}

              <View style={{ height: 1, backgroundColor: colors.cardBorder, marginVertical: 6 }} />
              <TouchableOpacity
                style={[styles.dropdownItem, { paddingVertical: 8 }]}
                onPress={() => {
                  setShowPersonaMenu(false);
                  if (onLogout) onLogout();
                }}
              >
                <View style={[styles.avatarCircleSmall, { backgroundColor: colors.dangerLight }]}>
                  <LogOut size={14} color={colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, { color: colors.danger }]}>Sign Out</Text>
                  <Text style={styles.itemRole}>End active session</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 70,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 100,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: -0.3,
  },
  enterpriseBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  enterpriseText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  onlinePill: {
    backgroundColor: colors.successLight,
    borderColor: '#A7F3D0',
  },
  offlinePill: {
    backgroundColor: colors.dangerLight,
    borderColor: '#FECDD3',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tenantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tenantText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  personaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  personaInfo: {
    justifyContent: 'center',
  },
  personaName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  personaRole: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.primary,
  },
  personaDropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 290,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    padding: 8,
    zIndex: 999,
  },
  dropdownHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    letterSpacing: 0.5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: colors.primaryLight,
  },
  avatarCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextSmall: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemRole: {
    fontSize: 10,
    color: colors.textMuted,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
