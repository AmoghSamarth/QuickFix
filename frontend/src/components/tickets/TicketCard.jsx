import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, User, ArrowRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { formatRelativeTime } from '../../utils/formatDate';

/**
 * TicketCard component for request listings and mobile responsive views
 */
export function TicketCard({ ticket, baseUrl = '/employee/requests' }) {
  if (!ticket) return null;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#D9E1E8] bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-semibold text-[#5D6875]">
            #{ticket.id}
          </span>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={ticket.priority} size="sm" />
            <StatusBadge status={ticket.status} size="sm" />
          </div>
        </div>

        <h3 className="text-base font-semibold text-[#1E293B] line-clamp-1 mb-1.5">
          {ticket.title}
        </h3>

        <p className="text-xs text-[#5D6875] line-clamp-2 mb-4">
          {ticket.description}
        </p>
      </div>

      <div className="pt-3 border-t border-[#D9E1E8]/70">
        <div className="grid grid-cols-2 gap-2 text-xs text-[#5D6875] mb-3">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{ticket.location || 'Building A'}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate justify-end">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{formatRelativeTime(ticket.createdAt)}</span>
          </div>
        </div>

        {ticket.technician && (
          <div className="flex items-center gap-1.5 text-xs text-[#1E293B] mb-3 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-[#D9E1E8]/50">
            <User className="h-3.5 w-3.5 text-[#2F6FED]" />
            <span className="text-slate-500">Tech:</span>
            <span className="font-medium truncate">{ticket.technician.name || ticket.technician}</span>
          </div>
        )}

        <Link
          to={`${baseUrl}/${ticket.id}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#D9E1E8] bg-white py-1.5 px-3 text-xs font-semibold text-[#1E293B] hover:bg-slate-50 hover:text-[#2F6FED] transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default TicketCard;
