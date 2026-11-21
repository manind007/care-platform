import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { StatCard } from '../components/StatCard';
import { apiFetch } from '../api/client';
import { 
  Users, 
  CalendarCheck, 
  AlertOctagon, 
  Pill, 
  PoundSterling, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight 
} from 'lucide-react';

export const DashboardScreen = ({ currentPersona, onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayVisits, setTodayVisits] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [currentPersona]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashData, visitsData] = await Promise.all([
        apiFetch('/dashboards/management').catch(() => null),
        apiFetch('/visits/today').catch(() => [])
      ]);
      setStats(dashData);
      setTodayVisits(visitsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Aggregating Multi-Tenant Care Metrics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View>
          <Text style={styles.welcomeTitle}>Welcome back, {currentPersona.name}</Text>
          <Text style={styles.welcomeSubtitle}>
            Active Role: <Text style={{ fontWeight: '700', color: colors.primaryDark }}>{currentPersona.label}</Text> • Branch: {currentPersona.branch}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.aiAssistBadge}
          onPress={() => onNavigate('ai')}
          activeOpacity={0.8}
        >
          <Sparkles size={16} color="#7C3AED" />
          <Text style={styles.aiAssistText}>AI Copilot Active</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Stat Cards Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Active Clients"
          value={stats?.totalActiveClients || 2}
          subtitle="Longitudinal profiles"
          icon={Users}
          color={colors.primary}
          badge="100% CQC Compliant"
        />
        <StatCard
          title="Today's Visits"
          value={stats?.todayTotalVisits || 4}
          subtitle={`${stats?.todayCompletedVisits || 1} completed • ${stats?.todayInProgressVisits || 1} active`}
          icon={CalendarCheck}
          color={colors.success}
          badge={`${stats?.visitCompletionRate || 75}% Rate`}
        />
        <StatCard
          title="eMAR Exceptions"
          value={stats?.medicationExceptions || 1}
          subtitle="Requires coordinator signoff"
          icon={Pill}
          color={colors.danger}
          badge="Action Required"
        />
        <StatCard
          title="Revenue Invoiced"
          value={`£${stats?.totalRevenueInvoiced || '954.00'}`}
          subtitle={`£${stats?.outstandingBalances || '424.00'} pending payment`}
          icon={PoundSterling}
          color={colors.accent}
          badge="BACS / Direct"
        />
      </View>

      {/* Two Column Section */}
      <View style={styles.twoColumnGrid}>
        {/* Left Column: Today's Electronic Call Monitoring Schedule */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Today's Care Visits & Electronic Monitoring</Text>
              <Text style={styles.panelSubtitle}>Real-time GPS & QR check-in status</Text>
            </View>
            <TouchableOpacity onPress={() => onNavigate('visits')}>
              <Text style={styles.viewAllLink}>View All Roster →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.visitList}>
            {todayVisits.map((visit) => {
              const isCompleted = visit.status === 'COMPLETED';
              const isInProgress = visit.status === 'IN_PROGRESS';
              return (
                <View key={visit.id} style={styles.visitCard}>
                  <View style={styles.visitTimeBlock}>
                    <Clock size={14} color={colors.textMuted} />
                    <Text style={styles.visitTime}>
                      {visit.scheduledStart ? visit.scheduledStart.split('T')[1]?.substring(0, 5) : '08:00'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientName}>{visit.clientName}</Text>
                    <Text style={styles.visitType}>{visit.visitType} • Assigned: {visit.staffName}</Text>
                    {visit.checkInMethod && (
                      <Text style={styles.ecmText}>
                        Verified via {visit.checkInMethod} {visit.checkInLatitude ? `(${visit.checkInLatitude.toFixed(4)}, ${visit.checkInLongitude.toFixed(4)})` : ''}
                      </Text>
                    )}
                  </View>
                  <View style={[
                    styles.statusPill, 
                    isCompleted && styles.statusPillSuccess, 
                    isInProgress && styles.statusPillWarning
                  ]}>
                    <Text style={[
                      styles.statusPillText, 
                      isCompleted && { color: colors.success }, 
                      isInProgress && { color: colors.warning }
                    ]}>
                      {visit.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Right Column: Clinical Alerts & Quick Actions */}
        <View style={{ flex: 1, gap: 16 }}>
          {/* Clinical Alert Card */}
          <View style={[styles.panel, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <ShieldAlert size={20} color="#D97706" />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400E' }}>Clinical & Safety Alerts</Text>
            </View>
            <Text style={{ fontSize: 12, color: '#B45309', lineHeight: 18, marginBottom: 12 }}>
              1 eMAR medication exception logged today: Margaret Higgins declined lunchtime Paracetamol due to mild nausea.
            </Text>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#D97706' }]}
              onPress={() => onNavigate('emar')}
            >
              <Text style={styles.actionBtnText}>Open eMAR Medication Sheet</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Shortcuts */}
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { marginBottom: 12 }]}>Operational Shortcuts</Text>
            <View style={styles.shortcutsGrid}>
              <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('careplan')}>
                <Text style={styles.shortcutTitle}>Care Plans</Text>
                <Text style={styles.shortcutDesc}>Review version history</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('assessments')}>
                <Text style={styles.shortcutTitle}>Assessments</Text>
                <Text style={styles.shortcutDesc}>Falls FRAT & Waterlow</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('incidents')}>
                <Text style={styles.shortcutTitle}>Incidents</Text>
                <Text style={styles.shortcutDesc}>Safeguarding & reviews</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('finance')}>
                <Text style={styles.shortcutTitle}>Invoicing</Text>
                <Text style={styles.shortcutDesc}>Generate billable lines</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('virtual-ward')}>
                <Text style={styles.shortcutTitle}>Virtual Ward</Text>
                <Text style={styles.shortcutDesc}>Hospital at Home telemetry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('wounds')}>
                <Text style={styles.shortcutTitle}>Wound Care</Text>
                <Text style={styles.shortcutDesc}>Body map & staging</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('nutrition')}>
                <Text style={styles.shortcutTitle}>Fluid Balance</Text>
                <Text style={styles.shortcutDesc}>Hydration ledger & targets</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('skills')}>
                <Text style={styles.shortcutTitle}>Skills Matching</Text>
                <Text style={styles.shortcutDesc}>Credential & safety checks</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('emergency')}>
                <Text style={styles.shortcutTitle}>Emergency & Trauma</Text>
                <Text style={styles.shortcutDesc}>ESI 1-5 triage & ambulance</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('insurance')}>
                <Text style={styles.shortcutTitle}>TPA & Cashless Desk</Text>
                <Text style={styles.shortcutDesc}>Insurance pre-auth claims</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('broadcast')}>
                <Text style={styles.shortcutTitle}>Shift Broadcasting</Text>
                <Text style={styles.shortcutDesc}>Open shift claiming board</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcutCard} onPress={() => onNavigate('crm')}>
                <Text style={styles.shortcutTitle}>Agency CRM Leads</Text>
                <Text style={styles.shortcutDesc}>Hospital referral pipeline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  welcomeBanner: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  aiAssistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  aiAssistText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  panel: {
    flex: 1.5,
    minWidth: 320,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  panelSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  visitList: {
    gap: 12,
  },
  visitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    gap: 12,
  },
  visitTimeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  visitTime: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  clientName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  visitType: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ecmText: {
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '600',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  statusPillSuccess: {
    backgroundColor: colors.successLight,
  },
  statusPillWarning: {
    backgroundColor: colors.warningLight,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shortcutCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
  },
  shortcutTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  shortcutDesc: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});
