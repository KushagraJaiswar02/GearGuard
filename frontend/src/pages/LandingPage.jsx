import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShieldCheck, Wrench, BarChart3, ArrowRight, Zap, Users, Clock, CheckCircle2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

const LandingPage = () => {
    const { user } = useUser();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    if (user) {
        if (user.role === 'Admin' || user.role === 'Manager') return <Navigate to="/dashboard/manager" />;
        if (user.role === 'Technician') return <Navigate to="/dashboard/technician" />;
        return <Navigate to="/dashboard/employee" />;
    }

    return (
        <div className="min-h-screen bg-[#0a0f1a] text-white font-sans overflow-hidden relative">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orbs */}
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/30 blur-[120px] animate-blob" />
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/25 blur-[100px] animate-blob delay-1000" />
                <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-cyan-500/20 blur-[80px] animate-blob delay-500" />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                         linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            {/* Navbar */}
            <nav className={`relative z-50 p-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Wrench className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            GearGuard
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors font-medium"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-semibold 
                                     shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 
                                     hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative z-10 py-20 px-6 max-w-6xl mx-auto text-center">
                <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-300">Trusted by 500+ enterprises</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
                        <span className="block text-white">Maintenance</span>
                        <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                            Mastered.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        The unified platform for Equipment Management, Fault Reporting, and Scrap workflows.
                        Empowering your teams to work in perfect sync.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                        <Link
                            to="/signup"
                            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl font-bold text-lg 
                                     shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40
                                     hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            Start for Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg
                                     hover:bg-white/10 hover:border-white/20 hover:-translate-y-1
                                     transition-all duration-300 backdrop-blur-sm"
                        >
                            Login to Portal
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <StatCard number="10K+" label="Assets Managed" />
                    <StatCard number="99.9%" label="Uptime" />
                    <StatCard number="50%" label="Faster Resolution" />
                    <StatCard number="24/7" label="Support" />
                </div>
            </header>

            {/* Features Section */}
            <section className={`relative z-10 py-24 px-6 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Everything you need to
                            <span className="text-gradient"> manage equipment</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Powerful features designed to streamline your maintenance operations
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={Wrench}
                            iconColor="from-blue-500 to-cyan-400"
                            title="Fault Boards"
                            description="Technicians see only what matters. Department-filtered requests for focused efficiency."
                            delay="0"
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            iconColor="from-purple-500 to-pink-400"
                            title="RBAC Security"
                            description="Granular permissions ensure employees can only report while managers approve critical actions."
                            delay="100"
                        />
                        <FeatureCard
                            icon={BarChart3}
                            iconColor="from-emerald-500 to-cyan-400"
                            title="Asset Lifecycle"
                            description="Track equipment from acquisition to scrap. Auto-escalate critical breakdowns."
                            delay="200"
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            How it <span className="text-gradient-purple">works</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <StepCard
                            number="01"
                            icon={Users}
                            title="Sign Up"
                            description="Create your account with role-based access"
                        />
                        <StepCard
                            number="02"
                            icon={Wrench}
                            title="Add Equipment"
                            description="Register your assets in the system"
                        />
                        <StepCard
                            number="03"
                            icon={Clock}
                            title="Report Issues"
                            description="Employees report faults instantly"
                        />
                        <StepCard
                            number="04"
                            icon={CheckCircle2}
                            title="Resolve Fast"
                            description="Technicians fix issues efficiently"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden">
                        {/* Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0tOCA4aC0ydi00aDJ2NHptMC04aC0ydi00aDJ2NHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

                        <div className="relative px-8 py-16 md:px-16 text-center">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                Ready to transform your maintenance?
                            </h2>
                            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                                Join thousands of teams already using GearGuard to streamline their operations.
                            </p>
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg
                                         hover:bg-gray-100 hover:-translate-y-1 hover:shadow-2xl
                                         transition-all duration-300"
                            >
                                Get Started Now
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 px-6 border-t border-white/10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                            <Wrench className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg">GearGuard</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        © 2024 GearGuard. Built for modern maintenance teams.
                    </p>
                </div>
            </footer>
        </div>
    );
};

// Sub-components

const StatCard = ({ number, label }) => (
    <div className="text-center p-4">
        <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{number}</div>
        <div className="text-sm text-gray-400">{label}</div>
    </div>
);

const FeatureCard = ({ icon: Icon, iconColor, title, description, delay }) => (
    <div
        className="group p-8 rounded-2xl bg-white/[0.03] border border-white/10 
                   hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-2
                   transition-all duration-500 cursor-default"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${iconColor} 
                        flex items-center justify-center mb-6 
                        shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
);

const StepCard = ({ number, icon: Icon, title, description }) => (
    <div className="text-center group">
        <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 
                          flex items-center justify-center group-hover:bg-white/10 
                          group-hover:border-white/20 transition-all duration-300">
                <Icon className="w-7 h-7 text-blue-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 
                          flex items-center justify-center text-xs font-bold shadow-lg">
                {number}
            </div>
        </div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </div>
);

export default LandingPage;
