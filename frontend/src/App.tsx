import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StillWorkingPage from './pages/StillWorkingPage';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-background text-white selection:bg-[#EFCC3A]/30">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/still_working" element={<StillWorkingPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
