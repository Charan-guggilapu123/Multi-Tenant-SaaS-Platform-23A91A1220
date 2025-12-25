import React, { useEffect, useState } from 'react';
import api from '../services/api';

const PLANS = {
  free: { label: 'Free', maxUsers: 5, maxProjects: 3 },
  pro: { label: 'Pro', maxUsers: 25, maxProjects: 15 },
  enterprise: { label: 'Enterprise', maxUsers: 100, maxProjects: 50 }
};

const Subscription = () => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.get('/auth/me');
        const tenantId = me.data.data.tenant.id;
        const res = await api.get(`/tenants/${tenantId}`);
        setTenant(res.data.data);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load subscription');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const changePlan = async (plan) => {
    if (!tenant) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await api.put(`/tenants/${tenant.id}/subscription`, { plan });
      setTenant(res.data.data);
      setSuccess(`Plan updated to ${PLANS[plan].label}`);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!tenant) return <div className="text-center py-8">No tenant data</div>;

  const current = tenant.subscriptionPlan;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Subscription</h1>

      <div className="bg-neutral-900 border border-gray-800 rounded-lg p-6">
        <p className="text-gray-300">Current Plan</p>
        <p className="text-2xl font-semibold">{PLANS[current].label}</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <p className="text-gray-300">Max Users</p>
            <p className="text-xl">{tenant.maxUsers}</p>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4">
            <p className="text-gray-300">Max Projects</p>
            <p className="text-xl">{tenant.maxProjects}</p>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4">
            <p className="text-gray-300">Status</p>
            <p className="text-xl">{tenant.status}</p>
          </div>
        </div>
      </div>

      {(error || success) && (
        <div className={`rounded-md p-4 ${error ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
          {error || success}
        </div>
      )}

      <h2 className="text-2xl font-bold">Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(PLANS).map(([key, p]) => {
          const isCurrent = key === current;
          return (
            <div key={key} className="bg-neutral-800 border border-gray-800 rounded-lg p-6">
              <p className="text-xl font-semibold">{p.label}</p>
              <ul className="mt-3 space-y-2 text-gray-300">
                <li>Max Users: {p.maxUsers}</li>
                <li>Max Projects: {p.maxProjects}</li>
              </ul>
              <button
                disabled={isCurrent || saving}
                onClick={() => changePlan(key)}
                className={`mt-4 w-full px-4 py-2 rounded-md ${isCurrent ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-neutral-900'} border border-gray-700`}
              >
                {isCurrent ? 'Current Plan' : saving ? 'Updating...' : 'Choose Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subscription;
