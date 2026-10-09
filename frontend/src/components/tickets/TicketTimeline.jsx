import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, UserCheck, MessageSquare } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

/**
 * Vertical progression and audit timeline for ticket status history
 */
export function TicketTimeline({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <p className="text-xs text-[#5D6875] italic py-4">
        No progression history logged for this ticket yet.
      </p>
    );
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'created':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'assigned':
        return <UserCheck className="h-4 w-4 text-emerald-600" />;
      case 'status_change':
        return <CheckCircle2 className="h-4 w-4 text-[#2F6FED]" />;
      case 'escalated':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, idx) => {
          const isLast = idx === events.length - 1;
          return (
            <li key={event.id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-[#D9E1E8]"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#D9E1E8] shadow-xs shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[#1E293B]">
                        {event.title || event.action}
                      </p>
                      <time className="text-[11px] text-[#5D6875] shrink-0 whitespace-nowrap">
                        {formatDateTime(event.timestamp || event.createdAt)}
                      </time>
                    </div>
                    {event.description && (
                      <p className="mt-1 text-xs text-[#5D6875]">
                        {event.description}
                      </p>
                    )}
                    {event.actor && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        By: <span className="font-medium text-slate-600">{event.actor}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TicketTimeline;
