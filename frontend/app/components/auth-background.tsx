import React from 'react';

export function AuthBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
       <svg className="absolute w-full h-[350px] top-1/2 -translate-y-1/2 text-text-muted" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="waves" x="0" y="0" width="400" height="50" patternUnits="userSpaceOnUse">
                <path d="M0 25 Q 100 5, 200 25 T 400 25" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#waves)" />
       </svg>

      {/* Floating Heads */}
      <img 
        src="/Street Life - Head.svg" 
        alt="Character" 
        className="absolute left-[5%] top-[30%] w-24 h-24 -rotate-12 opacity-90 hidden lg:block animate-float"
        style={{ animationDelay: '0s', animationDuration: '6s' }}
      />
      <img 
        src="/Street Life - Head (1).svg" 
        alt="Character" 
        className="absolute left-[15%] bottom-[20%] w-28 h-28 rotate-12 opacity-90 hidden lg:block animate-float"
        style={{ animationDelay: '1.5s', animationDuration: '7s' }}
      />
      <img 
        src="/Street Life - Head (2).svg" 
        alt="Character" 
        className="absolute right-[10%] top-[20%] w-32 h-32 -rotate-6 opacity-90 hidden lg:block animate-float"
        style={{ animationDelay: '0.5s', animationDuration: '5.5s' }}
      />
       <img 
        src="/Street Life - Head (3).svg" 
        alt="Character" 
        className="absolute right-[15%] bottom-[25%] w-20 h-20 rotate-12 opacity-90 hidden lg:block animate-float"
        style={{ animationDelay: '2s', animationDuration: '6.5s' }}
      />

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-text-muted z-10">
        Copyright @portyo {new Date().getFullYear()} | Privacy Policy
      </div>
    </div>
  );
}
