import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { DashboardView } from './components/DashboardView';
import { ProjectForm } from './components/ProjectForm';
import { AttendanceBook } from './components/AttendanceBook';
import { ContractorForm } from './components/ContractorForm';
import { MaterialTracking } from './components/MaterialTracking';
import { LayoutDashboard, FileText, Users, Briefcase, Package } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { seedInitialData } from './utils/seedData';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Seed initial data on first load
    seedInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 px-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center">Manpower Dashboard Engineering</h1>
        <p className="text-center text-blue-100 text-sm mt-1">Sun Pharmaceutical Industries Limited, Toansa (Punjab)</p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="contractors" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Contractors
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Materials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardView />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectForm />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceBook />
          </TabsContent>

          <TabsContent value="contractors">
            <ContractorForm />
          </TabsContent>

          <TabsContent value="materials">
            <MaterialTracking />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;