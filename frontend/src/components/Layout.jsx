import React from 'react';
<<<<<<< HEAD
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <div className="flex-1 flex flex-col pl-16">
                <Navbar />
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
=======
import { Link, Outlet } from 'react-router-dom';
import { Wrench, Users, Monitor } from 'lucide-react';

const Layout = () => {
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
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
>>>>>>> origin/feature/equipment
        </div>
    );
};

export default Layout;
