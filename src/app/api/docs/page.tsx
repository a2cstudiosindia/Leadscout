"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    Zap, Key, Shield, Globe, Terminal, Code2, AlertTriangle, 
    BookOpen, PlayCircle, Menu, X, Check, Copy, ArrowLeft,
    SlidersHorizontal, Layers, CheckCircle2, ChevronRight
} from 'lucide-react';

type Language = 'curl' | 'javascript' | 'python';

interface Endpoint {
    id: string;
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    path: string;
    title: string;
    category: 'CRM Endpoints' | 'Intelligence Engine';
    description: string;
    params?: { name: string; type: string; required: boolean; description: string }[];
    requestBody?: { name: string; type: string; required: boolean; description: string }[];
    code: {
        curl: string;
        javascript: string;
        python: string;
    };
    response: string;
}

export default function ApiDocsPage() {
    const [activeLang, setActiveLang] = useState<Language>('curl');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('getting-started');

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const endpoints: Endpoint[] = [
        {
            id: 'list-leads',
            method: 'GET',
            path: '/leads',
            title: 'List Saved Leads',
            category: 'CRM Endpoints',
            description: 'Retrieve a paginated list of leads saved in your CRM. Filters can be applied to narrow down the results by funnel status, favorite flag, or creation timestamp ranges.',
            params: [
                { name: 'status', type: 'string', required: false, description: 'Filter by funnel stage ("new", "auditing", "audited", "contacted", "converted")' },
                { name: 'favorite', type: 'boolean', required: false, description: 'Set to true to retrieve only starred/favorite leads' },
                { name: 'from', type: 'string (ISO date)', required: false, description: 'Filter leads created on or after this timestamp' },
                { name: 'to', type: 'string (ISO date)', required: false, description: 'Filter leads created on or before this timestamp' },
                { name: 'limit', type: 'number', required: false, description: 'Number of results to return (default: 50, max: 100)' },
                { name: 'offset', type: 'number', required: false, description: 'Number of items to skip for pagination (default: 0)' },
            ],
            code: {
                curl: `curl -X GET "https://api.leadscout.app/api/v1/leads?status=new&limit=10" \\
  -H "Authorization: Bearer sk_live_your_actual_api_key"`,
                javascript: `fetch('https://api.leadscout.app/api/v1/leads?status=new&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer sk_live_your_actual_api_key'
  }
})
.then(response => response.json())
.then(data => console.log(data));`,
                python: `import requests

url = "https://api.leadscout.app/api/v1/leads"
headers = {
    "Authorization": "Bearer sk_live_your_actual_api_key"
}
params = {
    "status": "new",
    "limit": 10
}

response = requests.get(url, headers=headers, params=params)
print(response.json())`
            },
            response: `{
  "success": true,
  "data": [
    {
      "id": "lead_9823f20a",
      "business_name": "Delhi Web Agency",
      "website_url": "https://delhiweb.in",
      "status": "new",
      "notes": "Interested in website redesign",
      "value": 15000,
      "phone": "+91 98765 43210",
      "address": "Connaught Place, New Delhi",
      "is_favorite": true,
      "created_at": "2026-06-08T18:00:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "limit": 10,
    "offset": 0
  }
}`
        },
        {
            id: 'create-lead',
            method: 'POST',
            path: '/leads',
            title: 'Create a Lead',
            category: 'CRM Endpoints',
            description: 'Manually insert a prospective target into your CRM pipeline. Ideal for programmatic ingestion from cold outreach platforms or webhooks.',
            requestBody: [
                { name: 'business_name', type: 'string', required: true, description: 'The official registered name of the business prospect' },
                { name: 'website_url', type: 'string', required: false, description: 'Prospect URL (must start with http:// or https://)' },
                { name: 'notes', type: 'string', required: false, description: 'Custom discovery notes or outreach history' },
                { name: 'value', type: 'number', required: false, description: 'Estimated project contract value in INR/USD' },
                { name: 'phone', type: 'string', required: false, description: 'Contact phone number' },
                { name: 'address', type: 'string', required: false, description: 'Physical address of the business' },
            ],
            code: {
                curl: `curl -X POST "https://api.leadscout.app/api/v1/leads" \\
  -H "Authorization: Bearer sk_live_your_actual_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "business_name": "A2C Designs",
    "website_url": "https://a2cdesigns.in",
    "notes": "Outreach candidate",
    "value": 45000,
    "phone": "+91 99999 88888",
    "address": "Tech Park, Bengaluru, KA"
  }'`,
                javascript: `fetch('https://api.leadscout.app/api/v1/leads', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_live_your_actual_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    business_name: 'A2C Designs',
    website_url: 'https://a2cdesigns.in',
    notes: 'Outreach candidate',
    value: 45000,
    phone: '+91 99999 88888',
    address: 'Tech Park, Bengaluru, KA'
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
                python: `import requests

url = "https://api.leadscout.app/api/v1/leads"
headers = {
    "Authorization": "Bearer sk_live_your_actual_api_key",
    "Content-Type": "application/json"
}
payload = {
    "business_name": "A2C Designs",
    "website_url": "https://a2cdesigns.in",
    "notes": "Outreach candidate",
    "value": 45000,
    "phone": "+91 99999 88888",
    "address": "Tech Park, Bengaluru, KA"
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`
            },
            response: `{
  "success": true,
  "data": {
    "id": "lead_e349fd81",
    "user_id": "user_0284ab92",
    "business_name": "A2C Designs",
    "website_url": "https://a2cdesigns.in",
    "notes": "Outreach candidate",
    "value": 45000,
    "phone": "+91 99999 88888",
    "address": "Tech Park, Bengaluru, KA",
    "status": "new",
    "created_at": "2026-06-09T00:44:00Z"
  }
}`
        },
        {
            id: 'get-lead',
            method: 'GET',
            path: '/leads/[id]',
            title: 'Retrieve a Single Lead',
            category: 'CRM Endpoints',
            description: 'Fetch detailed records, audit scores, and funnel stage for a single lead by its unique record ID.',
            code: {
                curl: `curl -X GET "https://api.leadscout.app/api/v1/leads/lead_e349fd81" \\
  -H "Authorization: Bearer sk_live_your_actual_api_key"`,
                javascript: `fetch('https://api.leadscout.app/api/v1/leads/lead_e349fd81', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer sk_live_your_actual_api_key'
  }
})
.then(response => response.json())
.then(data => console.log(data));`,
                python: `import requests

url = "https://api.leadscout.app/api/v1/leads/lead_e349fd81"
headers = {
    "Authorization": "Bearer sk_live_your_actual_api_key"
}

response = requests.get(url, headers=headers)
print(response.json())`
            },
            response: `{
  "success": true,
  "data": {
    "id": "lead_e349fd81",
    "business_name": "A2C Designs",
    "website_url": "https://a2cdesigns.in",
    "status": "new",
    "notes": "Outreach candidate",
    "value": 45000,
    "phone": "+91 99999 88888",
    "address": "Tech Park, Bengaluru, KA",
    "created_at": "2026-06-09T00:44:00Z"
  }
}`
        },
        {
            id: 'update-lead',
            method: 'PATCH',
            path: '/leads/[id]',
            title: 'Update a Lead',
            category: 'CRM Endpoints',
            description: 'Update fields on an existing lead, such as transitioning their pipeline status or modifying the project contract value.',
            requestBody: [
                { name: 'status', type: 'string', required: false, description: 'Funnel status ("new", "auditing", "audited", "contacted", "converted")' },
                { name: 'notes', type: 'string', required: false, description: 'Updated text notes' },
                { name: 'value', type: 'number', required: false, description: 'Updated contract value' },
                { name: 'phone', type: 'string', required: false, description: 'Updated phone number' },
                { name: 'address', type: 'string', required: false, description: 'Updated physical address' },
                { name: 'business_name', type: 'string', required: false, description: 'Updated company name' },
                { name: 'website_url', type: 'string', required: false, description: 'Updated website URL' },
            ],
            code: {
                curl: `curl -X PATCH "https://api.leadscout.app/api/v1/leads/lead_e349fd81" \\
  -H "Authorization: Bearer sk_live_your_actual_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "contacted",
    "notes": "Emailed pitch deck to marketing team",
    "value": 50000
  }'`,
                javascript: `fetch('https://api.leadscout.app/api/v1/leads/lead_e349fd81', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer sk_live_your_actual_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'contacted',
    notes: 'Emailed pitch deck to marketing team',
    value: 50000
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
                python: `import requests

url = "https://api.leadscout.app/api/v1/leads/lead_e349fd81"
headers = {
    "Authorization": "Bearer sk_live_your_actual_api_key",
    "Content-Type": "application/json"
}
payload = {
    "status": "contacted",
    "notes": "Emailed pitch deck to marketing team",
    "value": 50000
}

response = requests.patch(url, headers=headers, json=payload)
print(response.json())`
            },
            response: `{
  "success": true,
  "data": {
    "id": "lead_e349fd81",
    "business_name": "A2C Designs",
    "website_url": "https://a2cdesigns.in",
    "status": "contacted",
    "notes": "Emailed pitch deck to marketing team",
    "value": 50000,
    "phone": "+91 99999 88888",
    "address": "Tech Park, Bengaluru, KA",
    "created_at": "2026-06-09T00:44:00Z"
  }
}`
        },
        {
            id: 'delete-lead',
            method: 'DELETE',
            path: '/leads/[id]',
            title: 'Delete a Lead',
            category: 'CRM Endpoints',
            description: 'Permanently remove a lead from your workspace. This action is irreversible.',
            code: {
                curl: `curl -X DELETE "https://api.leadscout.app/api/v1/leads/lead_e349fd81" \\
  -H "Authorization: Bearer sk_live_your_actual_api_key"`,
                javascript: `fetch('https://api.leadscout.app/api/v1/leads/lead_e349fd81', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer sk_live_your_actual_api_key'
  }
})
.then(response => response.json())
.then(data => console.log(data));`,
                python: `import requests

