import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ADMIN_EMAILS } from '../constants';
import { Loader2, ShieldAlert } from 'lucide-react';

const ProtectedAdminRoute: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-[#FACC15] animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-gray-400 mb-6 text-center max-w-md">
                    Your email ({user.email}) is not authorized to access the admin dashboard.
                </p>
                <button
                    onClick={() => import('../lib/firebase').then(m => m.auth.signOut())}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                    Sign Out
                </button>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedAdminRoute;
