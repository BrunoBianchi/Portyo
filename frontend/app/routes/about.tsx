import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { Users, Target, Lightbulb, Heart, Rocket, Globe } from "lucide-react";

export const meta: MetaFunction = () => {
    return [
        { title: "About Us | Portyo" },
        { name: "description", content: "Learn about Portyo's mission to empower creators and entrepreneurs with the tools they need to thrive." },
    ];
};

export default function About() {
    const values = [
        {
            icon: Target,
            title: "Creator-First",
            description: "Everything we build starts with creators in mind. Your success is our success."
        },
        {
            icon: Lightbulb,
            title: "Innovation",
            description: "We constantly push boundaries to bring you cutting-edge tools that make a difference."
        },
        {
            icon: Heart,
            title: "Community",
            description: "We believe in the power of community and building genuine connections."
        },
        {
            icon: Rocket,
            title: "Growth",
            description: "We're committed to helping you grow your audience and revenue sustainably."
        }
    ];

    return (
        <div className="min-h-screen bg-[#fdfaf5] py-20 px-4 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Hero Section */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D7F000]/20 rounded-full mb-6">
                        <Globe className="w-4 h-4 text-gray-700" />
                        <span className="text-sm font-semibold text-gray-700">About Portyo</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                        Empowering creators to<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D7F000] to-green-500">build their future</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        We're on a mission to give every creator and entrepreneur the tools they need to turn their passion into a thriving business.
                    </p>
                </div>

                {/* Story Section */}
                <div className="bg-white rounded-[32px] p-10 md:p-16 shadow-lg mb-16">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    Portyo was born from a simple observation: creators and entrepreneurs were spending too much time juggling multiple tools and platforms, instead of focusing on what they do best — creating.
                                </p>
                                <p>
                                    We set out to build an all-in-one platform that consolidates everything you need: a beautiful link-in-bio, powerful analytics, email collection, scheduling, and e-commerce — all in one place.
                                </p>
                                <p>
                                    Today, thousands of creators trust Portyo to power their online presence and grow their businesses. And we're just getting started.
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="relative">
                                <div className="w-64 h-64 bg-gradient-to-br from-[#D7F000] to-green-400 rounded-[32px] flex items-center justify-center shadow-xl">
                                    <Users className="w-24 h-24 text-white" />
                                </div>
                                <div className="absolute -top-4 -right-4 w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                                    <Rocket className="w-8 h-8 text-[#D7F000]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Values Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Our Values</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-[24px] p-8 shadow-md hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="w-14 h-14 bg-[#D7F000]/20 rounded-2xl flex items-center justify-center mb-5">
                                    <value.icon className="w-7 h-7 text-gray-800" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-black rounded-[32px] p-10 md:p-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to join the movement?</h2>
                    <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                        Start building your online presence today and join thousands of creators already using Portyo.
                    </p>
                    <Link
                        to="/sign-up"
                        className="inline-block px-8 py-4 bg-[#D7F000] text-black font-bold rounded-2xl hover:bg-[#c5dd00] transition-colors shadow-lg"
                    >
                        Get Started for Free
                    </Link>
                </div>

            </div>
        </div>
    );
}
