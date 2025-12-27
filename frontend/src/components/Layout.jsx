import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { LogOut, Wrench, Monitor, Users } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useUser();

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Wrench className="w-6 h-6 text-blue-400" />
                        Maintenance
                    </h1>
                </div>

                {/* User Info */}
                <div className="p-4 bg-slate-800 border-b border-gray-700">
                    <div className="text-sm font-semibold">{user?.name}</div>
                    <div className="text-xs text-gray-400">{user?.role} - {user?.department || 'General'}</div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                        <Monitor className="w-5 h-5" />
                        Equipment
                    </Link>
                    <Link to="/teams" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                        <Users className="w-5 h-5" />
                        Teams
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