url = "https://api.leadscout.app/api/v1/leads/lead_e349fd81"
headers = {
    "Authorization": "Bearer sk_live_your_actual_api_key"
}

response = requests.delete(url, headers=headers)
print(response.json())`
            },
            response: `{
  "success": true,
  "message": "Lead deleted successfully"
}`
        },
        {
            id: 'search-leads',
            method: 'POST',
            path: '/search',
            title: 'Discover Leads (Google Places)',
            category: 'Intelligence Engine',
            description: 'Search for local businesses in real-time in any city and industry. Uses Google Places API. Returns leads with phone, address, website detection, and initial rating metrics.',
            requestBody: [
                { name: 'query', type: 'string', required: true, description: 'Natural query like "plumbers in Delhi", "dentists in Austin", or "boutique hotels in Jaipur"' }
            ],
            code: {
                curl: `curl -X POST "https://api.leadscout.app/api/v1/search" \\
  -H "Authorization: Bearer sk_live_your_actual_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "boutique hotels in Jaipur"
  }'`,
                javascript: `fetch('https://api.leadscout.app/api/v1/search', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_live_your_actual_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'boutique hotels in Jaipur'
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
                python: `import requests

url = "https://api.leadscout.app/api/v1/search"
headers = {
    "Authorization": "Bearer sk_live_your_actual_api_key",
    "Content-Type": "application/json"
}
payload = {
    "query": "boutique hotels in Jaipur"
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`
            },
            response: `{
  "success": true,
  "data": [
    {
      "business_name": "Royal Palace Stay",
      "website_url": "https://royalpalacestay.co.in",
      "phone": "+91 141 234 5678",
      "address": "Amer Road, Jaipur, Rajasthan",
      "rating": 4.5,
      "user_ratings_total": 128,
      "google_place_id": "ch_IJu83YdH82kDYR..."
    }
  ],
  "count": 1
}`
        },
        {
            id: 'audit-website',
            method: 'POST',
            path: '/audit',
            title: 'Trigger Website Audit',
            category: 'Intelligence Engine',
            description: 'Submit any website URL for a detailed technical audit scan. Analyzes SEO meta tags, mobile responsiveness, SSL certificate status, and page speed.',
            requestBody: [
                { name: 'url', type: 'string', required: true, description: 'Absolute website URL to audit (must start with http:// or https://)' }
            ],
            code: {
                curl: `curl -X POST "https://api.leadscout.app/api/v1/audit" \\
  -H "Authorization: Bearer sk_live_your_actual_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://delhiweb.in"
  }'`,
                javascript: `fetch('https://api.leadscout.app/api/v1/audit', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_live_your_actual_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://delhiweb.in'
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
                python: `import requests

