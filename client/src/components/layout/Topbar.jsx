import { useAuth } from '../../app/AuthProvider';
import Button from '../ui/Button';

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface-900/80 backdrop-blur-sm border-b border-surface-800">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search (optional) */}
        <div className="flex-1">
          {/* Can add global search here */}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications placeholder */}
          <button className="p-2 text-surface-400 hover:text-surface-100 hover:bg-surface-800 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-surface-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-surface-100">{user?.name}</p>
              <p className="text-xs text-surface-400">{user?.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
