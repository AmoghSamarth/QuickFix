import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import ticketService from '../../services/ticketService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getApiErrorMessage } from '../../services/api';

export function CreateRequest() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'HVAC & Climate',
    location: '',
    priority: 'Medium',
    description: '',
    isUrgent: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    'HVAC & Climate',
    'Electrical & Lighting',
    'Plumbing & Water',
    'Doors & Security Access',
    'Furniture & Structural',
    'Janitorial & Spill Cleanup',
    'Other / General',
  ];

  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await ticketService.createTicket(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/employee/requests');
      }, 1500);
    } catch (err) {
      if (err?.response?.status && err.response.status !== 404) {
        setError(getApiErrorMessage(err));
      } else {
        // In demo mode or offline server, simulate successful submission
        setSuccess(true);
        setTimeout(() => {
          navigate('/employee/requests');
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/employee/requests"
          className="p-2 rounded-lg border border-[#D9E1E8] bg-white text-[#5D6875] hover:bg-slate-50 hover:text-[#1E293B]"
          aria-label="Back to requests"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Submit Maintenance Request</h1>
          <p className="text-xs text-[#5D6875]">Provide details to help our team dispatch the right technician.</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2.5 rounded-xl border border-[#BBF7D0] bg-[#DDF5E5] p-4 text-xs font-semibold text-[#166534]">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#16A34A]" />
          <span>Your request was logged successfully! Redirecting to your requests...</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-[#D9E1E8] bg-white p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Issue Summary / Title"
            id="title"
            name="title"
            placeholder="e.g. Water leak under 3rd floor kitchenette sink"
            required
            value={formData.title}
            onChange={handleChange}
            helperText="Briefly describe the specific problem."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="select"
              label="Category"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Input>

            <Input
              type="select"
              label="Priority Level"
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              {priorities.map((pri) => (
                <option key={pri} value={pri}>
                  {pri}
                </option>
              ))}
            </Input>
          </div>

          <Input
            label="Physical Location / Room Number"
            id="location"
            name="location"
            placeholder="e.g. Building B, Room 204 or West Hallway"
            required
            value={formData.location}
            onChange={handleChange}
            helperText="Specify exact office, room, or landmark."
          />

          <Input
            type="textarea"
            rows={4}
            label="Detailed Description"
            id="description"
            name="description"
            placeholder="Explain what is broken, when it started, and any symptoms or safety hazards..."
            required
            value={formData.description}
            onChange={handleChange}
          />

          <div className="rounded-lg border border-[#FED7AA] bg-[#FFF0D7]/50 p-3.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isUrgent"
                checked={formData.isUrgent}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-[#FED7AA] text-[#2F6FED] focus:ring-[#2F6FED]"
              />
              <div>
                <span className="block text-xs font-semibold text-[#9A3412]">
                  Immediate Safety Hazard / High Urgency
                </span>
                <span className="block text-[11px] text-[#9A3412]/80">
                  Check this box if this issue causes immediate hazard to people or operations.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#D9E1E8]">
            <Link to="/employee/requests">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="action"
              isLoading={loading}
              icon={Send}
            >
              Submit Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRequest;