url = "https://api.leadscout.app/api/v1/audit"
headers = {
    "Authorization": "Bearer sk_live_your_actual_api_key",
    "Content-Type": "application/json"
}
payload = {
    "url": "https://delhiweb.in"
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`
            },
            response: `{
  "success": true,
  "data": {
    "url": "https://delhiweb.in",
    "overallScore": 62,
    "checks": [
      { "id": "has_meta_description", "name": "Meta Description", "passed": true, "score": 100, "category": "seo" },
      { "id": "has_ssl", "name": "SSL Secure (HTTPS)", "passed": false, "score": 0, "category": "security" },
      { "id": "load_time_good", "name": "Page Speed", "passed": false, "score": 35, "category": "performance" }
    ],
    "scannedAt": "2026-06-09T00:44:30Z"
  }
}`
        },
        {
            id: 'check-usage',
            method: 'GET',
            path: '/usage',
            title: 'Check Usage Limits',
            category: 'Intelligence Engine',
            description: 'Monitor your monthly quotas, billing period, and current API call count to prevent hitting rate limits.',
            code: {
                curl: `curl -X GET "https://api.leadscout.app/api/v1/usage" \\
  -H "Authorization: Bearer sk_live_your_actual_api_key"`,
                javascript: `fetch('https://api.leadscout.app/api/v1/usage', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer sk_live_your_actual_api_key'
  }
})
.then(response => response.json())
.then(data => console.log(data));`,
                python: `import requests

