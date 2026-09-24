import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Key, Sliders, CheckSquare, Square, 
  Save, AlertCircle, RefreshCw, X, Plus, Search, Building2,
  Lock, CheckCircle2, History, ArrowRight, Shield, Award, HelpCircle
} from 'lucide-react';
import { UserAccount, OrgRole, AppRole, RBACPermissionOverview } from '../types';

interface AdminAccessControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserUpdated: () => void;
}

export const AdminAccessControlModal: React.FC<AdminAccessControlModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'users' | 'capabilities' | 'audit'>('matrix');
  const [rbacData, setRbacData] = useState<RBACPermissionOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingMapping, setSavingMapping] = useState<string | null>(null);
  const [searchUser, setSearchUser] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New user form state
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDept, setNewUserDept] = useState('Product Engineering');
  const [newUserOrgRole, setNewUserOrgRole] = useState('org-dev');
  const [creatingUser, setCreatingUser] = useState(false);

  // Local state for role mappings to allow smooth editing before save
  const [localMappings, setLocalMappings] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen) {
      fetchRbacOverview();
    }
  }, [isOpen]);

  const fetchRbacOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/rbac/overview');
      if (!res.ok) throw new Error('Failed to load RBAC overview');
      const data: RBACPermissionOverview = await res.json();
      setRbacData(data);
      setLocalMappings(data.role_mappings || {});
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error loading access control state' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleToggleMapping = (appRoleId: string, orgRoleId: string) => {
    setLocalMappings(prev => {
      const currentList = prev[appRoleId] ? [...prev[appRoleId]] : [];
      const index = currentList.indexOf(orgRoleId);
      if (index >= 0) {
        currentList.splice(index, 1);
      } else {
        currentList.push(orgRoleId);
      }
      return {
        ...prev,
        [appRoleId]: currentList
      };
    });
  };

  const handleSaveMapping = async (appRoleId: string) => {
    setSavingMapping(appRoleId);
    setStatusMsg(null);
    try {
      const mappedOrgs = localMappings[appRoleId] || [];
      const res = await fetch('/api/auth/rbac/mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_role_id: appRoleId,
          mapped_org_role_ids: mappedOrgs,
          operator: currentUser?.name || 'Platform Admin'
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update mapping');
      }
      setStatusMsg({ 
        type: 'success', 
        text: `Application role '${appRoleId}' successfully updated and mapped to ${mappedOrgs.length} organizational roles.` 
      });
      // Refetch to propagate effective permissions to all users
      await fetchRbacOverview();
      onUserUpdated();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to persist mapping' });
    } finally {
      setSavingMapping(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/auth/users?operator=${encodeURIComponent(currentUser?.name || 'Platform Admin')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          department: newUserDept,
          org_role_id: newUserOrgRole
        })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to create user');
      }
      setStatusMsg({ type: 'success', text: `User '${newUserName}' onboarded successfully with corporate SSO credentials.` });
      setNewUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      await fetchRbacOverview();
      onUserUpdated();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'User creation error' });
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = (rbacData?.users || []).filter(u => 
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.org_role_title.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.department.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Enterprise RBAC & Identity Administration</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  Sovereign Administrator Console
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage N:M role mapping architecture, corporate organizational roles, user directory, and granular capability grants
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-950/60 text-emerald-200 border-emerald-500/40' 
              : 'bg-red-950/60 text-red-200 border-red-500/40'
          }`}>
            <span className="flex items-center gap-2">
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
              {statusMsg.text}
            </span>
            <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'matrix'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            N:M Role Mapping Matrix
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Core
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Corporate User Directory ({rbacData?.users?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('capabilities')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'capabilities'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            Capability Grants & Permissions ({rbacData?.all_permissions?.length || 0})
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Synchronizing RBAC Matrix from Security Subsystem...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: N:M ROLE MAPPING MATRIX */}
              {activeTab === 'matrix' && (
                <div className="space-y-6">
                  {/* Explanatory banner */}
                  <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-4 flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300 space-y-1">
                      <p className="font-semibold text-white">
                        N:M Architecture: Mapping Single Application Roles to Multiple Organizational Roles
                      </p>
                      <p className="text-slate-400">
                        In an enterprise IT company, technical application permissions (e.g. executing pipeline runs, running golden tests, approving waivers) are rarely 1:1 with corporate job titles. PRIP-AI maps a single application capability role (rows) to multiple organizational level roles (columns). Any employee with that organizational role immediately inherits the mapped application permissions.
                      </p>
                    </div>
                  </div>

                  {/* The Matrix Table */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300">
                            <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] sticky left-0 bg-slate-900 z-10 w-72">
                              Application Capability Role
                            </th>
                            {rbacData?.org_roles.map(org => (
                              <th key={org.role_id} className="p-3.5 font-semibold text-center border-l border-slate-800/80 min-w-[130px]">
                                <div className="font-medium text-white text-[11px] truncate" title={org.title}>
                                  {org.title}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                  {org.department}
                                </div>
                              </th>
                            ))}
                            <th className="p-3.5 font-semibold text-right border-l border-slate-800/80 w-28">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {rbacData?.app_roles.map(appRole => {
                            const mappedOrgIds = localMappings[appRole.role_id] || [];
                            const isSaving = savingMapping === appRole.role_id;
                            const hasChanges = JSON.stringify(mappedOrgIds.sort()) !== 
                                               JSON.stringify((rbacData.role_mappings[appRole.role_id] || []).sort());

                            return (
                              <tr key={appRole.role_id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="p-3.5 sticky left-0 bg-slate-950/90 border-r border-slate-800/80 z-10">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white font-mono text-xs text-indigo-300">
                                      {appRole.role_id}
                                    </span>
                                  </div>
                                  <div className="text-xs font-semibold text-slate-300 mt-0.5">
                                    {appRole.name}
                                  </div>
                                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={appRole.description}>
                                    {appRole.description}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {appRole.permissions.slice(0, 3).map(p => (
                                      <span key={p} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                        {p}
                                      </span>
                                    ))}
                                    {appRole.permissions.length > 3 && (
                                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-indigo-400 border border-slate-800">
                                        +{appRole.permissions.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {rbacData.org_roles.map(org => {
                                  const isChecked = mappedOrgIds.includes(org.role_id);
                                  return (
                                    <td 
                                      key={org.role_id} 
                                      onClick={() => handleToggleMapping(appRole.role_id, org.role_id)}
                                      className="p-3.5 text-center border-l border-slate-800/60 cursor-pointer hover:bg-indigo-950/20 transition-colors"
                                    >
                                      <div className="flex justify-center items-center">
                                        {isChecked ? (
                                          <div className="w-5 h-5 rounded bg-indigo-600 border border-indigo-400 flex items-center justify-center text-white shadow-sm shadow-indigo-500/40">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                          </div>
                                        ) : (
                                          <div className="w-5 h-5 rounded border border-slate-700 bg-slate-900/60 hover:border-slate-500 transition-colors" />
                                        )}
                                      </div>
                                    </td>
                                  );
                                })}

                                <td className="p-3.5 text-right border-l border-slate-800/80">
                                  <button
                                    onClick={() => handleSaveMapping(appRole.role_id)}
                                    disabled={isSaving}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all ${
                                      hasChanges
                                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                    }`}
                                  >
                                    {isSaving ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Save className="w-3.5 h-3.5" />
                                    )}
                                    <span>{hasChanges ? 'Save' : 'Saved'}</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CORPORATE USER DIRECTORY */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchUser}
                        onChange={e => setSearchUser(e.target.value)}
                        placeholder="Search employee by name, title, department, or email..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      onClick={() => setNewUserModalOpen(true)}
                      className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Onboard New IT Employee</span>
                    </button>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300">
                          <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Employee Identity</th>
                          <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Department & Title</th>
                          <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Mapped App Roles</th>
                          <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Status</th>
                          <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Last Attested</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredUsers.map(user => (
                          <tr key={user.user_id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                                  alt={user.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                    {user.name}
                                    {user.user_id === currentUser?.user_id && (
                                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="font-medium text-slate-200">{user.org_role_title}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                {user.department}
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {user.effective_app_roles?.map(role => (
                                  <span
                                    key={role}
                                    className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 font-medium"
                                  >
                                    {role}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="p-3.5">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                                {user.status}
                              </span>
                            </td>

                            <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                              {user.last_login}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: CAPABILITY GRANTS */}
              {activeTab === 'capabilities' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <p className="font-semibold text-white mb-1">
                      Granular Capability Permissions Spec (Least Privilege Invariant #1)
                    </p>
                    <p className="text-slate-400">
                      These atomic permissions govern the execution of high-consequence operations across PRIP-AI. They are bundled into Application Roles, which are dynamically bound to Organizational Roles via the N:M matrix.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rbacData?.app_roles.map(appRole => (
                      <div key={appRole.role_id} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold font-mono text-indigo-400">{appRole.role_id}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                              {appRole.permissions.length} capabilities
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white">{appRole.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">{appRole.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Granted Permissions:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {appRole.permissions.map(perm => (
                              <span 
                                key={perm}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30"
                              >
                                {perm}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Audited under FedRAMP / SOC2 Type II Architecture Invariant 10 & 12</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors text-xs"
          >
            Close Administration Console
          </button>
        </div>
      </div>

      {/* CREATE NEW USER POPUP */}
      {newUserModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Onboard IT Enterprise Employee
              </h3>
              <button onClick={() => setNewUserModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="alex.morgan@corp.internal"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  value={newUserDept}
                  onChange={e => setNewUserDept(e.target.value)}
                  placeholder="e.g. Cloud Infrastructure"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Organizational Title / Role</label>
                <select
                  value={newUserOrgRole}
                  onChange={e => setNewUserOrgRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {rbacData?.org_roles.map(r => (
                    <option key={r.role_id} value={r.role_id}>
                      {r.title} ({r.department})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Their application permissions will be dynamically derived from the N:M matrix for this role.
                </p>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setNewUserModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
                >
                  {creatingUser ? 'Creating...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
