import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';
import { Project, PROJECT_STATUSES } from '../utils/constants';
import { calculateDelayPercentage, calculateDelayDays, calculateForecastEndDate, calculateAvgPresentWorkers } from '../utils/calculations';
import { getAttendanceRecords, getMaterials } from '../utils/dataStore';
import { Calendar, Users, AlertCircle, TrendingDown, Package, Camera } from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project;
  open: boolean;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, open, onClose }) => {
  const delayPercentage = calculateDelayPercentage(project);
  const delayDays = calculateDelayDays(project);
  const forecastEnd = calculateForecastEndDate(project);
  const avgWorkers = calculateAvgPresentWorkers(project.id);
  const statusConfig = PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES];

  // Get attendance records for timeline
  const attendanceRecords = getAttendanceRecords()
    .filter(r => r.projectId === project.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Create timeline data
  const timelineData = attendanceRecords.map((record, index) => {
    const attendanceRate = record.plannedWorkers > 0 
      ? (record.actualPresent / record.plannedWorkers) * 100 
      : 0;
    const isDelay = attendanceRate < 80; // Consider below 80% as delay
    
    return {
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      performance: Math.round(attendanceRate),
      planned: 100,
      isDelay
    };
  });

  // Get materials for this project
  const materials = getMaterials().filter(m => m.projectId === project.id);

  // Custom dot for delays
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isDelay) {
      return (
        <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
      );
    }
    return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{project.projectName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Plant:</span>
                  <p className="text-base mt-1">{project.plant}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Department:</span>
                  <p className="text-base mt-1">{project.department}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Category:</span>
                  <p className="text-base mt-1">{project.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.color} text-white`}>
                      {project.status}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Responsible Manager:</span>
                  <p className="text-base mt-1">{project.responsibleManager}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Vendor:</span>
                  <p className="text-base mt-1">{project.vendorAllotted}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Planned Workers:</span>
                  <p className="text-base mt-1">{project.plannedWorkers}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Avg. Present Workers:</span>
                  <p className="text-base mt-1">{avgWorkers.toFixed(1)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Date Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Planned Start Date:</span>
                  <p className="text-base mt-1">{new Date(project.plannedStartDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Planned End Date:</span>
                  <p className="text-base mt-1">{new Date(project.plannedEndDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Forecast End Date:</span>
                  <p className={`text-base mt-1 ${delayDays > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}`}>
                    {forecastEnd ? new Date(forecastEnd).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Actual End Date:</span>
                  <p className="text-base mt-1">
                    {project.actualEndDate ? new Date(project.actualEndDate).toLocaleDateString() : 'Not completed'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Delay Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Delay Percentage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">{delayPercentage.toFixed(1)}%</div>
                  <p className="text-xs text-gray-500 mt-1">Based on attendance</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Delay Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-500">{delayDays} days</div>
                  <p className="text-xs text-gray-500 mt-1">Behind schedule</p>
                </CardContent>
              </Card>
            </div>

            {/* Delay Reasons */}
            {project.delayReasons && project.delayReasons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Delay Reasons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {project.delayReasons.map((reason, index) => (
                      <li key={index} className="text-sm text-gray-700">{reason}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Project Performance Timeline</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Red dots indicate days with attendance below 80%
                </p>
              </CardHeader>
              <CardContent>
                {timelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="planned" 
                        stroke="#94a3b8" 
                        strokeDasharray="5 5" 
                        name="Planned (100%)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="performance" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={<CustomDot />}
                        name="Actual Performance"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No attendance data available for this project
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Material Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                {materials.length > 0 ? (
                  <div className="space-y-4">
                    {materials.map((material) => {
                      const isDelayed = material.actualDeliveryDate 
                        ? new Date(material.actualDeliveryDate) > new Date(material.plannedDeliveryDate)
                        : new Date() > new Date(material.plannedDeliveryDate);
                      
                      return (
                        <div key={material.id} className={`p-4 border rounded-lg ${isDelayed ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{material.materialName}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              material.status === 'Received' ? 'bg-green-500 text-white' :
                              material.status === 'Delayed' ? 'bg-red-500 text-white' :
                              'bg-yellow-500 text-white'
                            }`}>
                              {material.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Planned Delivery:</span>
                              <p className="font-medium">{new Date(material.plannedDeliveryDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Actual Delivery:</span>
                              <p className={`font-medium ${isDelayed ? 'text-red-600' : ''}`}>
                                {material.actualDeliveryDate 
                                  ? new Date(material.actualDeliveryDate).toLocaleDateString()
                                  : 'Pending'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No materials tracked for this project
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Project Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Before Photo</h4>
                    {project.beforePhoto ? (
                      <img src={project.beforePhoto} alt="Before" className="w-full h-64 object-cover rounded-lg border" />
                    ) : (
                      <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400">
                        No photo uploaded
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">After Photo</h4>
                    {project.afterPhoto ? (
                      <img src={project.afterPhoto} alt="After" className="w-full h-64 object-cover rounded-lg border" />
                    ) : (
                      <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400">
                        No photo uploaded
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
