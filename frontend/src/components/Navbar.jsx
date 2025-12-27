import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ModeToggle } from './ModeToggle';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="border-b bg-background">
            <div className="flex h-16 items-center px-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-6">
                    <Link to="/dashboard" className="font-bold text-xl tracking-tight flex items-center gap-2">
                        <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs dark:bg-white dark:text-black">G</div>
                        GearGuard
                    </Link>
                    <div className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
                        <Link to="/dashboard" className="hover:text-foreground transition-colors">Overview</Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin/users" className="hover:text-foreground transition-colors">Users</Link>
                        )}
                        <Link to="#" className="hover:text-foreground transition-colors">Settings</Link>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <ModeToggle />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground border px-3 py-1 rounded-full">
                        <span className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        <span className="capitalize">{user?.role}</span>
                    </div>
                    <button onClick={handleLogout} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Log out
                    </button>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium border">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
