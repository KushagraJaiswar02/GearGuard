import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Activity,
    PenTool,
    ShieldAlert,
    ArrowUpRight,
    ArrowDownRight,
    Database,
    Clock
} from 'lucide-react';
import { cn } from '../lib/utils';

const StatCard = ({ title, value, change, trend, icon: Icon }) => (
    <div className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{value}</span>
            {change && (
                <span className={cn(
                    "text-xs font-medium flex items-center",
                    trend === 'up' ? "text-primary" : "text-destructive"
                )}>
                    {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {change}
                </span>
            )}
        </div>
    </div>
);

const ActivityRow = ({ action, object, time, user }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors px-2 -mx-2 rounded">
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center text-xs font-medium uppercase text-muted-foreground">
                {user.slice(0, 2)}
            </div>
            <div>
                <p className="text-sm text-foreground">
                    <span className="font-medium">{user}</span> {action} <span className="font-medium">{object}</span>
                </p>
                <p className="text-xs text-muted-foreground">{time}</p>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="max-w-7xl mx-auto p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Overview</h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome back, {user?.username}. Here's what's happening with your projects.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Requests"
                        value="2.4M"
                        change="+12.5%"
                        trend="up"
                        icon={Activity}
                    />
                    <StatCard
                        title="Active Users"
                        value="43,212"
                        change="+2.4%"
                        trend="up"
                        icon={Users}
                    />
                    <StatCard
                        title="Database Size"
                        value="12.8 GB"
                        change="+0.1%"
                        trend="up"
                        icon={Database}
                    />
                    <StatCard
                        title="Avg Response"
                        value="142ms"
                        change="-12ms"
                        trend="down"
                        icon={Clock}
                    />
                </div>

                {/* Activity and Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 rounded-lg border border-border bg-card shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">API Requests (Last 24h)</h3>
                        <div className="h-64 flex items-end justify-between gap-1">
                            {[...Array(30)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-primary/20 hover:bg-primary transition-colors rounded-t-sm w-full"
                                    style={{ height: `${Math.random() * 100}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                        <div className="flex flex-col">
                            <ActivityRow action="updated" object="users table" time="2m ago" user="Alice" />
                            <ActivityRow action="created" object="API Key" time="15m ago" user="Bob" />
                            <ActivityRow action="deployed" object="Edge Function" time="1h ago" user="Charlie" />
                            <ActivityRow action="deleted" object="old_backup" time="3h ago" user="Dave" />
                            <ActivityRow action="updated" object="auth settings" time="5h ago" user="Alice" />
                        </div>
                    </div>
                </div>

                {/* Business Logic / Management Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                    {/* Admin Controls */}
                    {user?.role === 'admin' && (
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ShieldAlert className="w-24 h-24" />
                            </div>
                            <div className="p-6 flex flex-col gap-1.5">
                                <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    User Management
                                </h3>
                                <p className="text-sm text-muted-foreground">Control access and permissions.</p>
                            </div>
                            <div className="p-6 pt-0">
                                <button
                                    onClick={() => navigate('/admin/users')}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
                                >
                                    Manage Users
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Technician Tasks */}
                    {['admin', 'manager', 'technician'].includes(user?.role) && (
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="p-6 flex flex-col gap-1.5">
                                <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                                    <PenTool className="w-4 h-4 text-muted-foreground" />
                                    Maintenance Tasks
                                </h3>
                                <p className="text-sm text-muted-foreground">Pending jobs and tickets.</p>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="h-24 flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                                    No active tasks
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
