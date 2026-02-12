import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { TikTokIcon } from "~/components/shared/icons";
import i18n from "~/i18n";

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.contact.title", { lng: lang }) },
        { name: "description", content: i18n.t("meta.contact.description", { lng: lang }) },
    ];
};

export default function Contact() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        { question: t("contactPage.faq.items.0.question"), answer: t("contactPage.faq.items.0.answer") },
        { question: t("contactPage.faq.items.1.question"), answer: t("contactPage.faq.items.1.answer") },
        { question: t("contactPage.faq.items.2.question"), answer: t("contactPage.faq.items.2.answer") },
        { question: t("contactPage.faq.items.3.question"), answer: t("contactPage.faq.items.3.answer") },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the form data to your backend
        console.log("Form submitted:", formData);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-surface-alt font-sans text-text-main selection:bg-primary selection:text-black pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                    {t("contactPage.title")}
                </h1>

                <p className="text-xl md:text-2xl text-text-muted leading-relaxed mb-16">
                    {t("contactPage.subtitle")}
                </p>

                <div className="grid md:grid-cols-2 gap-16 mb-24">
                    {/* Contact Form */}
                    <div>
                        {submitted ? (
                            <div className="bg-black/5 p-8 rounded-2xl text-center">
                                <h3 className="text-2xl font-bold mb-2">{t("contactPage.form.sent")}</h3>
                                <p className="text-text-muted mb-6">{t("contactPage.form.sentDescription")}</p>
                                <button
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormData({ name: '', email: '', subject: '', message: '' });
                                    }}
                                    className="text-sm font-bold underline"
                                >
                                    {t("contactPage.form.sendAnother")}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold uppercase tracking-wider mb-2">{t("contactPage.form.name")}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-gra-300 focus:border-black py-3 outline-none transition-colors"
                                        placeholder="Jane Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold uppercase tracking-wider mb-2">{t("contactPage.form.email")}</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-gray-300 focus:border-black py-3 outline-none transition-colors"
                                        placeholder="jane@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold uppercase tracking-wider mb-2">{t("contactPage.form.message")}</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-gray-300 focus:border-black py-3 outline-none transition-colors resize-none"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-black/80 transition-all custom-focus mt-4"
                                >
                                    {t("contactPage.form.send")}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div>
                            <h3 className="text-lg font-bold uppercase tracking-wider mb-2">{t("contactPage.info.emailTitle")}</h3>
                            <a href="mailto:support@portyo.me" className="text-xl underline decoration-2 decoration-black/20 hover:decoration-black transition-all">
                                support@portyo.me
                            </a>
                            <p className="text-text-muted mt-2 text-sm">{t("contactPage.info.responseTime")}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">{t("contactPage.info.socials")}</h3>
                            <div className="flex gap-6 text-lg font-medium">
                                <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                                <a href="#" className="hover:text-primary transition-colors">Instagram</a>
                                <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Simple */}
                <div className="border-t border-black/10 pt-16">
                    <h2 className="text-2xl font-bold mb-12">{t("contactPage.faq.title")}</h2>
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                        {faqs.map((faq, index) => (
                            <div key={index}>
                                <h3 className="font-bold mb-2">{faq.question}</h3>
                                <p className="text-text-muted text-sm leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
