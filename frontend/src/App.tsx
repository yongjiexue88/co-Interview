import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StillWorkingPage from './pages/StillWorkingPage';
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
import PreviousVersionsPage from './pages/dashboard/PreviousVersionsPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ActivationPage from './components/ActivationPage';
import PoliciesPage from './pages/PoliciesPage';
import TermsPage from './pages/policies/TermsPage';
import RefundPage from './pages/policies/RefundPage';
import PrivacyPage from './pages/policies/PrivacyPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
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
                    <Route path="/success" element={<ActivationPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/signin" element={<SignInPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/policies" element={<PoliciesPage />} />
                    <Route path="/policies/terms" element={<TermsPage />} />
                    <Route path="/policies/refund" element={<RefundPage />} />
                    <Route path="/policies/privacy" element={<PrivacyPage />} />

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
