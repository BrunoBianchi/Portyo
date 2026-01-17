import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import i18n from "~/i18n";

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.about.title", { lng: lang }) },
        { name: "description", content: i18n.t("meta.about.description", { lng: lang }) },
    ];
};

export default function About() {
    return (
        <div className="min-h-screen bg-surface-alt font-sans text-text-main selection:bg-primary selection:text-black pt-24 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
                    Empowering creators to <span className="text-primary">build their future.</span>
                </h1>

                <p className="text-xl md:text-2xl text-text-muted leading-relaxed mb-24">
                    We're on a mission to give every creator and entrepreneur the tools they need to turn their passion into a thriving business.
                </p>

                {/* Story - Text Only */}
                <div className="mb-24 space-y-8 text-lg font-medium leading-relaxed text-text-secondary">
                    <p>
                        Portyo was born from a simple observation: creators were spending too much time juggling multiple tools, instead of doing what they do best — creating.
                    </p>
                    <p>
                        We built an all-in-one platform that consolidates everything you need: a beautiful link-in-bio, powerful analytics, email collection, scheduling, and e-commerce.
                    </p>
                    <p>
                        Today, thousands of creators trust Portyo to power their online presence. And we're just getting started.
                    </p>
                </div>

                {/* Values - Grid Text */}
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-16 mb-24">
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-3">Creator-First</h3>
                        <p className="text-text-muted">Everything we build starts with you in mind. Your success is our success.</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-3">Innovation</h3>
                        <p className="text-text-muted">Pushing boundaries to bring you cutting-edge tools that make a difference.</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-3">Community</h3>
                        <p className="text-text-muted">We believe in the power of connection and building genuine relationships.</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-3">Growth</h3>
                        <p className="text-text-muted">Committed to helping you grow your audience and revenue sustainably.</p>
                    </div>
                </div>

                {/* Minimal CTA */}
                <div className="border-t border-black/10 pt-16">
                    <p className="text-2xl font-bold mb-6">Ready to join the movement?</p>
                    <Link
                        to="/sign-up"
                        className="inline-block px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-black/80 transition-all custom-focus"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </div>
    );
}
