import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Key, Shield, Zap, Search, Globe, Database, BarChart } from 'lucide-react';

export const metadata: Metadata = {
    title: 'API Documentation | LeadScout',
    description: 'Complete API reference for authenticating and using the LeadScout API.',
};

export default function ApiDocsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="h-6 w-px bg-gray-200" />
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
                            LeadScout API
                        </h1>
                        <span className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full border border-teal-100 font-medium">
                            v1.0
                        </span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <nav className="sticky top-24 space-y-1">
                            <a href="#authentication" className="block px-3 py-2 text-sm font-medium text-gray-900 rounded-md bg-gray-100 group">Authentication</a>
                            <a href="#base-url" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">Base URL</a>
                            <a href="#rate-limits" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">Plans & Limits</a>
                            <div className="pt-4 pb-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Endpoints</span>
                            </div>
                            <a href="#leads" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">Leads</a>
                            <a href="#search" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">Search (Discovery)</a>
                            <a href="#audit" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">Audits</a>
                            <a href="#usage" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">Usage</a>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-12">

                        {/* Introduction */}
                        <div className="prose prose-teal max-w-none">
                            <p className="text-lg text-gray-600">
                                The LeadScout API allows you to programmatically access our lead discovery database, trigger website audits, and manage your CRM data.
                                Build custom integrations, automate your workflow, or sync data with your existing tools.
                            </p>
                        </div>

                        {/* Authentication */}
                        <section id="authentication" className="scroll-mt-24">
                            <div className="flex items-center gap-2 mb-4">
                                <Key className="w-6 h-6 text-teal-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Authentication</h2>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                                <p className="text-gray-600">
                                    Authenticate your API requests by including your API key in the <code className="text-pink-600 bg-pink-50 px-1 py-0.5 rounded text-sm">Authorization</code> header of every request.
                                </p>

                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <code className="text-green-400 font-mono text-sm">
                                        Authorization: Bearer sk_live_...
                                    </code>
                                </div>

                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                <span className="font-bold">Important:</span> Your API key carries the same privileges as your user account. Keep it secret! Do not share it in client-side code (browsers, mobile apps).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Base URL */}
                        <section id="base-url" className="scroll-mt-24">
                            <div className="flex items-center gap-2 mb-4">
                                <Globe className="w-6 h-6 text-teal-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Base URL</h2>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <p className="text-gray-600 mb-4">
                                    All API requests should be made to the following base URL:
                                </p>
                                <div className="bg-gray-100 rounded-lg p-3 inline-block">
                                    <code className="text-gray-800 font-mono">https://your-domain.com/api/v1</code>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Replace <code className="bg-gray-100 px-1 rounded">your-domain.com</code> with your actual deployment domain.</p>
                            </div>
                        </section>

                        {/* Rate Limits */}
                        <section id="rate-limits" className="scroll-mt-24">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-6 h-6 text-teal-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Plans & Limits</h2>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Access</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Requests</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Free</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-semibold">No</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pro</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">Yes</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">1,000</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Standard Endpoints</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Enterprise</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">Yes</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">10,000</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Standard + Favorites API</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <hr className="border-gray-200" />

                        {/* Endpoints: Leads */}
                        <section id="leads" className="scroll-mt-24">
                            <div className="flex items-center gap-2 mb-4">
                                <Database className="w-6 h-6 text-teal-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
                            </div>

                            {/* GET /leads */}
                            <div className="mb-8 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">List Leads</h3>
                                <p className="text-gray-600">Retrieve a comprehensive list of your saved leads. Supports filtering and pagination.</p>

                                <EndpointBadge method="GET" path="/leads" />

                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-700">Query Parameters</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                        <li><code className="bg-gray-100 px-1 rounded">status</code> (optional): Filter by status (new, auditing, audited, contacted)</li>
                                        <li><code className="bg-gray-100 px-1 rounded">favorite</code> (optional): Set to "true" to get only favorites</li>
                                        <li><code className="bg-gray-100 px-1 rounded">from</code> (optional): Date string (ISO) to filter leads created after this date</li>
                                        <li><code className="bg-gray-100 px-1 rounded">limit</code> (optional): Number of results to return (default: 50)</li>
                                    </ul>
                                </div>

                                <CodeBlock
                                    code={`curl -X GET "http://localhost:3000/api/v1/leads?status=new&limit=10" \\
  -H "Authorization: Bearer sk_live_..."`}
                                />
                            </div>

                            {/* POST /leads */}
                            <div className="mb-8 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Create Lead</h3>
                                <p className="text-gray-600">Manually add a new lead to your CRM.</p>

                                <EndpointBadge method="POST" path="/leads" />

                                <CodeBlock
                                    code={`curl -X POST "http://localhost:3000/api/v1/leads" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "business_name": "Acme Corp",
    "website_url": "https://acme.org",
    "notes": "Met at conference",
    "value": 5000
  }'`}
                                />
                            </div>
                        </section>

                        <hr className="border-gray-200" />

                        {/* Endpoints: Search */}
                        <section id="search" className="scroll-mt-24">
                            <div className="flex items-center gap-2 mb-4">
                                <Search className="w-6 h-6 text-teal-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Search (Discovery)</h2>
                            </div>

                            <div className="mb-8 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Discover New Leads</h3>
                                <p className="text-gray-600">Search for businesses using keywords and location. Returns up to 20 results per request.</p>

                                <EndpointBadge method="POST" path="/search" />

                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-700">Request Body</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                        <li><code className="bg-gray-100 px-1 rounded">query</code> (required): Search term (e.g., "Plumbers in Austin, TX")</li>
                                    </ul>
                                </div>

                                <CodeBlock
                                    code={`curl -X POST "http://localhost:3000/api/v1/search" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "digital marketing agencies in London"
  }'`}
                                />
                            </div>
                        </section>

                        <hr className="border-gray-200" />

                        {/* Endpoints: Audit */}
                        <section id="audit" className="scroll-mt-24">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-6 h-6 text-teal-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Audits</h2>
                            </div>

                            <div className="mb-8 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Run Website Audit</h3>
                                <p className="text-gray-600">Trigger a comprehensive website audit for any URL. This is an expensive operation and counts towards your audit limits.</p>

                                <EndpointBadge method="POST" path="/audit" />

                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-700">Request Body</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                        <li><code className="bg-gray-100 px-1 rounded">url</code> (required): Valid website URL (must start with http:// or https://)</li>
                                    </ul>
                                </div>

                                <CodeBlock
                                    code={`curl -X POST "http://localhost:3000/api/v1/audit" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://stripe.com"
  }'`}
                                />
                            </div>
                        </section>

                        <hr className="border-gray-200" />

                        {/* Endpoints: Usage */}
                        <section id="usage" className="scroll-mt-24">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart className="w-6 h-6 text-teal-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Usage</h2>
                            </div>

                            <div className="mb-8 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Check Subscription Usage</h3>
                                <p className="text-gray-600">Get real-time statistics about your current billing period usage.</p>

                                <EndpointBadge method="GET" path="/usage" />

                                <CodeBlock
                                    code={`curl -X GET "http://localhost:3000/api/v1/usage" \\
  -H "Authorization: Bearer sk_live_..."`}
                                />
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper components
function EndpointBadge({ method, path }: { method: string, path: string }) {
    const color =
        method === 'GET' ? 'bg-blue-100 text-blue-700' :
            method === 'POST' ? 'bg-green-100 text-green-700' :
                method === 'PATCH' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700';

    return (
        <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg font-mono text-sm border border-gray-100">
            <span className={`px-2 py-1 rounded font-bold ${color}`}>
                {method}
            </span>
            <span className="text-gray-700">{path}</span>
        </div>
    );
}

function CodeBlock({ code }: { code: string }) {
    return (
        <div className="relative group">
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-gray-300 font-mono text-sm whitespace-pre">
                    {code}
                </pre>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">bash</span>
            </div>
        </div>
    );
}
