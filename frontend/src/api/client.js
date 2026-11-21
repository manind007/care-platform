const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

let currentToken = localStorage.getItem('care_token') || '';
let currentTenant = localStorage.getItem('care_tenant') || 'TENANT-001';

export const setAuthToken = (token) => {
  currentToken = token;
  if (token) {
    localStorage.setItem('care_token', token);
  } else {
    localStorage.removeItem('care_token');
  }
};

export const setTenantHeader = (tenantId) => {
  currentTenant = tenantId || '';
  if (tenantId) {
    localStorage.setItem('care_tenant', tenantId);
  } else {
    localStorage.removeItem('care_tenant');
  }
};

export const getTenantHeader = () => currentTenant;
export const getAuthToken = () => currentToken;

export const apiFetch = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(currentTenant ? { 'X-Tenant-ID': currentTenant } : {}),
    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (err) {
    console.warn(`[API] Network or API error for ${endpoint}:`, err.message);
    throw err;
  }
};

// Dynamic backend API loaders & CRUD - NO hardcoded data in frontend
export const fetchPersonas = async () => {
  return await apiFetch('/users/personas');
};

export const fetchTenants = async () => {
  return await apiFetch('/tenants');
};

export const createTenant = async (tenant) => {
  return await apiFetch('/tenants', {
    method: 'POST',
    body: JSON.stringify(tenant)
  });
};

export const updateTenant = async (id, tenant) => {
  return await apiFetch(`/tenants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tenant)
  });
};

export const deleteTenant = async (id) => {
  return await apiFetch(`/tenants/${id}`, {
    method: 'DELETE'
  });
};

export const fetchOrganisations = async () => {
  return await apiFetch('/organisations');
};

export const createOrganisation = async (org) => {
  return await apiFetch('/organisations', {
    method: 'POST',
    body: JSON.stringify(org)
  });
};

export const updateOrganisation = async (id, org) => {
  return await apiFetch(`/organisations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(org)
  });
};

export const deleteOrganisation = async (id) => {
  return await apiFetch(`/organisations/${id}`, {
    method: 'DELETE'
  });
};

export const fetchBranches = async () => {
  return await apiFetch('/organisations/all-branches');
};

export const createBranch = async (orgId, branch) => {
  return await apiFetch(`/organisations/${orgId}/branches`, {
    method: 'POST',
    body: JSON.stringify(branch)
  });
};

export const updateBranch = async (branchId, branch) => {
  return await apiFetch(`/organisations/branches/${branchId}`, {
    method: 'PUT',
    body: JSON.stringify(branch)
  });
};

export const deleteBranch = async (branchId) => {
  return await apiFetch(`/organisations/branches/${branchId}`, {
    method: 'DELETE'
  });
};

export const fetchUsers = async (role = null) => {
  const query = role ? `?role=${role}` : '';
  return await apiFetch(`/users${query}`);
};

export const createUser = async (user) => {
  return await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(user)
  });
};

export const updateUser = async (id, user) => {
  return await apiFetch(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(user)
  });
};

export const toggleUserStatus = async (id) => {
  return await apiFetch(`/users/${id}/toggle-status`, {
    method: 'PATCH'
  });
};

export const deleteUser = async (id) => {
  return await apiFetch(`/users/${id}`, {
    method: 'DELETE'
  });
};

export const fetchClients = async () => {
  return await apiFetch('/clients');
};

export const login = async (username, password, tenantId) => {
  const targetTenant = tenantId || currentTenant || 'TENANT-001';
  setTenantHeader(targetTenant);
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
      tenantId: targetTenant
    })
  });
  if (data && data.token) {
    setAuthToken(data.token);
  }
  return data;
};

export const logout = () => {
  setAuthToken('');
};

export const getCurrentUser = async () => {
  return await apiFetch('/auth/me');
};

export const loginWithPersona = async (username, password = 'password123') => {
  return await login(username, password, currentTenant);
};

// ==========================================
// HOSPITAL MANAGEMENT SYSTEM (HMS) APIS
// ==========================================

// --- 1. Outpatient Department (OPD) ---
export const fetchOpdAppointments = async () => {
  return await apiFetch('/opd/appointments');
};

export const fetchOpdAppointmentById = async (id) => {
  return await apiFetch(`/opd/appointments/${id}`);
};

export const createOpdAppointment = async (appointment) => {
  return await apiFetch('/opd/appointments', {
    method: 'POST',
    body: JSON.stringify(appointment)
  });
};

