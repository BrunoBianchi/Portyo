import React, { useEffect, useState } from 'react';
import { Check } from "lucide-react";

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');

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
                    className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                        billingCycle === 'monthly' 
                        ? 'bg-transparent text-text-main' 
                        : 'text-text-muted hover:text-text-main'
                    }`}
                >
                    Monthly
                </button>
                <button 
                    onClick={() => setBillingCycle('annually')}
                    className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                        billingCycle === 'annually' 
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
                    {['Customizable link-in-bio', 'Basic Analytics', 'Unlimited Links', 'Social Icons', 'Basic Themes','2.5% Transaction Fees'].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-text-main text-sm font-medium">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-6">
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-text-main font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer">
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
                            ${billingCycle === 'monthly' ? '10' : '7.50'}
                        </span>
                        <span className="text-primary-foreground/70 text-lg">/mo</span>
                    </div>
                    {billingCycle === 'annually' && (
                        <span className="text-xs font-bold text-black bg-white/20 px-2 py-1 rounded-full mt-2 inline-block">Billed $90 yearly</span>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    {['Everything in Free', 'Remove Branding', 'Custom Domain', 'Priority Support', 'Advanced Analytics', 'Email Collection'].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-black" />
                            <span className="text-primary-foreground text-sm font-medium">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-6">
                    <button className="w-full bg-black text-white hover:bg-gray-900 font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer">
                        Start Trial
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
                            ${billingCycle === 'monthly' ? '25' : '18.75'}
                        </span>
                        <span className="text-gray-400 text-lg">/mo</span>
                    </div>
                    {billingCycle === 'annually' && (
                        <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded-full mt-2 inline-block">Billed $225 yearly</span>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    {['Everything in Standard', '0% Transaction Fees', 'API Access', 'Dedicated Manager', 'White Labeling', 'Newsletter Tool'].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-primary" />
                            <span className="text-gray-300 text-sm font-medium">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-6">
                    <button className="w-full bg-white text-black hover:bg-gray-100 font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer">
                        Go Pro
                    </button>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
}
