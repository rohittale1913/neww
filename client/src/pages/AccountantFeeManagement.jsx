import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { feeAPI, classAPI, studentAPI } from '../services/api';
import { FiPlus, FiFilter, FiUsers, FiCheckCircle } from 'react-icons/fi';
import Modal from '../components/Modal';
import Alert from '../components/Alert';

const AccountantFeeManagement = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [alert, setAlert] = useState(null);

  // Filter states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    feeType: 'tuition',
    totalAmount: '',
    dueDate: '',
    academicYear: '2024-2025',
    remarks: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSectionsForClass(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    }
  }, [selectedClass, selectedSection]);

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getAll();
      const classesArray = Array.isArray(res) ? res : (res.data || []);
      
      // Get unique classes with their backing class record ids
      const uniqueClasses = [...new Map(
        classesArray
          .filter((item) => item?.className)
          .map((item) => [item.className, item])
      ).values()].map((classItem) => ({
        id: classItem._id,
        name: classItem.className,
        sections: classesArray
          .filter(c => c.className === classItem.className)
          .map(c => c.section)
      }));
      
      setClasses(uniqueClasses);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load classes'
      });
    }
  };

  const fetchSectionsForClass = (className) => {
    const classData = classes.find(c => c.name === className);
    setSections(classData?.sections || []);
    setSelectedSection('');
    setSelectedClassId('');
    setStudents([]);
  };

  const fetchStudents = async () => {
    if (!selectedClass || !selectedSection) {
      setStudents([]);
      return;
    }

    try {
      setLoading(true);
      const res = await studentAPI.getByClass(selectedClass);
      const studentsArray = Array.isArray(res.data) ? res.data : (res.data?.students || []);
      
      // Filter by section
      const filteredStudents = studentsArray.filter(s => s.section === selectedSection);
      setStudents(filteredStudents);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load students'
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (className) => {
    setSelectedClass(className);
    fetchSectionsForClass(className);
  };

  const handleSectionChange = (section) => {
    setSelectedSection(section);
    const matchedClass = classes.find(
      (item) => item.name === selectedClass && item.sections.includes(section)
    );
    setSelectedClassId(matchedClass?.id || '');
  };

  const handleCreateFees = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedClass || !selectedSection) {
      setAlert({
        type: 'error',
        message: 'Please select both class and section'
      });
      return;
    }

    if (!selectedClassId) {
      setAlert({
        type: 'error',
        message: 'Unable to resolve the selected class. Please reselect the class and section.'
      });
      return;
    }

    if (students.length === 0) {
      setAlert({
        type: 'error',
        message: 'No students found in this class/section'
      });
      return;
    }

    if (!formData.feeType) {
      setAlert({
        type: 'error',
        message: 'Please select a fee type'
      });
      return;
    }

    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      setAlert({
        type: 'error',
        message: 'Please enter a valid amount (greater than 0)'
      });
      return;
    }

    if (!formData.dueDate) {
      setAlert({
        type: 'error',
        message: 'Please select a due date'
      });
      return;
    }

    try {
      setLoading(true);
      console.log('📦 Creating fees for', students.length, 'students');

      // Create fees for each student
      const promises = students.map(student =>
        feeAPI.add({
          studentId: student._id,
          classId: selectedClassId,
          feeType: formData.feeType,
          totalAmount: parseFloat(formData.totalAmount),
          dueDate: formData.dueDate,
          academicYear: formData.academicYear,
          remarks: formData.remarks || `Bulk created for ${selectedClass} - ${selectedSection}`
        })
      );

      await Promise.all(promises);

      setAlert({
        type: 'success',
        message: `✓ Fees successfully created for ${students.length} students!`
      });

      // Reset form
      setShowCreateModal(false);
      setFormData({
        feeType: 'tuition',
        totalAmount: '',
        dueDate: '',
        academicYear: '2024-2025',
        remarks: ''
      });

      // Refresh students to confirm
      await fetchStudents();
    } catch (error) {
      console.error('Failed to create fees:', error);
      setAlert({
        type: 'error',
        message: 'Failed to create fees: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-purple-600 bg-clip-text text-transparent">
              Create Fees (Accountant)
            </h1>
            <p className="text-slate-500 mt-2">Create fees in bulk for classes and sections</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <FiPlus /> Create Fees
          </button>
        </div>

        {/* Selection Panel */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Select Class & Section</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Class *</label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Select Class</option>
                {classes.map((c, idx) => (
                  <option key={idx} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Section *</label>
              <select
                value={selectedSection}
                onChange={(e) => handleSectionChange(e.target.value)}
                disabled={!selectedClass}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-gray-100"
              >
                <option value="">Select Section</option>
                {sections.map((section, idx) => (
                  <option key={idx} value={section}>{section}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students Panel */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <FiUsers className="text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Students in {selectedClass && selectedSection ? `${selectedClass} - ${selectedSection}` : 'Selected Class'}
            </h3>
            {students.length > 0 && (
              <span className="ml-auto bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                {students.length} students
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              {selectedClass && selectedSection ? 'No students found' : 'Select a class and section to view students'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map(student => (
                <div key={student._id} className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <p className="font-semibold text-slate-900">{student.name}</p>
                  <p className="text-sm text-slate-600">ID: {student.studentId}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Fees Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => !loading && setShowCreateModal(false)}
        title={`Create Fees for ${selectedClass} - ${selectedSection} (${students.length} students)`}
      >
        <form onSubmit={handleCreateFees} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <FiCheckCircle className="inline mr-2" />
              Fees will be created for all <strong>{students.length} students</strong> in this class/section
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fee Type *</label>
            <select
              value={formData.feeType}
              onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              required
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount Per Student *</label>
            <input
              type="number"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Enter amount"
              step="0.01"
              min="0"
              required
            />
          </div>

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
            <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
            <select
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              rows="2"
              placeholder="Optional notes"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : `Create Fees (${students.length} students)`}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition disabled:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AccountantFeeManagement;
