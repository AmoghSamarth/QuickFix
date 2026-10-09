import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, AlertCircle, CheckCircle2, ArrowRight, Wrench } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ticketService from '../../services/ticketService';
import { MOCK_TICKETS } from '../../utils/mockData';
import Button from '../../components/common/Button';
import TicketTable from '../../components/tickets/TicketTable';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await ticketService.getEmployeeTickets();
        setTickets(Array.isArray(data) ? data : data?.tickets || MOCK_TICKETS);
      } catch {
        // Fallback to mock data for demo / offline development
        setTickets(MOCK_TICKETS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const total = tickets.length;
  const pending = tickets.filter((t) => t.status?.toLowerCase() === 'pending').length;
  const inProgress = tickets.filter((t) => t.status?.toLowerCase() === 'in progress').length;
  const resolved = tickets.filter((t) => t.status?.toLowerCase() === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white p-6 border border-[#D9E1E8] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">
            Welcome back, {user?.name?.split(' ')[0] || 'Employee'}
          </h1>
          <p className="mt-1 text-sm text-[#5D6875]">
            QuickFix Maintenance Portal • Track your work orders and submit new requests.
          </p>
        </div>
        <Link to="/employee/requests/new">
          <Button variant="action" size="md" icon={PlusCircle}>
            Report a Problem
          </Button>
        </Link>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#D9E1E8] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5D6875] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Requests</span>
            <Wrench className="h-4 w-4 text-[#2F6FED]" />
          </div>
          <p className="text-2xl font-bold text-[#1E293B]">{total}</p>
          <p className="text-xs text-[#5D6875] mt-1">Submitted by you</p>
        </div>

        <div className="rounded-xl border border-[#FED7AA] bg-[#FFF0D7]/40 p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#9A3412] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <Clock className="h-4 w-4 text-[#F97316]" />
          </div>
          <p className="text-2xl font-bold text-[#9A3412]">{pending}</p>
          <p className="text-xs text-[#9A3412]/80 mt-1">Awaiting dispatch</p>
        </div>

        <div className="rounded-xl border border-[#BFDBFE] bg-[#E0ECFD]/40 p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#1D4ED8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <AlertCircle className="h-4 w-4 text-[#2F6FED]" />
          </div>
          <p className="text-2xl font-bold text-[#1D4ED8]">{inProgress}</p>
          <p className="text-xs text-[#1D4ED8]/80 mt-1">Technicians actively repairing</p>
        </div>

        <div className="rounded-xl border border-[#BBF7D0] bg-[#DDF5E5]/40 p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#166534] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
          </div>
          <p className="text-2xl font-bold text-[#166534]">{resolved}</p>
          <p className="text-xs text-[#166534]/80 mt-1">Completed requests</p>
        </div>
      </div>

      {/* Recent Requests Section */}
      <div className="rounded-2xl border border-[#D9E1E8] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1E293B]">Recent Requests</h2>
            <p className="text-xs text-[#5D6875]">Track the live progress of your reported issues</p>
          </div>
          <Link
            to="/employee/requests"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6FED] hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton variant="card" count={3} />
        ) : (
          <TicketTable tickets={tickets.slice(0, 5)} detailPathPrefix="/employee/requests" />
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
