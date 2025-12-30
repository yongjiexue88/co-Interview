import React from 'react';
import PolicyDetailLayout from '../../components/PolicyDetailLayout';

const RefundPage: React.FC = () => {
    return (
        <PolicyDetailLayout
            title="Co-Interview Refund Policy"
            description="Refund policy details for Co-Interview subscriptions."
            maxWidth="max-w-5xl"
        >
            <div className="text-gray-400 mb-8 text-sm">
                <p>Effective Date: 5/28/2024, 12:00:00 AM</p>
                <p>Last Updated: 6/14/2025, 12:00:00 AM</p>
            </div>

            <p className="lead text-xl text-gray-300 mb-12">
                At Co-Interview, we are committed to providing high-quality AI-powered interview preparation tools to help you succeed. We understand that circumstances can change, so our refund policy is designed to be clear and fair.
            </p>

            <div className="space-y-8">
                {/* Card 1: Subscription & Refunds */}
                <div className="bg-[#111] border border-white/10 rounded-xl p-8">
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">1. Subscription Refund Policy</h3>
                        <p className="mb-4 text-gray-300">
                            Our subscriptions provide immediate access to premium AI services, which are digital and non-returnable. Because of this, no refunds are offered once a subscription has started. To ensure Co-Interview is right for you, we encourage using our free trial before purchasing.
                        </p>
                        <div className="ml-5 space-y-4">
                            <div>
                                <h4 className="text-white font-semibold">Monthly and Quarterly Subscriptions</h4>
                                <ul className="list-disc pl-5 mt-2 text-gray-300 space-y-1">
                                    <li>Non-refundable once started.</li>
                                    <li>Cancellation allows continued access until the billing cycle ends, but no refunds or prorated credits.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-semibold">Annual Subscriptions</h4>
                                <ul className="list-disc pl-5 mt-2 text-gray-300 space-y-1">
                                    <li>Eligible for a partial refund if canceled within 7 days of purchase.</li>
                                    <li>No refunds after 7 days, but access remains available until the end of the billing cycle.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">3. Refund Eligibility for Accidental Purchases or Billing Errors</h3>
                        <p className="mb-4 text-gray-300">
                            If you believe you were charged incorrectly, contact support within 7 days of the transaction.
                        </p>
                        <p className="mb-2 text-gray-300">Refunds may be considered for:</p>
                        <ul className="list-none space-y-2 mb-4 text-gray-300">
                            <li>✔️ <strong className="text-white">Duplicate Purchases</strong> – Charged more than once for the same subscription.</li>
                            <li>✔️ <strong className="text-white">Product Not Delivered</strong> – No access granted after payment.</li>
                            <li>✔️ <strong className="text-white">Billing Errors</strong> – Charged after canceling before the renewal date (must provide cancellation confirmation email).</li>
                        </ul>
                        <p className="text-gray-300">For accidental plan purchases, reach out immediately, and we’ll review your request.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-white mb-4">7. Third-Party Outages</h3>
                        <p className="text-gray-300 mb-4">
                            Co-Interview relies on external service providers to deliver core functionality. If an outage or failure occurs due to an issue beyond our control (e.g., third-party infrastructure downtime), we do not issue refunds for the affected period.
                        </p>
                        <p className="text-gray-300">
                            However, as a gesture of goodwill, we may offer platform credits or extended access depending on the duration and impact of the disruption. Credit compensation is issued at our discretion.
                        </p>
                    </section>
                </div>

                {/* Card 2: Management & Process */}
                <div className="bg-[#111] border border-white/10 rounded-xl p-8">
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">2. Managing Your Subscription</h3>
                        <p className="text-gray-300 mb-4">
                            Modify or cancel your subscription anytime through Co-Interview account settings. Cancellations must be made before your renewal date to avoid charges.
                        </p>
                        <a href="/dashboard" className="inline-flex items-center text-[#EFCC3A] hover:text-[#ffd633] transition-colors">
                            🔗 Manage Your Subscription
                        </a>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">4. Credit Usage & Subscription Policy</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-300">
                            <li><strong className="text-white">Unlocked Credits Never Expire</strong> – They remain in your account indefinitely.</li>
                            <li><strong className="text-white">Post-Subscription Access</strong> – Credits work with general AI models, but professional models require an active subscription.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">6. Plan Upgrades & Prorated Charges</h3>
                        <p className="text-gray-300 mb-2">
                            Upgrading adjusts your plan, and you’ll be charged only for the prorated amount based on the remaining time in your billing cycle.
                        </p>
                        <p className="text-gray-300">
                            🔹 Upgrades take effect immediately.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">5. Refund Processing & Timeline</h3>
                        <p className="text-gray-300 mb-2">If eligible, refunds are processed:</p>
                        <ul className="list-none space-y-2 text-gray-300">
                            <li>✔️ Within 5–10 business days to the original payment method.</li>
                            <li>✔️ A confirmation email will be sent once processed.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-white mb-4">8. How to Request a Refund</h3>
                        <div className="space-y-4 text-gray-300">
                            <div>
                                <span className="text-white font-bold mr-2">1️⃣</span>
                                Email us at <a href="mailto:support@co-interview.com" className="text-[#EFCC3A] hover:underline">support@co-interview.com</a> with:
                                <ul className="list-disc pl-10 mt-2 space-y-1">
                                    <li>Your registered email</li>
                                    <li>Reason for refund request</li>
                                    <li>Supporting details (e.g., screenshots, receipts)</li>
                                </ul>
                            </div>
                            <div>
                                <span className="text-white font-bold mr-2">2️⃣</span>
                                Support Team Review within 7 business days.
                            </div>
                            <div>
                                <span className="text-white font-bold mr-2">3️⃣</span>
                                Approved refunds will be processed within 5–10 business days.
                            </div>
                        </div>
                    </section>
                </div>

                {/* Contact Footer */}
                <div className="bg-[#111] border border-white/10 rounded-xl p-8 text-center md:text-left md:flex md:justify-between md:items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">📞 Need Help?</h3>
                        <p className="text-gray-300">
                            📧 Customer Support: <a href="mailto:support@co-interview.com" className="text-[#EFCC3A] hover:underline">support@co-interview.com</a>
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <a href="/dashboard" className="inline-flex items-center px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
                            🔗 Manage Your Subscription
                        </a>
                    </div>
                </div>
            </div>
        </PolicyDetailLayout>
    );
};

export default RefundPage;
