import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { feeAPI, classAssignmentAPI } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import Modal from '../components/Modal';

const AdminFeeTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    feeType: 'tuition',
    amount: '',
    academicYear: '2024-2025',
    applicableClasses: [],
    dueDate: ''
  });

  useEffect(() => {
    fetchTemplates();
    fetchClasses();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await feeAPI.getTemplates({ academicYear: '2024-2025' });
      const templatesArray = Array.isArray(response.data) ? response.data : (response.data?.templates || []);
      setTemplates(templatesArray);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classAssignmentAPI.getAllClasses();
      const classesArray = Array.isArray(response) ? response : (response.data || []);
      setClasses(classesArray);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || '',
        feeType: template.feeType,
        amount: template.amount,
        academicYear: template.academicYear,
        applicableClasses: template.applicableClasses || [],
        dueDate: template.dueDate.split('T')[0]
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        feeType: 'tuition',
        amount: '',
        academicYear: '2024-2025',
        applicableClasses: [],
        dueDate: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTemplate) {
        await feeAPI.updateTemplate(editingTemplate._id, formData);
        alert('Template updated successfully!');
      } else {
        await feeAPI.createTemplate(formData);
        alert('Template created successfully!');
      }

      setShowModal(false);
      fetchTemplates();
    } catch (error) {
      alert('Failed to save template: ' + error.message);
    }
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await feeAPI.deleteTemplate(templateId);
        alert('Template deleted successfully!');
        fetchTemplates();
      } catch (error) {
        alert('Failed to delete template: ' + error.message);
      }
    }
  };

  const handleClassToggle = (className) => {
    const updated = formData.applicableClasses.includes(className)
      ? formData.applicableClasses.filter(c => c !== className)
      : [...formData.applicableClasses, className];

    setFormData({ ...formData, applicableClasses: updated });
  };

  const getApplicableClassesDisplay = (template) => {
    if (!template.applicableClasses || template.applicableClasses.length === 0) {
      return <span className="text-slate-500 italic">All Classes</span>;
    }
    return template.applicableClasses.join(', ');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-purple-600 bg-clip-text text-transparent">
              Fee Templates
            </h1>
            <p className="text-slate-500 mt-2">Create and manage predefined fees for bulk assignment</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <FiPlus /> Create Template
          </button>
        </div>

        {/* Templates Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
            <h2 className="text-2xl font-bold text-slate-900">All Templates ({templates.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Fee Type</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Applicable Classes</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Academic Year</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      Loading templates...
                    </td>
                  </tr>
                ) : templates.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      No templates found. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  templates.map(template => (
                    <tr key={template._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {template.name}
                        {template.description && (
                          <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 capitalize text-sm text-slate-700">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {template.feeType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 text-sm text-right">
                        ${template.amount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getApplicableClassesDisplay(template)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(template.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {template.academicYear}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal(template)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(template._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTemplate ? 'Edit Fee Template' : 'Create Fee Template'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Template Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="e.g., Monthly Tuition Fee"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              rows="2"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fee Type *</label>
              <select
                value={formData.feeType}
                onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="tuition">Tuition</option>
                <option value="transport">Transport</option>
                <option value="uniform">Uniform</option>
                <option value="activities">Activities</option>
                <option value="exam">Exam</option>
                <option value="library">Library</option>
                <option value="sports">Sports</option>
                <option value="registration">Registration</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year *</label>
              <select
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Applicable Classes</label>
            <p className="text-xs text-slate-500 mb-2">Leave empty to apply to all classes</p>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-slate-50 p-3 rounded-lg border border-slate-200">
              {classes.length === 0 ? (
                <p className="text-sm text-slate-500">No classes available</p>
              ) : (
                classes.map(cls => (
                  <label key={cls._id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.applicableClasses.includes(`${cls.className}-${cls.section}`)}
                      onChange={() => handleClassToggle(`${cls.className}-${cls.section}`)}
                      className="rounded"
                    />
                    <span className="text-sm">{cls.className} - {cls.section}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminFeeTemplate;
