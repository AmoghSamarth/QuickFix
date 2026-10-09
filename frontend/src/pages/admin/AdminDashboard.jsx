import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  AlertTriangle,
  Clock,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import adminService from '../../services/adminService';
import { MOCK_TICKETS, MOCK_ADMIN_STATS } from '../../utils/mockData';
import TicketTable from '../../components/tickets/TicketTable';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export function AdminDashboard() {
  const [stats, setStats] = useState(MOCK_ADMIN_STATS);
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, ticketsData] = await Promise.allSettled([
          adminService.getDashboardStats(),
          adminService.getAllTickets(),
        ]);

        if (statsData.status === 'fulfilled' && statsData.value) {
          setStats(statsData.value);
        }
        if (ticketsData.status === 'fulfilled' && ticketsData.value) {
          setTickets(Array.isArray(ticketsData.value) ? ticketsData.value : ticketsData.value.tickets || MOCK_TICKETS);
        }
      } catch {
        // Fallback to mock data for demo mode
        setStats(MOCK_ADMIN_STATS);
        setTickets(MOCK_TICKETS);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const chartData = [
    { name: 'Pending', count: stats.pendingTickets || 12, fill: '#F97316' },
    { name: 'In Progress', count: stats.inProgressTickets || 19, fill: '#2F6FED' },
    { name: 'Escalated', count: stats.escalatedTickets || 4, fill: '#DC2626' },
    { name: 'Resolved', count: stats.resolvedTickets || 7, fill: '#16A34A' },
  ];

  const escalatedTickets = tickets.filter(
    (t) => t.status?.toLowerCase() === 'escalated'
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Admin Operations Dashboard</h1>
          <p className="text-sm text-[#5D6875] mt-1">
            Real-time workplace maintenance monitoring, technician dispatch, and escalation control.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/escalations"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FCE8E8] px-3.5 py-2 text-xs font-semibold text-[#991B1B] hover:bg-red-100 border border-[#FECACA] transition-colors"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>{stats.escalatedTickets} Active Escalations</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#D9E1E8] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5D6875] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Work Orders</span>
            <ClipboardList className="h-4 w-4 text-[#2F6FED]" />
          </div>
          <p className="text-2xl font-bold text-[#1E293B]">{stats.totalTickets}</p>
          <p className="text-xs text-[#5D6875] mt-1">Logged across all facilities</p>
        </div>

        <div className="rounded-xl border border-[#FED7AA] bg-[#FFF0D7]/40 p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#9A3412] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Needs Assignment</span>
            <Clock className="h-4 w-4 text-[#F97316]" />
          </div>
          <p className="text-2xl font-bold text-[#9A3412]">{stats.pendingTickets}</p>
          <p className="text-xs text-[#9A3412]/80 mt-1">Awaiting technician triage</p>
        </div>

        <div className="rounded-xl border border-[#FECACA] bg-[#FCE8E8]/50 p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#991B1B] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Escalated / At Risk</span>
            <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
          </div>
          <p className="text-2xl font-bold text-[#991B1B]">{stats.escalatedTickets}</p>
          <p className="text-xs text-[#991B1B]/80 mt-1">High urgency SLA breaches</p>
        </div>

        <div className="rounded-xl border border-[#BBF7D0] bg-[#DDF5E5]/40 p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#166534] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">SLA Compliance</span>
            <TrendingUp className="h-4 w-4 text-[#16A34A]" />
          </div>
          <p className="text-2xl font-bold text-[#166534]">{stats.slaComplianceRate}%</p>
          <p className="text-xs text-[#166534]/80 mt-1">Avg turnaround: {stats.avgResolutionHours} hrs</p>
        </div>
      </div>

      {/* Visual Chart & Urgent Escalations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Ticket Distribution */}
        <div className="lg:col-span-2 rounded-2xl border border-[#D9E1E8] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#1E293B]">Ticket Pipeline Breakdown</h2>
              <p className="text-xs text-[#5D6875]">Distribution across current maintenance lifecycle stages</p>
            </div>
            <span className="text-xs text-[#5D6875] font-mono">Live Sync</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5D6875' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#5D6875' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #D9E1E8',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Action / Escalated Alert box */}
        <div className="rounded-2xl border border-[#D9E1E8] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <h2 className="text-base font-semibold text-[#1E293B]">Escalated Watchlist</h2>
            </div>
            <p className="text-xs text-[#5D6875] mb-4">
              Issues flagged for critical response or SLA violation require administrator approval.
            </p>

            <div className="space-y-3">
              {escalatedTickets.slice(0, 2).map((t) => (
                <div key={t.id} className="rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-red-800">#{t.id}</span>
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                      CRITICAL
                    </span>
                  </div>
                  <p className="font-semibold text-[#1E293B] line-clamp-1">{t.title}</p>
                  <p className="text-[#5D6875] line-clamp-1 mt-0.5">{t.location}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#D9E1E8]">
            <Link
              to="/admin/escalations"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#173B32] hover:bg-[#215447] text-white py-2 text-xs font-semibold transition-colors"
            >
              <span>Manage Escalations</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* All Recent Tickets Table */}
      <div className="rounded-2xl border border-[#D9E1E8] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1E293B]">All Recent Facility Tickets</h2>
            <p className="text-xs text-[#5D6875]">Triage, assign, and update status</p>
          </div>
          <Link
            to="/admin/tickets"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6FED] hover:underline"
          >
            <span>View All Tickets</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton variant="card" count={3} />
        ) : (
          <TicketTable tickets={tickets} detailPathPrefix="/admin/tickets" />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
