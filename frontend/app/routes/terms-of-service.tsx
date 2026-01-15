import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
    return [
        { title: "Terms of Service | Portyo" },
        { name: "description", content: "Terms of Service for Portyo." },
    ];
};

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-white py-20 px-4 font-sans">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-16 border-b border-gray-100 pb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Terms of Service</h1>
                    <p className="text-gray-500">Last updated: January 2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-lg prose-gray max-w-none">
                    <p className="lead text-gray-600 mb-8">
                        Welcome to Portyo. By using our website and services, you agree to comply with and be bound by the following terms and conditions.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        By accessing or using Portyo, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Use of Service</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        You may use our services only in compliance with these Terms and all applicable laws. You are responsible for your use of the service and for any content you provide. You agree not to misuse our services or help anyone else to do so.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Account Registration</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account and password. Portyo cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Prohibited Activities</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-6">
                        <li>Engaging in any unlawful or fraudulent activity.</li>
                        <li>Violating the rights of others, including intellectual property rights.</li>
                        <li>Interfering with or disrupting our services or servers.</li>
                        <li>Transmitting viruses, malware, or other harmful code.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Termination</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We may terminate or suspend your account at any time for any reason without prior notice, including if we believe you have violated these Terms. Upon termination, your right to use the service will immediately cease.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Changes to Terms</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We reserve the right to modify these terms at any time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.
                    </p>
                </div>
            </div>
        </div>
    );
}
