import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { Building2, Shield, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { login } from '../api/client';

export const LoginScreen = ({ 
  onLoginSuccess, 
  tenants = [], 
  personas = [], 
  currentTenant, 
  onSelectTenant 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(currentTenant || (tenants.length > 0 ? tenants[0].tenantId : 'TENANT-001'));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);

  // Sync selectedTenant with parent if it changes
  React.useEffect(() => {
    if (currentTenant) {
      setSelectedTenant(currentTenant);
    } else if (tenants.length > 0) {
      setSelectedTenant(tenants[0].tenantId);
    } else {
      setSelectedTenant('TENANT-001');
    }
  }, [currentTenant, tenants]);

  const handleTenantChange = (tenantId) => {
    setSelectedTenant(tenantId);
    if (onSelectTenant) {
      onSelectTenant(tenantId);
    }
  };

  const handlePersonaQuickFill = (persona) => {
    setUsername(persona.id);
    setPassword('password123');
    setSelectedPersonaId(persona.id);
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      setErrorMessage('Please enter your username');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await login(username.trim(), password, selectedTenant);
      
      // Match with persona details if available for avatar/label UI
      const matchingPersona = personas.find(p => p.id === username.trim()) || {
        id: response.username,
        name: response.fullName || response.username,
        role: response.role,
        label: response.role.replace('_', ' '),
        avatar: response.fullName ? response.fullName.substring(0, 2).toUpperCase() : 'US'
      };

      onLoginSuccess(response, matchingPersona);
    } catch (err) {
      console.error('Login failed:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials and tenant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Graphic Accents */}
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <View style={styles.contentWrapper}>
        {/* Left Informational Showcase (Visible on Desktop / Tablets) */}
        <View style={styles.showcasePanel}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Building2 size={24} color={colors.textWhite} />
            </View>
            <View>
              <Text style={styles.brandTitle}>Care Platform</Text>
              <Text style={styles.brandSubtitle}>Integrated Digital Care Platform</Text>
            </View>
          </View>

          <View style={styles.showcaseHero}>
            <Text style={styles.showcaseHeading}>
              Enterprise Clinical Care & Safeguarding Operations
            </Text>
            <Text style={styles.showcaseDescription}>
              Unified multi-tenant solution delivering compliant electronic medication administration (eMAR), 
              electronic call monitoring (ECM), person-centred care plans, and real-time CQC compliance audits.
            </Text>
          </View>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <CheckCircle2 size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.featureTitle}>Strict Multi-Tenant Realm Isolation</Text>
                <Text style={styles.featureSubtitle}>Dynamic cryptographic tenancy with scoped data access</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <CheckCircle2 size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.featureTitle}>Role-Based Access Control (RBAC)</Text>
                <Text style={styles.featureSubtitle}>Specialized interfaces for Care Managers, Workers, Families & Auditors</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <CheckCircle2 size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.featureTitle}>Audit Trail & CQC Compliance</Text>
                <Text style={styles.featureSubtitle}>Immutable logging for all clinical interactions and medication rounds</Text>
              </View>
            </View>
          </View>

          <View style={styles.complianceBadgeRow}>
            <View style={styles.complianceBadge}>
              <Shield size={12} color={colors.success} />
              <Text style={styles.complianceText}>CQC Regulated</Text>
            </View>
            <View style={styles.complianceBadge}>
              <Lock size={12} color={colors.primary} />
              <Text style={styles.complianceText}>JWT & 256-Bit TLS</Text>
            </View>
            <View style={styles.complianceBadge}>
              <Text style={styles.complianceText}>ISO 27001 Ready</Text>
            </View>
          </View>
        </View>

        {/* Right Authentication Card */}
        <View style={styles.authCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>Authenticate with your organisation credentials</Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color={colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Tenant Realm Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ORGANISATION REALM (TENANT)</Text>
            <View style={styles.tenantPickerRow}>
              {tenants.map((t) => {
                const isSelected = selectedTenant === t.tenantId;
                return (
                  <TouchableOpacity
                    key={t.tenantId}
                    style={[styles.tenantChip, isSelected && styles.tenantChipActive]}
                    onPress={() => handleTenantChange(t.tenantId)}
                    activeOpacity={0.8}
                  >
                    <Building2 size={14} color={isSelected ? colors.primaryDark : colors.textMuted} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.tenantChipTitle, isSelected && styles.tenantChipTitleActive]}>
                        {t.name}
                      </Text>
                      <Text style={styles.tenantChipMeta}>
                        {t.tenantId} • {t.subscriptionTier}
                      </Text>
                    </View>
                    {isSelected && <View style={styles.activePillDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>USERNAME / EMAIL</Text>
            <View style={styles.inputContainer}>
              <User size={16} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter username (e.g. manager_sarah)"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <Text style={styles.hintText}>Default: password123</Text>
            </View>
            <View style={styles.inputContainer}>
              <Lock size={16} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="Enter password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={16} color={colors.textMuted} />
                ) : (
                  <Eye size={16} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textWhite} />
            ) : (
              <View style={styles.submitBtnContent}>
                <Text style={styles.submitButtonText}>Sign In to Platform</Text>
                <ArrowRight size={16} color={colors.textWhite} />
              </View>
            )}
          </TouchableOpacity>

          {/* Quick Persona Selector */}
          {personas && personas.length > 0 && (
            <View style={styles.quickAccessSection}>
              <Text style={styles.quickAccessHeader}>QUICK SELECT STAKEHOLDER DEMO ACCOUNT</Text>
              <View style={styles.personasGrid}>
                {personas.slice(0, 6).map((p) => {
                  const isFilled = selectedPersonaId === p.id && username === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.personaChip, isFilled && styles.personaChipActive]}
                      onPress={() => handlePersonaQuickFill(p)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.avatarMini, isFilled && { backgroundColor: colors.primary }]}>
                        <Text style={[styles.avatarMiniText, isFilled && { color: colors.textWhite }]}>
                          {p.avatar}
                        </Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.personaChipName} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text style={styles.personaChipRole} numberOfLines={1}>
                          {p.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B', // Deep clinical navy background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlowTop: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    filter: 'blur(80px)',
  },
  bgGlowBottom: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    filter: 'blur(90px)',
  },
  contentWrapper: {
    flexDirection: 'row',
    maxWidth: 1100,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 35,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  showcasePanel: {
    flex: 1.1,
    backgroundColor: '#0F172A', // Slate 900
    padding: 44,
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textWhite,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  showcaseHero: {
    marginVertical: 28,
  },
  showcaseHeading: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textWhite,
    lineHeight: 34,
    marginBottom: 14,
  },
  showcaseDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
  },
  featureList: {
    gap: 16,
    marginVertical: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  complianceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    flexWrap: 'wrap',
  },
  complianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  complianceText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  authCard: {
    flex: 1.2,
    padding: 44,
    backgroundColor: colors.cardBg,
    justifyContent: 'center',
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECDD3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hintText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  tenantPickerRow: {
    flexDirection: 'column',
    gap: 8,
  },
  tenantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: '#F8FAFC',
  },
  tenantChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  tenantChipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tenantChipTitleActive: {
    color: colors.primaryDark,
  },
  tenantChipMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  activePillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: colors.textPrimary,
    outlineStyle: 'none',
  },
  eyeBtn: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: colors.primary,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  quickAccessSection: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  quickAccessHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  personasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '48%',
  },
  personaChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  personaChipName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  personaChipRole: {
    fontSize: 10,
    color: colors.textMuted,
  },
});
