import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Users, Database, Clock } from 'lucide-react';
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
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-2">Overview of your project statistics and activity.</p>
            </div>

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
                    trend="down" /* technically good for latency, but using down for visual red distinction? No, let's imply improvement is green */
                    icon={Clock}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 rounded-lg border border-border bg-card shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">API Requests (Last 24h)</h3>
                    {/* Placeholder for a chart - using a visual mock with simple divs for bar chart effect */}
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
        </div>
    );
};

export default Dashboard;
