import { Project, Contractor, AttendanceRecord, Material } from './constants';
import { saveProject, saveContractor, saveAttendanceRecord, saveMaterial, getProjects, getContractors } from './dataStore';

export const seedInitialData = () => {
  // Check if data already exists
  if (getProjects().length > 0 || getContractors().length > 0) {
    return; // Data already seeded
  }

  // Sample Contractors
  const contractors: Contractor[] = [
    {
      id: 'contractor-1',
      name: 'Engg Associates',
      totalWorkers: 50,
      createdAt: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'contractor-2',
      name: 'Build Tech Solutions',
      totalWorkers: 75,
      createdAt: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'contractor-3',
      name: 'Precision Engineering',
      totalWorkers: 40,
      createdAt: new Date('2026-01-01').toISOString(),
    },
  ];

  contractors.forEach(contractor => saveContractor(contractor));

  // Sample Projects
  const projects: Project[] = [
    {
      id: 'project-1',
      projectName: 'HVAC System Upgrade',
      plant: 'MP01',
      department: 'HVAC',
      category: 'Major',
      status: 'In Progress',
      responsibleManager: 'Piyush Vyas',
      vendorAllotted: 'Engg Associates',
      plannedStartDate: '2026-02-01',
      plannedEndDate: '2026-03-15',
      plannedWorkers: 10,
      delayReasons: [],
      createdAt: new Date('2026-02-01').toISOString(),
    },
    {
      id: 'project-2',
      projectName: 'Electrical Panel Installation',
      plant: 'MP03',
      department: 'Electrical',
      category: 'Critical',
      status: 'In Progress',
      responsibleManager: 'Abhinav Vikash',
      vendorAllotted: 'Build Tech Solutions',
      plannedStartDate: '2026-01-15',
      plannedEndDate: '2026-03-01',
      plannedWorkers: 15,
      delayReasons: ['Material delivery delayed by 3 days'],
      createdAt: new Date('2026-01-15').toISOString(),
    },
    {
      id: 'project-3',
      projectName: 'Boiler Maintenance',
      plant: 'Boiler',
      department: 'Mechanical',
      category: 'Minor',
      status: 'Completed',
      responsibleManager: 'Prashant Sharma',
      vendorAllotted: 'Precision Engineering',
      plannedStartDate: '2026-01-10',
      plannedEndDate: '2026-02-10',
      actualEndDate: '2026-02-08',
      plannedWorkers: 8,
      delayReasons: [],
      createdAt: new Date('2026-01-10').toISOString(),
    },
    {
      id: 'project-4',
      projectName: 'Civil Work - Floor Repair',
      plant: 'MP05',
      department: 'Civil',
      category: 'Minor',
      status: 'On Hold',
      responsibleManager: 'Ravinder Singh',
      vendorAllotted: 'Engg Associates',
      plannedStartDate: '2026-02-15',
      plannedEndDate: '2026-03-20',
      plannedWorkers: 6,
      delayReasons: ['Waiting for raw material approval', 'Budget constraints'],
      createdAt: new Date('2026-02-15').toISOString(),
    },
    {
      id: 'project-5',
      projectName: 'Instrumentation Calibration',
      plant: 'MP10',
      department: 'Instrumentation',
      category: 'Critical',
      status: 'Not Started',
      responsibleManager: 'Amar Kushwaha',
      vendorAllotted: 'Build Tech Solutions',
      plannedStartDate: '2026-03-20',
      plannedEndDate: '2026-04-25',
      plannedWorkers: 12,
      delayReasons: [],
      createdAt: new Date('2026-03-01').toISOString(),
    },
  ];

  projects.forEach(project => saveProject(project));

  // Sample Attendance Records
  const attendanceRecords: AttendanceRecord[] = [
    // Project 1 - HVAC System
    {
      id: 'attendance-1',
      projectId: 'project-1',
      vendorName: 'Engg Associates',
      date: '2026-03-01',
      plannedWorkers: 10,
      actualPresent: 9,
      createdAt: new Date('2026-03-01').toISOString(),
    },
    {
      id: 'attendance-2',
      projectId: 'project-1',
      vendorName: 'Engg Associates',
      date: '2026-03-02',
      plannedWorkers: 10,
      actualPresent: 10,
      createdAt: new Date('2026-03-02').toISOString(),
    },
    {
      id: 'attendance-3',
      projectId: 'project-1',
      vendorName: 'Engg Associates',
      date: '2026-03-03',
      plannedWorkers: 10,
      actualPresent: 8,
      createdAt: new Date('2026-03-03').toISOString(),
    },
    {
      id: 'attendance-4',
      projectId: 'project-1',
      vendorName: 'Engg Associates',
      date: '2026-03-04',
      plannedWorkers: 10,
      actualPresent: 9,
      createdAt: new Date('2026-03-04').toISOString(),
    },
    {
      id: 'attendance-5',
      projectId: 'project-1',
      vendorName: 'Engg Associates',
      date: '2026-03-05',
      plannedWorkers: 10,
      actualPresent: 10,
      createdAt: new Date('2026-03-05').toISOString(),
    },
    // Project 2 - Electrical
    {
      id: 'attendance-6',
      projectId: 'project-2',
      vendorName: 'Build Tech Solutions',
      date: '2026-03-01',
      plannedWorkers: 15,
      actualPresent: 14,
      createdAt: new Date('2026-03-01').toISOString(),
    },
    {
      id: 'attendance-7',
      projectId: 'project-2',
      vendorName: 'Build Tech Solutions',
      date: '2026-03-02',
      plannedWorkers: 15,
      actualPresent: 12,
      createdAt: new Date('2026-03-02').toISOString(),
    },
    {
      id: 'attendance-8',
      projectId: 'project-2',
      vendorName: 'Build Tech Solutions',
      date: '2026-03-03',
      plannedWorkers: 15,
      actualPresent: 15,
      createdAt: new Date('2026-03-03').toISOString(),
    },
    {
      id: 'attendance-9',
      projectId: 'project-2',
      vendorName: 'Build Tech Solutions',
      date: '2026-03-04',
      plannedWorkers: 15,
      actualPresent: 13,
      createdAt: new Date('2026-03-04').toISOString(),
    },
    {
      id: 'attendance-10',
      projectId: 'project-2',
      vendorName: 'Build Tech Solutions',
      date: '2026-03-05',
      plannedWorkers: 15,
      actualPresent: 14,
      createdAt: new Date('2026-03-05').toISOString(),
    },
    // Project 3 - Boiler (completed)
    {
      id: 'attendance-11',
      projectId: 'project-3',
      vendorName: 'Precision Engineering',
      date: '2026-02-01',
      plannedWorkers: 8,
      actualPresent: 8,
      createdAt: new Date('2026-02-01').toISOString(),
    },
    {
      id: 'attendance-12',
      projectId: 'project-3',
      vendorName: 'Precision Engineering',
      date: '2026-02-02',
      plannedWorkers: 8,
      actualPresent: 8,
      createdAt: new Date('2026-02-02').toISOString(),
    },
    {
      id: 'attendance-13',
      projectId: 'project-3',
      vendorName: 'Precision Engineering',
      date: '2026-02-03',
      plannedWorkers: 8,
      actualPresent: 7,
      createdAt: new Date('2026-02-03').toISOString(),
    },
  ];

  attendanceRecords.forEach(record => saveAttendanceRecord(record));

  // Sample Materials
  const materials: Material[] = [
    {
      id: 'material-1',
      projectId: 'project-1',
      materialName: 'HVAC Ducting - Stainless Steel',
      plannedDeliveryDate: '2026-02-10',
      actualDeliveryDate: '2026-02-10',
      status: 'Received',
      createdAt: new Date('2026-02-01').toISOString(),
    },
    {
      id: 'material-2',
      projectId: 'project-2',
      materialName: 'Electrical Panels - 3 Phase',
      plannedDeliveryDate: '2026-01-25',
      actualDeliveryDate: '2026-01-28',
      status: 'Delayed',
      createdAt: new Date('2026-01-15').toISOString(),
    },
    {
      id: 'material-3',
      projectId: 'project-2',
      materialName: 'Copper Wiring - 500m',
      plannedDeliveryDate: '2026-02-15',
      status: 'Pending',
      createdAt: new Date('2026-01-15').toISOString(),
    },
    {
      id: 'material-4',
      projectId: 'project-4',
      materialName: 'Cement - 50 bags',
      plannedDeliveryDate: '2026-02-20',
      status: 'Pending',
      createdAt: new Date('2026-02-15').toISOString(),
    },
  ];

  materials.forEach(material => saveMaterial(material));
};
