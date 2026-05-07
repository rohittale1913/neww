import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { classAPI, subjectAPI, teacherAPI } from '../services/api';
import { FiArrowLeft, FiCheck, FiPlus, FiX } from 'react-icons/fi';
import Modal from '../components/Modal';

const TeacherAssignmentCreate = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myClasses, setMyClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    className: '',
    section: '',
    subject: '',
    totalMarks: 100,
    dueDate: '',
    attachments: []
  });

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.classes)) return value.classes;
    if (Array.isArray(value?.subjects)) return value.subjects;
    return [];
  };

  const isLikelyObjectId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);

      const [teacherClassesRes, classesRes, subjectsRes] = await Promise.all([
        teacherAPI.getMyClasses(),
        classAPI.getAll(),
        subjectAPI.getAll()
      ]);

      setMyClasses(normalizeArray(teacherClassesRes?.data ?? teacherClassesRes));
      setAllClasses(normalizeArray(classesRes?.data ?? classesRes));
      setSubjects(normalizeArray(subjectsRes?.data ?? subjectsRes));
    } catch (err) {
      console.error('Error fetching teacher assignment data:', err);
      setError('Failed to load class, section, and subject options');
      setMyClasses([]);
      setAllClasses([]);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const classOptions = useMemo(() => {
    return [...new Set((Array.isArray(myClasses) ? myClasses : [])
      .map((item) => item.className)
      .filter(Boolean))];
  }, [myClasses]);

  const subjectOptions = useMemo(() => {
    const source = Array.isArray(myClasses) ? myClasses : [];

    if (formData.className && formData.section) {
      const matchedClass = source.find(
        (item) => item.className === formData.className && item.section === formData.section
      );

      if (matchedClass?.assignedSubjects?.length) return matchedClass.assignedSubjects;
      if (matchedClass?.subjects?.length) return matchedClass.subjects;
    }

    return subjects;
  }, [formData.className, formData.section, myClasses, subjects]);

  const normalizedSubjectOptions = useMemo(() => {
    const subjectCatalog = Array.isArray(subjects) ? subjects : [];

    const mapped = (Array.isArray(subjectOptions) ? subjectOptions : [])
      .map((subject) => {
        if (typeof subject === 'string') {
          const trimmed = subject.trim();
          if (!trimmed) return null;

          if (isLikelyObjectId(trimmed)) {
            const matched = subjectCatalog.find((item) => (item?._id || item?.id) === trimmed);
            return {
              value: trimmed,
              label: matched?.name || trimmed
            };
          }

          const matchedByNameOrCode = subjectCatalog.find((item) => {
            const name = (item?.name || '').trim().toLowerCase();
            const code = (item?.code || '').trim().toLowerCase();
            const probe = trimmed.toLowerCase();
            return name === probe || code === probe;
          });

          if (matchedByNameOrCode) {
            return {
              value: matchedByNameOrCode._id || matchedByNameOrCode.id,
              label: matchedByNameOrCode.name || trimmed
            };
          }

          // If subject exists only as a teacher-assigned name, keep it visible and selectable.
          // The backend resolves name/code to ObjectId before saving.
          return {
            value: trimmed,
            label: trimmed
          };
        }

        const value = subject?._id || subject?.id || subject?.name || subject?.subjectName || subject?.title;
        if (!value) return null;

        return {
          value,
          label: subject?.name || subject?.subjectName || subject?.title || value
        };
      })
      .filter(Boolean);

    return mapped.filter((item, index, list) => list.findIndex((x) => x.value === item.value) === index);
  }, [subjectOptions, subjects]);

  useEffect(() => {
    if (!formData.className) {
      setSections([]);
      return;
    }

    const relevantClasses = Array.isArray(myClasses)
      ? myClasses.filter((item) => item.className === formData.className)
      : [];

    const teacherSections = relevantClasses
      .flatMap((item) => Array.isArray(item.sections) ? item.sections : [item.section])
      .filter(Boolean);

    if (teacherSections.length > 0) {
      setSections([...new Set(teacherSections)]);
      return;
    }

    const fallbackSections = [...new Set(
      (Array.isArray(allClasses) ? allClasses : [])
        .filter((item) => item.className === formData.className)
        .map((item) => item.section)
        .filter(Boolean)
    )];

    setSections(fallbackSections);
  }, [formData.className, myClasses, allClasses]);

  const handleClassChange = (e) => {
    const className = e.target.value;
    setFormData((prev) => ({
      ...prev,
      className,
      section: '',
      subject: ''
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAttachment = () => {
    const trimmed = attachmentUrl.trim();
    if (!trimmed) return;

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, trimmed]
    }));
    setAttachmentUrl('');
    setShowAttachmentModal(false);
  };

  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) return setError('Assignment title is required');
    if (!formData.className) return setError('Please select a class');
    if (!formData.section) return setError('Please select a section');
    if (!formData.subject) return setError('Please select a subject');
    if (!formData.dueDate) return setError('Please set a due date');

    try {
      setLoading(true);

      const response = await teacherAPI.createAssignment({
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        className: formData.className,
        section: formData.section,
        subject: formData.subject,
        totalMarks: Number(formData.totalMarks),
        dueDate: formData.dueDate,
        attachments: formData.attachments
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess('Assignment created successfully!');
        setTimeout(() => navigate('/teacher/assignments'), 1500);
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Create Assignment</h1>
            <p className="text-slate-600 mt-1">Create a new assignment for your class</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 flex items-center gap-2">
            <FiCheck className="w-5 h-5" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Assignment Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Chapter 5 Algebra Exercise"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Class <span className="text-red-600">*</span>
              </label>
              <select
                name="className"
                value={formData.className}
                onChange={handleClassChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Class</option>
                {classOptions.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Section <span className="text-red-600">*</span>
              </label>
              <select
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Section</option>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subject <span className="text-red-600">*</span>
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Subject</option>
                {normalizedSubjectOptions.map((subj) => (
                  <option key={subj.value} value={subj.value}>
                    {subj.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Total Marks</label>
              <input
                type="number"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Due Date & Time <span className="text-red-600">*</span>
              </label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide a brief description of the assignment"
                rows="4"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Instructions</label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                placeholder="Provide detailed instructions for students"
                rows="4"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Attachments</label>

              {Array.isArray(formData.attachments) && formData.attachments.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.attachments.map((attachment, index) => (
                    <div key={`${attachment}-${index}`} className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                      <span className="text-sm text-slate-700 truncate">{attachment}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-600 hover:text-red-700 transition"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowAttachmentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition"
              >
                <FiPlus className="w-5 h-5" />
                Add Attachment Link
              </button>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6">
            <button
              type="button"
              onClick={() => navigate('/teacher/assignments')}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>

      {showAttachmentModal && (
        <Modal
          title="Add Attachment"
          onClose={() => {
            setShowAttachmentModal(false);
            setAttachmentUrl('');
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Attachment URL</label>
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://example.com/document.pdf"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Enter a URL to a document or resource</p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowAttachmentModal(false);
                  setAttachmentUrl('');
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default TeacherAssignmentCreate;