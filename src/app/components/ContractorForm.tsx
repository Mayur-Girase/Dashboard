import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { Contractor } from '../utils/constants';
import { getContractors, saveContractor, deleteContractor } from '../utils/dataStore';
import { calculateContractorPerformance } from '../utils/calculations';
import { toast } from 'sonner';

export const ContractorForm: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    totalWorkers: 0,
  });

  useEffect(() => {
    loadContractors();
  }, []);

  const loadContractors = () => {
    setContractors(getContractors());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.totalWorkers <= 0) {
      toast.error('Please fill in all fields with valid values');
      return;
    }

    const contractor: Contractor = {
      id: editingContractor?.id || `contractor-${Date.now()}`,
      name: formData.name,
      totalWorkers: formData.totalWorkers,
      createdAt: editingContractor?.createdAt || new Date().toISOString(),
    };

    saveContractor(contractor);
    loadContractors();
    resetForm();
    setIsModalOpen(false);
    toast.success(editingContractor ? 'Contractor updated successfully' : 'Contractor added successfully');
  };

  const handleEdit = (contractor: Contractor) => {
    setEditingContractor(contractor);
    setFormData({
      name: contractor.name,
      totalWorkers: contractor.totalWorkers,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this contractor?')) {
      deleteContractor(id);
      loadContractors();
      toast.success('Contractor deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      totalWorkers: 0,
    });
    setEditingContractor(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Contractor Management</CardTitle>
            <Button onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Contractor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contractors.map((contractor) => {
              const performance = calculateContractorPerformance(contractor.name);
              
              return (
                <Card key={contractor.id} className="border-l-4" style={{
                  borderLeftColor: performance >= 80 ? '#22c55e' : performance >= 60 ? '#f97316' : '#ef4444'
                }}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{contractor.name}</h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{contractor.totalWorkers} Total Workers</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(contractor)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(contractor.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {performance > 0 && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Performance</span>
                          <span className={`text-sm font-semibold ${
                            performance >= 80 ? 'text-green-600' : 
                            performance >= 60 ? 'text-orange-600' : 
                            'text-red-600'
                          }`}>
                            {performance.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(performance, 100)}%`,
                              backgroundColor: performance >= 80 ? '#22c55e' : performance >= 60 ? '#f97316' : '#ef4444'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {contractors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No contractors added yet. Click "Add New Contractor" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contractor Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingContractor ? 'Edit Contractor' : 'Add New Contractor'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Contractor Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Engg Associates"
                required
              />
            </div>

            <div>
              <Label htmlFor="totalWorkers">Total Workers *</Label>
              <Input
                id="totalWorkers"
                type="number"
                min="1"
                value={formData.totalWorkers}
                onChange={(e) => setFormData({ ...formData, totalWorkers: parseInt(e.target.value) || 0 })}
                placeholder="e.g., 50"
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
                {editingContractor ? 'Update Contractor' : 'Add Contractor'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
