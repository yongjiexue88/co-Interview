import React from 'react';
import { Users, CheckCircle, MousePointer, TrendingUp } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface UserData {
    id: string;
    email: string;
    source: string;
    createdAt: Timestamp;
    intent?: string;
}

interface AnalyticsEvent {
    id: string;
    eventName: string;
    params: any;
    createdAt: Timestamp;
}

interface KPISummaryPanelProps {
    users: UserData[];
    events: AnalyticsEvent[];
}

const KPISummaryPanel: React.FC<KPISummaryPanelProps> = ({ users, events }) => {
    // 1. Signups (7d)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const signups7d = users.filter(u => {
        const date = u.createdAt?.toDate ? u.createdAt.toDate() : new Date();
        return date >= sevenDaysAgo;
    }).length;

    // 2. Qualified Rate
    // Count users who have an 'intent' field set
    const qualifiedCount = users.filter(u => u.intent).length;
    const qualifiedRate = users.length > 0 ? Math.round((qualifiedCount / users.length) * 100) : 0;

    // 3. Top Source
    const sourceCounts: Record<string, number> = {};
    users.forEach(u => {
        const src = u.source || 'unknown';
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });
    const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0];
    const topSourceName = topSource ? topSource[0] : '-';

    // 4. Pricing Interest (Nav Clicks on 'Pricing')
    const pricingClicks = events.filter(e =>
        (e.eventName === 'nav_click' || e.eventName === 'mobile_nav_click') &&
        e.params?.label === 'Pricing'
    ).length;

    return (
        <div className="bg-gradient-to-r from-gray-900 to-black border border-white/10 rounded-xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-32 h-32 text-[#FACC15]" />
            </div>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-[#FACC15]">North Star</span> Metrics (Last 7 Days)
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm">
                        <Users className="w-4 h-4" />
                        <span>Signups (7d)</span>
                    </div>
                    <div className="text-3xl font-bold text-white">+{signups7d}</div>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Qualified %</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{qualifiedRate}%</div>
                    <div className="text-xs text-gray-500 mt-1">{qualifiedCount} qualified users</div>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span>Top Source</span>
                    </div>
                    <div className="text-3xl font-bold text-white capitalize">{topSourceName}</div>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm">
                        <MousePointer className="w-4 h-4 text-purple-500" />
                        <span>Pricing Interest</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{pricingClicks}</div>
                    <div className="text-xs text-gray-500 mt-1">all-time clicks</div>
                </div>
            </div>
        </div>
    );
};

export default KPISummaryPanel;
