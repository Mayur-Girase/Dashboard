import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PROJECT_STATUSES, PLANTS, DEPARTMENTS, Project } from '../utils/constants';
import { getProjects, getContractors, getAttendanceRecords } from '../utils/dataStore';
import { calculateDelayPercentage, calculateDelayDays, calculateForecastEndDate, calculateContractorPerformance, calculateAvgPresentWorkers } from '../utils/calculations';
import { Filter, TrendingUp, TrendingDown, Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { ProjectDetailModal } from './ProjectDetailModal';

export const DashboardView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedPlant, setSelectedPlant] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProjects(getProjects());
  };

  // Get unique vendors
  const vendors = Array.from(new Set(projects.map(p => p.vendorAllotted))).filter(Boolean);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    if (selectedMonth !== 'all') {
      const projectDate = new Date(project.plannedStartDate);
      const projectMonth = `${projectDate.getFullYear()}-${String(projectDate.getMonth() + 1).padStart(2, '0')}`;
      if (projectMonth !== selectedMonth) return false;
    }
    if (selectedPlant !== 'all' && project.plant !== selectedPlant) return false;
    if (selectedDepartment !== 'all' && project.department !== selectedDepartment) return false;
    if (selectedVendor !== 'all' && project.vendorAllotted !== selectedVendor) return false;
    return true;
  });

  // KPI Calculations
  const kpiData = {
    inProgress: filteredProjects.filter(p => p.status === 'In Progress').length,
    onHold: filteredProjects.filter(p => p.status === 'On Hold').length,
    notStarted: filteredProjects.filter(p => p.status === 'Not Started').length,
    completed: filteredProjects.filter(p => p.status === 'Completed').length,
  };

  // Best and Worst Performers
  const contractors = getContractors();
  const contractorPerformances = contractors.map(contractor => ({
    name: contractor.name,
    performance: calculateContractorPerformance(contractor.name)
  })).filter(c => c.performance > 0);

  contractorPerformances.sort((a, b) => b.performance - a.performance);
  const bestPerformer = contractorPerformances[0];
  const worstPerformer = contractorPerformances[contractorPerformances.length - 1];

  // Department-wise delay data
  const departmentDelayData = DEPARTMENTS.map(dept => {
    const deptProjects = filteredProjects.filter(p => p.department === dept);
    if (deptProjects.length === 0) return { department: dept, avgDelay: 0 };
    
    const totalDelay = deptProjects.reduce((sum, p) => sum + calculateDelayPercentage(p), 0);
    return {
      department: dept,
      avgDelay: Math.round((totalDelay / deptProjects.length) * 10) / 10
    };
  }).filter(d => d.avgDelay > 0);

  // Month-wise project distribution
  const monthData: { [key: string]: any } = {};
  filteredProjects.forEach(project => {
    const date = new Date(project.plannedStartDate);
    const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    if (!monthData[monthKey]) {
      monthData[monthKey] = { month: monthKey, 'In Progress': 0, 'On Hold': 0, 'Not Started': 0, 'Completed': 0 };
    }
    monthData[monthKey][project.status]++;
  });
  const monthChartData = Object.values(monthData);

  // Status pie chart data
  const statusData = [
    { name: 'In Progress', value: kpiData.inProgress, color: '#f97316' },
    { name: 'On Hold', value: kpiData.onHold, color: '#ef4444' },
    { name: 'Not Started', value: kpiData.notStarted, color: '#ec4899' },
    { name: 'Completed', value: kpiData.completed, color: '#22c55e' },
  ];

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowDetail(true);
  };

  const resetFilters = () => {
    setSelectedMonth('all');
    setSelectedPlant('all');
    setSelectedDepartment('all');
    setSelectedVendor('all');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="2026-01">January 2026</SelectItem>
                  <SelectItem value="2026-02">February 2026</SelectItem>
                  <SelectItem value="2026-03">March 2026</SelectItem>
                  <SelectItem value="2026-04">April 2026</SelectItem>
                  <SelectItem value="2026-05">May 2026</SelectItem>
                  <SelectItem value="2026-06">June 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Plant</label>
              <Select value={selectedPlant} onValueChange={setSelectedPlant}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plants</SelectItem>
                  {PLANTS.map(plant => (
                    <SelectItem key={plant} value={plant}>{plant}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Vendor</label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={resetFilters} variant="outline" size="sm">Reset Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{kpiData.inProgress}</div>
            <p className="text-xs text-gray-500 mt-1">Active projects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">On Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{kpiData.onHold}</div>
            <p className="text-xs text-gray-500 mt-1">Paused projects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Not Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-500">{kpiData.notStarted}</div>
            <p className="text-xs text-gray-500 mt-1">Pending projects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{kpiData.completed}</div>
            <p className="text-xs text-gray-500 mt-1">Finished projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Performer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="w-5 h-5" />
              Best Performer of the Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bestPerformer ? (
              <div>
                <div className="text-2xl font-bold text-green-600">{bestPerformer.name}</div>
                <div className="text-sm text-gray-600 mt-1">Performance: {bestPerformer.performance}%</div>
                <p className="text-xs text-gray-500 mt-2">Based on attendance punctuality</p>
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <TrendingDown className="w-5 h-5" />
              Least Performer of the Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {worstPerformer ? (
              <div>
                <div className="text-2xl font-bold text-red-600">{worstPerformer.name}</div>
                <div className="text-sm text-gray-600 mt-1">Performance: {worstPerformer.performance}%</div>
                <p className="text-xs text-gray-500 mt-2">Needs improvement</p>
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Delay Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Average Delay %</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentDelayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                <YAxis label={{ value: 'Delay %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="avgDelay" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Month-wise Projects */}
      {monthChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Month-wise Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="In Progress" fill="#f97316" />
                <Bar dataKey="On Hold" fill="#ef4444" />
                <Bar dataKey="Not Started" fill="#ec4899" />
                <Bar dataKey="Completed" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Project Name</th>
                  <th className="p-3 text-left">Plant</th>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Manager</th>
                  <th className="p-3 text-left">Delay %</th>
                  <th className="p-3 text-left">Delay Days</th>
                  <th className="p-3 text-left">Forecast End</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const delayPercentage = calculateDelayPercentage(project);
                  const delayDays = calculateDelayDays(project);
                  const forecastEnd = calculateForecastEndDate(project);
                  const statusConfig = PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES];

                  return (
                    <tr key={project.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleProjectClick(project)}>
                      <td className="p-3 font-medium">{project.projectName}</td>
                      <td className="p-3">{project.plant}</td>
                      <td className="p-3">{project.department}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.color} text-white`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="p-3">{project.responsibleManager}</td>
                      <td className="p-3">
                        <span className={delayPercentage > 20 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                          {delayPercentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={delayDays > 5 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                          {delayDays} days
                        </span>
                      </td>
                      <td className="p-3">{forecastEnd || 'N/A'}</td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" onClick={(e) => {
                          e.stopPropagation();
                          handleProjectClick(project);
                        }}>
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No projects found. Add a project to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          open={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedProject(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
