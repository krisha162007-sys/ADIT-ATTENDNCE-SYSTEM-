import React, { useState } from 'react';
import { BookOpen, Search, Filter, Calendar, CheckCircle2 } from 'lucide-react';
import { getSessions, getSubjects } from '../services/attendanceStorage';

export default function TopicView({ searchQuery }) {
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [localSearch, setLocalSearch] = useState('');

  const sessions = getSessions();
  const subjects = getSubjects();

  const query = (searchQuery || localSearch).toLowerCase();

  const getSubjectObj = (subjId) => subjects.find(s => s.id === subjId) || { code: subjId, name: subjId };

  // Filter topics
  const topicList = sessions
    .filter(sess => sess.topic && sess.topic.trim() !== '')
    .filter(sess => selectedSubject === 'ALL' || sess.subjectId === selectedSubject)
    .filter(sess => {
      const topicText = sess.topic.toLowerCase();
      const dateText = sess.date.toLowerCase();
      const subj = getSubjectObj(sess.subjectId);
      const subjText = (subj.name + ' ' + subj.code).toLowerCase();
      return !query || topicText.includes(query) || dateText.includes(query) || subjText.includes(query);
    });

  // Calculate topic counts per subject
  const subjectTopicCounts = subjects.map(subj => {
    const count = sessions.filter(s => s.subjectId === subj.id && s.topic).length;
    return { ...subj, topicCount: count };
  });

  return (
    <div className="card">
      <div className="card-header-flex" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="card-title" style={{ fontSize: '22px' }}>
            <BookOpen size={24} style={{ color: 'var(--blue-primary)' }} />
            Curriculum Topic Log
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Track all syllabus topics taught per lecture date across subjects.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="input-with-icon" style={{ width: '220px' }}>
            <Search className="input-icon" size={15} />
            <input
              type="text"
              className="form-control"
              placeholder="Search topic..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              style={{ height: '38px' }}
            />
          </div>

          <select
            className="form-control"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ width: '200px', height: '38px' }}
          >
            <option value="ALL">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject Topic Progress Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px', marginBottom: '24px' }}>
        {subjectTopicCounts.map(subj => (
          <div
            key={subj.id}
            style={{
              flex: '1 1 200px',
              backgroundColor: 'var(--blue-light)',
              border: '1px solid var(--blue-sky)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--navy-primary)', display: 'block' }}>
                {subj.code}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>
                {subj.name}
              </span>
            </div>
            <span className="badge" style={{ backgroundColor: 'var(--navy-primary)', color: 'white', fontWeight: '800' }}>
              {subj.topicCount} Topics
            </span>
          </div>
        ))}
      </div>

      {/* Topic History Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Subject</th>
              <th>Topic Taught</th>
              <th>Faculty</th>
            </tr>
          </thead>
          <tbody>
            {topicList.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No topic records found matching your search.
                </td>
              </tr>
            ) : (
              topicList.map((sess) => {
                const subj = getSubjectObj(sess.subjectId);
                return (
                  <tr key={sess.id}>
                    <td style={{ fontWeight: '700', whiteSpace: 'nowrap', width: '130px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} style={{ color: 'var(--blue-primary)' }} />
                        {sess.date}
                      </span>
                    </td>
                    <td style={{ width: '220px' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--blue-sky)', color: 'var(--navy-primary)' }}>
                        {subj.code}
                      </span>
                      <span style={{ fontSize: '13px', marginLeft: '6px', fontWeight: '600' }}>
                        {subj.name}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--navy-dark)', fontSize: '15px' }}>
                      {sess.topic}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {subj.faculty || 'N/A'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
