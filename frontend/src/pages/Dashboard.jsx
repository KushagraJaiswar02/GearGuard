import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, PenTool, ShieldAlert } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                    <p className="text-muted-foreground mt-2">Welcome back, {user?.username}. Here's what's happening with your projects.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="p-6 flex flex-col gap-1.5">
                            <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                                <Activity className="w-4 h-4 text-muted-foreground" />
                                Your Activity
                            </h3>
                            <p className="text-sm text-muted-foreground">Recent actions and updates.</p>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="text-sm">
                                <p className="mb-2"><strong>Email:</strong> {user?.email}</p>
                                <p><strong>Joined:</strong> {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

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
