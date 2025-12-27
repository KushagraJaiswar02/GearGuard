import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, Database, Activity, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Database, label: 'Table Editor', path: '/tables' },
        { icon: Users, label: 'Authentication', path: '/auth' },
        { icon: Shield, label: 'Policies', path: '/policies' },
        { icon: Activity, label: 'Logs', path: '/logs' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-16 border-r border-border bg-sidebar flex flex-col items-center py-4">
            <div className="mb-8 p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
            </div>

            <nav className="flex-1 flex flex-col gap-2 w-full px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center p-2 rounded-md transition-colors gap-1 group relative",
                                isActive
                                    ? "bg-sidebar-active text-primary"
                                    : "text-muted-foreground hover:bg-sidebar-active hover:text-foreground"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border z-50">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto">
                {/* Bottom items if any */}
            </div>
        </aside>
    );
};

export default Sidebar;
