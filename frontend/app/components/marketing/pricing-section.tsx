import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { useCookies } from 'react-cookie';
import { Check, ChevronDown } from "lucide-react";
import AuthContext from "~/contexts/auth.context";
import { api } from "~/services/api";

export default function PricingSection() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');
    const [expandedFree, setExpandedFree] = useState(false);
    const [expandedStandard, setExpandedStandard] = useState(false);
    const [expandedPro, setExpandedPro] = useState(false);

    const { user } = useContext(AuthContext);
    const [cookies] = useCookies(['@App:token']);
    const navigate = useNavigate();

    const handleUpgrade = async (plan: 'standard' | 'pro') => {
        if (!user) {
            navigate(`/sign-up?plan=${plan}`);
            return;
        }

        try {
            const token = cookies['@App:token'];
            if (!token) {
                navigate(`/sign-up?plan=${plan}`);
                return;
            }

            const response = await api.post('/stripe/create-checkout-session', {
                plan,
                interval: billingCycle
            });

            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                console.error("No checkout URL received");
                alert("Something went wrong. Please try again.");
            }

        } catch (error: any) {
            console.error("Upgrade error:", error);
            alert("Failed to initiate checkout. Please try again.");
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            const section = document.getElementById('pricing-section');

            if (section) {
                const sectionTop = section.offsetTop;
                const viewportHeight = window.innerHeight;
                const distance = scrolled - (sectionTop - viewportHeight);

                // Only animate when in view (roughly)
                if (distance > -1000 && distance < viewportHeight + 1000) {
                    const freeCard = document.getElementById('free-card');
                    const standardCard = document.getElementById('standard-card');
                    const proCard = document.getElementById('pro-card');

                    if (window.innerWidth >= 1024) { // Only on desktop
                        // New Logic: Bunch initially, Delay, then Spread with Limit

                        const triggerPoint = viewportHeight * 0.25; // Start spreading when section is 25% up
                        const initialBunch = 80; // Start 80px inwards (bunched)
                        const maxSpread = 40; // Don't spread more than 40px outwards
                        const speed = 0.3;

                        let xOffset = initialBunch;
                        let yOffset = 0;

                        if (distance > triggerPoint) {
                            const progress = (distance - triggerPoint) * speed;
                            xOffset = initialBunch - progress;

                            // Diagonal movement (Upwards as they spread)
                            yOffset = -(progress * 0.2);
                        }

                        // Limit the spreading (xOffset shouldn't go too negative)
                        if (xOffset < -maxSpread) xOffset = -maxSpread;

                        // Limit vertical movement
                        if (yOffset < -60) yOffset = -60;

                        // Free (Left): Positive xOffset = Right (In), Negative = Left (Out)
                        if (freeCard) freeCard.style.transform = `translate(${xOffset}px, ${yOffset}px)`;

                        // Standard (Center): Moves up slightly slower
                        if (standardCard) standardCard.style.transform = `translateY(${yOffset * 0.5}px)`;

                        // Pro (Right): Negative xOffset = Left (In), Positive = Right (Out)
                        // Since xOffset logic is (Positive=In, Negative=Out), we negate it for the Right card
                        if (proCard) proCard.style.transform = `translate(${-xOffset}px, ${yOffset}px)`;
                    } else {
                        // Reset on mobile
                        if (freeCard) freeCard.style.transform = 'none';
                        if (standardCard) standardCard.style.transform = 'none';
                        if (proCard) proCard.style.transform = 'none';
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section id="pricing-section" className="w-full py-32 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* Billing Toggle */}
                <div className="flex justify-center mb-16">
                    <div className="bg-white p-1.5 rounded-full shadow-sm inline-flex">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${billingCycle === 'monthly'
                                ? 'bg-transparent text-text-main'
                                : 'text-text-muted hover:text-text-main'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('annually')}
                            className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${billingCycle === 'annually'
                                ? 'bg-text-main text-white shadow-md'
                                : 'text-text-muted hover:text-text-main'
                                }`}
                        >
                            Annually (save 25%)
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row justify-center items-stretch gap-6 lg:gap-8 relative">

                    {/* Free Card */}
                    <div id="free-card" className="bg-white rounded-[2rem] p-8 w-full lg:w-1/3 shadow-lg flex flex-col gap-6 transition-transform duration-75 ease-linear z-10 border border-gray-100 min-h-[500px]">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-text-main">Free</h3>
                            <p className="text-text-muted text-sm mt-2">For getting started</p>
                        </div>
                        <div className="text-center py-4">
                            <span className="text-5xl font-bold text-text-main">$0</span>
                        </div>

                        <div className="flex flex-col gap-3">
                            {['Create only one page', 'Create 1 form', 'No branding removal', 'No custom domain', 'Basic analytics', '3% store fee'].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span className="text-text-main text-sm font-medium">{feature}</span>
                                </div>
                            ))}

                            {expandedFree && (
                                <>
                                    {['Limited integrations'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Check className="w-4 h-4 text-green-500" />
                                            <span className="text-text-main text-sm font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </>
                            )}

                            <button
                                onClick={() => setExpandedFree(!expandedFree)}
                                className="flex items-center gap-1 text-text-muted hover:text-text-main text-sm font-medium transition-colors mt-2"
                            >
                                {expandedFree ? 'Show less' : 'Show more'}
                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedFree ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        <div className="mt-auto pt-6">
                            <button
                                onClick={() => navigate(user ? '/dashboard' : '/sign-up')}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-text-main font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>

                    {/* Standard Card */}
                    <div id="standard-card" className="bg-primary rounded-[2rem] p-8 w-full lg:w-1/3 shadow-xl flex flex-col gap-6 transition-transform duration-75 ease-linear z-20 relative min-h-[500px] border-2 border-primary">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span className="bg-black text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">Most Popular</span>
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-primary-foreground">Standard</h3>
                            <p className="text-primary-foreground/80 text-sm mt-2">For growing creators</p>
                        </div>
                        <div className="text-center py-4">
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-bold text-primary-foreground">
                                    ${billingCycle === 'monthly' ? '5.50' : '4.12'}
                                </span>
                                <span className="text-primary-foreground/70 text-lg">/mo</span>
                            </div>
                            {billingCycle === 'annually' && (
                                <span className="text-xs font-bold text-black bg-white/20 px-2 py-1 rounded-full mt-2 inline-block">Billed $49.50 yearly</span>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            {['Create up to 2 bios', 'Create 3 forms', 'Branding removal', 'Custom domain', 'Email collection', '1% store fee', '150 emails/month'].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-black" />
                                    <span className="text-primary-foreground text-sm font-medium">{feature}</span>
                                </div>
                            ))}

                            {expandedStandard && (
                                <>
                                    {['Automation (2 per bio)', 'Email template (2 per bio)', 'SEO settings', 'Google and Facebook analytics', 'More customizations'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Check className="w-4 h-4 text-black" />
                                            <span className="text-primary-foreground text-sm font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </>
                            )}

                            <button
                                onClick={() => setExpandedStandard(!expandedStandard)}
                                className="flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium transition-colors mt-2"
                            >
                                {expandedStandard ? 'Show less' : 'Show more'}
                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedStandard ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        <div className="mt-auto pt-6">
                            <button
                                onClick={() => handleUpgrade('standard')}
                                className="w-full bg-black text-white hover:bg-gray-900 font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
                            >
                                {user ? 'Upgrade' : 'Start Trial'}
                            </button>
                        </div>
                    </div>

                    {/* Pro Card */}
                    <div id="pro-card" className="bg-black rounded-[2rem] p-8 w-full lg:w-1/3 shadow-2xl flex flex-col gap-6 transition-transform duration-75 ease-linear z-10 min-h-[500px]">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white">Pro</h3>
                            <p className="text-gray-400 text-sm mt-2">For serious business</p>
                        </div>
                        <div className="text-center py-4">
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-bold text-white">
                                    ${billingCycle === 'monthly' ? '15' : '11.25'}
                                </span>
                                <span className="text-gray-400 text-lg">/mo</span>
                            </div>
                            {billingCycle === 'annually' && (
                                <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded-full mt-2 inline-block">Billed $135 yearly</span>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            {['Everything in Standard', 'Create up to 5 bios', 'Create 4 forms', 'Scheduler', 'Automation (4 per bio)', 'Email template (4 per bio)', '0% store fee', '500 emails/month', 'More customizations'].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-primary" />
                                    <span className="text-gray-300 text-sm font-medium">{feature}</span>
                                </div>
                            ))}

                            {expandedPro && (
                                <>
                                    {[].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Check className="w-4 h-4 text-primary" />
                                            <span className="text-gray-300 text-sm font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </>
                            )}

                            <button
                                onClick={() => setExpandedPro(!expandedPro)}
                                className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors mt-2"
                            >
                                {expandedPro ? 'Show less' : 'Show more'}
                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedPro ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        <div className="mt-auto pt-6">
                            <button
                                onClick={() => handleUpgrade('pro')}
                                className="w-full bg-white text-black hover:bg-gray-100 font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
                            >
                                Go Pro
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