url = "https://api.leadscout.app/api/v1/usage"
headers = {
    "Authorization": "Bearer sk_live_your_actual_api_key"
}

response = requests.get(url, headers=headers)
print(response.json())`
            },
            response: `{
  "success": true,
  "data": {
    "plan": "pro",
    "period": "2026-06",
    "usage": {
      "api_calls": { "current": 142, "limit": 1000 },
      "leads": { "current": 18, "limit": 500 },
      "audits": { "current": 32, "limit": 50 },
      "searches": { "current": 4, "limit": 50 }
    }
  }
}`
        }
    ];

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    const getMethodBadgeClass = (method: string) => {
        switch (method) {
            case 'GET':
                return 'bg-sky-50 text-sky-700 border border-sky-200/80';
            case 'POST':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
            case 'PATCH':
                return 'bg-amber-50 text-amber-700 border border-amber-200/80';
            case 'DELETE':
                return 'bg-rose-50 text-rose-700 border border-rose-200/80';
            default:
                return 'bg-zinc-100 text-zinc-700 border border-zinc-200';
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
            {/* Header / Nav */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-6 py-3.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                    <Link 
                        href="/dashboard" 
                        className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
                        title="Return to Dashboard"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>

                    <div className="h-4 w-px bg-zinc-200" />

                    <Link href="/" className="flex items-center gap-2.5 group">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white shadow-xs">
                            <Zap size={16} fill="currentColor" />
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold tracking-tight text-zinc-900">LeadScout</span>
                            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                                API Docs
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-4">
                    {/* Language Switcher */}
                    <div className="hidden sm:flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                        {(['curl', 'javascript', 'python'] as Language[]).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setActiveLang(lang)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                                    activeLang === lang 
                                        ? 'bg-zinc-900 text-white shadow-xs' 
                                        : 'text-zinc-600 hover:text-zinc-900'
                                }`}
                            >
                                {lang === 'javascript' ? 'Node.js' : lang}
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-2 border-l border-zinc-200 pl-4">
                        <Link 
                            href="/settings/api-keys" 
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        >
                            Get API Key
                        </Link>
                        <Link 
                            href="/pricing" 
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-black text-white hover:bg-zinc-800 transition-transform hover:scale-[1.02]"
                        >
                            View Plans
                        </Link>
                    </div>

                    {/* Mobile Hamburger */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 md:hidden text-zinc-700 hover:text-black rounded-lg hover:bg-zinc-100 transition-colors"
                        aria-label="Toggle navigation menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            {/* Mobile Nav Drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 top-14 bg-white/95 backdrop-blur-xl z-40 p-6 flex flex-col gap-6 md:hidden overflow-y-auto animate-in fade-in duration-200 border-b border-zinc-200">
                    <div className="flex flex-col gap-1 pb-4 border-b border-zinc-200">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono">App Navigation</span>
                        <Link href="/dashboard" className="py-2 text-base font-semibold text-zinc-900 flex items-center justify-between">
                            Dashboard <ChevronRight size={16} className="text-zinc-400" />
                        </Link>
                        <Link href="/settings/api-keys" className="py-2 text-base font-semibold text-zinc-900 flex items-center justify-between">
                            Manage API Keys <ChevronRight size={16} className="text-zinc-400" />
                        </Link>
                        <Link href="/pricing" className="py-2 text-base font-semibold text-zinc-900 flex items-center justify-between">
                            Pricing & Limits <ChevronRight size={16} className="text-zinc-400" />
                        </Link>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Documentation</span>
                        <button onClick={() => scrollToSection('getting-started')} className={`text-left py-2 text-sm font-semibold ${activeSection === 'getting-started' ? 'text-black' : 'text-zinc-600'}`}>Getting Started</button>
                        <button onClick={() => scrollToSection('authentication')} className={`text-left py-2 text-sm font-semibold ${activeSection === 'authentication' ? 'text-black' : 'text-zinc-600'}`}>Authentication</button>
                        <button onClick={() => scrollToSection('base-url')} className={`text-left py-2 text-sm font-semibold ${activeSection === 'base-url' ? 'text-black' : 'text-zinc-600'}`}>Base URL & Environments</button>
                        <button onClick={() => scrollToSection('rate-limits')} className={`text-left py-2 text-sm font-semibold ${activeSection === 'rate-limits' ? 'text-black' : 'text-zinc-600'}`}>Rate Limits & Errors</button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">Endpoints</span>
                        {endpoints.map((ep) => (
                            <button 
                                key={ep.id} 
                                onClick={() => scrollToSection(ep.id)} 
                                className={`text-left py-2 text-sm font-medium flex items-center gap-2 ${activeSection === ep.id ? 'text-black font-bold' : 'text-zinc-600'}`}
                            >
                                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getMethodBadgeClass(ep.method)}`}>
                                    {ep.method}
                                </span>
                                {ep.title}
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-zinc-200 flex flex-col gap-3">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Language Preference</span>
                        <div className="grid grid-cols-3 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                            {(['curl', 'javascript', 'python'] as Language[]).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => {
                                        setActiveLang(lang);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`py-2 text-xs font-semibold rounded-lg text-center capitalize ${
                                        activeLang === lang 
                                            ? 'bg-zinc-900 text-white shadow-xs' 
                                            : 'text-zinc-600'
                                    }`}
                                >
                                    {lang === 'javascript' ? 'Node' : lang}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Split Layout */}
            <div className="max-w-[1600px] mx-auto flex">
                
                {/* Desktop Sidebar */}
                <aside className="w-72 border-r border-zinc-200/80 sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto hidden lg:block p-6 bg-white/60">
                    <nav className="space-y-8">
                        <div>
                            <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider block mb-3">Overview</span>
                            <div className="space-y-1">
                                {[
                                    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
                                    { id: 'authentication', label: 'Authentication', icon: Key },
                                    { id: 'base-url', label: 'Base URL', icon: Globe },
                                    { id: 'rate-limits', label: 'Limits & Codes', icon: Shield },
                                ].map((item) => (
                                    <button 
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)} 
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xl transition-colors text-left ${
                                            activeSection === item.id 
                                                ? 'bg-zinc-900 text-white shadow-xs' 
                                                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                                        }`}
                                    >
                                        <item.icon className="w-4 h-4 shrink-0" /> {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider block mb-3">CRM Endpoints</span>
                            <div className="space-y-1">
                                {endpoints.filter(e => e.category === 'CRM Endpoints').map((ep) => (
                                    <button
                                        key={ep.id}
                                        onClick={() => scrollToSection(ep.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-xl transition-colors text-left ${
                                            activeSection === ep.id 
                                                ? 'bg-zinc-900 text-white shadow-xs' 
                                                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                                        }`}
                                    >
                                        <span className="truncate pr-2">{ep.title}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                                            activeSection === ep.id 
                                                ? 'bg-zinc-800 text-zinc-100' 
                                                : getMethodBadgeClass(ep.method)
                                        }`}>
                                            {ep.method}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider block mb-3">Intelligence Engine</span>
                            <div className="space-y-1">
                                {endpoints.filter(e => e.category === 'Intelligence Engine').map((ep) => (
                                    <button
                                        key={ep.id}
                                        onClick={() => scrollToSection(ep.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-xl transition-colors text-left ${
                                            activeSection === ep.id 
                                                ? 'bg-zinc-900 text-white shadow-xs' 
                                                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                                        }`}
                                    >
                                        <span className="truncate pr-2">{ep.title}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                                            activeSection === ep.id 
                                                ? 'bg-zinc-800 text-zinc-100' 
                                                : getMethodBadgeClass(ep.method)
                                        }`}>
                                            {ep.method}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick API Key Callout */}
                        <div className="bg-zinc-100 p-4 rounded-2xl border border-zinc-200">
                            <h4 className="text-xs font-extrabold text-zinc-900 mb-1 flex items-center gap-1.5">
                                <Key className="w-3.5 h-3.5 text-zinc-700" /> Need an API Key?
                            </h4>
                            <p className="text-xs text-zinc-600 leading-relaxed mb-3">
                                Generate live production tokens with instantaneous provisioning.
                            </p>
                            <Link 
                                href="/settings/api-keys" 
                                className="block w-full py-2 bg-zinc-900 hover:bg-black text-white text-center rounded-xl text-xs font-semibold transition-colors"
                            >
                                Open API Settings
                            </Link>
                        </div>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden min-h-[calc(100vh-61px)]">
                    
                    {/* Documentation Text (Middle) */}
                    <div className="xl:col-span-7 p-6 md:p-12 space-y-16 border-r border-zinc-200/80 max-w-4xl bg-white">
                        
                        {/* Getting Started */}
                        <section id="getting-started" className="scroll-mt-24 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-black text-white rounded-xl shadow-xs">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">LeadScout REST API</h1>
                                    <p className="text-sm font-semibold text-zinc-500 mt-0.5">Version 1.0 • Developer Documentation</p>
                                </div>
                            </div>

                            <p className="text-zinc-600 text-base md:text-lg leading-relaxed font-normal">
                                The LeadScout REST API provides direct programmatic access to our local business lead discovery engine, automated technical website diagnostics, and CRM pipeline management. Integrate seamlessly with your internal pipelines, CRMs, or workflow automation tools.
                            </p>

                            <div className="grid sm:grid-cols-3 gap-4 pt-2">
                                <div className="p-4 rounded-2xl border border-zinc-200 bg-[#fafafa]">
                                    <div className="font-bold text-sm text-zinc-900">Google Places Sync</div>
                                    <p className="text-xs text-zinc-500 mt-1">Real-time local business discovery across all industries.</p>
                                </div>
                                <div className="p-4 rounded-2xl border border-zinc-200 bg-[#fafafa]">
                                    <div className="font-bold text-sm text-zinc-900">Digital Audits</div>
                                    <p className="text-xs text-zinc-500 mt-1">SEO, mobile, SSL, and speed diagnostics with 0-100 scoring.</p>
                                </div>
                                <div className="p-4 rounded-2xl border border-zinc-200 bg-[#fafafa]">
                                    <div className="font-bold text-sm text-zinc-900">CRM Pipeline</div>
                                    <p className="text-xs text-zinc-500 mt-1">Stage tracking, notes, and contract value management.</p>
                                </div>
                            </div>
                        </section>

                        {/* Authentication */}
                        <section id="authentication" className="scroll-mt-24 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-zinc-900 text-white rounded-xl shadow-xs">
                                    <Key className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Authentication</h2>
                            </div>
                            
                            <div className="space-y-4 text-zinc-600 text-base leading-relaxed">
                                <p>
                                    Authenticate your requests by including your secret API token in the <code className="bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded font-mono text-sm border border-zinc-200">Authorization</code> header as a Bearer token:
                                </p>

                                <div className="bg-[#0c0c0e] rounded-2xl border border-zinc-800 p-4 font-mono text-sm text-zinc-100 flex items-center justify-between shadow-md">
                                    <code>Authorization: Bearer sk_live_...</code>
                                    <button 
                                        onClick={() => handleCopy('header-auth', 'Authorization: Bearer sk_live_...')}
                                        className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
                                        title="Copy header format"
                                    >
                                        {copiedId === 'header-auth' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3.5">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-amber-900 text-sm mb-1">Keep your secret keys safe</h4>
                                        <p className="text-xs text-amber-800/90 leading-relaxed">
                                            Your API keys carry full read and write access to your workspace CRM data. Never expose your keys in client-side applications (browsers or mobile binaries). Always route API calls through your secure backend services.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl border border-zinc-200 bg-[#fafafa] space-y-3">
                                    <h4 className="font-bold text-zinc-900 text-sm">How to Generate an API Key:</h4>
                                    <ol className="list-decimal pl-5 space-y-1.5 text-sm text-zinc-600">
                                        <li>Open <Link href="/settings/api-keys" className="text-zinc-900 font-bold underline hover:text-zinc-700">API Settings</Link> inside your dashboard.</li>
                                        <li>Provide a label for your key (e.g., "Production Ingestion Webhook").</li>
                                        <li>Click <strong>Generate Token</strong> and copy the token immediately (it will not be shown again).</li>
                                    </ol>
                                </div>
                            </div>
                        </section>

                        {/* Base URL */}
                        <section id="base-url" className="scroll-mt-24 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-zinc-900 text-white rounded-xl shadow-xs">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Base URL & Protocols</h2>
                            </div>
                            <p className="text-zinc-600 text-base leading-relaxed">
                                All API requests must be directed to our production endpoints over secure HTTPS. Plain HTTP requests will be refused.
                            </p>
                            <div className="bg-[#0c0c0e] p-4 rounded-2xl border border-zinc-800 font-mono text-sm text-zinc-100 flex items-center justify-between shadow-md">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">HTTPS</span>
                                    <span>https://api.leadscout.app/api/v1</span>
                                </div>
                                <button 
                                    onClick={() => handleCopy('base-url-text', 'https://api.leadscout.app/api/v1')}
                                    className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
                                    title="Copy base URL"
                                >
                                    {copiedId === 'base-url-text' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </section>

                        {/* Rate Limits & Status Codes */}
                        <section id="rate-limits" className="scroll-mt-24 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-zinc-900 text-white rounded-xl shadow-xs">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Rate Limits & HTTP Codes</h2>
                            </div>
                            
                            <p className="text-zinc-600 text-base leading-relaxed">
                                LeadScout returns standard HTTP status codes. Rate limits depend on your workspace tier:
                            </p>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl border border-zinc-200 bg-[#fafafa]">
                                    <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-wider">Professional Plan</span>
                                    <div className="text-2xl font-extrabold text-zinc-900 mt-1">1,000 requests / mo</div>
                                    <p className="text-xs text-zinc-500 mt-1">Burst limit: 60 requests / minute.</p>
                                </div>
                                <div className="p-5 rounded-2xl border border-zinc-200 bg-[#fafafa]">
                                    <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-wider">Enterprise Plan</span>
                                    <div className="text-2xl font-extrabold text-zinc-900 mt-1">Priority Unlimited</div>
                                    <p className="text-xs text-zinc-500 mt-1">Dedicated capacity with custom concurrency.</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-700 text-xs font-bold uppercase tracking-wider">
                                            <th className="p-3.5">Code</th>
                                            <th className="p-3.5">Status</th>
                                            <th className="p-3.5">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 text-zinc-700">
                                        <tr>
                                            <td className="p-3.5 font-mono font-bold text-emerald-600">200</td>
                                            <td className="p-3.5 font-semibold text-zinc-900">OK</td>
                                            <td className="p-3.5 text-zinc-600">The request completed successfully.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3.5 font-mono font-bold text-amber-600">400</td>
                                            <td className="p-3.5 font-semibold text-zinc-900">Bad Request</td>
                                            <td className="p-3.5 text-zinc-600">Missing required parameters or malformed payload.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3.5 font-mono font-bold text-rose-600">401</td>
                                            <td className="p-3.5 font-semibold text-zinc-900">Unauthorized</td>
                                            <td className="p-3.5 text-zinc-600">Invalid or missing API Bearer token.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3.5 font-mono font-bold text-rose-600">403</td>
                                            <td className="p-3.5 font-semibold text-zinc-900">Forbidden</td>
                                            <td className="p-3.5 text-zinc-600">API access not unlocked on your current plan.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3.5 font-mono font-bold text-purple-600">429</td>
                                            <td className="p-3.5 font-semibold text-zinc-900">Too Many Requests</td>
                                            <td className="p-3.5 text-zinc-600">Rate limit quota exceeded for the billing cycle.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <hr className="border-zinc-200" />

                        {/* Endpoints Documentation */}
                        <div className="space-y-24">
                            {endpoints.map((ep) => (
                                <section key={ep.id} id={ep.id} className="scroll-mt-24 space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`text-xs font-mono font-extrabold px-3 py-1 rounded-lg ${getMethodBadgeClass(ep.method)}`}>
                                                {ep.method}
                                            </span>
                                            <code className="text-sm font-mono font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-lg border border-zinc-200">
                                                /api/v1{ep.path}
                                            </code>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">{ep.title}</h3>
                                        <p className="text-zinc-600 text-base leading-relaxed">{ep.description}</p>
                                    </div>

                                    {/* Query Parameters Table */}
                                    {ep.params && ep.params.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Query Parameters</h4>
                                            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
                                                <table className="w-full text-left border-collapse text-sm">
                                                    <thead>
                                                        <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-700 text-xs font-bold uppercase tracking-wider">
                                                            <th className="p-3.5">Parameter</th>
                                                            <th className="p-3.5">Type</th>
                                                            <th className="p-3.5">Required</th>
                                                            <th className="p-3.5">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-zinc-200 text-zinc-700">
                                                        {ep.params.map((param) => (
                                                            <tr key={param.name}>
                                                                <td className="p-3.5 font-mono font-bold text-zinc-900 text-sm">{param.name}</td>
                                                                <td className="p-3.5 font-mono text-xs text-zinc-600">
                                                                    <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">{param.type}</span>
                                                                </td>
                                                                <td className="p-3.5 text-xs">
                                                                    {param.required ? (
                                                                        <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">Required</span>
                                                                    ) : (
                                                                        <span className="text-zinc-400 font-medium">Optional</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-3.5 text-xs text-zinc-600 leading-relaxed">{param.description}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Request Body Table */}
                                    {ep.requestBody && ep.requestBody.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Request Body (JSON)</h4>
                                            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
                                                <table className="w-full text-left border-collapse text-sm">
                                                    <thead>
                                                        <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-700 text-xs font-bold uppercase tracking-wider">
                                                            <th className="p-3.5">Field</th>
                                                            <th className="p-3.5">Type</th>
                                                            <th className="p-3.5">Required</th>
                                                            <th className="p-3.5">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-zinc-200 text-zinc-700">
                                                        {ep.requestBody.map((bodyProp) => (
                                                            <tr key={bodyProp.name}>
                                                                <td className="p-3.5 font-mono font-bold text-zinc-900 text-sm">{bodyProp.name}</td>
                                                                <td className="p-3.5 font-mono text-xs text-zinc-600">
                                                                    <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">{bodyProp.type}</span>
                                                                </td>
                                                                <td className="p-3.5 text-xs">
                                                                    {bodyProp.required ? (
                                                                        <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">Required</span>
                                                                    ) : (
                                                                        <span className="text-zinc-400 font-medium">Optional</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-3.5 text-xs text-zinc-600 leading-relaxed">{bodyProp.description}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Code Snippets for mobile (stacked) */}
                                    <div className="xl:hidden space-y-4 pt-2">
                                        <div className="bg-[#0c0c0e] rounded-2xl border border-zinc-800 overflow-hidden shadow-lg">
                                            <div className="bg-zinc-900/80 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between text-xs text-zinc-300 font-semibold">
                                                <span className="flex items-center gap-1.5">
                                                    <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                                                    Request ({activeLang === 'javascript' ? 'Node.js' : activeLang})
                                                </span>
                                                <button 
                                                    onClick={() => handleCopy(`${ep.id}-req-mob`, ep.code[activeLang])}
                                                    className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                                                >
                                                    {copiedId === `${ep.id}-req-mob` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                    Copy
                                                </button>
                                            </div>
                                            <pre className="p-4 font-mono text-xs overflow-x-auto text-zinc-100">
                                                {ep.code[activeLang]}
                                            </pre>
                                        </div>

                                        <div className="bg-[#0c0c0e] rounded-2xl border border-zinc-800 overflow-hidden shadow-lg">
                                            <div className="bg-zinc-900/80 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between text-xs text-zinc-300 font-semibold">
                                                <span className="flex items-center gap-1.5">
                                                    <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                                                    Response (200 OK)
                                                </span>
                                                <button 
                                                    onClick={() => handleCopy(`${ep.id}-res-mob`, ep.response)}
                                                    className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                                                >
                                                    {copiedId === `${ep.id}-res-mob` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                    Copy
                                                </button>
                                            </div>
                                            <pre className="p-4 font-mono text-xs overflow-x-auto text-emerald-400">
                                                {ep.response}
                                            </pre>
                                        </div>
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>

                    {/* Right Sticky Code Panes (Desktop) */}
                    <div className="xl:col-span-5 bg-[#0c0c0e] p-6 md:p-8 space-y-8 sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto hidden xl:block border-l border-zinc-800">
                        <div className="space-y-10">
                            {endpoints.map((ep) => (
                                <div key={`${ep.id}-code-pane`} className="space-y-4 py-6 border-b border-zinc-800/80 last:border-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                                            {ep.title} Sample
                                        </span>
                                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${getMethodBadgeClass(ep.method)}`}>
                                            {ep.method}
                                        </span>
                                    </div>

                                    {/* Request Snippet Card */}
                                    <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg">
                                        <div className="bg-zinc-950 px-4 py-2.5 flex items-center justify-between text-xs border-b border-zinc-800 text-zinc-300">
                                            <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                                                <Code2 className="w-3.5 h-3.5 text-zinc-400" /> 
                                                <span>Request ({activeLang === 'javascript' ? 'Node.js' : activeLang})</span>
                                            </div>
                                            <button 
                                                onClick={() => handleCopy(`${ep.id}-req-desk`, ep.code[activeLang])}
                                                className="flex items-center gap-1 hover:text-white text-zinc-400 transition-colors py-1 px-2 rounded-md hover:bg-zinc-800"
                                            >
                                                {copiedId === `${ep.id}-req-desk` ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span className="text-emerald-400 text-[11px] font-medium">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span className="text-[11px]">Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="p-4 overflow-x-auto">
                                            <pre className="font-mono text-xs text-zinc-200 whitespace-pre">
                                                {ep.code[activeLang]}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Response Snippet Card */}
                                    <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg">
                                        <div className="bg-zinc-950 px-4 py-2.5 flex items-center justify-between text-xs border-b border-zinc-800 text-zinc-300">
                                            <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                                                <PlayCircle className="w-3.5 h-3.5 text-emerald-400" /> 
                                                <span>Response (200 OK)</span>
                                            </div>
                                            <button 
                                                onClick={() => handleCopy(`${ep.id}-res-desk`, ep.response)}
                                                className="flex items-center gap-1 hover:text-white text-zinc-400 transition-colors py-1 px-2 rounded-md hover:bg-zinc-800"
                                            >
                                                {copiedId === `${ep.id}-res-desk` ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span className="text-emerald-400 text-[11px] font-medium">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span className="text-[11px]">Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="p-4 overflow-x-auto max-h-[320px] overflow-y-auto">
                                            <pre className="font-mono text-xs text-emerald-400 whitespace-pre">
                                                {ep.response}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
