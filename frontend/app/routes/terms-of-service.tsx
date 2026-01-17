import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import i18n from "~/i18n";

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.termsOfService.title", { lng: lang }) },
        { name: "description", content: i18n.t("meta.termsOfService.description", { lng: lang }) },
    ];
};

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-surface-alt flex flex-col font-sans text-text-main selection:bg-primary selection:text-black">

            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-24 md:py-32">
                <header className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Terms of Service</h1>
                    <p className="text-lg text-text-muted">Last updated: January 15, 2026</p>
                </header>

                <div className="prose prose-lg prose-neutral max-w-none text-text-secondary space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using Portyo ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms,
                            you may not access the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">2. Accounts and Memberships</h2>
                        <p>
                            If you create an account on the Service, you are responsible for maintaining the security of your account and you are fully responsible
                            for all activities that occur under the account. You must immediately notify us of any unauthorized uses of your account or any other
                            breaches of security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">3. User Content</h2>
                        <p>
                            We do not own any data, information, or material that you submit to the Service. You shall have sole responsibility for the accuracy,
                            quality, integrity, legality, reliability, appropriateness, and intellectual property ownership or right to use of all submitted Content.
                            We reserve the right to refuse or remove any Content in our sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">4. Billing and Payments</h2>
                        <p>
                            We use Stripe for payment processing. By selecting a paid plan, you agree to pay the subscription fees indicated for that service.
                            Payments will be charged on a pre-pay basis on the day you sign up for an Upgrade and will cover the use of that service for a
                            monthly or annual subscription period as indicated.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">5. Termination</h2>
                        <p>
                            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever,
                            including without limitation if you breach the Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">6. Changes to Terms</h2>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to
                            provide at least 30 days' notice prior to any new terms taking effect.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-main mb-4">7. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at: <a href="mailto:support@portyo.me" className="text-primary hover:underline">support@portyo.me</a>
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
