import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { Sparkles, Coffee, Zap, Users, Heart, MapPin, Briefcase } from "lucide-react";

export const meta: MetaFunction = () => {
    return [
        { title: "Careers | Portyo" },
        { name: "description", content: "Join our team and help empower creators worldwide. View open positions at Portyo." },
    ];
};

export default function Careers() {
    const benefits = [
        { icon: Coffee, title: "Remote-First", description: "Work from anywhere in the world" },
        { icon: Zap, title: "Fast-Paced", description: "Ship features that impact millions" },
        { icon: Users, title: "Great Team", description: "Collaborate with talented people" },
        { icon: Heart, title: "Health & Wellness", description: "Comprehensive benefits package" },
    ];

    const openPositions = [
        {
            title: "Senior Full-Stack Developer",
            department: "Engineering",
            location: "Remote",
            type: "Full-time"
        },
        {
            title: "Product Designer",
            department: "Design",
            location: "Remote",
            type: "Full-time"
        },
        {
            title: "Growth Marketing Manager",
            department: "Marketing",
            location: "Remote",
            type: "Full-time"
        },
    ];

    return (
        <div className="min-h-screen bg-[#fdfaf5] py-20 px-4 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Hero Section */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D7F000]/20 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-gray-700" />
                        <span className="text-sm font-semibold text-gray-700">We're Hiring!</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                        Join the team that's<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D7F000] to-green-500">empowering creators</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        We're looking for passionate people who want to make a difference in the creator economy.
                    </p>
                </div>

                {/* Benefits Section */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Why Portyo?</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-[24px] p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 bg-[#D7F000]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <benefit.icon className="w-6 h-6 text-gray-800" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                                <p className="text-sm text-gray-500">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Open Positions Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Open Positions</h2>
                    <div className="space-y-4">
                        {openPositions.map((position, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-[24px] p-6 md:p-8 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{position.title}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                                            <Briefcase className="w-4 h-4" />
                                            {position.department}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                                            <MapPin className="w-4 h-4" />
                                            {position.location}
                                        </span>
                                        <span className="px-2 py-0.5 bg-[#D7F000]/20 rounded-full text-xs font-semibold text-gray-700">
                                            {position.type}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    to="/contact"
                                    className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-center shrink-0"
                                >
                                    Apply Now
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-br from-[#D7F000] to-green-400 rounded-[32px] p-10 md:p-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Don't see your role?</h2>
                    <p className="text-black/70 mb-8 max-w-lg mx-auto">
                        We're always looking for talented people. Send us your resume and tell us how you can contribute.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-block px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-900 transition-colors shadow-lg"
                    >
                        Get in Touch
                    </Link>
                </div>

            </div>
        </div>
    );
}
