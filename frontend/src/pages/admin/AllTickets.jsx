import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import adminService from '../../services/adminService';
import { MOCK_TICKETS } from '../../utils/mockData';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import TicketTable from '../../components/tickets/TicketTable';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export function AllTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllTickets();
      setTickets(Array.isArray(data) ? data : data?.tickets || MOCK_TICKETS);
    } catch {
      setTickets(MOCK_TICKETS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    adminService.getAllTickets()
      .then((data) => {
        if (active) {
          setTickets(Array.isArray(data) ? data : data?.tickets || MOCK_TICKETS);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setTickets(MOCK_TICKETS);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.id.toLowerCase().includes(search.toLowerCase()) ||
        ticket.location?.toLowerCase().includes(search.toLowerCase()) ||
        ticket.employee?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        ticket.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesPriority =
        priorityFilter === 'ALL' ||
        ticket.priority?.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const statuses = ['ALL', 'Pending', 'In Progress', 'Resolved', 'Escalated'];
  const priorities = ['ALL', 'Low', 'Medium', 'High', 'Critical'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">All Maintenance Tickets</h1>
          <p className="text-sm text-[#5D6875] mt-1">
            Global administrative overview of all submitted facility requests and work orders.
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      {/* Filter controls */}
      <div className="rounded-xl border border-[#D9E1E8] bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96">
            <Input
              id="admin-ticket-search"
              name="adminTicketSearch"
              placeholder="Search by ticket #ID, keyword, or requester..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5D6875] shrink-0">
              Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-[#D9E1E8] bg-white px-3 py-2 text-xs font-medium text-[#1E293B] focus:border-[#2F6FED] focus:outline-none"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p === 'ALL' ? 'All Priorities' : p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5D6875] shrink-0 mr-1">
            Status:
          </span>
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#173B32] text-white'
                  : 'bg-slate-100 text-[#5D6875] hover:bg-slate-200 hover:text-[#1E293B]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton variant="card" count={4} />
      ) : (
        <TicketTable tickets={filteredTickets} detailPathPrefix="/admin/tickets" />
      )}
    </div>
  );
}

export default AllTickets;
