import { Project, AttendanceRecord, Material } from './constants';
import { getAttendanceRecords, getMaterials } from './dataStore';

// Calculate average present workers for a project
export const calculateAvgPresentWorkers = (projectId: string): number => {
  const records = getAttendanceRecords().filter(r => r.projectId === projectId);
  if (records.length === 0) return 0;
  
  const total = records.reduce((sum, r) => sum + r.actualPresent, 0);
  return Math.round((total / records.length) * 10) / 10;
};

// Calculate delay percentage based on attendance
export const calculateDelayPercentage = (project: Project): number => {
  const records = getAttendanceRecords().filter(r => r.projectId === project.id);
  if (records.length === 0) return 0;
  
  let totalExpected = 0;
  let totalActual = 0;
  
  records.forEach(r => {
    totalExpected += r.plannedWorkers;
    totalActual += r.actualPresent;
  });
  
  if (totalExpected === 0) return 0;
  
  const attendanceRate = (totalActual / totalExpected) * 100;
  const delayPercentage = Math.max(0, 100 - attendanceRate);
  
  return Math.round(delayPercentage * 10) / 10;
};

// Calculate delay days
export const calculateDelayDays = (project: Project): number => {
  if (!project.plannedStartDate || !project.plannedEndDate) return 0;
  
  const startDate = new Date(project.plannedStartDate);
  const plannedEndDate = new Date(project.plannedEndDate);
  const today = new Date();
  
  const plannedDuration = Math.ceil((plannedEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const delayPercentage = calculateDelayPercentage(project);
  const delayDays = Math.ceil((delayPercentage / 100) * plannedDuration);
  
  // Check material delays
  const materials = getMaterials().filter(m => m.projectId === project.id);
  let materialDelayDays = 0;
  
  materials.forEach(material => {
    if (material.actualDeliveryDate && material.plannedDeliveryDate) {
      const planned = new Date(material.plannedDeliveryDate);
      const actual = new Date(material.actualDeliveryDate);
      const diff = Math.ceil((actual.getTime() - planned.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0) {
        materialDelayDays = Math.max(materialDelayDays, diff);
      }
    }
  });
  
  return Math.max(delayDays, materialDelayDays);
};

// Calculate forecast end date
export const calculateForecastEndDate = (project: Project): string => {
  if (!project.plannedEndDate) return '';
  
  const plannedEndDate = new Date(project.plannedEndDate);
  const delayDays = calculateDelayDays(project);
  
  const forecastDate = new Date(plannedEndDate);
  forecastDate.setDate(forecastDate.getDate() + delayDays);
  
  return forecastDate.toISOString().split('T')[0];
};

// Calculate contractor performance
export const calculateContractorPerformance = (contractorName: string, startDate?: string, endDate?: string): number => {
  const records = getAttendanceRecords().filter(r => r.vendorName === contractorName);
  
  let filteredRecords = records;
  if (startDate && endDate) {
    filteredRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });
  }
  
  if (filteredRecords.length === 0) return 0;
  
  let totalExpected = 0;
  let totalActual = 0;
  
  filteredRecords.forEach(r => {
    totalExpected += r.plannedWorkers;
    totalActual += r.actualPresent;
  });
  
  if (totalExpected === 0) return 0;
  
  return Math.round((totalActual / totalExpected) * 100 * 10) / 10;
};

// Get project completion percentage
export const calculateCompletionPercentage = (project: Project): number => {
  if (project.status === 'Completed') return 100;
  if (project.status === 'Not Started') return 0;
  
  const startDate = new Date(project.plannedStartDate);
  const endDate = new Date(project.plannedEndDate);
  const today = new Date();
  
  if (today < startDate) return 0;
  if (today > endDate) return 100;
  
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = today.getTime() - startDate.getTime();
  
  const percentage = (elapsed / totalDuration) * 100;
  
  // Adjust based on attendance
  const avgAttendance = calculateAvgPresentWorkers(project.id);
  const plannedWorkers = project.plannedWorkers || 1;
  const attendanceMultiplier = avgAttendance / plannedWorkers;
  
  return Math.min(100, Math.round(percentage * attendanceMultiplier));
};

// Calculate material delay percentage
export const calculateMaterialDelayPercentage = (materialId: string): number => {
  const materials = getMaterials();
  const material = materials.find(m => m.id === materialId);
  
  if (!material || !material.actualDeliveryDate || !material.plannedDeliveryDate) return 0;
  
  const planned = new Date(material.plannedDeliveryDate);
  const actual = new Date(material.actualDeliveryDate);
  
  const plannedDays = 1; // Assuming 1 day as baseline
  const delayDays = Math.max(0, Math.ceil((actual.getTime() - planned.getTime()) / (1000 * 60 * 60 * 24)));
  
  return Math.round((delayDays / plannedDays) * 100 * 10) / 10;
};

// Calculate material forecast delivery date
export const calculateMaterialForecastDate = (material: Material): string => {
  if (material.actualDeliveryDate) return material.actualDeliveryDate;
  
  // Simple forecast based on current date
  return new Date().toISOString().split('T')[0];
};