export const updateOpdConsultation = async (id, data) => {
  return await apiFetch(`/opd/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

// --- 2. Inpatient Department (IPD) & Bed Management ---
export const fetchIpdWards = async () => {
  return await apiFetch('/ipd/wards');
};

export const fetchIpdBeds = async () => {
  return await apiFetch('/ipd/beds');
};

export const fetchIpdAdmissions = async () => {
  return await apiFetch('/ipd/admissions');
};

export const admitIpdPatient = async (admissionData) => {
  return await apiFetch('/ipd/admissions', {
    method: 'POST',
    body: JSON.stringify(admissionData)
  });
};

export const transferIpdBed = async (admissionId, newBedId) => {
  return await apiFetch(`/ipd/admissions/${admissionId}/transfer`, {
    method: 'POST',
    body: JSON.stringify({ newBedId })
  });
};

export const dischargeIpdPatient = async (admissionId, dischargeSummary, dischargeAdvice) => {
  return await apiFetch(`/ipd/admissions/${admissionId}/discharge`, {
    method: 'POST',
    body: JSON.stringify({ dischargeSummary, dischargeAdvice })
  });
};

export const updateNursingNotes = async (admissionId, nursingNotes) => {
  return await apiFetch(`/ipd/admissions/${admissionId}/nursing-notes`, {
    method: 'PATCH',
    body: JSON.stringify({ nursingNotes })
  });
};

// --- 3. Diagnostics & Laboratory ---
export const fetchDiagnosticOrders = async () => {
  return await apiFetch('/diagnostics/orders');
};

export const createDiagnosticOrder = async (order) => {
  return await apiFetch('/diagnostics/orders', {
    method: 'POST',
    body: JSON.stringify(order)
  });
};

export const collectDiagnosticSample = async (orderId) => {
  return await apiFetch(`/diagnostics/orders/${orderId}/collect-sample`, {
    method: 'POST'
  });
};

export const recordDiagnosticResult = async (orderId, resultData) => {
  return await apiFetch(`/diagnostics/orders/${orderId}/result`, {
    method: 'POST',
    body: JSON.stringify(resultData)
  });
};

// --- 4. Pharmacy & Inventory Management ---
export const fetchPharmacyMedicines = async () => {
  return await apiFetch('/pharmacy/medicines');
};

export const createPharmacyMedicine = async (medicine) => {
  return await apiFetch('/pharmacy/medicines', {
    method: 'POST',
    body: JSON.stringify(medicine)
  });
};

export const fetchPharmacyBatches = async () => {
  return await apiFetch('/pharmacy/batches');
};

export const addPharmacyBatch = async (batch) => {
  return await apiFetch('/pharmacy/batches', {
    method: 'POST',
    body: JSON.stringify(batch)
  });
};

export const fetchPharmacyDispensations = async () => {
  return await apiFetch('/pharmacy/dispensations');
};

export const dispensePharmacyMedicine = async (dispensation) => {
  return await apiFetch('/pharmacy/dispense', {
    method: 'POST',
    body: JSON.stringify(dispensation)
  });
};

export const fetchExpiringBatches = async (days = 30) => {
  return await apiFetch(`/pharmacy/alerts/expiring?days=${days}`);
};

// --- 5. Hospital Specialities (OT & Blood Bank) ---
export const fetchOtBookings = async () => {
  return await apiFetch('/hospital/ot-bookings');
};

export const createOtBooking = async (booking) => {
  return await apiFetch('/hospital/ot-bookings', {
    method: 'POST',
    body: JSON.stringify(booking)
  });
};

export const updateOtStatus = async (id, status, operativeNotes) => {
  return await apiFetch(`/hospital/ot-bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, operativeNotes })
  });
};

export const fetchBloodUnits = async () => {
  return await apiFetch('/hospital/blood-units');
};

export const addBloodUnit = async (unit) => {
  return await apiFetch('/hospital/blood-units', {
    method: 'POST',
    body: JSON.stringify(unit)
  });
};

export const reserveBloodUnit = async (id, uhid, patientName) => {
  return await apiFetch(`/hospital/blood-units/${id}/reserve`, {
    method: 'POST',
    body: JSON.stringify({ uhid, patientName })
  });
};

// ==========================================
// EPIC-GRADE EHR & LONGITUDINAL PATIENT CHART
// ==========================================

