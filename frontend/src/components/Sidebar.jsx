import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Pill, 
  ClipboardCheck, 
  FileText, 
  AlertTriangle, 
  HeartHandshake, 
  CreditCard, 
  Bot, 
  ShieldCheck,
  Building2,
  Stethoscope,
  Bed,
  FlaskConical,
  Package,
  Scissors,
  Activity,
  Radio,
  Crosshair,
  Droplet,
  Award,
  Flame,
  TrendingUp
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab, userRole }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ALL'] },
    { id: 'ehr', label: 'EHR & Patient Chart (360°)', icon: Activity, badge: 'Epic EHR', roles: ['ALL'] },
    { id: 'opd', label: 'Outpatient (OPD) & Clinics', icon: Stethoscope, badge: 'Active', roles: ['ALL'] },
    { id: 'emergency', label: 'Emergency & Trauma (ER)', icon: Flame, badge: 'ESI 1-5', roles: ['ALL'] },
    { id: 'ipd', label: 'Inpatient (IPD) & Bed Matrix', icon: Bed, roles: ['ALL'] },
    { id: 'virtual-ward', label: 'Virtual Ward (HaH)', icon: Radio, badge: 'Remote Bed', roles: ['ALL'] },
    { id: 'diagnostics', label: 'Diagnostics & Pathology', icon: FlaskConical, roles: ['ALL'] },
    { id: 'pharmacy', label: 'Pharmacy & Drug Inventory', icon: Package, badge: 'Stock', roles: ['ALL'] },
    { id: 'hospital', label: 'OT & Blood Bank', icon: Scissors, roles: ['ALL'] },
    { id: 'visits', label: 'Visits & Rostering (ECM)', icon: CalendarDays, roles: ['ALL'] },
    { id: 'broadcast', label: 'Open Shift Broadcasting', icon: Radio, badge: 'Open Shifts', roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER', 'CARE_COORDINATOR', 'CARE_WORKER'] },
    { id: 'crm', label: 'Agency CRM & Leads', icon: TrendingUp, badge: 'Pipeline', roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER', 'CARE_COORDINATOR'] },
    { id: 'skills', label: 'Staff Skills & Matching', icon: Award, badge: 'Safe Match', roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER', 'CARE_COORDINATOR'] },
    { id: 'clients', label: 'Clients & Profiles (UHID)', icon: Users, roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER', 'CARE_COORDINATOR', 'CARE_WORKER', 'AUDIT_TEAM'] },
    { id: 'emar', label: 'Medication & eMAR', icon: Pill, badge: '28-Day MAR', roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER', 'CARE_COORDINATOR', 'CARE_WORKER'] },
    { id: 'wounds', label: 'Wound Care & Body Map', icon: Crosshair, badge: 'Staging', roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER', 'CARE_COORDINATOR', 'CARE_WORKER', 'AUDIT_TEAM'] },
    { id: 'nutrition', label: 'Hydration & Fluid Balance', icon: Droplet, badge: '24h Ledger', roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER', 'CARE_COORDINATOR', 'CARE_WORKER', 'AUDIT_TEAM'] },
    { id: 'careplan', label: 'Person-Centred Care Plans', icon: ClipboardCheck, roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER', 'CARE_COORDINATOR', 'CARE_WORKER', 'FAMILY_MEMBER'] },
    { id: 'assessments', label: 'Clinical Assessments', icon: FileText, roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER', 'CARE_COORDINATOR', 'CARE_WORKER', 'AUDIT_TEAM'] },
    { id: 'incidents', label: 'Incidents & Safeguarding', icon: AlertTriangle, badge: '1 Active', roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER', 'CARE_COORDINATOR', 'CARE_WORKER', 'AUDIT_TEAM'] },
    { id: 'family', label: 'Family Engagement Portal', icon: HeartHandshake, roles: ['ALL'] },
    { id: 'finance', label: 'Finance & Invoicing', icon: CreditCard, roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'FINANCE_ADMIN'] },
    { id: 'insurance', label: 'TPA & Cashless Desk', icon: ShieldCheck, badge: 'Pre-Auth', roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'FINANCE_ADMIN', 'CARE_MANAGER'] },
    { id: 'ai', label: 'AI Operations Assistant', icon: Bot, badge: 'Assistive', roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER', 'CARE_COORDINATOR', 'CARE_WORKER'] },
    { id: 'audit', label: 'Audit Trail & Compliance', icon: ShieldCheck, roles: ['PLATFORM_ADMIN', 'ORG_ADMIN', 'AUDIT_TEAM', 'CARE_MANAGER'] },
    { id: 'organisation', label: 'Organisation & Branches', icon: Building2, roles: ['PLATFORM_ADMIN', 'ORG_ADMIN'] }
  ];

  const visibleItems = navItems.filter(item => {
    if (item.roles.includes('ALL')) return true;
    return item.roles.includes(userRole);
  });

  return (
    <View style={styles.sidebarContainer}>
      <Text style={styles.sectionHeader}>NAVIGATION MENU</Text>
      <ScrollView style={{ flex: 1 }}>
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.navButton, isActive && styles.navButtonActive]}
              onPress={() => onSelectTab(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                <Icon size={18} color={isActive ? colors.primary : colors.textSecondary} />
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
              {item.badge && (
                <View style={[styles.itemBadge, item.badge.includes('Active') && { backgroundColor: colors.dangerLight }]}>
                  <Text style={[styles.itemBadgeText, item.badge.includes('Active') && { color: colors.danger }]}>
                    {item.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer Info */}
      <View style={styles.sidebarFooter}>
        <Text style={styles.footerBrand}>Integrated Care Platform</Text>
        <Text style={styles.footerVersion}>v1.0.0 • Java 21 + React Native</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    width: 270,
    backgroundColor: colors.cardBg,
    borderRightWidth: 1,
    borderRightColor: colors.cardBorder,
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  navButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  iconWrapper: {
    marginRight: 12,
  },
  iconWrapperActive: {},
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
  },
  navLabelActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  itemBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  sidebarFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingHorizontal: 12,
  },
  footerBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  footerVersion: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});
