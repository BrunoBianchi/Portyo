import { useState } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { TikTokIcon } from "~/components/shared/icons";

export const meta: MetaFunction = () => {
    return [
        { title: "Contact | Portyo" },
        { name: "description", content: "Get in touch with the Portyo team." },
    ];
};

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        {
            question: "How do I get started?",
            answer: "Simply sign up for a free account, claim your username, and start customizing your bio page."
        },
        {
            question: "Can I use a custom domain?",
            answer: "Yes! Custom domains are available on our Standard and Pro plans."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards including Visa, Mastercard, and American Express."
        },
        {
            question: "How do I cancel my subscription?",
            answer: "You can cancel your subscription at any time from your dashboard settings."
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the form data to your backend
        console.log("Form submitted:", formData);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-surface-alt font-sans text-text-main selection:bg-primary selection:text-black pt-24 pb-20 px-6">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
                    Get in touch
                </h1>

                <p className="text-xl md:text-2xl text-text-muted leading-relaxed mb-16">
                    Have a question or feedback? We'd love to hear from you.
                </p>

                <div className="grid md:grid-cols-2 gap-16 mb-24">
                    {/* Contact Form */}
                    <div>
                        {submitted ? (
                            <div className="bg-black/5 p-8 rounded-2xl text-center">
                                <h3 className="text-2xl font-bold mb-2">Message Sent</h3>
                                <p className="text-text-muted mb-6">Thanks for reaching out. We'll get back to you soon.</p>
                                <button
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormData({ name: '', email: '', subject: '', message: '' });
                                    }}
                                    className="text-sm font-bold underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold uppercase tracking-wider mb-2">Name</label>
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
                                    <label className="block text-sm font-bold uppercase tracking-wider mb-2">Email</label>
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
                                    <label className="block text-sm font-bold uppercase tracking-wider mb-2">Message</label>
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
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div>
                            <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Email</h3>
                            <a href="mailto:support@portyo.me" className="text-xl underline decoration-2 decoration-black/20 hover:decoration-black transition-all">
                                support@portyo.me
                            </a>
                            <p className="text-text-muted mt-2 text-sm">Typical response time: 24 hours.</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">Socials</h3>
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
                    <h2 className="text-2xl font-bold mb-12">Common Questions</h2>
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
