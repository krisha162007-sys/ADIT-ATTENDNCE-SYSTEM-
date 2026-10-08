import React from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  FileText, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  Printer, 
  Users, 
  ShieldCheck,
  RotateCcw 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onResetData }) {
  const menuItems = [
    { id: 'faculty', label: 'Faculty Panel', icon: UserCheck },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'enter', label: 'Enter Attendance', icon: UserCheck },
    { id: 'list', label: 'View & Edit Attendance', icon: FileText },
    { id: 'dateView', label: 'Date-wise View', icon: Calendar },
    { id: 'topicView', label: 'View Topic', icon: BookOpen },
    { id: 'analytics', label: 'Average & Stats', icon: BarChart3 },
    { id: 'print', label: 'Print Attendance', icon: Printer },
    { id: 'manage', label: 'Admin Panel', icon: ShieldCheck },
  ];

  return (
    <aside className="app-sidebar no-print">
      <div className="sidebar-header">
        <span className="college-tag">Dept. of Computer Engg.</span>
        <h2>ADIT Portal</h2>
      </div>

      <nav style={{ flex: 1 }}>
        <ul className="nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`nav-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button 
          className="reset-btn"
          onClick={() => {
            if (window.confirm('Reset all attendance data back to default sample data?')) {
              onResetData();
            }
          }}
          title="Reset database to default sample records"
        >
          <RotateCcw size={14} />
          <span>Reset Sample Data</span>
        </button>
      </div>
    </aside>
  );
}
