import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
    return [
        { title: "Security Policy | Portyo" },
        { name: "description", content: "Portyo security policy and vulnerability disclosure program." },
    ];
};

export default function SecurityPolicy() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pt-32 pb-20 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Security Policy</h1>
                
                <div className="space-y-8 text-white/80">
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">Our Commitment</h2>
                        <p>
                            At Portyo, we take security seriously. We are committed to protecting our users' data 
                            and maintaining the integrity of our platform. We believe in responsible disclosure 
                            and working with security researchers to identify and address vulnerabilities.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">Reporting Vulnerabilities</h2>
                        <p className="mb-4">
                            If you discover a security vulnerability, please report it to us responsibly:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Email: <a href="mailto:security@portyo.me" className="text-emerald-400 hover:underline">security@portyo.me</a></li>
                            <li>Response time: Within 48 hours</li>
                            <li>Resolution time: Critical issues within 7 days</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">What to Report</h2>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Cross-site scripting (XSS)</li>
                            <li>SQL injection</li>
                            <li>Authentication bypasses</li>
                            <li>Data exposure vulnerabilities</li>
                            <li>CSRF vulnerabilities</li>
                            <li>Server-side request forgery (SSRF)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">Bug Bounty Program</h2>
                        <p>
                            We recognize and reward security researchers who help us improve our security. 
                            Eligible reports may receive:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                            <li>Public acknowledgment in our Hall of Fame</li>
                            <li>Swag and merchandise</li>
                            <li>Premium account upgrades</li>
                            <li>Monetary rewards for critical findings</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">Security Measures</h2>
                        <p className="mb-4">We implement industry-standard security practices:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>HTTPS/TLS encryption for all connections</li>
                            <li>Password hashing with bcrypt</li>
                            <li>Regular security audits</li>
                            <li>Automated dependency scanning</li>
                            <li>Rate limiting on API endpoints</li>
                            <li>DDoS protection</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
                        <p>
                            For security-related inquiries, please contact us at:{" "}
                            <a href="mailto:security@portyo.me" className="text-emerald-400 hover:underline ml-1">
                                security@portyo.me
                            </a>
                        </p>
                    </section>

                    <footer className="pt-8 border-t border-white/10 text-sm text-white/60">
                        <p>Last updated: February 2, 2025</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
