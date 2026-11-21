import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { colors } from './theme/colors';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardScreen } from './screens/DashboardScreen';
import { VisitsScreen } from './screens/VisitsScreen';
import { ClientsScreen } from './screens/ClientsScreen';
import { EmarScreen } from './screens/EmarScreen';
import { CarePlanScreen } from './screens/CarePlanScreen';
import { AssessmentScreen } from './screens/AssessmentScreen';
import { IncidentsScreen } from './screens/IncidentsScreen';
import { FamilyPortalScreen } from './screens/FamilyPortalScreen';
import { FinanceScreen } from './screens/FinanceScreen';
import { AiAssistantScreen } from './screens/AiAssistantScreen';
import { AuditScreen } from './screens/AuditScreen';
import { OrganisationScreen } from './screens/OrganisationScreen';
import { OpdScreen } from './screens/OpdScreen';
import { IpdBedScreen } from './screens/IpdBedScreen';
import { DiagnosticsScreen } from './screens/DiagnosticsScreen';
import { PharmacyInventoryScreen } from './screens/PharmacyInventoryScreen';
import { OtBloodBankScreen } from './screens/OtBloodBankScreen';
import { EhrChartScreen } from './screens/EhrChartScreen';
import { VirtualWardScreen } from './screens/VirtualWardScreen';
import { WoundCareScreen } from './screens/WoundCareScreen';
import { FluidBalanceScreen } from './screens/FluidBalanceScreen';
import { SkillsMatchingScreen } from './screens/SkillsMatchingScreen';
import { EmergencyScreen } from './screens/EmergencyScreen';
import { InsuranceScreen } from './screens/InsuranceScreen';
import { ShiftBroadcastScreen } from './screens/ShiftBroadcastScreen';
import { AgencyCrmScreen } from './screens/AgencyCrmScreen';
import { LoginScreen } from './screens/LoginScreen';
import { 
  fetchPersonas, 
  fetchOrganisations, 
  fetchClients, 
  fetchTenants, 
  loginWithPersona, 
  setTenantHeader, 
  getTenantHeader,
  getAuthToken,
  getCurrentUser,
  logout
} from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [personas, setPersonas] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [currentPersona, setCurrentPersona] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(getTenantHeader() || '');
  const [isOnline, setIsOnline] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // 1. Initialize public directory data and check existing session
  useEffect(() => {
    async function initPlatform() {
      try {
        setInitialLoading(true);

        // Fetch dynamic public directory (tenants and personas)
        const [loadedTenants, loadedPersonas] = await Promise.all([
          fetchTenants().catch(() => []),
          fetchPersonas().catch(() => [])
        ]);

        setTenants(loadedTenants);
        setPersonas(loadedPersonas);

        if (loadedTenants.length > 0) {
          const existingTenant = getTenantHeader();
          const match = loadedTenants.find(t => t.tenantId === existingTenant);
          const initialTenantId = match ? match.tenantId : loadedTenants[0].tenantId;
          setCurrentTenant(initialTenantId);
          setTenantHeader(initialTenantId);
        }

        // Check if there is already an active valid session token
        const token = getAuthToken();
        if (token) {
          try {
            const user = await getCurrentUser();
            if (user && user.username) {
              const matchedPersona = loadedPersonas.find(p => p.id === user.username) || {
                id: user.username,
                name: user.fullName || user.username,
                role: user.role,
                label: user.role ? user.role.replace('_', ' ') : 'User',
                avatar: user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'US'
              };
              setCurrentPersona(matchedPersona);

              if (user.tenantId) {
                setCurrentTenant(user.tenantId);
                setTenantHeader(user.tenantId);
              }

              // Load protected tenant data
              const [loadedOrgs, loadedClients] = await Promise.all([
                fetchOrganisations().catch(() => []),
                fetchClients().catch(() => [])
              ]);
              setOrganisations(loadedOrgs);
              setClients(loadedClients);
              if (loadedClients.length > 0) {
                setActiveClient(loadedClients[0]);
              }
            }
          } catch {
            // Token expired or invalid
            logout();
            setCurrentPersona(null);
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setInitialLoading(false);
      }
    }

    initPlatform();
  }, []);

  // 2. Handle Login success from LoginScreen
  const handleLoginSuccess = async (loginResponse, persona) => {
    setInitialLoading(true);
    try {
      setCurrentPersona(persona);
      const tenantId = loginResponse.tenantId || currentTenant;
      setCurrentTenant(tenantId);
      setTenantHeader(tenantId);

      // Fetch protected tenant data
      const [loadedOrgs, loadedClients] = await Promise.all([
        fetchOrganisations().catch(() => []),
        fetchClients().catch(() => [])
      ]);

      setOrganisations(loadedOrgs);
      setClients(loadedClients);
      if (loadedClients.length > 0) {
        setActiveClient(loadedClients[0]);
      }

      if (persona.role === 'FAMILY_MEMBER') {
        setActiveTab('family');
      } else if (persona.role === 'FINANCE_ADMIN') {
        setActiveTab('finance');
      } else {
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error('Post-login data loading failed:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  // 3. Handle Logout
  const handleLogout = () => {
    logout();
    setCurrentPersona(null);
    setOrganisations([]);
    setClients([]);
    setActiveClient(null);
    setActiveTab('dashboard');
  };

  // 4. Switch persona dynamically within authenticated realm
  const handleSelectPersona = async (p) => {
    setCurrentPersona(p);
    try {
      await loginWithPersona(p.id);
      if (p.role === 'FAMILY_MEMBER') {
        setActiveTab('family');
      }
    } catch (err) {
      console.warn('Persona switch notice:', err.message);
    }
  };

  const handleSelectTenant = async (tenantId) => {
    setCurrentTenant(tenantId);
    setTenantHeader(tenantId);
    try {
      const [loadedOrgs, loadedClients] = await Promise.all([
        fetchOrganisations().catch(() => []),
        fetchClients().catch(() => [])
      ]);
      setOrganisations(loadedOrgs);
      setClients(loadedClients);
      if (loadedClients.length > 0) {
        setActiveClient(loadedClients[0]);
      }
    } catch (err) {
      console.error('Failed to reload tenant data:', err);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If not authenticated, render Login Screen
  if (!currentPersona) {
    return (
      <LoginScreen
        tenants={tenants}
        personas={personas}
        currentTenant={currentTenant}
        onSelectTenant={setCurrentTenant}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen currentPersona={currentPersona} onNavigate={setActiveTab} />;
      case 'ehr':
        return <EhrChartScreen currentPersona={currentPersona} />;
      case 'opd':
        return <OpdScreen currentPersona={currentPersona} />;
      case 'emergency':
        return <EmergencyScreen currentPersona={currentPersona} />;
      case 'ipd':
        return <IpdBedScreen currentPersona={currentPersona} />;
      case 'virtual-ward':
        return <VirtualWardScreen currentPersona={currentPersona} activeClient={activeClient} />;
      case 'diagnostics':
        return <DiagnosticsScreen currentPersona={currentPersona} />;
      case 'pharmacy':
        return <PharmacyInventoryScreen currentPersona={currentPersona} />;
      case 'hospital':
        return <OtBloodBankScreen currentPersona={currentPersona} />;
      case 'visits':
        return <VisitsScreen currentPersona={currentPersona} />;
      case 'broadcast':
        return <ShiftBroadcastScreen currentPersona={currentPersona} />;
      case 'crm':
        return (
          <AgencyCrmScreen
            currentPersona={currentPersona}
            onNavigateToClient={(client) => {
              setActiveClient(client);
              setActiveTab('clients');
            }}
          />
        );
      case 'skills':
        return <SkillsMatchingScreen currentPersona={currentPersona} activeClient={activeClient} />;
      case 'clients':
        return (
          <ClientsScreen
            onSelectClientForPlan={(client) => {
              setActiveClient(client);
              setActiveTab('careplan');
            }}
          />
        );
      case 'emar':
        return (
          <EmarScreen
            currentPersona={currentPersona}
            activeClient={activeClient}
            onSelectClient={setActiveClient}
          />
        );
      case 'wounds':
        return <WoundCareScreen currentPersona={currentPersona} activeClient={activeClient} />;
      case 'nutrition':
        return <FluidBalanceScreen currentPersona={currentPersona} activeClient={activeClient} />;
      case 'careplan':
        return <CarePlanScreen currentPersona={currentPersona} activeClient={activeClient} />;
      case 'assessments':
        return <AssessmentScreen currentPersona={currentPersona} activeClient={activeClient} />;
      case 'incidents':
        return <IncidentsScreen currentPersona={currentPersona} />;
      case 'family':
        return <FamilyPortalScreen currentPersona={currentPersona} activeClient={activeClient} />;
      case 'finance':
        return <FinanceScreen currentPersona={currentPersona} activeClient={activeClient} />;
      case 'insurance':
        return <InsuranceScreen currentPersona={currentPersona} />;
      case 'ai':
        return <AiAssistantScreen currentPersona={currentPersona} activeClient={activeClient} />;
      case 'audit':
        return <AuditScreen />;
      case 'organisation':
        return <OrganisationScreen currentPersona={currentPersona} />;
      default:
        return <DashboardScreen currentPersona={currentPersona} onNavigate={setActiveTab} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        currentPersona={currentPersona}
        onSelectPersona={handleSelectPersona}
        personas={personas}
        currentTenant={currentTenant}
        onSelectTenant={handleSelectTenant}
        organisations={organisations}
        tenants={tenants}
        isOnline={isOnline}
        onLogout={handleLogout}
      />
      <View style={styles.bodyLayout}>
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={currentPersona.role}
        />
        <View style={styles.mainContent}>
          {renderActiveScreen()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    height: '100%',
  },
  bodyLayout: {
    flex: 1,
    flexDirection: 'row',
    height: 'calc(100vh - 70px)',
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
