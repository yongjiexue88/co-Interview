import React from 'react';
import PolicyDetailLayout from '../../components/PolicyDetailLayout';

const TermsPage: React.FC = () => {
    return (
        <PolicyDetailLayout
            title="Terms of Service"
            description="Terms of Service for using Co-Interview."
            maxWidth="max-w-5xl"
        >
            <div className="text-gray-400 mb-12 text-center">
                <p>Effective Date: 5/28/2024, 12:00:00 AM</p>
                <p>Last Updated: 6/14/2025, 12:00:00 AM</p>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-xl p-8 space-y-8">
                <section>
                    <p className="text-gray-300">
                        Welcome to Co-Interview. These Terms and Conditions ("Terms") govern your access to and use of our website, software, services, and other offerings (collectively, the "Services"). By accessing or using our Services, you agree to comply with and be bound by these Terms. If you do not agree with any part of these Terms, please do not use our Services.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Acceptance of Terms</h3>
                    <p className="text-gray-300">
                        By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with these Terms, you must not access or use our Services.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Registration</h3>
                    <p className="text-gray-300">
                        To access certain features of our Services, you may need to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your account information and for any activities or actions under your account.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Use of Services</h3>
                    <p className="text-gray-300 mb-4">
                        You agree to use our Services only for lawful purposes and in compliance with all applicable laws, regulations, and guidelines. You agree not to use our Services:
                    </p>
                    <ul className="list-disc pl-5 text-gray-300 space-y-2">
                        <li>In any manner that could damage, disable, overburden, or impair our Services.</li>
                        <li>To transmit any viruses, malware, or other harmful code.</li>
                        <li>To interfere with or disrupt any servers or networks connected to our Services.</li>
                        <li>To attempt to gain unauthorized access to any portion of our Services or any other accounts, computer systems, or networks connected to our Services.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Intellectual Property</h3>
                    <p className="text-gray-300">
                        All content, features, and functionality provided through our Services are the exclusive property of Co-Interview and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or use any part of our Services without prior written consent from Co-Interview.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Subscriptions</h3>
                    <p className="text-gray-300">
                        All subscriptions to our Services, including renewals, are non-refundable. Once a subscription fee has been paid, no refunds will be provided, regardless of the reason for cancellation or termination. By purchasing a subscription, you acknowledge and agree to this non-refundability policy.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Privacy</h3>
                    <p className="text-gray-300">
                        Your use of our Services is also governed by our Privacy Policy. By using our Services, you acknowledge and agree that you have read and understood our Privacy Policy.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Recording Consent & Responsibilities</h3>
                    <p className="text-gray-300 mb-4">
                        Our Services may allow users to record audio, video, or screen content, such as during online meetings or interactions. You are solely responsible for obtaining the explicit consent of all participants before initiating any recording using our Services.
                    </p>

                    <h4 className="text-lg font-semibold text-white mb-2">User Acknowledgment</h4>
                    <p className="text-gray-300 mb-4">
                        By using any recording features, you agree to:
                    </p>
                    <ul className="list-disc pl-5 text-gray-300 space-y-2 mb-4">
                        <li>Obtain informed, explicit consent from all individuals being recorded.</li>
                        <li>Ensure compliance with all applicable privacy, wiretap, surveillance, or consent laws (including but not limited to GDPR, CCPA, and state-specific two-party consent rules).</li>
                        <li>Use recorded content only for lawful and authorized purposes.</li>
                    </ul>
                    <p className="text-gray-300">
                        You acknowledge that Co-Interview does not verify whether appropriate consent has been obtained and is not responsible for any disputes, claims, or liabilities arising from unconsented recordings. It is your duty to ensure that your use of our Services complies with all relevant laws in your jurisdiction and the jurisdictions of your participants.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Legal Risk Warning: Compliance Logging</h3>
                    <p className="text-gray-300">
                        When recordings are initiated, our system may log metadata (e.g., session ID, timestamp, IP address) for audit purposes. This information is recorded solely to demonstrate user acknowledgment and system compliance, not as proof of third-party consent.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Limitation of Liability</h3>
                    <p className="text-gray-300 mb-4">
                        To the maximum extent permitted by law, Co-Interview shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
                    </p>
                    <ul className="list-disc pl-5 text-gray-300 space-y-2">
                        <li>Your access to or use of or inability to access or use our Services.</li>
                        <li>Any conduct or content of any third party on the Services.</li>
                        <li>Any content obtained from the Services.</li>
                        <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Third-Party Infrastructure & Outages</h3>
                    <p className="text-gray-300">
                        Our Services rely on certain third-party infrastructure providers. While we take every reasonable measure to ensure uninterrupted access, outages or service disruptions may occur due to failures beyond our control. We are not liable for any loss or disruption caused by such third-party outages.
                        <br /><br />
                        In such cases, we may, at our discretion, issue platform credits as a goodwill gesture. Refunds will not be issued for any downtime or unavailability caused by third-party service disruptions.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Beta Testing</h3>
                    <p className="text-gray-300">
                        If you participate in our beta testing programs, you acknowledge that the beta products are in a testing phase and may contain errors. These products are provided "AS IS" and "AS AVAILABLE." We reserve the right to modify or terminate the software or your access to the beta products at any time, without notice and without liability to you. You agree to provide feedback on the beta products and assign all rights to such feedback to us without compensation.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Use Restrictions</h3>
                    <p className="text-gray-300">
                        You agree not to abuse our platform, including but not limited to creating multiple accounts to exploit free credits or promotions. We reserve the right to terminate accounts and remove any content that violates our terms or policies.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Branding and Credits</h3>
                    <p className="text-gray-300">
                        You agree to provide proper credit to Co-Interview when using our products, in accordance with our branding guidelines.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Warranty Disclaimer & Performance Liability</h3>
                    <p className="text-gray-300">
                        Our services are provided "AS IS" without any guarantees of performance, accuracy, or compatibility. We disclaim all warranties, express or implied, and you assume all risks associated with using our services.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Early Development Service</h3>
                    <p className="text-gray-300">
                        Please note that our Services are still in their early development phase. Consequently, you may experience occasional stability issues and intermittent service interruptions. We are diligently working to enhance the reliability and performance of our Services, but uninterrupted service cannot be guaranteed at this stage. By using our Services, you acknowledge and accept that you are doing so at your own risk. Co-Interview is not liable for any problems or disruptions that may occur due to these early-stage instabilities.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Indemnification</h3>
                    <p className="text-gray-300">
                        You agree to indemnify, defend, and hold harmless Co-Interview and its affiliates from any claims arising from your use of our services, your breach of these terms, or any content you create using our services.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Injunctive Relief</h3>
                    <p className="text-gray-300">
                        You agree that any breach of these terms may cause irreparable harm to us for which monetary damages would not be an adequate remedy. We are entitled to seek injunctive or other equitable relief to prevent such breaches.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Proprietary Rights</h3>
                    <p className="text-gray-300">
                        We retain all rights to our services and beta products. You may not sell, transfer, or use these products for any unauthorized purposes.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Confidentiality</h3>
                    <p className="text-gray-300">
                        You agree to keep confidential all non-public information related to our beta products and services. This confidentiality obligation survives termination of these terms.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Governing Law</h3>
                    <p className="text-gray-300">
                        These terms are governed by the laws of the United States. You agree to submit to the jurisdiction of the courts in the United States for any disputes arising from these terms.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Changes to the Terms</h3>
                    <p className="text-gray-300">
                        We may modify these terms at any time. The most current version will be posted on our website. By continuing to use our services after any changes, you agree to be bound by the revised terms.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Termination</h3>
                    <p className="text-gray-300">
                        We reserve the right to terminate your access to our services at any time, with or without cause or notice. Upon termination, your right to use our services will cease immediately.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Miscellaneous</h3>
                    <p className="text-gray-300">
                        These terms do not create any partnership, agency, or joint venture between the parties. Your use of our services is subject to all our applicable online terms and policies. In case of any conflict, these terms will govern your use of the beta products.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
                    <p className="text-gray-300">
                        If you have any questions about these Terms, please contact us at: <a href="mailto:support@co-interview.com" className="text-white hover:underline">support@co-interview.com</a>.
                    </p>
                </section>

                <div className="pt-8 border-t border-white/10 text-center">
                    <p className="text-gray-400">
                        By using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms.
                    </p>
                </div>
            </div>
        </PolicyDetailLayout>
    );
};

export default TermsPage;
