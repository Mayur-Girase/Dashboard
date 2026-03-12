import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Material } from '../utils/constants';
import { getProjects, getMaterials, saveMaterial } from '../utils/dataStore';
import { calculateMaterialDelayPercentage } from '../utils/calculations';
import { toast } from 'sonner';

export const MaterialTracking: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  
  const [formData, setFormData] = useState({
    projectId: '',
    materialName: '',
    plannedDeliveryDate: '',
  });

  const [actualDeliveryDate, setActualDeliveryDate] = useState('');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = () => {
    setMaterials(getMaterials());
  };

  const projects = getProjects();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.materialName || !formData.plannedDeliveryDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const material: Material = {
      id: `material-${Date.now()}`,
      projectId: formData.projectId,
      materialName: formData.materialName,
      plannedDeliveryDate: formData.plannedDeliveryDate,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    saveMaterial(material);
    loadMaterials();
    resetForm();
    setIsModalOpen(false);
    toast.success('Material added successfully');
  };

  const handleUpdateDelivery = () => {
    if (!selectedMaterial || !actualDeliveryDate) {
      toast.error('Please select a delivery date');
      return;
    }

    const plannedDate = new Date(selectedMaterial.plannedDeliveryDate);
    const actualDate = new Date(actualDeliveryDate);
    const isDelayed = actualDate > plannedDate;

    const updatedMaterial: Material = {
      ...selectedMaterial,
      actualDeliveryDate: actualDeliveryDate,
      status: isDelayed ? 'Delayed' : 'Received',
    };

    saveMaterial(updatedMaterial);
    loadMaterials();
    setIsUpdateModalOpen(false);
    setSelectedMaterial(null);
    setActualDeliveryDate('');
    toast.success('Delivery date updated successfully');
  };

  const resetForm = () => {
    setFormData({
      projectId: '',
      materialName: '',
      plannedDeliveryDate: '',
    });
  };

  // Group materials by project
  const materialsByProject = materials.reduce((acc, material) => {
    const project = projects.find(p => p.id === material.projectId);
    const projectName = project?.projectName || 'Unknown Project';
    
    if (!acc[projectName]) {
      acc[projectName] = [];
    }
    acc[projectName].push(material);
    return acc;
  }, {} as { [key: string]: Material[] });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Received':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Delayed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Material Tracking
            </CardTitle>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(materialsByProject).map(([projectName, projectMaterials]) => (
              <Card key={projectName}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{projectName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projectMaterials.map((material) => {
                      const plannedDate = new Date(material.plannedDeliveryDate);
                      const actualDate = material.actualDeliveryDate ? new Date(material.actualDeliveryDate) : null;
                      const today = new Date();
                      const isOverdue = !actualDate && today > plannedDate;
                      const delayDays = actualDate && actualDate > plannedDate 
                        ? Math.ceil((actualDate.getTime() - plannedDate.getTime()) / (1000 * 60 * 60 * 24))
                        : 0;

                      return (
                        <div 
                          key={material.id} 
                          className={`p-4 border rounded-lg ${
                            material.status === 'Delayed' || isOverdue ? 'border-red-200 bg-red-50' :
                            material.status === 'Received' ? 'border-green-200 bg-green-50' :
                            'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(material.status)}
                                <h4 className="font-semibold">{material.materialName}</h4>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                <div>
                                  <span className="text-gray-600">Planned Delivery:</span>
                                  <p className="font-medium">{plannedDate.toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Actual Delivery:</span>
                                  <p className={`font-medium ${
                                    material.status === 'Delayed' ? 'text-red-600' :
                                    material.status === 'Received' ? 'text-green-600' : ''
                                  }`}>
                                    {actualDate ? actualDate.toLocaleDateString() : 'Pending'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Status:</span>
                                  <p className="font-medium">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      material.status === 'Received' ? 'bg-green-500 text-white' :
                                      material.status === 'Delayed' ? 'bg-red-500 text-white' :
                                      'bg-yellow-500 text-white'
                                    }`}>
                                      {material.status}
                                    </span>
                                  </p>
                                </div>
                                {delayDays > 0 && (
                                  <div>
                                    <span className="text-gray-600">Delay Days:</span>
                                    <p className="font-medium text-red-600">{delayDays} days</p>
                                  </div>
                                )}
                                {isOverdue && !actualDate && (
                                  <div className="col-span-2">
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-semibold">
                                      Overdue by {Math.ceil((today.getTime() - plannedDate.getTime()) / (1000 * 60 * 60 * 24))} days
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {material.status === 'Pending' && (
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedMaterial(material);
                                  setIsUpdateModalOpen(true);
                                }}
                              >
                                Update Delivery
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {materials.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No materials tracked yet. Click "Add Material" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Material Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Material</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="project">Select Project *</Label>
              <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
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

            <div>
              <Label htmlFor="materialName">Material Name *</Label>
              <Input
                id="materialName"
                value={formData.materialName}
                onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                placeholder="e.g., Steel Beams, Cement, etc."
                required
              />
            </div>

            <div>
              <Label htmlFor="plannedDeliveryDate">Planned Delivery Date *</Label>
              <Input
                id="plannedDeliveryDate"
                type="date"
                value={formData.plannedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, plannedDeliveryDate: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                Add Material
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Delivery Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Delivery Date</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedMaterial && (
              <>
                <div>
                  <Label>Material Name</Label>
                  <Input value={selectedMaterial.materialName} disabled />
                </div>

                <div>
                  <Label>Planned Delivery Date</Label>
                  <Input value={new Date(selectedMaterial.plannedDeliveryDate).toLocaleDateString()} disabled />
                </div>

                <div>
                  <Label htmlFor="actualDeliveryDate">Actual Delivery Date *</Label>
                  <Input
                    id="actualDeliveryDate"
                    type="date"
                    value={actualDeliveryDate}
                    onChange={(e) => setActualDeliveryDate(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedMaterial(null);
                    setActualDeliveryDate('');
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateDelivery}>
                    Update
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
