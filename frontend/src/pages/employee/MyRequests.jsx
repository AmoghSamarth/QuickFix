import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, LayoutGrid, List } from 'lucide-react';
import ticketService from '../../services/ticketService';
import { MOCK_TICKETS } from '../../utils/mockData';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import TicketTable from '../../components/tickets/TicketTable';
import TicketCard from '../../components/tickets/TicketCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export function MyRequests() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  useEffect(() => {
    async function fetchTickets() {
      try {
        const data = await ticketService.getEmployeeTickets();
        setTickets(Array.isArray(data) ? data : data?.tickets || MOCK_TICKETS);
      } catch {
        setTickets(MOCK_TICKETS);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(search.toLowerCase()) ||
        ticket.location?.toLowerCase().includes(search.toLowerCase()) ||
        ticket.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        ticket.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const statuses = ['ALL', 'Pending', 'In Progress', 'Resolved', 'Escalated'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">My Maintenance Requests</h1>
          <p className="text-sm text-[#5D6875] mt-1">
            View, filter, and track all work requests you have submitted.
          </p>
        </div>
        <Link to="/employee/requests/new">
          <Button variant="action" icon={PlusCircle}>
            New Request
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between rounded-xl bg-white p-4 border border-[#D9E1E8] shadow-xs">
        <div className="w-full md:w-80">
          <Input
            id="ticket-search"
            name="ticketSearch"
            placeholder="Search by title, room, or #ID..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#173B32] text-white'
                  : 'bg-slate-100 text-[#5D6875] hover:bg-slate-200 hover:text-[#1E293B]'
              }`}
            >
              {status}
            </button>
          ))}

          {/* View toggle (desktop) */}
          <div className="hidden sm:flex items-center ml-2 pl-2 border-l border-[#D9E1E8] gap-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table' ? 'bg-slate-200 text-[#1E293B]' : 'text-[#5D6875]'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' ? 'bg-slate-200 text-[#1E293B]' : 'text-[#5D6875]'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton variant="card" count={4} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} baseUrl="/employee/requests" />
          ))}
        </div>
      ) : (
        <TicketTable tickets={filteredTickets} detailPathPrefix="/employee/requests" />
      )}
    </div>
  );
}

export default MyRequests;
