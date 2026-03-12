import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Edit2, Trash2, Upload, AlertCircle } from 'lucide-react';
import { PLANTS, DEPARTMENTS, PROJECT_CATEGORIES, MANAGERS, Project } from '../utils/constants';
import { getProjects, saveProject, deleteProject, getContractors } from '../utils/dataStore';
import { toast } from 'sonner';

export const ProjectForm: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDelayReasonModalOpen, setIsDelayReasonModalOpen] = useState(false);
  const [selectedProjectForDelay, setSelectedProjectForDelay] = useState<Project | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    projectName: '',
    plant: '',
    department: '',
    category: 'Minor',
    status: 'Not Started',
    responsibleManager: '',
    vendorAllotted: '',
    plannedStartDate: '',
    plannedEndDate: '',
    plannedWorkers: 0,
    beforePhoto: '',
    afterPhoto: '',
  });
  const [delayReason, setDelayReason] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    setProjects(getProjects());
  };

  const contractors = getContractors();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (contractors.length === 0) {
      toast.error('Please add a contractor first before creating a project');
      return;
    }
    
    if (!formData.projectName || !formData.plant || !formData.department || !formData.responsibleManager || 
        !formData.vendorAllotted || !formData.plannedStartDate || !formData.plannedEndDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const project: Project = {
      id: editingProject?.id || `project-${Date.now()}`,
      ...formData,
      delayReasons: editingProject?.delayReasons || [],
      createdAt: editingProject?.createdAt || new Date().toISOString(),
    };

    saveProject(project);
    loadProjects();
    resetForm();
    setIsModalOpen(false);
    toast.success(editingProject ? 'Project updated successfully' : 'Project added successfully');
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      projectName: project.projectName,
      plant: project.plant,
      department: project.department,
      category: project.category,
      status: project.status,
      responsibleManager: project.responsibleManager,
      vendorAllotted: project.vendorAllotted,
      plannedStartDate: project.plannedStartDate,
      plannedEndDate: project.plannedEndDate,
      plannedWorkers: project.plannedWorkers,
      beforePhoto: project.beforePhoto || '',
      afterPhoto: project.afterPhoto || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      loadProjects();
      toast.success('Project deleted successfully');
    }
  };

  const handleAddDelayReason = (projectId: string) => {
    if (!delayReason.trim()) {
      toast.error('Please enter a delay reason');
      return;
    }

    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.delayReasons = [...(project.delayReasons || []), delayReason];
      saveProject(project);
      loadProjects();
      setDelayReason('');
      setIsDelayReasonModalOpen(false);
      setSelectedProjectForDelay(null);
      toast.success('Delay reason added');
    }
  };

  const resetForm = () => {
    setFormData({
      projectName: '',
      plant: '',
      department: '',
      category: 'Minor',
      status: 'Not Started',
      responsibleManager: '',
      vendorAllotted: '',
      plannedStartDate: '',
      plannedEndDate: '',
      plannedWorkers: 0,
      beforePhoto: '',
      afterPhoto: '',
    });
    setEditingProject(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'before') {
          setFormData({ ...formData, beforePhoto: reader.result as string });
        } else {
          setFormData({ ...formData, afterPhoto: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Project Management</CardTitle>
            <Button onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="border-l-4" style={{ borderLeftColor: 
                project.status === 'In Progress' ? '#f97316' :
                project.status === 'On Hold' ? '#ef4444' :
                project.status === 'Not Started' ? '#ec4899' : '#22c55e'
              }}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{project.projectName}</h3>
                        <p className="text-sm text-gray-600">{project.plant} - {project.department}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-600">Manager: <span className="font-medium">{project.responsibleManager}</span></p>
                        <p className="text-gray-600">Vendor: <span className="font-medium">{project.vendorAllotted}</span></p>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-600">Category: <span className="font-medium">{project.category}</span></p>
                        <p className="text-gray-600">Workers: <span className="font-medium">{project.plannedWorkers}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedProjectForDelay(project);
                        setIsDelayReasonModalOpen(true);
                      }} title="Add Delay Reason">
                        <AlertCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(project)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(project.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No projects added yet. Click "Add New Project" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Project Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="plant">Plant *</Label>
                <Select value={formData.plant} onValueChange={(value) => setFormData({ ...formData, plant: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plant" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANTS.map((plant) => (
                      <SelectItem key={plant} value={plant}>{plant}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="manager">Responsible Manager *</Label>
                <Select value={formData.responsibleManager} onValueChange={(value) => setFormData({ ...formData, responsibleManager: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {MANAGERS.map((manager) => (
                      <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vendor">Vendor Allotted *</Label>
                <Select value={formData.vendorAllotted} onValueChange={(value) => setFormData({ ...formData, vendorAllotted: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractors.map((contractor) => (
                      <SelectItem key={contractor.id} value={contractor.name}>{contractor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="plannedWorkers">Planned Workers *</Label>
                <Input
                  id="plannedWorkers"
                  type="number"
                  min="0"
                  value={formData.plannedWorkers}
                  onChange={(e) => setFormData({ ...formData, plannedWorkers: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="startDate">Planned Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.plannedStartDate}
                  onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">Planned End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.plannedEndDate}
                  onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="beforePhoto">Before Photo</Label>
                <Input
                  id="beforePhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'before')}
                />
                {formData.beforePhoto && (
                  <img src={formData.beforePhoto} alt="Before" className="mt-2 w-full h-32 object-cover rounded border" />
                )}
              </div>

              <div>
                <Label htmlFor="afterPhoto">After Photo</Label>
                <Input
                  id="afterPhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'after')}
                />
                {formData.afterPhoto && (
                  <img src={formData.afterPhoto} alt="After" className="mt-2 w-full h-32 object-cover rounded border" />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProject ? 'Update Project' : 'Add Project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delay Reason Modal */}
      <Dialog open={isDelayReasonModalOpen} onOpenChange={setIsDelayReasonModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Delay Reason</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedProjectForDelay && (
              <>
                <div>
                  <Label>Project Name</Label>
                  <Input value={selectedProjectForDelay.projectName} disabled />
                </div>

                <div>
                  <Label htmlFor="delayReason">Delay Reason *</Label>
                  <Textarea
                    id="delayReason"
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value)}
                    placeholder="Enter reason for delay..."
                    rows={4}
                  />
                </div>

                {selectedProjectForDelay.delayReasons && selectedProjectForDelay.delayReasons.length > 0 && (
                  <div>
                    <Label>Previous Delay Reasons</Label>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                      {selectedProjectForDelay.delayReasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDelayReasonModalOpen(false);
                    setSelectedProjectForDelay(null);
                    setDelayReason('');
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={() => selectedProjectForDelay && handleAddDelayReason(selectedProjectForDelay.id)}>
                    Add Reason
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};