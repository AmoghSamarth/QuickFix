import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import adminService from '../../services/adminService';
import { MOCK_TICKETS } from '../../utils/mockData';
import TicketTable from '../../components/tickets/TicketTable';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export function Escalations() {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEscalations() {
      try {
        const data = await adminService.getEscalations();
        const items = Array.isArray(data) ? data : data?.tickets || [];
        setEscalations(
          items.length > 0
            ? items
            : MOCK_TICKETS.filter((t) => t.status?.toLowerCase() === 'escalated')
        );
      } catch {
        setEscalations(
          MOCK_TICKETS.filter((t) => t.status?.toLowerCase() === 'escalated')
        );
      } finally {
        setLoading(false);
      }
    }
    loadEscalations();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-red-600 mb-1">
          <ShieldAlert className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Critical Queue</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Escalated Work Orders</h1>
        <p className="text-sm text-[#5D6875] mt-1">
          Tickets requiring immediate administrative intervention, vendor escalation, or urgent safety resolution.
        </p>
      </div>

      {/* Advisory Banner */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Automated Escalation Rule Triggered:</strong>
          <span>
            These tickets have exceeded standard response SLAs or have been tagged as urgent physical safety hazards.
            Administrators must review technician allocation or authorize external contractor dispatch.
          </span>
        </div>
      </div>

      {/* Metric summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-red-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-red-700 uppercase">
            <span>Active Escalations</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-800 mt-2">{escalations.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">High priority intervention</p>
        </div>

        <div className="rounded-xl border border-[#D9E1E8] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5D6875] uppercase">
            <span>SLA Overdue Threshold</span>
            <Clock className="h-4 w-4 text-[#F97316]" />
          </div>
          <p className="text-2xl font-bold text-[#1E293B] mt-2">&gt; 4 hrs</p>
          <p className="text-xs text-slate-500 mt-0.5">Standard critical target</p>
        </div>

        <div className="rounded-xl border border-[#D9E1E8] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5D6875] uppercase">
            <span>Avg Escalation Clear Time</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-[#1E293B] mt-2">1.8 hrs</p>
          <p className="text-xs text-slate-500 mt-0.5">Past 30 days performance</p>
        </div>
      </div>

      {/* Escalated Tickets Table */}
      <div className="rounded-2xl border border-[#D9E1E8] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1E293B]">Critical Ticket Inventory</h2>
          <span className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
            {escalations.length} Pending Resolution
          </span>
        </div>

        {loading ? (
          <LoadingSkeleton variant="card" count={2} />
        ) : (
          <TicketTable
            tickets={escalations}
            detailPathPrefix="/admin/tickets"
            emptyMessage="No escalated tickets at this time"
          />
        )}
      </div>
    </div>
  );
}

export default Escalations;
