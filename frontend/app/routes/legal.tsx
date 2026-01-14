import { useState } from "react";
import type { MetaFunction } from "react-router";
import { Shield, FileText, Cookie } from "lucide-react";

export const meta: MetaFunction = () => {
    return [
        { title: "Legal | Portyo" },
        { name: "description", content: "Privacy Policy, Terms of Service, and Cookie Policy for Portyo." },
    ];
};

type Tab = 'privacy' | 'terms' | 'cookies';

export default function Legal() {
    const [activeTab, setActiveTab] = useState<Tab>('privacy');

    const tabs = [
        { id: 'privacy' as Tab, label: 'Privacy Policy', icon: Shield },
        { id: 'terms' as Tab, label: 'Terms of Service', icon: FileText },
        { id: 'cookies' as Tab, label: 'Cookie Policy', icon: Cookie },
    ];

    return (
        <div className="min-h-screen bg-[#fdfaf5] py-20 px-4 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Legal</h1>
                    <p className="text-lg text-gray-600">Last updated: January 2026</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-black text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-lg">

                    {activeTab === 'privacy' && (
                        <div className="prose prose-gray max-w-none">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h2>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h3>
                            <p className="text-gray-600 mb-4">
                                We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support. This may include your name, email address, and any other information you choose to provide.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h3>
                            <p className="text-gray-600 mb-4">
                                We use the information we collect to provide, maintain, and improve our services, to process transactions, to send you technical notices and support messages, and to respond to your comments and questions.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Information Sharing</h3>
                            <p className="text-gray-600 mb-4">
                                We do not share your personal information with third parties except as described in this policy. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Data Security</h3>
                            <p className="text-gray-600 mb-4">
                                We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Contact Us</h3>
                            <p className="text-gray-600">
                                If you have any questions about this Privacy Policy, please contact us at privacy@portyo.me.
                            </p>
                        </div>
                    )}

                    {activeTab === 'terms' && (
                        <div className="prose prose-gray max-w-none">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms of Service</h2>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h3>
                            <p className="text-gray-600 mb-4">
                                By accessing or using Portyo, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Use of Service</h3>
                            <p className="text-gray-600 mb-4">
                                You may use our services only in compliance with these Terms and all applicable laws. You are responsible for your use of the service and for any content you provide.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Account Registration</h3>
                            <p className="text-gray-600 mb-4">
                                You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account and password.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Prohibited Activities</h3>
                            <p className="text-gray-600 mb-4">
                                You agree not to engage in any activity that interferes with or disrupts our services, or use our services for any illegal or unauthorized purpose.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Termination</h3>
                            <p className="text-gray-600">
                                We may terminate or suspend your account at any time for any reason without prior notice if we believe you have violated these Terms.
                            </p>
                        </div>
                    )}

                    {activeTab === 'cookies' && (
                        <div className="prose prose-gray max-w-none">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookie Policy</h2>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. What Are Cookies</h3>
                            <p className="text-gray-600 mb-4">
                                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Cookies</h3>
                            <p className="text-gray-600 mb-4">
                                We use cookies to understand how you use our website and to improve your experience. This includes personalizing content, providing social media features, and analyzing our traffic.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Types of Cookies We Use</h3>
                            <ul className="text-gray-600 mb-4 list-disc list-inside space-y-2">
                                <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
                                <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website</li>
                                <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Managing Cookies</h3>
                            <p className="text-gray-600">
                                You can control and manage cookies through your browser settings. Please note that removing or blocking cookies may impact your user experience.
                            </p>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
