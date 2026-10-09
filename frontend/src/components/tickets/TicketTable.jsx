import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { formatDate } from '../../utils/formatDate';
import EmptyState from '../common/EmptyState';

/**
 * Standard table presentation for tickets with responsive horizontal scroll
 */
export function TicketTable({
  tickets = [],
  detailPathPrefix = '/employee/requests',
  emptyMessage = 'No tickets found',
}) {
  if (!tickets || tickets.length === 0) {
    return <EmptyState title={emptyMessage} description="No maintenance requests match this criteria." />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#D9E1E8] bg-white shadow-xs">
      <table className="w-full text-left text-sm text-[#1E293B]">
        <thead className="border-b border-[#D9E1E8] bg-[#F7F9FC] text-xs font-semibold uppercase tracking-wider text-[#5D6875]">
          <tr>
            <th scope="col" className="px-4 py-3.5">ID</th>
            <th scope="col" className="px-4 py-3.5">Title &amp; Category</th>
            <th scope="col" className="px-4 py-3.5">Location</th>
            <th scope="col" className="px-4 py-3.5">Priority</th>
            <th scope="col" className="px-4 py-3.5">Status</th>
            <th scope="col" className="px-4 py-3.5">Created</th>
            <th scope="col" className="px-4 py-3.5">Assigned To</th>
            <th scope="col" className="px-4 py-3.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D9E1E8]">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="hover:bg-slate-50/80 transition-colors"
            >
              <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[#5D6875]">
                #{ticket.id}
              </td>
              <td className="px-4 py-3.5 max-w-xs">
                <div className="font-medium text-[#1E293B] truncate">{ticket.title}</div>
                <div className="text-xs text-[#5D6875] truncate">{ticket.category || 'General Maintenance'}</div>
              </td>
              <td className="px-4 py-3.5 text-xs text-[#5D6875] whitespace-nowrap">
                {ticket.location || '—'}
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <PriorityBadge priority={ticket.priority} size="sm" />
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <StatusBadge status={ticket.status} size="sm" />
              </td>
              <td className="px-4 py-3.5 text-xs text-[#5D6875] whitespace-nowrap">
                {formatDate(ticket.createdAt)}
              </td>
              <td className="px-4 py-3.5 text-xs text-[#1E293B] whitespace-nowrap">
                {ticket.technician?.name || ticket.technician || (
                  <span className="text-slate-400 italic">Unassigned</span>
                )}
              </td>
              <td className="px-4 py-3.5 text-right whitespace-nowrap">
                <Link
                  to={`${detailPathPrefix}/${ticket.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9E1E8] bg-white px-2.5 py-1 text-xs font-medium text-[#1E293B] hover:bg-slate-50 hover:text-[#2F6FED] transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TicketTable;