export const fetchLongitudinalRecord = async (clientId) => {
  return await apiFetch(`/ehr/patients/${clientId}/chart`);
};

export const fetchPatientAllergies = async (clientId) => {
  return await apiFetch(`/ehr/patients/${clientId}/allergies`);
};

export const addPatientAllergy = async (clientId, allergy) => {
  return await apiFetch(`/ehr/patients/${clientId}/allergies`, {
    method: 'POST',
    body: JSON.stringify(allergy)
  });
};

export const deletePatientAllergy = async (id) => {
  return await apiFetch(`/ehr/allergies/${id}`, {
    method: 'DELETE'
  });
};

export const fetchPatientProblems = async (clientId) => {
  return await apiFetch(`/ehr/patients/${clientId}/problems`);
};

export const addPatientProblem = async (clientId, problem) => {
  return await apiFetch(`/ehr/patients/${clientId}/problems`, {
    method: 'POST',
    body: JSON.stringify(problem)
  });
};

export const updatePatientProblem = async (id, problem) => {
  return await apiFetch(`/ehr/problems/${id}`, {
    method: 'PUT',
    body: JSON.stringify(problem)
  });
};

export const deletePatientProblem = async (id) => {
  return await apiFetch(`/ehr/problems/${id}`, {
    method: 'DELETE'
  });
};

export const fetchPatientMedications = async (clientId) => {
  return await apiFetch(`/ehr/patients/${clientId}/medications`);
};

export const addPatientMedication = async (clientId, medication) => {
  return await apiFetch(`/ehr/patients/${clientId}/medications`, {
    method: 'POST',
    body: JSON.stringify(medication)
  });
};

export const updatePatientMedication = async (id, medication) => {
  return await apiFetch(`/ehr/medications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(medication)
  });
};

export const fetchPatientImmunizations = async (clientId) => {
  return await apiFetch(`/ehr/patients/${clientId}/immunizations`);
};

export const addPatientImmunization = async (clientId, immunization) => {
  return await apiFetch(`/ehr/patients/${clientId}/immunizations`, {
    method: 'POST',
    body: JSON.stringify(immunization)
  });
};

export const fetchPatientProcedures = async (clientId) => {
  return await apiFetch(`/ehr/patients/${clientId}/procedures`);
};

export const addPatientProcedure = async (clientId, procedure) => {
  return await apiFetch(`/ehr/patients/${clientId}/procedures`, {
    method: 'POST',
    body: JSON.stringify(procedure)
  });
};

export const fetchPatientHistories = async (clientId) => {
  return await apiFetch(`/ehr/patients/${clientId}/histories`);
};

export const addPastMedicalHistory = async (clientId, pmh) => {
  return await apiFetch(`/ehr/patients/${clientId}/pmh`, {
    method: 'POST',
    body: JSON.stringify(pmh)
  });
};

export const addFamilyHistory = async (clientId, fh) => {
  return await apiFetch(`/ehr/patients/${clientId}/family-history`, {
    method: 'POST',
    body: JSON.stringify(fh)
  });
};

export const saveSocialHistory = async (clientId, sh) => {
  return await apiFetch(`/ehr/patients/${clientId}/social-history`, {
    method: 'POST',
    body: JSON.stringify(sh)
  });
};

export const fetchClinicalNotes = async (clientId) => {
  return await apiFetch(`/ehr/patients/${clientId}/notes`);
};

export const createClinicalNote = async (clientId, note) => {
  return await apiFetch(`/ehr/patients/${clientId}/notes`, {
    method: 'POST',
    body: JSON.stringify(note)
  });
};

export const fetchClinicalDocuments = async (clientId) => {
  return await apiFetch(`/ehr/patients/${clientId}/documents`);
};

export const addClinicalDocument = async (clientId, doc) => {
  return await apiFetch(`/ehr/patients/${clientId}/documents`, {
    method: 'POST',
    body: JSON.stringify(doc)
  });
};

export const evaluateCds = async (cdsRequest) => {
  return await apiFetch('/cds/evaluate', {
    method: 'POST',
    body: JSON.stringify(cdsRequest)
  });
};

// ==========================================
// UK eMAR & PRESCRIPTION LIFECYCLE APIS
// ==========================================
export const fetchMedications = async (clientId) => {
  return await apiFetch(`/medications/client/${clientId}`);
};

export const prescribeMedication = async (medication) => {
  return await apiFetch('/medications', {
    method: 'POST',
    body: JSON.stringify(medication)
  });
};

export const recordAdministration = async (adminRequest) => {
  return await apiFetch('/emar/administer', {
    method: 'POST',
    body: JSON.stringify(adminRequest)
  });
};

export const fetchEmarHistory = async (clientId) => {
  return await apiFetch(`/emar/history/${clientId}`);
};

export const fetchEmarExceptions = async () => {
  return await apiFetch('/emar/exceptions');
};

export const recordPrnEffectiveness = async (adminId, effectiveness) => {
  return await apiFetch('/emar/prn-effectiveness', {
    method: 'POST',
    body: JSON.stringify({ adminId, effectiveness })
  });
};

export const resolveMedicationException = async (adminId, resolutionNotes) => {
  return await apiFetch(`/emar/exceptions/${adminId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolutionNotes })
  });
};

