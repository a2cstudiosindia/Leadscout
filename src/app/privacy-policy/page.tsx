import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Zap, Shield, Lock, Eye, Database, Bell, Trash2, Globe } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Privacy Policy | LeadScout',
    description: 'LeadScout Privacy Policy - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="h-6 w-px bg-gray-200" />
                        <Link href="/" className="flex items-center gap-2">
                            <div className="p-1.5 bg-teal-400 rounded-lg text-white">
                                <Zap size={16} fill="currentColor" />
                            </div>
                            <span className="font-bold text-lg text-gray-800">LeadScout</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Title Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-2xl mb-4">
                        <Shield className="w-8 h-8 text-teal-500" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <p className="text-gray-500">Last updated: January 10, 2026</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-10">

                    {/* Introduction */}
                    <section>
                        <p className="text-gray-600 leading-relaxed">
                            LeadScout Inc. (&quot;LeadScout,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
                            use our website and services at leadscout.app (the &quot;Service&quot;). Please read this policy carefully.
                        </p>
                    </section>

                    {/* Section 1 */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Database className="w-5 h-5 text-blue-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">1. Information We Collect</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-gray-600">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
                                <p className="leading-relaxed">
                                    When you register for an account, we collect your email address, name, and payment information
                                    (processed securely through Stripe and Razorpay). We do not store full credit card numbers on our servers.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Usage Data</h3>
                                <p className="leading-relaxed">
                                    We automatically collect information about how you use the Service, including your IP address,
                                    browser type, device information, pages visited, features used, search queries, and audit reports generated.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Lead Data</h3>
                                <p className="leading-relaxed">
                                    The Service allows you to discover and save business leads. This data includes publicly available
                                    business information from Google Places API and website audit results. You own your saved leads data.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Eye className="w-5 h-5 text-green-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">2. How We Use Your Information</h2>
                        </div>
                        <ul className="pl-12 space-y-2 text-gray-600 list-disc list-inside">
                            <li>To provide, operate, and maintain the Service</li>
                            <li>To process your transactions and manage your subscription</li>
                            <li>To send you important updates about your account and the Service</li>
                            <li>To respond to your inquiries and provide customer support</li>
                            <li>To improve and personalize your experience</li>
                            <li>To analyze usage patterns and optimize our services</li>
                            <li>To detect, prevent, and address technical issues or fraud</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Globe className="w-5 h-5 text-purple-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">3. Data Sharing and Third Parties</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-gray-600">
                            <p className="leading-relaxed">We do not sell your personal information. We may share your data with:</p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li><strong>Service Providers:</strong> Stripe, Razorpay (payments), Supabase (database), Vercel (hosting), Google (Places API)</li>
                                <li><strong>Analytics Partners:</strong> We use analytics tools to understand how users interact with our Service</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-50 rounded-lg">
                                <Lock className="w-5 h-5 text-teal-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">4. Data Security</h2>
                        </div>
                        <p className="pl-12 text-gray-600 leading-relaxed">
                            We implement industry-standard security measures to protect your information, including:
                            encryption in transit (TLS/SSL), secure database storage, access controls, and regular security audits.
                            However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    {/* Section 5 - CCPA */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Shield className="w-5 h-5 text-orange-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">5. Your Rights (CCPA & Privacy Rights)</h2>
                        </div>
                        <div className="pl-12 space-y-4 text-gray-600">
                            <p className="leading-relaxed">
                                If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA):
                            </p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li><strong>Right to Know:</strong> Request information about the personal data we collect and how we use it</li>
                                <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                                <li><strong>Right to Opt-Out:</strong> Opt out of the sale of your personal information (we do not sell your data)</li>
                                <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights</li>
                            </ul>
                            <p className="leading-relaxed">
                                To exercise these rights, please contact us at <a href="mailto:privacy@leadscout.app" className="text-teal-500 hover:underline">privacy@leadscout.app</a>.
                            </p>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <Bell className="w-5 h-5 text-yellow-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">6. Cookies and Tracking Technologies</h2>
                        </div>
                        <p className="pl-12 text-gray-600 leading-relaxed">
                            We use cookies and similar technologies to maintain your session, remember your preferences,
                            and analyze how you use our Service. You can control cookies through your browser settings,
                            but disabling them may affect functionality.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">7. Data Retention</h2>
                        </div>
                        <p className="pl-12 text-gray-600 leading-relaxed">
                            We retain your personal information for as long as your account is active or as needed to provide
                            the Service. Upon account deletion, we will delete or anonymize your data within 30 days,
                            except where we are required to retain it for legal or legitimate business purposes.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">8. Children&apos;s Privacy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            The Service is not intended for individuals under the age of 18. We do not knowingly collect
                            personal information from children. If we learn that we have collected information from a child
                            under 18, we will delete it promptly.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">9. International Data Transfers</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Your information may be transferred to and processed in countries other than your own.
                            We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">10. Changes to This Policy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any material changes
                            by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use
                            of the Service after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    {/* Section 11 - Contact */}
                    <section className="space-y-4 pt-6 border-t border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">11. Contact Us</h2>
                        <div className="text-gray-600 leading-relaxed space-y-2">
                            <p>If you have any questions about this Privacy Policy, please contact us:</p>
                            <div className="bg-gray-50 rounded-xl p-6 mt-4">
                                <p><strong>LeadScout Inc.</strong></p>
                                <p>Email: <a href="mailto:privacy@leadscout.app" className="text-teal-500 hover:underline">privacy@leadscout.app</a></p>
                                <p>Support: <a href="mailto:abhisheksangule6@gmail.com" className="text-teal-500 hover:underline">support@leadscout.app</a></p>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Back to Home */}
                <div className="text-center mt-12">
                    <Link href="/" className="text-teal-500 font-bold hover:underline inline-flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 py-8 mt-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-sm text-gray-500">© 2026 LeadScout Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
