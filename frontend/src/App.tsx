import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StillWorkingPage from './pages/StillWorkingPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function App() {
    return (
        <BrowserRouter>
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
