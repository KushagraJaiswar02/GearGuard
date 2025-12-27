import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShieldCheck, Wrench, BarChart3, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';

const LandingPage = () => {
    const { user } = useUser();

    // Optional: Auto-redirect if logged in? 
    // "The website should start with a Landing... Once authenticated... redirect"
    // If they are visiting root / explicitly, maybe show landing?
    // But usually apps redirect to dashboard.
    if (user) {
        if (user.role === 'Admin' || user.role === 'Manager') return <Navigate to="/dashboard/manager" />;
        if (user.role === 'Technician') return <Navigate to="/dashboard/technician" />;
        return <Navigate to="/dashboard/employee" />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white font-sans">
            {/* Navbar */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="text-2xl font-bold flex items-center gap-2">
                    <Wrench className="w-8 h-8 text-blue-400" />
                    GearGuard
                </div>
                <div className="flex gap-4">
                    <Link to="/login" className="px-4 py-2 text-gray-300 hover:text-white transition">Login</Link>
                    <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-medium transition shadow-lg shadow-blue-500/30">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <header className="py-20 px-6 text-center max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                    Maintenance Mastered.
                </h1>
                <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
                    The unified system for Equipment Management, Fault Reporting, and Scrap workflows.
                    <br />Empowering Admins, Managers, and Technicians to work in sync.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20">
                        Start for Free <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/login" className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition border border-slate-600">
                        Login to Portal
                    </Link>
                </div>
            </header>

            {/* Features Info */}
            <section className="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
                        <Wrench className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Fault Boards</h3>
                    <p className="text-gray-400">Technicians see only what matters. Department-filtered requests for focused efficiency.</p>
                </div>
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6">
                        <ShieldCheck className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">RBAC Security</h3>
                    <p className="text-gray-400">Granular permissions ensure employees can only report, while managers approve critical actions.</p>
                </div>
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-6">
                        <BarChart3 className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Asset Lifecycle</h3>
                    <p className="text-gray-400">Track equipment from acquisition to scrap. Auto-escalate critical breakdowns.</p>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
