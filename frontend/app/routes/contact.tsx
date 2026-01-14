import { useState } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { Mail, MessageSquare, ChevronDown, Send, Twitter, Instagram, Linkedin } from "lucide-react";
import { TikTokIcon } from "~/components/shared/icons";

export const meta: MetaFunction = () => {
    return [
        { title: "Contact | Portyo" },
        { name: "description", content: "Get in touch with the Portyo team. We're here to help!" },
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
            question: "How do I get started with Portyo?",
            answer: "Simply sign up for a free account, claim your username, and start customizing your bio page. It takes less than 2 minutes!"
        },
        {
            question: "Can I use a custom domain?",
            answer: "Yes! Custom domains are available on our Standard and Pro plans. You can connect any domain you own."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards including Visa, Mastercard, and American Express through our secure payment processor."
        },
        {
            question: "How do I cancel my subscription?",
            answer: "You can cancel your subscription at any time from your dashboard settings. Your account will remain active until the end of your billing period."
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the form data to your backend
        console.log("Form submitted:", formData);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-[#fdfaf5] py-20 px-4 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D7F000]/20 rounded-full mb-6">
                        <MessageSquare className="w-4 h-4 text-gray-700" />
                        <span className="text-sm font-semibold text-gray-700">Contact Us</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                        We'd love to<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D7F000] to-green-500">hear from you</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Have a question or feedback? Send us a message and we'll get back to you as soon as possible.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10 mb-20">

                    {/* Contact Form */}
                    <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-lg">
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-[#D7F000] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Send className="w-8 h-8 text-black" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                                <p className="text-gray-600 mb-6">Thanks for reaching out. We'll get back to you soon.</p>
                                <button
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormData({ name: '', email: '', subject: '', message: '' });
                                    }}
                                    className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D7F000] focus:border-transparent transition-all"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D7F000] focus:border-transparent transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D7F000] focus:border-transparent transition-all"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D7F000] focus:border-transparent transition-all resize-none"
                                        placeholder="Tell us more..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info + Socials */}
                    <div className="space-y-6">
                        <div className="bg-black rounded-[32px] p-8 text-white">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-[#D7F000] rounded-xl flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Email us at</p>
                                    <p className="font-bold">support@portyo.me</p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm">
                                We typically respond within 24 hours during business days.
                            </p>
                        </div>

                        <div className="bg-white rounded-[32px] p-8 shadow-lg">
                            <h3 className="font-bold text-gray-900 mb-4">Follow Us</h3>
                            <div className="flex gap-3">
                                <a href="#" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-[#D7F000] transition-colors group">
                                    <Twitter className="w-5 h-5 text-gray-600 group-hover:text-black" />
                                </a>
                                <a href="#" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-[#D7F000] transition-colors group">
                                    <Instagram className="w-5 h-5 text-gray-600 group-hover:text-black" />
                                </a>
                                <a href="#" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-[#D7F000] transition-colors group">
                                    <Linkedin className="w-5 h-5 text-gray-600 group-hover:text-black" />
                                </a>
                                <a href="#" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-[#D7F000] transition-colors group">
                                    <TikTokIcon className="w-5 h-5 text-gray-600 group-hover:text-black" />
                                </a>
                            </div>
                        </div>
                    </div>

                </div>

                {/* FAQ Section */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-[20px] shadow-md overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                                >
                                    <span className="font-semibold text-gray-900">{faq.question}</span>
                                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-5 text-gray-600">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
