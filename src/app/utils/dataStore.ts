import { Project, Contractor, AttendanceRecord, Material } from './constants';

const STORAGE_KEYS = {
  PROJECTS: 'pharma_projects',
  CONTRACTORS: 'pharma_contractors',
  ATTENDANCE: 'pharma_attendance',
  MATERIALS: 'pharma_materials',
};

// Projects
export const getProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : [];
};

export const saveProject = (project: Project) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const deleteProject = (id: string) => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

// Contractors
export const getContractors = (): Contractor[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CONTRACTORS);
  return data ? JSON.parse(data) : [];
};

export const saveContractor = (contractor: Contractor) => {
  const contractors = getContractors();
  const index = contractors.findIndex(c => c.id === contractor.id);
  if (index >= 0) {
    contractors[index] = contractor;
  } else {
    contractors.push(contractor);
  }
  localStorage.setItem(STORAGE_KEYS.CONTRACTORS, JSON.stringify(contractors));
};

export const deleteContractor = (id: string) => {
  const contractors = getContractors().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CONTRACTORS, JSON.stringify(contractors));
};

// Attendance
export const getAttendanceRecords = (): AttendanceRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  return data ? JSON.parse(data) : [];
};

export const saveAttendanceRecord = (record: AttendanceRecord) => {
  const records = getAttendanceRecords();
  const index = records.findIndex(r => r.id === record.id);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
};

export const deleteAttendanceRecord = (id: string) => {
  const records = getAttendanceRecords().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
};

// Materials
export const getMaterials = (): Material[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MATERIALS);
  return data ? JSON.parse(data) : [];
};

export const saveMaterial = (material: Material) => {
  const materials = getMaterials();
  const index = materials.findIndex(m => m.id === material.id);
  if (index >= 0) {
    materials[index] = material;
  } else {
    materials.push(material);
  }
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
};

export const deleteMaterial = (id: string) => {
  const materials = getMaterials().filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
};
