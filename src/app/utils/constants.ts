export const PLANTS = [
  'MP01', 'MP02', 'MP03', 'MP04', 'MP05', 'MP06', 'MP07', 'MP9A', 'MP08', 'MP09',
  'MP10', 'MP11', 'MP12', 'MP14', 'MP14A', 'MP15', 'Hydrogenator-1', 'Hydrogenator-2',
  'ETP', 'Pilot Plant', 'QA', 'QC', 'Warehouse', 'Workshop', 'Utility-1', 'Utility-2',
  'Canteen', 'Main Gate', 'Rear Gate', 'Plantation Area', 'Boiler'
];

export const DEPARTMENTS = [
  'Mechanical', 'Electrical', 'Civil', 'Instrumentation', 'Utility', 'HVAC'
];

export const PROJECT_CATEGORIES = ['Minor', 'Major', 'Critical'];

export const PROJECT_STATUSES = {
  'In Progress': { color: 'bg-orange-500', textColor: 'text-orange-500', borderColor: 'border-orange-500' },
  'On Hold': { color: 'bg-red-500', textColor: 'text-red-500', borderColor: 'border-red-500' },
  'Not Started': { color: 'bg-pink-500', textColor: 'text-pink-500', borderColor: 'border-pink-500' },
  'Completed': { color: 'bg-green-500', textColor: 'text-green-500', borderColor: 'border-green-500' }
};

export const MANAGERS = [
  'Piyush Vyas',
  'Abhinav Vikash',
  'Prashant Sharma',
  'Ravinder Singh',
  'Amar Kushwaha',
  'Vaibhav Deshpande',
  'Rahul Sharma',
  'Rakesh Verma'
];

export interface Project {
  id: string;
  projectName: string;
  plant: string;
  department: string;
  category: string;
  status: string;
  responsibleManager: string;
  vendorAllotted: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  plannedWorkers: number;
  delayReasons: string[];
  beforePhoto?: string;
  afterPhoto?: string;
  createdAt: string;
}

export interface Contractor {
  id: string;
  name: string;
  totalWorkers: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  projectId: string;
  vendorName: string;
  date: string;
  plannedWorkers: number;
  actualPresent: number;
  createdAt: string;
}

export interface Material {
  id: string;
  projectId: string;
  materialName: string;
  plannedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: 'Pending' | 'Received' | 'Delayed';
  createdAt: string;
}
