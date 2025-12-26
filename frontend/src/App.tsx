import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StillWorkingPage from './pages/StillWorkingPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { usePageTracking } from './hooks/usePageTracking';
import { useScrollTracking } from './hooks/useScrollTracking';
import { useExitTracking } from './hooks/useExitTracking';

const AnalyticsTracker = () => {
    usePageTracking();
    useScrollTracking();
    useExitTracking();
    return null;
};

function App() {
    return (
        <BrowserRouter>
            <AnalyticsTracker />
            <div className="min-h-screen bg-background text-white selection:bg-[#EFCC3A]/30">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/still_working" element={<StillWorkingPage />} />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route element={<ProtectedAdminRoute />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
