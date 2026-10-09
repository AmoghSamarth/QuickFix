import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Wrench,
  AlertTriangle,
  Edit3,
  UserPlus,
} from 'lucide-react';
import adminService from '../../services/adminService';
import { MOCK_TICKETS } from '../../utils/mockData';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import TicketTimeline from '../../components/tickets/TicketTimeline';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { formatDateTime } from '../../utils/formatDate';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export function AdminTicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);

  // Form states
  const [selectedStatus, setSelectedStatus] = useState('In Progress');
  const [statusNote, setStatusNote] = useState('');
  const [technicianName, setTechnicianName] = useState('Carlos Mendoza');
  const [escalationReason, setEscalationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const data = await adminService.getAllTickets({ id });
        const found = Array.isArray(data)
          ? data.find((t) => t.id === id)
          : data?.tickets?.find((t) => t.id === id);
        setTicket(found || MOCK_TICKETS.find((t) => t.id === id) || MOCK_TICKETS[0]);
      } catch {
        const found = MOCK_TICKETS.find((t) => t.id === id) || MOCK_TICKETS[0];
        setTicket(found);
      } finally {
        setLoading(false);
      }
    }
    fetchTicket();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminService.updateTicketStatus(id, { status: selectedStatus, note: statusNote });
      setTicket((prev) => ({
        ...prev,
        status: selectedStatus,
        events: [
          ...(prev?.events || []),
          {
            id: `ev-${Date.now()}`,
            type: 'status_change',
            title: `Status changed to ${selectedStatus}`,
            description: statusNote || 'Administrative status change applied.',
            actor: 'Admin Jordan Vance',
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } catch {
      setTicket((prev) => ({
        ...prev,
        status: selectedStatus,
      }));
    } finally {
      setActionLoading(false);
      setStatusModalOpen(false);
      setStatusNote('');
    }
  };

  const handleAssignTech = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminService.assignTechnician(id, { technicianName });
      setTicket((prev) => ({
        ...prev,
        technician: { name: technicianName, specialty: 'Facilities Engineer' },
        status: prev.status === 'Pending' ? 'In Progress' : prev.status,
        events: [
          ...(prev?.events || []),
          {
            id: `ev-${Date.now()}`,
            type: 'assigned',
            title: `Technician Assigned: ${technicianName}`,
            description: 'Work order dispatched.',
            actor: 'Admin Jordan Vance',
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } catch {
      setTicket((prev) => ({
        ...prev,
        technician: { name: technicianName, specialty: 'Facilities Engineer' },
      }));
    } finally {
      setActionLoading(false);
      setAssignModalOpen(false);
    }
  };

  const handleEscalate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminService.escalateTicket(id, { reason: escalationReason });
      setTicket((prev) => ({
        ...prev,
        status: 'Escalated',
        priority: 'Critical',
        events: [
          ...(prev?.events || []),
          {
            id: `ev-${Date.now()}`,
            type: 'escalated',
            title: 'Manually Escalated by Administrator',
            description: escalationReason || 'Escalated for immediate priority resolution.',
            actor: 'Admin Jordan Vance',
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } catch {
      setTicket((prev) => ({
        ...prev,
        status: 'Escalated',
      }));
    } finally {
      setActionLoading(false);
      setEscalateModalOpen(false);
      setEscalationReason('');
    }
  };

  if (loading) {
    return <LoadingSkeleton variant="card" count={2} />;
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-[#1E293B]">Ticket Not Found</h2>
        <Link to="/admin/tickets" className="text-xs text-[#2F6FED] hover:underline mt-2 inline-block">
          Return to All Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/tickets"
            className="p-2 rounded-lg border border-[#D9E1E8] bg-white text-[#5D6875] hover:bg-slate-50 hover:text-[#1E293B]"
            aria-label="Back to tickets"
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

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setStatusModalOpen(true)}
            icon={Edit3}
          >
            Update Status
          </Button>

          <Button
            variant="action"
            size="sm"
            onClick={() => setAssignModalOpen(true)}
            icon={UserPlus}
          >
            Assign Tech
          </Button>

          {ticket.status !== 'Escalated' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setEscalateModalOpen(true)}
              icon={AlertTriangle}
            >
              Escalate
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#D9E1E8] bg-white p-6 shadow-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#5D6875] mb-3">
              Work Order Details
            </h2>
            <p className="text-sm text-[#1E293B] leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>

            <div className="mt-6 pt-6 border-t border-[#D9E1E8] grid grid-cols-2 gap-4 text-xs">
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

          {/* Timeline */}
          <div className="rounded-2xl border border-[#D9E1E8] bg-white p-6 shadow-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#5D6875] mb-4">
              Audit &amp; Dispatch Timeline
            </h2>
            <TicketTimeline events={ticket.events || []} />
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#D9E1E8] bg-white p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-semibold text-[#1E293B] border-b border-[#D9E1E8] pb-3">
              Administrative Context
            </h2>

            <div>
              <span className="text-[#5D6875] flex items-center gap-1.5 mb-1">
                <Calendar className="h-3.5 w-3.5" /> Date Submitted
              </span>
              <span className="font-medium text-[#1E293B]">{formatDateTime(ticket.createdAt)}</span>
            </div>

            <div>
              <span className="text-[#5D6875] flex items-center gap-1.5 mb-1">
                <MapPin className="h-3.5 w-3.5" /> Physical Location
              </span>
              <span className="font-medium text-[#1E293B]">{ticket.location}</span>
            </div>

            <div>
              <span className="text-[#5D6875] flex items-center gap-1.5 mb-1">
                <User className="h-3.5 w-3.5" /> Requester
              </span>
              <span className="font-medium text-[#1E293B]">
                {ticket.employee?.name || 'Alex Rivera'} ({ticket.employee?.email || 'alex.rivera@company.com'})
              </span>
            </div>

            <div>
              <span className="text-[#5D6875] flex items-center gap-1.5 mb-1">
                <Wrench className="h-3.5 w-3.5" /> Assigned Technician
              </span>
              {ticket.technician ? (
                <div className="rounded-lg bg-slate-50 p-3 border border-[#D9E1E8]">
                  <p className="font-medium text-[#1E293B]">{ticket.technician.name || ticket.technician}</p>
                  <p className="text-[11px] text-[#5D6875]">Facilities Technician</p>
                </div>
              ) : (
                <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block font-medium">
                  Needs Assignment
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Update Status */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Ticket Status"
        description={`Modify the lifecycle stage for #${ticket.id}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" isLoading={actionLoading} onClick={handleUpdateStatus}>
              Save Status
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            type="select"
            label="Status"
            id="modal-status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Escalated">Escalated</option>
          </Input>
          <Input
            type="textarea"
            rows={3}
            label="Status Note"
            id="modal-status-note"
            placeholder="Add a reason or technician note explaining this update..."
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal: Assign Technician */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Technician"
        description="Dispatch a maintenance specialist to handle this work order"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="action" isLoading={actionLoading} onClick={handleAssignTech}>
              Dispatch Technician
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            type="select"
            label="Select Technician"
            id="modal-tech-select"
            value={technicianName}
            onChange={(e) => setTechnicianName(e.target.value)}
          >
            <option value="Carlos Mendoza">Carlos Mendoza — HVAC &amp; Refrigeration</option>
            <option value="David Patel">David Patel — Electrical &amp; Access Controls</option>
            <option value="Elena Rostova">Elena Rostova — Plumbing &amp; Infrastructure</option>
            <option value="Marcus Bell">Marcus Bell — General Carpentry &amp; Structural</option>
          </Input>
        </div>
      </Modal>

      {/* Modal: Escalate */}
      <Modal
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        title="Escalate Work Order"
        description="Trigger high-urgency escalation status for this request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEscalateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={actionLoading} onClick={handleEscalate}>
              Confirm Escalation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            type="textarea"
            rows={3}
            label="Escalation Justification"
            id="modal-escalate-reason"
            placeholder="Document why this ticket is being escalated (e.g., SLA breach, safety risk, executive office priority)..."
            required
            value={escalationReason}
            onChange={(e) => setEscalationReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

export default AdminTicketDetails;
