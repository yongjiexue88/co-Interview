import React from 'react';
import PolicyDetailLayout from '../../components/PolicyDetailLayout';

const PrivacyPage: React.FC = () => {
    return (
        <PolicyDetailLayout title="Privacy Policy" description="Privacy Policy for Co-Interview services." maxWidth="max-w-5xl">
            <div className="text-gray-400 mb-12 text-center">
                <p>Effective Date: May 28, 2024</p>
                <p>Last Updated: October 5, 2024</p>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-xl p-8 space-y-8">
                <section>
                    <p className="text-gray-300">
                        At Co-Interview, your privacy is of utmost importance to us. We are committed to respecting your privacy and adhering to any
                        applicable law and regulation regarding any personal information we may collect, including information collected through our
                        website,{' '}
                        <a href="https://www.co-interview.com" className="text-white hover:underline">
                            https://www.co-interview.com
                        </a>
                        , and other services we provide.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Information We Collect</h3>
                    <p className="text-gray-300 mb-4">
                        We collect two types of information: voluntarily provided information and automatically collected information.
                    </p>
                    <ul className="list-disc pl-5 text-gray-300 space-y-2">
                        <li>
                            <strong className="text-white">Voluntarily Provided Information:</strong> This includes information you give us directly,
                            such as when you sign up for an account, subscribe to our newsletter, or participate in our services and promotions.
                        </li>
                        <li>
                            <strong className="text-white">Automatically Collected Information:</strong> This includes information that your devices
                            automatically send when you access our services. It encompasses data like your IP address, device type, and how you
                            interact with our site.
                        </li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Detailed Data Collection</h3>
                    <ul className="list-disc pl-5 text-gray-300 space-y-2">
                        <li>
                            <strong className="text-white">Log Data:</strong> Our servers log information like your IP address, browser type, the
                            pages you visit, and visit duration.
                        </li>
                        <li>
                            <strong className="text-white">Device Data:</strong> We collect information about the device you use, such as the device
                            type and operating system.
                        </li>
                        <li>
                            <strong className="text-white">Personal Information:</strong> We may collect personal details like your name and email
                            address when you engage with our services.
                        </li>
                        <li>
                            <strong className="text-white">User-Generated Content:</strong> Any content provided by users will only be published with
                            their explicit consent. Once published, users can delete their content at any time directly through their account
                            settings. Additionally, if an account remains inactive for over a year, we will automatically delete all associated data,
                            including user-generated content.
                        </li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Cookies and Tracking Technologies</h3>
                    <p className="text-gray-300">
                        We use cookies and similar technologies to improve user experience and analyze website performance. By using our services, you
                        consent to our use of cookies.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Security of Your Personal Information</h3>
                    <p className="text-gray-300">
                        We strive to protect your personal information with commercially acceptable means against unauthorized access, loss, or theft.
                        However, no digital platform can guarantee absolute security.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Retention of Your Personal Information</h3>
                    <p className="text-gray-300">
                        We retain your personal information as long as necessary to provide our services to you and comply with legal obligations.
                        When no longer needed, we will delete or anonymize your information.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Children's Privacy</h3>
                    <p className="text-gray-300">Our services are not intended for children under 13, and we do not knowingly collect their data.</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Disclosure of Personal Information to Third Parties</h3>
                    <p className="text-gray-300 mb-4">We may share your information with:</p>
                    <ul className="list-disc pl-5 text-gray-300 space-y-2 mb-4">
                        <li>Subsidiaries, affiliates, and third-party service providers to facilitate our services.</li>
                        <li>Regulatory authorities, law enforcement, or in legal proceedings if required.</li>
                    </ul>
                    <p className="text-gray-300 mb-2">We do not sell your personal information. Third parties we work with include:</p>
                    <ul className="list-disc pl-5 text-gray-300 space-y-2">
                        <li>Google Analytics</li>
                        <li>Stripe</li>
                        <li>GitHub</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Your Rights</h3>
                    <p className="text-gray-300">
                        You have rights over your personal information, including access, correction, and deletion. Users can delete their entire
                        account, including all personal data, by navigating to their profile settings. For chat history, a dedicated button allows
                        users to delete this data separately. Contact us to exercise these rights.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Changes to This Policy</h3>
                    <p className="text-gray-300">
                        We may update this policy to reflect changes in our practices. Significant changes will be communicated through our website or
                        directly to you.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
                    <p className="text-gray-300">
                        For questions about this privacy policy, please contact us at{' '}
                        <a href="mailto:support@co-interview.com" className="text-white hover:underline">
                            support@co-interview.com
                        </a>
                        .
                    </p>
                </section>

                <div className="pt-8 border-t border-white/10 text-center">
                    <p className="text-gray-400">By using our services, you acknowledge you have read and understood this Privacy Policy.</p>
                </div>
            </div>
        </PolicyDetailLayout>
    );
};

export default PrivacyPage;
