import type { MetaFunction } from "react-router";
import { Link } from "react-router";

export const meta: MetaFunction = () => {
    return [
        { title: "Privacy Policy | Portyo" },
        { name: "description", content: "Privacy Policy for Portyo." },
    ];
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-surface-alt flex flex-col font-sans text-text-main selection:bg-primary selection:text-black">

            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-24 md:py-32">
                <header className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Privacy Policy</h1>
                    <p className="text-lg text-text-muted">Last updated: January 15, 2026</p>
                </header>

                <div className="prose prose-lg prose-neutral max-w-none text-text-secondary space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">1. Introduction</h2>
                        <p>
                            Welcome to Portyo ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
                            and use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">2. Information We Collect</h2>
                        <p className="mb-4">We collect information that you strictly provide to us when you register for an account, specifically:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Personal Data:</strong> Name, email address, and profile information you choose to display on your bio page.</li>
                            <li><strong>Payment Data:</strong> Financial information is processed directly by our payment processor, Stripe. We do not store full credit card numbers on our servers.</li>
                            <li><strong>Usage Data:</strong> Information about how you interact with our services, such as page views and button clicks, to improve our product.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">3. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>Provide, operate, and maintain our website.</li>
                            <li>Process your transactions and manage your subscription.</li>
                            <li>Improve, personalize, and expand our website.</li>
                            <li>Communicate with you regarding updates, security alerts, and support.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">4. Sharing Your Information</h2>
                        <p>
                            We do not sell your personal information. We may share information with third-party service providers (such as Stripe for payments or Google Analytics for usage tracking) strictly for the purpose of operating our business and providing our services to you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">5. Data Security</h2>
                        <p>
                            We use administrative, technical, and physical security measures to help protect your personal information.
                            However, please remember that no method of transmission over the internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">6. Your Rights</h2>
                        <p>
                            Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete
                            the personal information we hold about you. You can manage your account settings directly within the Portyo dashboard.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">7. Contact Us</h2>
                        <p>
                            If you have questions or comments about this policy, you may contact us at: <a href="mailto:support@portyo.me" className="text-primary hover:underline">support@portyo.me</a>
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
