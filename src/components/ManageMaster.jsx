import React, { useState } from 'react';
import { Users, BookOpen, Plus, Edit2, Trash2, Save, X, UserPlus, BookPlus } from 'lucide-react';
import { getStudents, saveStudent, deleteStudent, getSubjects, saveSubject, deleteSubject } from '../services/attendanceStorage';

export default function ManageMaster({ showToast }) {
  const [activeTab, setActiveTab] = useState('students');

  // Students state
  const [students, setStudents] = useState(getStudents());
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentForm, setStudentForm] = useState({ id: '', rollNo: '', name: '', enrollmentNo: '', dept: 'Computer Engg', sem: '5th' });

  // Subjects state
  const [subjects, setSubjects] = useState(getSubjects());
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ id: '', code: '', name: '', faculty: '', credits: 4 });

  // Handle Student Submit
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!studentForm.rollNo || !studentForm.name || !studentForm.enrollmentNo) {
      alert('Please fill out all required student fields!');
      return;
    }
    const updated = saveStudent(studentForm);
    setStudents(updated);
    setShowStudentModal(false);
    setStudentForm({ id: '', rollNo: '', name: '', enrollmentNo: '', dept: 'Computer Engg', sem: '5th' });
    if (showToast) showToast('Student master record saved!');
  };

  const handleEditStudent = (s) => {
    setStudentForm(s);
    setShowStudentModal(true);
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to remove this student from master records?')) {
      const updated = deleteStudent(id);
      setStudents(updated);
      if (showToast) showToast('Student removed from database.');
    }
  };

  // Handle Subject Submit
  const handleSubjectSubmit = (e) => {
    e.preventDefault();
    if (!subjectForm.code || !subjectForm.name) {
      alert('Please fill out subject code and name!');
      return;
    }
    const updated = saveSubject(subjectForm);
    setSubjects(updated);
    setShowSubjectModal(false);
    setSubjectForm({ id: '', code: '', name: '', faculty: '', credits: 4 });
    if (showToast) showToast('Subject record saved!');
  };

  const handleDeleteSubject = (id) => {
    if (window.confirm('Are you sure you want to remove this subject?')) {
      const updated = deleteSubject(id);
      setSubjects(updated);
      if (showToast) showToast('Subject deleted.');
    }
  };

  return (
    <div className="card">
      {/* Tab Selector Header */}
      <div className="card-header-flex" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2 className="card-title" style={{ fontSize: '22px' }}>
            <Users size={24} style={{ color: 'var(--blue-primary)' }} />
            Master Database Management
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Add, update, or remove enrolled students and master subjects.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={16} /> Students ({students.length})
          </button>
          <button
            className={`btn ${activeTab === 'subjects' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('subjects')}
          >
            <BookOpen size={16} /> Subjects ({subjects.length})
          </button>
        </div>
      </div>

      {/* STUDENTS TAB CONTENT */}
      {activeTab === 'students' && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setStudentForm({ id: '', rollNo: '', name: '', enrollmentNo: '', dept: 'Computer Engg', sem: '5th' });
                setShowStudentModal(true);
              }}
            >
              <UserPlus size={16} /> Add New Student
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Enrollment No</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: '800', color: 'var(--navy-primary)' }}>{s.rollNo}</td>
                    <td style={{ fontWeight: '700' }}>{s.name}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.enrollmentNo}</td>
                    <td>{s.dept}</td>
                    <td>{s.sem}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditStudent(s)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteStudent(s.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBJECTS TAB CONTENT */}
      {activeTab === 'subjects' && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSubjectForm({ id: '', code: '', name: '', faculty: '', credits: 4 });
                setShowSubjectModal(true);
              }}
            >
              <BookPlus size={16} /> Add New Subject
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Faculty Instructor</th>
                  <th>Credits</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: '800' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--blue-light)', color: 'var(--navy-primary)' }}>
                        {sub.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700' }}>{sub.name}</td>
                    <td>{sub.faculty}</td>
                    <td>{sub.credits} Credits</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSubject(sub.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{studentForm.id ? 'Edit Student Details' : 'Add New Student'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowStudentModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleStudentSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Roll No *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentForm.rollNo}
                      onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Student Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Enrollment Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={studentForm.enrollmentNo}
                    onChange={(e) => setStudentForm({ ...studentForm, enrollmentNo: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentForm.dept}
                      onChange={(e) => setStudentForm({ ...studentForm, dept: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Semester</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentForm.sem}
                      onChange={(e) => setStudentForm({ ...studentForm, sem: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStudentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add New Subject</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowSubjectModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubjectSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Subject Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. CE506"
                      value={subjectForm.code}
                      onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Subject Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Artificial Intelligence"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Faculty Instructor</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Prof. Name"
                      value={subjectForm.faculty}
                      onChange={(e) => setSubjectForm({ ...subjectForm, faculty: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Credits</label>
                    <input
                      type="number"
                      className="form-control"
                      value={subjectForm.credits}
                      onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 3 })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
