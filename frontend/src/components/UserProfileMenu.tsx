import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, Key, User, ChevronDown, LogOut, Settings, 
  Sparkles, CheckCircle2, ShieldAlert, Award, Lock, ExternalLink
} from 'lucide-react';
import { UserAccount } from '../types';

interface UserProfileMenuProps {
  currentUser: UserAccount | null;
  onOpenLoginModal: () => void;
  onOpenAdminModal: () => void;
  onLogout: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  currentUser,
  onOpenLoginModal,
  onOpenAdminModal,
  onLogout
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) {
    return (
      <button
        onClick={onOpenLoginModal}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 text-xs font-semibold shadow-sm transition-all"
      >
        <Key className="w-3.5 h-3.5 text-indigo-400" />
        <span>Corporate Sign In</span>
      </button>
    );
  }

  const isAdmin = currentUser.effective_permissions?.includes('rbac.manage') || 
                  currentUser.effective_app_roles?.includes('SUPER_ADMIN');

  const primaryRole = currentUser.effective_app_roles?.[0] || 'VIEWER';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800/80 transition-all text-left group"
      >
        <img
          src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
          alt={currentUser.name}
          className="w-7 h-7 rounded-lg object-cover border border-slate-600 shrink-0"
        />
        <div className="hidden sm:block min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate max-w-[110px]">
              {currentUser.name}
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
              isAdmin 
                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}>
              {primaryRole}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
            {currentUser.org_role_title}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in divide-y divide-slate-800">
          {/* Header profile details */}
          <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900">
            <div className="flex items-start gap-3">
              <img
                src={currentUser.avatar_url}
                alt={currentUser.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white truncate">{currentUser.name}</h4>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
                <p className="text-xs text-indigo-300 font-medium truncate">{currentUser.org_role_title}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                <p className="text-[10px] text-slate-400 mt-1">{currentUser.department}</p>
              </div>
            </div>

            {/* Effective App Roles */}
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Mapped Application Roles</span>
                <span className="font-mono text-indigo-400">{currentUser.effective_app_roles?.length || 0} active</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {currentUser.effective_app_roles?.map(role => (
                  <span
                    key={role}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-200"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Effective Permissions Summary */}
            <div className="mt-2.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Granular Capability Grants</span>
                <span className="font-mono text-emerald-400">{currentUser.effective_permissions?.length || 0} perms</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                {currentUser.effective_permissions?.map(perm => (
                  <span
                    key={perm}
                    className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action links */}
          <div className="p-2 space-y-1 bg-slate-950/60">
            {isAdmin && (
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenAdminModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-amber-300 hover:text-white bg-amber-950/20 hover:bg-amber-900/40 rounded-xl transition-colors border border-amber-500/30"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span className="flex-1 text-left">Admin Access Control Console</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 font-bold">Admin</span>
              </button>
            )}

            <button
              onClick={() => {
                setDropdownOpen(false);
                onOpenLoginModal();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="flex-1 text-left">Switch Corporate Persona</span>
            </button>

            <button
              onClick={() => {
                setDropdownOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="flex-1 text-left">Sign Out Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
