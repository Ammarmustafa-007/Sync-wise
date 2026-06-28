const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const fetchWithToken = async (url, options = {}) => {
  // Try to get dev token first, otherwise try standard supabase localstorage token
  let token = 'dev-token'; // Fallback for testing
  
  try {
    const rawStorage = localStorage.getItem('sb-wsnofhztukhhoztjbkfy-auth-token');
    if (rawStorage) {
      const parsed = JSON.parse(rawStorage);
      if (parsed.access_token) {
        token = parsed.access_token;
      }
    }
  } catch (e) {
    console.warn("Could not read supabase token", e);
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || `API Error: ${response.status}`);
  }

  return response.json();
};

export const api = {
  // Organization Data
  getUniversities: () => fetchWithToken('/timetable/universities'),
  getDepartments: (universityId) => fetchWithToken(`/timetable/departments?university_id=${universityId}`),
  
  // Timetable Data
  getLatestTimetable: (departmentId, semesterLabel) => 
    fetchWithToken(`/timetable/latest?department_id=${departmentId}&semester_label=${semesterLabel}`),
  getSlots: (versionId, section) => 
    fetchWithToken(`/timetable/slots?version_id=${versionId}${section ? `&section=${section}` : ''}`),
    
  // Wizard Endpoints
  getVersions: (departmentId) => fetchWithToken(`/timetable/versions?department_id=${departmentId}`),
  getSemesters: (versionId) => fetchWithToken(`/timetable/semesters?version_id=${versionId}`),
  getSubjects: (versionId, semesters) => fetchWithToken(`/timetable/subjects?version_id=${versionId}&semesters=${semesters.join(',')}`),
  
  // Student Actions
  parsePersonalTimetable: async (file) => {
    let token = 'dev-token';
    try {
      const rawStorage = localStorage.getItem('sb-wsnofhztukhhoztjbkfy-auth-token');
      if (rawStorage) {
        const parsed = JSON.parse(rawStorage);
        if (parsed.access_token) token = parsed.access_token;
      }
    } catch (e) {}

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/student/parse-personal`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || err.message || `API Error: ${response.status}`);
    }
    return response.json();
  },
  generateSchedule: (data) => fetchWithToken('/student/schedules/generate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  enrollSchedule: (slotIds) => fetchWithToken('/student/enroll', {
    method: 'POST',
    body: JSON.stringify({ slot_ids: slotIds })
  }),
  getMySchedule: () => fetchWithToken('/student/schedule'),
  
  // Teacher Actions
  getTeacherSections: () => fetchWithToken('/teacher/sections'),
  assignSection: (data) => fetchWithToken('/teacher/assign-section', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getSectionStudents: (sectionId) => fetchWithToken(`/teacher/section/${sectionId}/students`),
  getTeacherStats: () => fetchWithToken('/teacher/stats'),
  getTeacherSchedule: () => fetchWithToken('/teacher/my-schedule'),
  checkMakeupClass: (data) => fetchWithToken('/teacher/makeup/check', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  saveMakeupClass: (data) => fetchWithToken('/teacher/makeup/save', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getMakeupHistory: () => fetchWithToken('/teacher/makeup/history'),
};
