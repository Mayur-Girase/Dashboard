import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { CalendarIcon, Plus, Users, TrendingUp } from 'lucide-react';
import { AttendanceRecord, Project } from '../utils/constants';
import { getProjects, getContractors, getAttendanceRecords, saveAttendanceRecord } from '../utils/dataStore';
import { calculateContractorPerformance } from '../utils/calculations';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const AttendanceBook: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [actualPresent, setActualPresent] = useState<number>(0);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = () => {
    setAttendanceRecords(getAttendanceRecords());
  };

  const projects = getProjects();
  const contractors = getContractors();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }

    const project = projects.find(p => p.id === selectedProject);
    if (!project) {
      toast.error('Project not found');
      return;
    }

    const record: AttendanceRecord = {
      id: `attendance-${Date.now()}`,
      projectId: project.id,
      vendorName: project.vendorAllotted,
      date: selectedDate.toISOString().split('T')[0],
      plannedWorkers: project.plannedWorkers,
      actualPresent: actualPresent,
      createdAt: new Date().toISOString(),
    };

    saveAttendanceRecord(record);
    loadAttendance();
    setIsModalOpen(false);
    setSelectedProject('');
    setActualPresent(0);
    toast.success('Attendance marked successfully');
  };

  // Group attendance by date
  const attendanceByDate = attendanceRecords.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as { [key: string]: AttendanceRecord[] });

  // Calculate vendor performance
  const vendorPerformances = contractors.map(contractor => ({
    name: contractor.name,
    performance: calculateContractorPerformance(contractor.name)
  })).filter(v => v.performance > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Daily Attendance Book</CardTitle>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Vendor Performance Summary */}
            <div>
              <h3 className="font-semibold mb-3">Vendor Performance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vendorPerformances.map((vendor) => (
                  <Card key={vendor.name} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{vendor.name}</p>
                          <p className="text-2xl font-bold text-blue-600">{vendor.performance.toFixed(1)}%</p>
                        </div>
                        <TrendingUp className={`w-8 h-8 ${vendor.performance >= 80 ? 'text-green-500' : 'text-orange-500'}`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Attendance Records */}
            <div>
              <h3 className="font-semibold mb-3">Attendance Records</h3>
              <div className="space-y-4">
                {Object.entries(attendanceByDate)
                  .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                  .map(([date, records]) => (
                    <Card key={date}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="p-2 text-left">Project</th>
                                <th className="p-2 text-left">Vendor</th>
                                <th className="p-2 text-left">Planned Workers</th>
                                <th className="p-2 text-left">Actual Present</th>
                                <th className="p-2 text-left">Attendance %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {records.map((record) => {
                                const project = projects.find(p => p.id === record.projectId);
                                const attendancePercentage = record.plannedWorkers > 0 
                                  ? (record.actualPresent / record.plannedWorkers) * 100 
                                  : 0;
                                
                                return (
                                  <tr key={record.id} className="border-t">
                                    <td className="p-2">{project?.projectName || 'Unknown'}</td>
                                    <td className="p-2">{record.vendorName}</td>
                                    <td className="p-2">{record.plannedWorkers}</td>
                                    <td className="p-2 font-semibold">{record.actualPresent}</td>
                                    <td className="p-2">
                                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        attendancePercentage >= 90 ? 'bg-green-100 text-green-700' :
                                        attendancePercentage >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {attendancePercentage.toFixed(1)}%
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {Object.keys(attendanceByDate).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No attendance records yet. Click "Mark Attendance" to add records.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mark Attendance Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Daily Attendance</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="project">Select Project *</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.projectName} - {project.plant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProject && (
              <>
                <div>
                  <Label>Vendor</Label>
                  <Input
                    value={projects.find(p => p.id === selectedProject)?.vendorAllotted || ''}
                    disabled
                  />
                </div>

                <div>
                  <Label>Planned Workers</Label>
                  <Input
                    type="number"
                    value={projects.find(p => p.id === selectedProject)?.plannedWorkers || 0}
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="actualPresent">Actual Workers Present *</Label>
                  <Input
                    id="actualPresent"
                    type="number"
                    min="0"
                    value={actualPresent}
                    onChange={(e) => setActualPresent(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Mark Attendance
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
