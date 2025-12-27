import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
    LogOut, Wrench, Monitor, Users, LayoutDashboard,
    ChevronLeft, ChevronRight, Settings, Bell, Search,
    ClipboardList, Package
} from 'lucide-react';

const Layout = () => {
    const { user, logout } = useUser();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Determine active dashboard based on role
    const getDashboardPath = () => {
        if (user?.role === 'Admin' || user?.role === 'Manager') return '/dashboard/manager';
        if (user?.role === 'Technician') return '/dashboard/technician';
        return '/dashboard/employee';
    };

    const navItems = [
        { path: getDashboardPath(), icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/dashboard/employee', icon: Package, label: 'Equipment', roles: ['Manager', 'Admin', 'User', 'Employee'] },
        { path: '/teams', icon: Users, label: 'Teams', roles: ['Manager', 'Admin'] },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside
                className={`${isCollapsed ? 'w-20' : 'w-72'} 
                           bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
                           text-white flex flex-col transition-all duration-300 relative
                           border-r border-white/5`}
            >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 pointer-events-none" />

                {/* Logo Section */}
                <div className={`relative p-6 border-b border-white/10 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                        <Wrench className="w-5 h-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fade-in">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                GearGuard
                            </h1>
                            <p className="text-xs text-gray-500">Maintenance System</p>
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className={`relative p-4 mx-3 mt-4 rounded-xl bg-white/5 border border-white/10 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        {!isCollapsed && (
                            <div className="animate-fade-in overflow-hidden">
                                <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    {user?.role} • {user?.department || 'General'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="relative flex-1 p-3 mt-4 space-y-1">
                    {navItems.map((item) => {
                        // Check if user has permission for this nav item
                        if (item.roles && !item.roles.includes(user?.role)) return null;

                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                                           ${active
                                        ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-white border-l-2 border-blue-400'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    } ${isCollapsed ? 'justify-center px-3' : ''}`}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 
                                                ${active ? 'text-blue-400' : 'group-hover:scale-110'}`} />
                                {!isCollapsed && (
                                    <span className="font-medium animate-fade-in">{item.label}</span>
                                )}
                                {active && !isCollapsed && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute top-1/2 -right-3 transform -translate-y-1/2 
                             w-6 h-6 rounded-full bg-slate-700 border border-slate-600
                             flex items-center justify-center text-gray-400 
                             hover:bg-slate-600 hover:text-white transition-all duration-300
                             shadow-lg z-10"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Logout */}
                <div className="relative p-3 border-t border-white/10">
                    <button
                        onClick={logout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                  text-gray-400 hover:text-red-400 hover:bg-red-500/10 
                                  transition-all duration-300 group
                                  ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {!isCollapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Top Header Bar */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search equipment, requests..."
                                className="w-80 pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 border border-transparent
                                         text-gray-900 placeholder-gray-400 text-sm
                                         focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 focus:bg-white
                                         transition-all duration-300"
                            />
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <button className="relative p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            </button>

                            {/* Settings */}
                            <button className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                                <Settings className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
