import { useEffect, useState, useMemo, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Shield, Users, Clock, AlertTriangle, Activity, Search,
  ChevronLeft, ChevronRight, Filter, RefreshCw, Wifi,
  CheckCircle, XCircle, TrendingUp, TrendingDown, X, Download,
  User, Globe, Calendar, Zap, Eye, ShieldAlert, ShieldCheck,
  BarChart3, FileSpreadsheet, ChevronDown, ExternalLink
} from "lucide-react";
import "./App.css";

const API_BASE = "https://vpn-dashboard-api-106069351328.asia-south1.run.app";

// Chart colors - Apple palette
const COLORS = {
  blue: "#007aff",
  purple: "#af52de",
  green: "#34c759",
  red: "#ff3b30",
  cyan: "#32ade6",
  orange: "#ff9500",
  pink: "#ff2d55",
  indigo: "#5856d6",
};

// Premium tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="premium-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            <span className="tooltip-dot" style={{ background: entry.color }}></span>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {type === 'success' && <CheckCircle size={18} />}
        {type === 'warning' && <AlertTriangle size={18} />}
        {type === 'info' && <Eye size={18} />}
      </div>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
};

// User Drilldown Drawer Component
const UserDrawer = ({ user, userSessions, onClose, formatDate, getInitials }) => {
  const [toast, setToast] = useState(null);
  const [buttonStates, setButtonStates] = useState({});

  const handleAction = useCallback((action, type, message) => {
    // Set button loading/active state
    setButtonStates(prev => ({ ...prev, [action]: 'loading' }));
    
    // Simulate action with delay
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, [action]: 'success' }));
      setToast({ message, type });
      
      // Reset button state after animation
      setTimeout(() => {
        setButtonStates(prev => ({ ...prev, [action]: null }));
      }, 1500);
    }, 800);
  }, []);

  if (!user) return null;

  const totalSessions = userSessions.length;
  const violations = userSessions.filter(s => s.violation).length;
  const avgDuration = totalSessions > 0
    ? (userSessions.reduce((sum, s) => sum + (parseFloat(s.duration) || 0), 0) / totalSessions).toFixed(1)
    : 0;
  const uniqueIPs = new Set(userSessions.map(s => s.ip_address)).size;
  const violationRate = totalSessions > 0 ? ((violations / totalSessions) * 100).toFixed(1) : 0;

  // Session timeline data
  const timelineData = userSessions.slice(0, 10).map(session => ({
    time: formatDate(session.login_time),
    duration: parseFloat(session.duration) || 0,
    violation: session.violation,
  }));

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-user-info">
            <div className="drawer-avatar">
              {getInitials(user)}
            </div>
            <div>
              <h2 className="drawer-user-name">{user}</h2>
              <p className="drawer-user-meta">User Profile & Analytics</p>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          {/* Quick Stats */}
          <div className="drawer-section">
            <h3 className="drawer-section-title">Overview</h3>
            <div className="drawer-stats">
              <div className="drawer-stat">
                <div className="drawer-stat-icon blue">
                  <Activity size={16} />
                </div>
                <div className="drawer-stat-info">
                  <span className="drawer-stat-value">{totalSessions}</span>
                  <span className="drawer-stat-label">Total Sessions</span>
                </div>
              </div>
              <div className="drawer-stat">
                <div className="drawer-stat-icon red">
                  <AlertTriangle size={16} />
                </div>
                <div className="drawer-stat-info">
                  <span className="drawer-stat-value">{violations}</span>
                  <span className="drawer-stat-label">Violations</span>
                </div>
              </div>
              <div className="drawer-stat">
                <div className="drawer-stat-icon green">
                  <Clock size={16} />
                </div>
                <div className="drawer-stat-info">
                  <span className="drawer-stat-value">{avgDuration}h</span>
                  <span className="drawer-stat-label">Avg Duration</span>
                </div>
              </div>
              <div className="drawer-stat">
                <div className="drawer-stat-icon purple">
                  <Globe size={16} />
                </div>
                <div className="drawer-stat-info">
                  <span className="drawer-stat-value">{uniqueIPs}</span>
                  <span className="drawer-stat-label">Unique IPs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="drawer-section">
            <h3 className="drawer-section-title">Risk Assessment</h3>
            <div className="risk-card">
              <div className="risk-meter">
                <div className="risk-bar">
                  <div 
                    className={`risk-fill ${violationRate > 50 ? 'high' : violationRate > 20 ? 'medium' : 'low'}`}
                    style={{ width: `${Math.min(violationRate, 100)}%` }}
                  ></div>
                </div>
                <span className={`risk-label ${violationRate > 50 ? 'high' : violationRate > 20 ? 'medium' : 'low'}`}>
                  {violationRate > 50 ? 'High Risk' : violationRate > 20 ? 'Medium Risk' : 'Low Risk'}
                </span>
              </div>
              <p className="risk-description">
                {violationRate}% violation rate across {totalSessions} sessions
              </p>
            </div>
          </div>

          {/* Session Duration Chart */}
          <div className="drawer-section">
            <h3 className="drawer-section-title">Recent Sessions</h3>
            <div className="drawer-chart">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="time" stroke="#86868b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#86868b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="duration" name="Duration (h)" radius={[4, 4, 0, 0]}>
                    {timelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.violation ? COLORS.red : COLORS.blue} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Session Timeline */}
          <div className="drawer-section">
            <h3 className="drawer-section-title">Activity Timeline</h3>
            <div className="timeline">
              {userSessions.slice(0, 8).map((session, index) => (
                <div key={index} className={`timeline-item ${session.violation ? 'violation' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className={`timeline-status ${session.violation ? 'danger' : 'success'}`}>
                        {session.violation ? <XCircle size={12} /> : <CheckCircle size={12} />}
                        {session.violation ? 'Violation' : 'Clean'}
                      </span>
                      <span className="timeline-time">{formatDate(session.login_time)}</span>
                    </div>
                    <div className="timeline-details">
                      <span><Globe size={12} /> {session.ip_address}</span>
                      <span><Clock size={12} /> {parseFloat(session.duration).toFixed(1)}h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="drawer-section">
            <h3 className="drawer-section-title">Quick Actions</h3>
            <div className="drawer-actions">
              <button 
                className={`action-btn primary ${buttonStates.history || ''}`}
                onClick={() => handleAction('history', 'info', `Loading full history for ${user}...`)}
                disabled={buttonStates.history}
              >
                <span className="action-btn-icon">
                  {buttonStates.history === 'loading' ? (
                    <RefreshCw size={16} className="spin" />
                  ) : buttonStates.history === 'success' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </span>
                <span>View Full History</span>
                <ChevronRight size={16} className="action-arrow" />
              </button>
              <button 
                className={`action-btn warning ${buttonStates.flag || ''}`}
                onClick={() => handleAction('flag', 'warning', `${user} has been flagged for review`)}
                disabled={buttonStates.flag}
              >
                <span className="action-btn-icon">
                  {buttonStates.flag === 'loading' ? (
                    <RefreshCw size={16} className="spin" />
                  ) : buttonStates.flag === 'success' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <ShieldAlert size={16} />
                  )}
                </span>
                <span>Flag User</span>
                <ChevronRight size={16} className="action-arrow" />
              </button>
              <button 
                className={`action-btn success ${buttonStates.trust || ''}`}
                onClick={() => handleAction('trust', 'success', `${user} marked as trusted`)}
                disabled={buttonStates.trust}
              >
                <span className="action-btn-icon">
                  {buttonStates.trust === 'loading' ? (
                    <RefreshCw size={16} className="spin" />
                  ) : buttonStates.trust === 'success' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                </span>
                <span>Mark as Trusted</span>
                <ChevronRight size={16} className="action-arrow" />
              </button>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    </div>
  );
};

// Analytics Section Component
const AnalyticsSection = ({ allLogs, COLORS }) => {
  // Top violators
  const topViolators = useMemo(() => {
    const userViolations = {};
    allLogs.forEach(log => {
      if (log.violation) {
        userViolations[log.user_id] = (userViolations[log.user_id] || 0) + 1;
      }
    });
    return Object.entries(userViolations)
      .map(([user, count]) => ({ user, violations: count }))
      .sort((a, b) => b.violations - a.violations)
      .slice(0, 5);
  }, [allLogs]);

  // Duration distribution
  const durationDistribution = useMemo(() => {
    const ranges = [
      { range: '0-2h', min: 0, max: 2, count: 0 },
      { range: '2-4h', min: 2, max: 4, count: 0 },
      { range: '4-6h', min: 4, max: 6, count: 0 },
      { range: '6-8h', min: 6, max: 8, count: 0 },
      { range: '8h+', min: 8, max: Infinity, count: 0 },
    ];
    allLogs.forEach(log => {
      const d = parseFloat(log.duration) || 0;
      const range = ranges.find(r => d >= r.min && d < r.max);
      if (range) range.count++;
    });
    return ranges;
  }, [allLogs]);

  // Violation trend over days
  const violationTrend = useMemo(() => {
    const dayMap = {};
    allLogs.forEach(log => {
      if (log.login_time) {
        const date = new Date(log.login_time);
        const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dayMap[dayKey]) {
          dayMap[dayKey] = { day: dayKey, total: 0, violations: 0 };
        }
        dayMap[dayKey].total++;
        if (log.violation) dayMap[dayKey].violations++;
      }
    });
    return Object.values(dayMap).slice(-7);
  }, [allLogs]);

  return (
    <div className="analytics-section">
      <div className="section-header">
        <div className="section-title-group">
          <BarChart3 size={24} className="section-icon" />
          <div>
            <h2 className="section-title">Advanced Analytics</h2>
            <p className="section-subtitle">Deep insights into your VPN usage patterns</p>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Top Violators */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3>Top Violators</h3>
            <span className="analytics-badge danger">{topViolators.length} users</span>
          </div>
          <div className="top-violators-list">
            {topViolators.length > 0 ? topViolators.map((v, i) => (
              <div key={i} className="violator-item">
                <div className="violator-rank">{i + 1}</div>
                <div className="violator-info">
                  <span className="violator-name">{v.user}</span>
                  <div className="violator-bar">
                    <div 
                      className="violator-bar-fill"
                      style={{ width: `${(v.violations / (topViolators[0]?.violations || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="violator-count">{v.violations}</span>
              </div>
            )) : (
              <div className="empty-analytics">
                <CheckCircle size={24} />
                <span>No violations detected</span>
              </div>
            )}
          </div>
        </div>

        {/* Duration Distribution */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3>Session Duration</h3>
            <span className="analytics-badge info">Distribution</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={durationDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="range" stroke="#86868b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#86868b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Sessions" fill={COLORS.cyan} radius={[6, 6, 0, 0]}>
                {durationDistribution.map((entry, index) => (
                  <Cell key={index} fill={index >= 4 ? COLORS.red : index >= 3 ? COLORS.orange : COLORS.cyan} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Violation Trend */}
        <div className="analytics-card wide">
          <div className="analytics-card-header">
            <h3>Violation Trend</h3>
            <span className="analytics-badge warning">Last 7 periods</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={violationTrend}>
              <defs>
                <linearGradient id="violationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="day" stroke="#86868b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#86868b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                name="Total Sessions"
                stroke={COLORS.blue}
                strokeWidth={2}
                dot={{ fill: COLORS.blue, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: COLORS.blue, strokeWidth: 2, fill: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="violations"
                name="Violations"
                stroke={COLORS.red}
                strokeWidth={2}
                dot={{ fill: COLORS.red, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: COLORS.red, strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [logs, setLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [showAnomalies, setShowAnomalies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const limit = 20;

  const fetchLogs = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let url = `${API_BASE}/logs?page=${page}&limit=${limit}`;
      if (showAnomalies) {
        url += "&anomaly=true";
      }

      const res = await fetch(url);
      const data = await res.json();
      setLogs(data.data || []);

      // Fetch more data for charts if first load
      if (!showRefresh && allLogs.length === 0) {
        const allRes = await fetch(`${API_BASE}/logs?page=1&limit=100`);
        const allData = await allRes.json();
        setAllLogs(allData.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [page, showAnomalies]);

  // Calculate stats from data
  const stats = useMemo(() => {
    const dataToUse = allLogs.length > 0 ? allLogs : logs;
    const totalLogs = dataToUse.length;
    const violations = dataToUse.filter(log => log.violation).length;
    const avgDuration = dataToUse.length > 0
      ? (dataToUse.reduce((sum, log) => sum + (parseFloat(log.duration) || 0), 0) / dataToUse.length).toFixed(1)
      : 0;
    const uniqueUsers = new Set(dataToUse.map(log => log.user_id)).size;
    
    return { totalLogs, violations, avgDuration, uniqueUsers };
  }, [logs, allLogs]);

  // Prepare chart data - Activity over time
  const activityData = useMemo(() => {
    const dataToUse = allLogs.length > 0 ? allLogs : logs;
    const hourMap = {};
    
    dataToUse.forEach(log => {
      if (log.login_time) {
        const hour = new Date(log.login_time).getHours();
        const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
        if (!hourMap[hourLabel]) {
          hourMap[hourLabel] = { time: hourLabel, logins: 0, violations: 0 };
        }
        hourMap[hourLabel].logins++;
        if (log.violation) hourMap[hourLabel].violations++;
      }
    });

    return Object.values(hourMap).sort((a, b) => a.time.localeCompare(b.time));
  }, [logs, allLogs]);

  // Prepare pie chart data
  const violationData = useMemo(() => {
    const dataToUse = allLogs.length > 0 ? allLogs : logs;
    const violations = dataToUse.filter(log => log.violation).length;
    const clean = dataToUse.length - violations;
    
    return [
      { name: "Clean Sessions", value: clean, color: COLORS.green },
      { name: "Violations", value: violations, color: COLORS.red },
    ];
  }, [logs, allLogs]);

  // Filter logs by search
  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter(log =>
      log.user_id?.toLowerCase().includes(query) ||
      log.ip_address?.toLowerCase().includes(query)
    );
  }, [logs, searchQuery]);

  // Get duration color class
  const getDurationClass = (duration) => {
    const d = parseFloat(duration) || 0;
    if (d > 8) return "danger";
    if (d > 5) return "warning";
    return "normal";
  };

  // Get duration percentage (max 12 hours)
  const getDurationPercent = (duration) => {
    const d = parseFloat(duration) || 0;
    return Math.min((d / 12) * 100, 100);
  };

  // Get initials from user ID
  const getInitials = (userId) => {
    if (!userId) return "?";
    return userId.substring(0, 2).toUpperCase();
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get user sessions for drawer
  const userSessions = useMemo(() => {
    if (!selectedUser) return [];
    const dataToUse = allLogs.length > 0 ? allLogs : logs;
    return dataToUse.filter(log => log.user_id === selectedUser);
  }, [selectedUser, allLogs, logs]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const dataToExport = allLogs.length > 0 ? allLogs : logs;
    if (dataToExport.length === 0) return;

    const headers = ['User ID', 'Duration (hours)', 'IP Address', 'Violation', 'Login Time'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(log => [
        log.user_id,
        parseFloat(log.duration).toFixed(2),
        log.ip_address,
        log.violation ? 'Yes' : 'No',
        log.login_time
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vpn-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [allLogs, logs]);

  return (
    <div className="app-container fade-in">
      {/* User Drawer */}
      {selectedUser && (
        <UserDrawer
          user={selectedUser}
          userSessions={userSessions}
          onClose={() => setSelectedUser(null)}
          formatDate={formatDate}
          getInitials={getInitials}
        />
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-icon">
            <Shield size={24} color="white" />
          </div>
          <div>
            <h1 className="dashboard-title">VPN Monitor</h1>
            <p className="dashboard-subtitle">Real-time security analytics dashboard</p>
          </div>
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span>Live</span>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-ghost"
            onClick={exportToCSV}
            title="Export to CSV"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          <button
            className={`btn btn-secondary ${refreshing ? "active" : ""}`}
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-header">
            <div className="stat-icon blue">
              <Activity size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.totalLogs}</div>
          <div className="stat-label">Total Sessions</div>
          <div className="stat-change positive">
            <TrendingUp size={12} /> Active monitoring
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-header">
            <div className="stat-icon red">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.violations}</div>
          <div className="stat-label">Violations Detected</div>
          <div className="stat-change negative">
            <AlertTriangle size={12} /> Requires attention
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-header">
            <div className="stat-icon green">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.avgDuration}h</div>
          <div className="stat-label">Avg. Session Duration</div>
          <div className="stat-change positive">
            <TrendingUp size={12} /> Within normal range
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-header">
            <div className="stat-icon purple">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.uniqueUsers}</div>
          <div className="stat-label">Unique Users</div>
          <div className="stat-change positive">
            <TrendingUp size={12} /> Connected
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Session Activity</h3>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: COLORS.blue }}></span>
                Logins
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: COLORS.red }}></span>
                Violations
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="time"
                stroke="#86868b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#86868b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="logins"
                name="Logins"
                stroke={COLORS.blue}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLogins)"
              />
              <Area
                type="monotone"
                dataKey="violations"
                name="Violations"
                stroke={COLORS.red}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViolations)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Security Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={violationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {violationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span style={{ color: "#6e6e73", fontSize: "12px" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="filter-group">
          <button
            className={`btn ${showAnomalies ? "btn-danger active" : "btn-secondary"}`}
            onClick={() => {
              setShowAnomalies(!showAnomalies);
              setPage(1);
            }}
          >
            <AlertTriangle size={16} />
            {showAnomalies ? "Showing Violations" : "Show Violations Only"}
          </button>
          <button
            className={`btn ${showAnalytics ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 size={16} />
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </button>
        </div>

        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by user or IP address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && allLogs.length > 0 && (
        <AnalyticsSection allLogs={allLogs} COLORS={COLORS} />
      )}

      {/* Data Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Session Logs</h3>
          <div className="table-header-right">
            <span className="record-count">{filteredLogs.length} records</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading session data...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">
            <Wifi size={48} strokeWidth={1.5} />
            <p style={{ marginTop: "1rem" }}>No sessions found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Duration</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th>Login Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <tr 
                    key={index} 
                    className="slide-in table-row-clickable" 
                    style={{ animationDelay: `${index * 0.03}s` }}
                    onClick={() => setSelectedUser(log.user_id)}
                  >
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{getInitials(log.user_id)}</div>
                        <div className="user-info">
                          <span className="user-name">{log.user_id}</span>
                          <span className="user-hint">Click to view profile</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="duration-cell">
                        <span>{parseFloat(log.duration).toFixed(1)}h</span>
                        <div className="duration-bar">
                          <div
                            className={`duration-fill ${getDurationClass(log.duration)}`}
                            style={{ width: `${getDurationPercent(log.duration)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="ip-badge">{log.ip_address}</code>
                    </td>
                    <td>
                      {log.violation ? (
                        <span className="badge badge-danger">
                          <XCircle size={12} /> Violation
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle size={12} /> Clean
                        </span>
                      )}
                    </td>
                    <td style={{ color: "#a0a0b0" }}>{formatDate(log.login_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">
            Page {page} • Showing {filteredLogs.length} of {limit} per page
          </div>
          <div className="pagination-controls">
            <button
              className="page-btn"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="page-number">{page}</span>
            <button
              className="page-btn"
              onClick={() => setPage(page + 1)}
              disabled={filteredLogs.length < limit}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}