export const updateMedicationStatus = async (medId, status) => {
  return await apiFetch(`/medications/${medId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
};

export const reorderRepeatPrescription = async (medId) => {
  return await apiFetch(`/medications/${medId}/reorder`, {
    method: 'POST'
  });
};

export const receiveMedicationStock = async (medId, quantity) => {
  return await apiFetch(`/medications/${medId}/receive-stock`, {
    method: 'POST',
    body: JSON.stringify({ quantity })
  });
};

export const fetchMedicationReconciliations = async (clientId) => {
  return await apiFetch(`/medications/client/${clientId}/reconciliations`);
};

export const createMedicationReconciliation = async (clientId, rec) => {
  return await apiFetch(`/medications/client/${clientId}/reconciliations`, {
    method: 'POST',
    body: JSON.stringify(rec)
  });
};

export const fetchMonthlyMarGrid = async (clientId, year, month) => {
  const query = [];
  if (year) query.push(`year=${year}`);
  if (month) query.push(`month=${month}`);
  const qStr = query.length > 0 ? `?${query.join('&')}` : '';
  return await apiFetch(`/emar/monthly-grid/${clientId}${qStr}`);
};

// ==========================================
// VIRTUAL WARD / HOSPITAL-AT-HOME APIS
// ==========================================
export const fetchVirtualWardStays = async () => {
  return await apiFetch('/virtual-ward');
};

export const fetchActiveVirtualWardStays = async () => {
  return await apiFetch('/virtual-ward/active');
};

export const admitVirtualWardPatient = async (stay) => {
  return await apiFetch('/virtual-ward/admit', {
    method: 'POST',
    body: JSON.stringify(stay)
  });
};

export const recordVirtualWardRemoteRound = async (id, data) => {
  return await apiFetch(`/virtual-ward/${id}/remote-round`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const dischargeVirtualWardPatient = async (id, summary) => {
  return await apiFetch(`/virtual-ward/${id}/discharge`, {
    method: 'POST',
    body: JSON.stringify({ summary })
  });
};

// ==========================================
// WOUND CARE & TISSUE VIABILITY APIS
// ==========================================
export const fetchClientWounds = async (clientId) => {
  return await apiFetch(`/wounds/client/${clientId}`);
};

export const fetchAllWounds = async () => {
  return await apiFetch('/wounds');
};

export const recordWoundAssessment = async (assessment) => {
  return await apiFetch('/wounds', {
    method: 'POST',
    body: JSON.stringify(assessment)
  });
};

// ==========================================
// HYDRATION & FLUID BALANCE APIS
// ==========================================
export const fetchFluidHistory = async (clientId) => {
  return await apiFetch(`/nutrition/client/${clientId}/history`);
};

export const fetchTodayFluidSummary = async (clientId) => {
  return await apiFetch(`/nutrition/client/${clientId}/today-summary`);
};

export const recordFluidEntry = async (clientId, entry) => {
  return await apiFetch(`/nutrition/client/${clientId}/entry`, {
    method: 'POST',
    body: JSON.stringify(entry)
  });
};

// ==========================================
// WORKFORCE SKILLS & MATCHING APIS
// ==========================================
export const fetchUserSkills = async (userId) => {
  return await apiFetch(`/skills/user/${userId}`);
};

export const fetchAllCarerSkills = async () => {
  return await apiFetch('/skills');
};

export const addCarerSkill = async (skill) => {
  return await apiFetch('/skills', {
    method: 'POST',
    body: JSON.stringify(skill)
  });
};

export const matchCarersForNeeds = async (requiredSkills) => {
  return await apiFetch('/skills/match', {
    method: 'POST',
    body: JSON.stringify({ requiredSkills })
  });
};

// ==========================================
// EMERGENCY & TRAUMA DEPARTMENT (ER / ED) APIS
// ==========================================
export const fetchEmergencyTriage = async () => {
  return await apiFetch('/emergency/triage');
};

export const fetchEmergencyQueue = async () => {
  return await apiFetch('/emergency/queue');
};

export const registerEmergencyTriage = async (triage) => {
  return await apiFetch('/emergency/triage', {
    method: 'POST',
    body: JSON.stringify(triage)
  });
};

export const updateEmergencyVitals = async (id, vitals) => {
  return await apiFetch(`/emergency/triage/${id}/vitals`, {
    method: 'PATCH',
    body: JSON.stringify(vitals)
  });
};

export const fastTrackEmergencyToIpd = async (id, data) => {
  return await apiFetch(`/emergency/triage/${id}/admit-ipd`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const transferEmergencyToOt = async (id, data) => {
  return await apiFetch(`/emergency/triage/${id}/transfer-ot`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const dischargeEmergencyPatient = async (id, summary) => {
  return await apiFetch(`/emergency/triage/${id}/discharge`, {
    method: 'POST',
    body: JSON.stringify({ summary })
  });
};

// ==========================================
// TPA & CASHLESS INSURANCE DESK APIS
// ==========================================
export const fetchInsuranceClaims = async () => {
  return await apiFetch('/insurance/claims');
};

export const fetchInsuranceSummary = async () => {
  return await apiFetch('/insurance/summary');
};

export const createInsuranceClaim = async (claim) => {
  return await apiFetch('/insurance/claims', {
    method: 'POST',
    body: JSON.stringify(claim)
  });
};

export const updateInsuranceClaimStatus = async (id, payload) => {
  return await apiFetch(`/insurance/claims/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
};

// ==========================================
// OPEN SHIFT BROADCASTING APIS
// ==========================================
export const fetchOpenShiftBroadcasts = async () => {
  return await apiFetch('/shifts/broadcast');
};

export const fetchActiveOpenShifts = async () => {
  return await apiFetch('/shifts/broadcast/open');
};

export const broadcastOpenShift = async (shift) => {
  return await apiFetch('/shifts/broadcast', {
    method: 'POST',
    body: JSON.stringify(shift)
  });
};

export const claimOpenShift = async (id, payload) => {
  return await apiFetch(`/shifts/broadcast/${id}/claim`, {
    method: 'POST',
    body: JSON.stringify(payload || {})
  });
};

export const cancelShiftBroadcast = async (id, reason) => {
  return await apiFetch(`/shifts/broadcast/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
};

// ==========================================
// HOME CARE CRM & LEAD PIPELINE APIS
// ==========================================
export const fetchClientLeads = async () => {
  return await apiFetch('/crm/leads');
};

export const fetchCrmSummary = async () => {
  return await apiFetch('/crm/leads/summary');
};

export const createClientLead = async (lead) => {
  return await apiFetch('/crm/leads', {
    method: 'POST',
    body: JSON.stringify(lead)
  });
};

export const updateLeadStage = async (id, stage, notes) => {
  return await apiFetch(`/crm/leads/${id}/stage`, {
    method: 'PATCH',
    body: JSON.stringify({ stage, notes })
  });
};

export const convertLeadToClient = async (id) => {
  return await apiFetch(`/crm/leads/${id}/convert-to-client`, {
    method: 'POST'
  });
};

// ==========================================
// SPECIALTY EMR CONSULTATION APIS
// ==========================================
export const fetchSpecialtyConsultations = async () => {
  return await apiFetch('/ehr/specialty/consultations');
};

export const fetchSpecialtyConsultationsByUhid = async (uhid) => {
  return await apiFetch(`/ehr/specialty/consultations/patient/${uhid}`);
};

export const fetchSpecialtyTemplates = async () => {
  return await apiFetch('/ehr/specialty/templates');
};

export const recordSpecialtyConsultation = async (consultation) => {
  return await apiFetch('/ehr/specialty/consultations', {
    method: 'POST',
    body: JSON.stringify(consultation)
  });
};

// ==========================================
// BED TURNAROUND & HOUSEKEEPING API
// ==========================================
export const updateBedTurnaroundStatus = async (bedId, status, staffName, reason) => {
  return await apiFetch(`/ipd/beds/${bedId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, staffName, reason })
  });
};


