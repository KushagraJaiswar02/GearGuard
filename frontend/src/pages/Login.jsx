import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
    const { login } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login(formData.email, formData.password);

        if (result.success) {
            const role = result.user.role;
            if (role === 'Admin' || role === 'Manager') navigate('/dashboard/manager');
            else if (role === 'Technician') navigate('/dashboard/technician');
            else navigate('/dashboard/employee');
        } else {
            setError(result.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px] animate-blob" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[100px] animate-blob delay-1000" />
                <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-cyan-500/15 blur-[80px] animate-blob delay-500" />
            </div>

            {/* Login Card */}
            <div className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                            <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">GearGuard</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
                        <p className="text-gray-400">Sign in to access your dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    required
                                    placeholder="you@company.com"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 
                                             text-white placeholder-gray-500 
                                             focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40
                                             transition-all duration-300"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 
                                             text-white placeholder-gray-500 
                                             focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40
                                             transition-all duration-300"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl
                                     shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                                     hover:-translate-y-0.5 active:translate-y-0
                                     transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-gray-500 text-sm">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-gray-400">
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            Create one
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
