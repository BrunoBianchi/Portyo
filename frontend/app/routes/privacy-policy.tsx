import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
    return [
        { title: "Privacy Policy | Portyo" },
        { name: "description", content: "Privacy Policy for Portyo." },
    ];
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white py-20 px-4 font-sans">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-16 border-b border-gray-100 pb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Privacy Policy</h1>
                    <p className="text-gray-500">Last updated: January 2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-lg prose-gray max-w-none">
                    <p className="lead text-gray-600 mb-8">
                        Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information when you use Portyo.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Information We Collect</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support. This may include your name, email address, password, and any other information you choose to provide.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. How We Use Your Information</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-6">
                        <li>To provide, maintain, and improve our services.</li>
                        <li>To process transactions and send related information.</li>
                        <li>To send technical notices, updates, security alerts, and support messages.</li>
                        <li>To respond to your comments, questions, and requests.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Information Sharing</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We do not share your personal information with third parties except as described in this policy. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Data Security</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Contact Us</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        If you have any questions about this Privacy Policy, please contact us at privacy@portyo.me.
                    </p>
                </div>
            </div>
        </div>
    );
}
