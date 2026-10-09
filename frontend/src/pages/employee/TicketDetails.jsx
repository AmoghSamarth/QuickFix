import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, Wrench, XCircle } from 'lucide-react';
import ticketService from '../../services/ticketService';
import { MOCK_TICKETS } from '../../utils/mockData';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import TicketTimeline from '../../components/tickets/TicketTimeline';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatDateTime } from '../../utils/formatDate';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      try {
        const data = await ticketService.getTicketById(id);
        setTicket(data || MOCK_TICKETS.find((t) => t.id === id) || MOCK_TICKETS[0]);
      } catch {
        const found = MOCK_TICKETS.find((t) => t.id === id) || MOCK_TICKETS[0];
        setTicket(found);
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [id]);

  const handleCancelTicket = async () => {
    setCancelling(true);
    try {
      await ticketService.cancelTicket(id);
      setTicket((prev) => ({ ...prev, status: 'Resolved' }));
    } catch {
      setTicket((prev) => ({ ...prev, status: 'Resolved' }));
    } finally {
      setCancelling(false);
      setIsCancelModalOpen(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton variant="card" count={2} />;
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-[#1E293B]">Ticket Not Found</h2>
        <Link to="/employee/requests" className="text-xs text-[#2F6FED] hover:underline mt-2 inline-block">
          Return to My Requests
        </Link>
      </div>
    );
  }

  const isPending = ticket.status?.toLowerCase() === 'pending';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/employee/requests"
            className="p-2 rounded-lg border border-[#D9E1E8] bg-white text-[#5D6875] hover:bg-slate-50 hover:text-[#1E293B]"
            aria-label="Back to requests"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#5D6875]">#{ticket.id}</span>
              <PriorityBadge priority={ticket.priority} size="sm" />
              <StatusBadge status={ticket.status} size="sm" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] mt-1">
              {ticket.title}
            </h1>
          </div>
        </div>

        {isPending && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsCancelModalOpen(true)}
            icon={XCircle}
          >
            Cancel Request
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details and Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#D9E1E8] bg-white p-6 shadow-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#5D6875] mb-3">
              Description &amp; Symptoms
            </h2>
            <p className="text-sm text-[#1E293B] leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>

            <div className="mt-6 pt-6 border-t border-[#D9E1E8] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#5D6875] block">Category:</span>
                <span className="font-medium text-[#1E293B]">{ticket.category}</span>
              </div>
              <div>
                <span className="text-[#5D6875] block">Location:</span>
                <span className="font-medium text-[#1E293B]">{ticket.location}</span>
              </div>
            </div>
          </div>

          {/* Timeline of events */}
          <div className="rounded-2xl border border-[#D9E1E8] bg-white p-6 shadow-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#5D6875] mb-4">
              Status Progression History
            </h2>
            <TicketTimeline events={ticket.events || []} />
          </div>
        </div>

        {/* Sidebar Metadata */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#D9E1E8] bg-white p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-semibold text-[#1E293B] border-b border-[#D9E1E8] pb-3">
              Request Metadata
            </h2>

            <div>
              <span className="text-[#5D6875] flex items-center gap-1.5 mb-1">
                <Calendar className="h-3.5 w-3.5" /> Date Submitted
              </span>
              <span className="font-medium text-[#1E293B]">{formatDateTime(ticket.createdAt)}</span>
            </div>

            <div>
              <span className="text-[#5D6875] flex items-center gap-1.5 mb-1">
                <MapPin className="h-3.5 w-3.5" /> Building &amp; Location
              </span>
              <span className="font-medium text-[#1E293B]">{ticket.location}</span>
            </div>

            <div>
              <span className="text-[#5D6875] flex items-center gap-1.5 mb-1">
                <User className="h-3.5 w-3.5" /> Requester
              </span>
              <span className="font-medium text-[#1E293B]">{ticket.employee?.name || 'Alex Rivera'}</span>
            </div>

            <div>
              <span className="text-[#5D6875] flex items-center gap-1.5 mb-1">
                <Wrench className="h-3.5 w-3.5" /> Assigned Technician
              </span>
              {ticket.technician ? (
                <div className="rounded-lg bg-slate-50 p-2.5 border border-[#D9E1E8]">
                  <p className="font-medium text-[#1E293B]">{ticket.technician.name || ticket.technician}</p>
                  {ticket.technician.specialty && (
                    <p className="text-[11px] text-[#5D6875]">{ticket.technician.specialty}</p>
                  )}
                </div>
              ) : (
                <span className="text-slate-400 italic">Not yet assigned to technician</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Cancel Request */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Maintenance Request?"
        description="Are you sure you want to cancel this request? This action will mark the request as closed."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)}>
              Keep Request
            </Button>
            <Button variant="danger" isLoading={cancelling} onClick={handleCancelTicket}>
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#5D6875]">
          If this maintenance issue is still happening, please keep the ticket open so our operations crew can attend to it.
        </p>
      </Modal>
    </div>
  );
}

export default TicketDetails;
