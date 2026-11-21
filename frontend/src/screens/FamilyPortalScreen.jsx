import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { apiFetch } from '../api/client';
import { HeartHandshake, ShieldCheck, Clock, Send, MessageSquare, CheckCircle, RefreshCw } from 'lucide-react';

export const FamilyPortalScreen = ({ currentPersona, activeClient }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const clientId = activeClient?.id || 1;

  useEffect(() => {
    loadFamilyData();
  }, [clientId]);

  const loadFamilyData = async () => {
    try {
      setLoading(true);
      const [timelineData, messagesData] = await Promise.all([
        apiFetch(`/clients/${clientId}/timeline?familyOnly=true`).catch(() => []),
        apiFetch(`/messages?clientId=${clientId}`).catch(() => [])
      ]);
      setTimeline(timelineData || []);
      setChatLog(messagesData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      const savedMsg = await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify({
          clientId: clientId,
          senderUsername: currentPersona.id,
          senderName: currentPersona.name,
          senderRole: currentPersona.role,
          recipientRole: currentPersona.role === 'FAMILY_MEMBER' ? 'CARE_MANAGER' : 'FAMILY_MEMBER',
          content: message
        })
      });
      setChatLog([...chatLog, savedMsg]);
      setMessage('');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.iconCircle}>
              <HeartHandshake size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.title}>Family Engagement & Transparency Portal</Text>
              <Text style={styles.subtitle}>
                Authorised care transparency, visit verification, and real-time messaging with care coordinators.
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadFamilyData}>
            <RefreshCw size={14} color={colors.primaryDark} />
            <Text style={styles.refreshText}>Sync Feed</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainLayout}>
        {/* Left Column: Authorized Care Timeline */}
        <View style={styles.leftCol}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Client Care Activity Feed ({activeClient?.firstName} {activeClient?.lastName})</Text>
            <Text style={styles.panelSubtitle}>Permitted care notes, completed visits, and vital signs</Text>

            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <View style={styles.timelineList}>
                {timeline.map((ev, idx) => (
                  <View key={ev.id || idx} style={styles.timelineItem}>
                    <View style={styles.bullet} />
                    <View style={styles.timelineCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.evTitle}>{ev.title}</Text>
                        <Text style={styles.evTime}>
                          {ev.eventTimestamp ? new Date(ev.eventTimestamp).toLocaleTimeString() : 'Today'}
                        </Text>
                      </View>
                      <Text style={styles.evDesc}>{ev.description}</Text>
                      <Text style={styles.evAuthor}>Signed by carer: {ev.recordedBy}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Right Column: Secure Family Messaging from Database */}
        <View style={styles.rightCol}>
          <View style={styles.panel}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MessageSquare size={16} color={colors.primary} />
              <Text style={styles.panelTitle}>Direct Care Team Messaging</Text>
            </View>

            <View style={styles.chatBox}>
              {chatLog.map((c, idx) => (
                <View key={c.id || idx} style={styles.chatBubble}>
                  <Text style={styles.chatSender}>{c.senderName} ({c.senderRole})</Text>
                  <Text style={styles.chatText}>{c.content}</Text>
                  <Text style={styles.chatTime}>
                    {c.sentAt ? new Date(c.sentAt).toLocaleTimeString() : 'Recently'}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Message care team..."
                value={message}
                onChangeText={setMessage}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                <Send size={15} color={colors.textWhite} />
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
  headerCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  iconCircle: {
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
    color: colors.secondary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  mainLayout: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: 1.8,
    minWidth: 340,
  },
  rightCol: {
    flex: 1.2,
    minWidth: 300,
  },
  panel: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
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
    marginBottom: 16,
  },
  timelineList: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primaryLight,
    paddingLeft: 16,
    marginLeft: 8,
    gap: 14,
  },
  timelineItem: {
    position: 'relative',
  },
  bullet: {
    position: 'absolute',
    left: -22,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  timelineCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    gap: 4,
  },
  evTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  evTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  evDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  evAuthor: {
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '600',
    marginTop: 4,
  },
  chatBox: {
    gap: 10,
    marginBottom: 14,
    maxHeight: 400,
  },
  chatBubble: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chatSender: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  chatText: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  chatTime: {
    fontSize: 9,
    color: colors.textMuted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
