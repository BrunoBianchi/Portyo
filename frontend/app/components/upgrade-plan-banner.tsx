import React, { useState, useContext } from 'react';
import { Link } from 'react-router';
import AuthContext from '~/contexts/auth.context';

function IconCheck(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={3} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            {...props}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

export default function UpgradePlanBanner() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');
  const { user } = useContext(AuthContext);
  const currentPlan = user?.plan || 'free';

  return (
    <div className="w-full min-h-screen bg-surface-alt flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-7xl mx-auto w-full">
        
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-text-main mb-4">Upgrade your plan</h1>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
                You've hit a limit or tried to access a feature that requires a higher plan. 
                Upgrade now to unlock your full potential.
            </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
            <div className="bg-white p-1.5 rounded-full shadow-sm inline-flex">
                <button 
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                        billingCycle === 'monthly' 
                        ? 'bg-transparent text-text-main' 
                        : 'text-text-muted hover:text-text-main'
                    }`}
                >
                    Monthly
                </button>
                <button 
                    onClick={() => setBillingCycle('annually')}
                    className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                        billingCycle === 'annually' 
                        ? 'bg-text-main text-white shadow-md' 
                        : 'text-text-muted hover:text-text-main'
                    }`}
                >
                    Annually (save 25%)
                </button>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-6 lg:gap-8">
            
            {/* Free Card */}
            <div className={`bg-white rounded-[2rem] p-8 w-full lg:w-1/3 shadow-lg flex flex-col gap-6 border transition-all duration-200 ${currentPlan === 'free' ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100'}`}>
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-text-main">Free</h3>
                    <p className="text-text-muted text-sm mt-2">For getting started</p>
                </div>
                <div className="text-center py-4">
                    <span className="text-5xl font-bold text-text-main">$0</span>
                </div>

                <div className="flex flex-col gap-3">
                    {['Customizable link-in-bio', 'Basic Analytics', 'Unlimited Links', 'Social Icons', 'Basic Themes'].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <IconCheck className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-text-main text-sm font-medium">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-6">
                    <button 
                        disabled={currentPlan === 'free'}
                        className={`w-full font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer ${
                            currentPlan === 'free' 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-100 hover:bg-gray-200 text-text-main'
                        }`}
                    >
                        {currentPlan === 'free' ? 'Current Plan' : 'Downgrade'}
                    </button>
                </div>
            </div>

            {/* Standard Card */}
            <div className={`bg-primary rounded-[2rem] p-8 w-full lg:w-1/3 shadow-xl flex flex-col gap-6 relative border-2 transition-all duration-200 ${currentPlan === 'standard' ? 'border-black ring-4 ring-black/10' : 'border-primary'}`}>
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
                            <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                                <IconCheck className="w-3 h-3 text-black" />
                            </div>
                            <span className="text-primary-foreground text-sm font-medium">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-6">
                    <button 
                        disabled={currentPlan === 'standard'}
                        className={`w-full font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer ${
                            currentPlan === 'standard'
                            ? 'bg-black/80 text-white/80 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-900'
                        }`}
                    >
                        {currentPlan === 'standard' ? 'Current Plan' : 'Upgrade to Standard'}
                    </button>
                </div>
            </div>

            {/* Pro Card */}
            <div className={`bg-black rounded-[2rem] p-8 w-full lg:w-1/3 shadow-2xl flex flex-col gap-6 border-2 transition-all duration-200 ${currentPlan === 'pro' ? 'border-primary ring-2 ring-primary/50' : 'border-black'}`}>
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
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <IconCheck className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-gray-300 text-sm font-medium">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-6">
                    <button 
                        disabled={currentPlan === 'pro'}
                        className={`w-full font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer ${
                            currentPlan === 'pro'
                            ? 'bg-white/20 text-white/50 cursor-not-allowed'
                            : 'bg-white text-black hover:bg-gray-100'
                        }`}
                    >
                        {currentPlan === 'pro' ? 'Current Plan' : 'Go Pro'}
                    </button>
                </div>
            </div>

        </div>

        <div className="mt-12 text-center">
            <Link to="/" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors">
                ← Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
}
