import React, { useState } from 'react';
import { X, UserCheck, Save, Mail, Phone, BookOpen, Building2, Briefcase, Check } from 'lucide-react';
import { getDepartments, generateSuggestedFacultyId } from '../services/attendanceStorage';

export default function FacultyEditModal({ faculty, departments: propDepts, onClose, onSave, showToast }) {
  const departments = (propDepts && propDepts.length > 0) ? propDepts : getDepartments();

  const [formData, setFormData] = useState({
    id: faculty?.id || (faculty?.name ? generateSuggestedFacultyId(faculty.name) : ''),
    name: faculty?.name || '',
    dept: faculty?.dept || (departments[0]?.name || 'Information Technology'),
    designation: faculty?.designation || 'Associate Professor',
    email: faculty?.email || '',
    phone: faculty?.phone || '',
    subjects: faculty?.subjects || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Faculty name is required.');
      return;
    }
    const finalData = {
      ...formData,
      id: formData.id ? formData.id.trim().toUpperCase() : generateSuggestedFacultyId(formData.name)
    };
    onSave(finalData);
    if (showToast) showToast(`Faculty details updated for ${finalData.name}`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-primary)' }}>
            <UserCheck size={20} />
            {faculty?.id ? 'Edit Faculty Details' : 'Add Faculty Member'}
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                  <UserCheck size={14} style={{ color: 'var(--blue-primary)' }} />
                  Faculty Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Prof. Priya Shah"
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const prevSuggested = generateSuggestedFacultyId(formData.name);
                    const shouldAutoUpdateId = !formData.id || formData.id === prevSuggested;
                    setFormData({
                      ...formData,
                      name: val,
                      id: shouldAutoUpdateId ? generateSuggestedFacultyId(val) : formData.id
                    });
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                  Faculty ID / Code *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. FAC_PS, FAC_PB"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.trim().toUpperCase() })}
                  required
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                  Links timetable slots across devices.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                  <Building2 size={14} style={{ color: 'var(--blue-primary)' }} />
                  Department / Home Category *
                </label>
                <select
                  className="form-control"
                  value={formData.dept}
                  onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                >
                  {departments.map((d) => (
                    <option key={d.id || d.name} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                  Organizational category only; faculty can teach across any department.
                </span>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                  <Briefcase size={14} style={{ color: 'var(--blue-primary)' }} />
                  Designation
                </label>
                <select
                  className="form-control"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                >
                  <option value="Professor & HOD">Professor & HOD</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Adjunct Faculty">Adjunct Faculty</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                  <Mail size={14} style={{ color: 'var(--blue-primary)' }} />
                  Official Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. priya.shah@adit.ac.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                  <Phone size={14} style={{ color: 'var(--blue-primary)' }} />
                  Contact Phone
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 9825011111"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                <BookOpen size={14} style={{ color: 'var(--blue-primary)' }} />
                Subjects Handled (comma-separated)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. DBMS, Data Structures, Python"
                value={formData.subjects}
                onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> {formData.id ? 'Save Changes' : 'Save Faculty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
