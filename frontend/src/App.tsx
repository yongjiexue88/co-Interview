import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import ChangelogPage from './pages/dashboard/ChangelogPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import PricingPage from './pages/dashboard/PricingPage';
import BillingSuccessPage from './pages/BillingSuccessPage';
import PreviousVersionsPage from './pages/dashboard/PreviousVersionsPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ActivationPage from './components/ActivationPage';
import HelpPage from './pages/HelpPage';
import ApiKeyPage from './pages/help/ApiKeyPage';
import AudioPermissionsPage from './pages/help/AudioPermissionsPage';
import InstallationWarningPage from './pages/help/InstallationWarningPage';
import ClearStoragePage from './pages/help/ClearStoragePage';
import DownloadPage from './pages/DownloadPage';
import ElectronAuthPage from './pages/ElectronAuthPage';
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
                    <Route path="/success" element={<ActivationPage />} />
                    <Route path="/billing/success" element={<BillingSuccessPage />} />
                    <Route path="/signin" element={<SignInPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/electron-auth" element={<ElectronAuthPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/help/api-key" element={<ApiKeyPage />} />
                    <Route path="/help/audio-permissions" element={<AudioPermissionsPage />} />
                    <Route path="/help/installation-warning" element={<InstallationWarningPage />} />
                    <Route path="/help/clear-storage" element={<ClearStoragePage />} />
                    <Route path="/download" element={<DownloadPage />} />

                    {/* Dashboard Routes with shared layout */}
                    <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<DashboardHomePage />} />
                        <Route path="changelog" element={<ChangelogPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="pricing" element={<PricingPage />} />
                        <Route path="previous-versions" element={<PreviousVersionsPage />} />
                    </Route>

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
