import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { apiFetch } from '../api/client';
import { ShieldCheck, Lock, Activity, User, Download, Filter } from 'lucide-react';

export const AuditScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    loadAuditEvents();
  }, []);

  const loadAuditEvents = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/audit');
      setEvents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(events, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CQC-Compliance-Evidence-Pack-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('Compliance Evidence Pack exported successfully as JSON!');
  };

  const filteredEvents = filterType === 'ALL' 
    ? events 
    : events.filter(e => e.resourceType?.toUpperCase().includes(filterType) || e.actionType?.toUpperCase().includes(filterType));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.shieldIcon}>
              <ShieldCheck size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.title}>Tamper-Evident Audit Event Trail</Text>
              <Text style={styles.subtitle}>
                Immutable cryptographic event logs recording who performed sensitive actions, timestamps, and state transitions.
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.exportBtn}
            onPress={handleExportJson}
            activeOpacity={0.8}
          >
            <Download size={15} color={colors.textWhite} />
            <Text style={styles.exportBtnText}>Export Evidence Pack (JSON)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filterCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Filter size={14} color={colors.textMuted} />
          <Text style={styles.filterLabel}>FILTER RESOURCE:</Text>
          {['ALL', 'CAREPLAN', 'MEDICATION', 'VISIT', 'INVOICE', 'INCIDENT'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filterType === f && styles.filterChipActive]}
              onPress={() => setFilterType(f)}
            >
              <Text style={[styles.filterChipText, filterType === f && styles.filterChipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{ fontSize: 11, color: colors.textMuted }}>
          Showing {filteredEvents.length} of {events.length} immutable events
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.auditTable}>
          {filteredEvents.map((ev) => (
            <View key={ev.id} style={styles.auditRow}>
              <View style={styles.leftCol}>
                <View style={styles.actionPill}>
                  <Text style={styles.actionPillText}>{ev.actionType}</Text>
                </View>
                <Text style={styles.timeText}>
                  {ev.createdAt ? new Date(ev.createdAt).toLocaleString() : 'Just now'}
                </Text>
              </View>

              <View style={styles.midCol}>
                <Text style={styles.descText}>{ev.description}</Text>
                <Text style={styles.resourceTag}>Resource: {ev.resourceType} #{ev.resourceId}</Text>
              </View>

              <View style={styles.rightCol}>
                <View style={styles.actorRow}>
                  <User size={12} color={colors.textMuted} />
                  <Text style={styles.actorText}>{ev.actorUsername} ({ev.actorRole})</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{ev.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
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
    gap: 16,
  },
  headerCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  shieldIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportBtnText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  filterCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  auditTable: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  auditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 16,
    flexWrap: 'wrap',
  },
  leftCol: {
    minWidth: 160,
    gap: 4,
  },
  actionPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actionPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  midCol: {
    flex: 2,
    minWidth: 240,
    gap: 4,
  },
  descText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  resourceTag: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  rightCol: {
    minWidth: 160,
    alignItems: 'flex-end',
    gap: 4,
  },
  actorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actorText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
});
