"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, Key, Shield, Zap, Search, Globe, Database, 
    BarChart3, Copy, Check, Terminal, Code2, AlertTriangle, 
    BookOpen, Layers, PlayCircle, Menu, X, ExternalLink
} from 'lucide-react';

type Language = 'curl' | 'javascript' | 'python';

interface Endpoint {
    id: string;
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    path: string;
    title: string;
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
            description: 'Retrieve a paginated list of leads saved in your CRM. Filters can be applied to narrow down the results by status, favorite flag, or creation dates.',
            params: [
                { name: 'status', type: 'string', required: false, description: 'Filter by funnel status (e.g., "new", "auditing", "audited", "contacted", "converted")' },
                { name: 'favorite', type: 'boolean', required: false, description: 'Set to "true" to list only favorite/starred leads' },
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
      "notes": "Interested in redesign",
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
            description: 'Manually add a new lead to your CRM dashboard. This is useful for importing leads from other sources programmatically.',
            requestBody: [
                { name: 'business_name', type: 'string', required: true, description: 'The official name of the business' },
                { name: 'website_url', type: 'string', required: false, description: 'URL of the business website (must include http/https)' },
                { name: 'notes', type: 'string', required: false, description: 'Custom notes or details about the prospect' },
                { name: 'value', type: 'number', required: false, description: 'Estimated project contract value in INR' },
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
    "notes": "Cold outreach candidate",
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
    notes: 'Cold outreach candidate',
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
    "notes": "Cold outreach candidate",
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
    "notes": "Cold outreach candidate",
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
            description: 'Fetch all detailed information and metrics associated with a single lead, identified by its unique ID.',
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
    "notes": "Cold outreach candidate",
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
            description: 'Modify details on an existing lead, such as moving them to a different funnel status or updating their contract value.',
            requestBody: [
                { name: 'status', type: 'string', required: false, description: 'Funnel status ("new", "auditing", "audited", "contacted", "converted")' },
                { name: 'notes', type: 'string', required: false, description: 'Updated text notes' },
                { name: 'value', type: 'number', required: false, description: 'Updated contract value (in INR)' },
                { name: 'phone', type: 'string', required: false, description: 'Updated phone number' },
                { name: 'address', type: 'string', required: false, description: 'Updated physical address' },
                { name: 'business_name', type: 'string', required: false, description: 'Updated company name' },
                { name: 'website_url', type: 'string', required: false, description: 'Updated site URL' },
            ],
            code: {
                curl: `curl -X PATCH "https://api.leadscout.app/api/v1/leads/lead_e349fd81" \\
  -H "Authorization: Bearer sk_live_your_actual_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "contacted",
    "notes": "Emailed pitch deck to team",
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
    notes: 'Emailed pitch deck to team',
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
    "notes": "Emailed pitch deck to team",
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
    "notes": "Emailed pitch deck to team",
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
            description: 'Permanently remove a lead from your database. This action is irreversible.',
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
            description: 'Search for local businesses in real-time in any city and industry. Uses Google Places API. Returns leads with phone, address, website detection, and initial rating metrics.',
            requestBody: [
                { name: 'query', type: 'string', required: true, description: 'Natural query like "plumbers in Delhi", "dentists in Mumbai", or "coffee shops in Goa"' }
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
      "website_url": "http://royalpalacestay.co.in",
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
            description: 'Submit any website URL for a detailed digital presence scan. Our crawler checks technical parameters including SEO headers, page speeds, mobile support, analytics integration, and SSL security. The audit result includes an overall numeric rating out of 100.',
            requestBody: [
                { name: 'url', type: 'string', required: true, description: 'The absolute website URL to scan (must start with http:// or https://)' }
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
            description: 'Monitor your monthly quotas, billing period, and current API usage metrics to prevent hitting rate limits.',
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

    // Simple scroll helper
    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
            {/* Header / Nav */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="h-4 w-px bg-slate-800" />
                    <span className="font-extrabold text-xl bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Zap className="w-5 h-5 text-teal-400" fill="currentColor" /> Blade Spot API
                    </span>
                    <span className="bg-teal-950 text-teal-300 text-xs px-2 py-0.5 rounded-full border border-teal-800 font-semibold tracking-wider uppercase">
                        v1.0
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Switcher Desktop */}
                    <div className="hidden md:flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                        {(['curl', 'javascript', 'python'] as Language[]).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setActiveLang(lang)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                                    activeLang === lang 
                                        ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20' 
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {lang === 'javascript' ? 'Node.js' : lang}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 md:hidden text-slate-400 hover:text-slate-200"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </header>

            {/* Mobile Nav Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 top-16 bg-slate-950/95 z-40 p-6 flex flex-col gap-6 md:hidden animate-in fade-in duration-200">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Navigation</span>
                        <button onClick={() => scrollToSection('getting-started')} className={`text-left py-2 font-medium ${activeSection === 'getting-started' ? 'text-teal-400' : 'text-slate-300'}`}>Getting Started</button>
                        <button onClick={() => scrollToSection('authentication')} className={`text-left py-2 font-medium ${activeSection === 'authentication' ? 'text-teal-400' : 'text-slate-300'}`}>Authentication</button>
                        <button onClick={() => scrollToSection('base-url')} className={`text-left py-2 font-medium ${activeSection === 'base-url' ? 'text-teal-400' : 'text-slate-300'}`}>Base URL</button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Endpoints</span>
                        {endpoints.map((ep) => (
                            <button 
                                key={ep.id} 
                                onClick={() => scrollToSection(ep.id)} 
                                className={`text-left py-2 font-medium flex items-center gap-2 ${activeSection === ep.id ? 'text-teal-400' : 'text-slate-300'}`}
                            >
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                    ep.method === 'GET' ? 'bg-blue-950 text-blue-300' :
                                    ep.method === 'POST' ? 'bg-emerald-950 text-emerald-300' :
                                    ep.method === 'PATCH' ? 'bg-amber-950 text-amber-300' : 'bg-red-950 text-red-300'
                                }`}>
                                    {ep.method}
                                </span>
                                {ep.path}
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto border-t border-slate-800 pt-4 flex flex-col gap-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Language Preference</span>
                        <div className="grid grid-cols-3 bg-slate-900 p-1 rounded-xl border border-slate-800">
                            {(['curl', 'javascript', 'python'] as Language[]).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => {
                                        setActiveLang(lang);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`py-2 text-xs font-semibold rounded-lg text-center capitalize ${
                                        activeLang === lang 
                                            ? 'bg-teal-500 text-slate-950' 
                                            : 'text-slate-400'
                                    }`}
                                >
                                    {lang === 'javascript' ? 'Node' : lang}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Split Layout Container */}
            <div className="max-w-[1600px] mx-auto flex">
                
                {/* Sidebar Left (Desktop only) */}
                <aside className="w-80 border-r border-slate-800/60 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto hidden lg:block p-6 bg-slate-900/30">
                    <nav className="space-y-8">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Welcome</span>
                            <div className="space-y-1">
                                <button 
                                    onClick={() => scrollToSection('getting-started')} 
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeSection === 'getting-started' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <BookOpen className="w-4 h-4" /> Getting Started
                                </button>
                                <button 
                                    onClick={() => scrollToSection('authentication')} 
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeSection === 'authentication' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <Key className="w-4 h-4" /> Authentication
                                </button>
                                <button 
                                    onClick={() => scrollToSection('base-url')} 
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeSection === 'base-url' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <Globe className="w-4 h-4" /> Base URL
                                </button>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Core API Endpoints</span>
                            <div className="space-y-1">
                                {endpoints.map((ep) => (
                                    <button
                                        key={ep.id}
                                        onClick={() => scrollToSection(ep.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                                            activeSection === ep.id ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        <span className="truncate pr-2">{ep.title}</span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                            ep.method === 'GET' ? 'bg-blue-950/50 text-blue-400 border border-blue-900/30' :
                                            ep.method === 'POST' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' :
                                            ep.method === 'PATCH' ? 'bg-amber-950/50 text-amber-400 border border-amber-900/30' : 
                                            'bg-red-950/50 text-red-400 border border-red-900/30'
                                        }`}>
                                            {ep.method}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800/80">
                            <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-teal-400" /> Limits Policy
                            </h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                API requests are subject to limits of 1,000/mo (Pro) and 10,000/mo (Agency). Rate limit headers are returned with every request.
                            </p>
                        </div>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden min-h-[calc(100vh-80px)]">
                    
                    {/* Left/Middle Column (Documentation explanation) */}
                    <div className="xl:col-span-7 p-6 md:p-12 space-y-16 border-r border-slate-800/40 bg-slate-900/10 max-w-4xl">
                        
                        {/* Getting Started Section */}
                        <section id="getting-started" className="scroll-mt-24 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-teal-950 text-teal-400 border border-teal-800/50 rounded-xl">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-white tracking-tight">Getting Started</h2>
                            </div>
                            <p className="text-slate-300 leading-relaxed">
                                Welcome to the <strong>Blade Spot API by A2C Studios</strong>. Our REST API enables developer-first agency outreach automation. Integrate local lead discovery, detailed mobile responsiveness & SEO diagnostics, and auto-score lists directly into your CRM or outbound toolkits.
                            </p>
                            <div className="bg-slate-800/40 rounded-xl border border-slate-800/60 p-4 flex gap-3.5 items-start">
                                <Terminal className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
                                <div className="text-sm text-slate-300">
                                    <span className="font-bold text-white">Base URL:</span> Use <code className="bg-slate-950 px-1.5 py-0.5 rounded text-teal-300 font-mono">https://api.leadscout.app/api/v1</code> for all operations. Secure HTTPS is required for all requests.
                                </div>
                            </div>
                        </section>

                        {/* Authentication Section */}
                        <section id="authentication" className="scroll-mt-24 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-teal-950 text-teal-400 border border-teal-800/50 rounded-xl">
                                    <Key className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Authentication</h2>
                            </div>
                            
                            <div className="space-y-4 text-slate-300">
                                <p>
                                    Authenticate your requests by including your secret API token in the <code className="bg-slate-950 text-pink-400 px-1.5 py-0.5 rounded font-mono text-sm">Authorization</code> header as a Bearer token:
                                </p>

                                <div className="relative group">
                                    <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-4 font-mono text-sm text-teal-400 flex items-center justify-between">
                                        <code>Authorization: Bearer sk_live_...</code>
                                        <button 
                                            onClick={() => handleCopy('header-auth', 'Authorization: Bearer sk_live_...')}
                                            className="text-slate-500 hover:text-teal-400 transition-colors p-1.5 rounded-lg hover:bg-slate-900"
                                        >
                                            {copiedId === 'header-auth' ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-amber-950/30 border-l-4 border-amber-500 rounded-r-xl p-4 flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-amber-400 text-sm mb-0.5">Keep your credentials secure</h4>
                                        <p className="text-xs text-amber-300/85 leading-relaxed">
                                            API keys carry full write & read privileges for your CRM database. Do not embed keys in client-side code (browsers, public repositories, mobile applications). All requests should ideally be channeled via server-side logic.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold text-white text-sm">Generating an API Key:</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                                        <li>Navigate to the <Link href="/settings/api-keys" className="text-teal-400 hover:underline">API Settings</Link> inside your dashboard.</li>
                                        <li>Provide a key description (e.g., "Production Client", "Zapier Integration").</li>
                                        <li>Click <strong>Generate Key</strong>. Copy the key hash immediately. For safety, the raw token is shown only once.</li>
                                    </ol>
                                </div>
                            </div>
                        </section>

                        {/* Base URL Section */}
                        <section id="base-url" className="scroll-mt-24 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-teal-950 text-teal-400 border border-teal-800/50 rounded-xl">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Base URL & API Clients</h2>
                            </div>
                            <p className="text-slate-300">
                                Send all API requests directly to our production server cluster. Update your environment variables:
                            </p>
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm text-slate-300 flex items-center justify-between">
                                <code>https://api.leadscout.app/api/v1</code>
                                <button 
                                    onClick={() => handleCopy('base-url-text', 'https://api.leadscout.app/api/v1')}
                                    className="text-slate-500 hover:text-teal-400 transition-colors p-1.5 rounded-lg"
                                >
                                    {copiedId === 'base-url-text' ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </section>

                        <hr className="border-slate-800/60" />

                        {/* Endpoints Documentation */}
                        <div className="space-y-20">
                            {endpoints.map((ep) => (
                                <section key={ep.id} id={ep.id} className="scroll-mt-24 space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-mono font-extrabold px-2 py-1 rounded border ${
                                                ep.method === 'GET' ? 'bg-blue-950/60 text-blue-400 border-blue-900/40' :
                                                ep.method === 'POST' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900/40' :
                                                ep.method === 'PATCH' ? 'bg-amber-950/60 text-amber-400 border-amber-900/40' : 
                                                'bg-red-950/60 text-red-400 border-red-900/40'
                                            }`}>
                                                {ep.method}
                                            </span>
                                            <code className="text-sm font-mono text-teal-300">{ep.path}</code>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white tracking-tight">{ep.title}</h3>
                                        <p className="text-slate-300 leading-relaxed text-sm">{ep.description}</p>
                                    </div>

                                    {/* Query Parameters Table */}
                                    {ep.params && ep.params.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Query Parameters</h4>
                                            <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
                                                <table className="w-full text-left border-collapse text-sm">
                                                    <thead>
                                                        <tr className="border-b border-slate-800/80 bg-slate-900/40 text-slate-400 text-xs font-semibold">
                                                            <th className="p-3">Parameter</th>
                                                            <th className="p-3">Type</th>
                                                            <th className="p-3">Required</th>
                                                            <th className="p-3">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                                                        {ep.params.map((param) => (
                                                            <tr key={param.name}>
                                                                <td className="p-3 font-mono text-teal-400 text-xs">{param.name}</td>
                                                                <td className="p-3 text-slate-400 text-xs">{param.type}</td>
                                                                <td className="p-3 text-xs">
                                                                    {param.required ? (
                                                                        <span className="text-red-400 font-medium">Yes</span>
                                                                    ) : (
                                                                        <span className="text-slate-500">No</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-3 text-xs text-slate-400">{param.description}</td>
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
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Request Body (JSON)</h4>
                                            <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
                                                <table className="w-full text-left border-collapse text-sm">
                                                    <thead>
                                                        <tr className="border-b border-slate-800/80 bg-slate-900/40 text-slate-400 text-xs font-semibold">
                                                            <th className="p-3">Property</th>
                                                            <th className="p-3">Type</th>
                                                            <th className="p-3">Required</th>
                                                            <th className="p-3">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                                                        {ep.requestBody.map((bodyProp) => (
                                                            <tr key={bodyProp.name}>
                                                                <td className="p-3 font-mono text-teal-400 text-xs">{bodyProp.name}</td>
                                                                <td className="p-3 text-slate-400 text-xs">{bodyProp.type}</td>
                                                                <td className="p-3 text-xs">
                                                                    {bodyProp.required ? (
                                                                        <span className="text-red-400 font-medium">Yes</span>
                                                                    ) : (
                                                                        <span className="text-slate-500">No</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-3 text-xs text-slate-400">{bodyProp.description}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Code Snippets for mobile (stacked) */}
                                    <div className="xl:hidden space-y-4">
                                        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                                            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-semibold">
                                                <span>Request Example ({activeLang === 'javascript' ? 'Node' : activeLang})</span>
                                                <button 
                                                    onClick={() => handleCopy(`${ep.id}-req-mob`, ep.code[activeLang])}
                                                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                                                >
                                                    {copiedId === `${ep.id}-req-mob` ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                    Copy
                                                </button>
                                            </div>
                                            <pre className="p-4 font-mono text-xs overflow-x-auto text-teal-300">
                                                {ep.code[activeLang]}
                                            </pre>
                                        </div>

                                        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                                            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-semibold">
                                                <span>Response Payload</span>
                                                <button 
                                                    onClick={() => handleCopy(`${ep.id}-res-mob`, ep.response)}
                                                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                                                >
                                                    {copiedId === `${ep.id}-res-mob` ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
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

                    {/* Right Column (Code execution panes - fixed, desktop only) */}
                    <div className="xl:col-span-5 bg-slate-950 p-6 md:p-10 space-y-8 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto hidden xl:block border-l border-slate-800/80">
                        <div className="space-y-12">
                            {endpoints.map((ep) => (
                                <div key={`${ep.id}-code-pane`} className="space-y-4 py-6 border-b border-slate-900">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            {ep.title} Sample Code
                                        </span>
                                    </div>

                                    {/* Request Snippet Card */}
                                    <div className="bg-slate-900 rounded-xl border border-slate-800/80 overflow-hidden">
                                        <div className="bg-slate-900/60 px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800/60 text-slate-400">
                                            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                                                <Code2 className="w-3.5 h-3.5 text-teal-400" /> 
                                                <span>Request ({activeLang === 'javascript' ? 'Node.js' : activeLang})</span>
                                            </div>
                                            <button 
                                                onClick={() => handleCopy(`${ep.id}-req-desk`, ep.code[activeLang])}
                                                className="flex items-center gap-1 hover:text-white text-slate-500 transition-colors py-1 px-2 rounded-md hover:bg-slate-850"
                                            >
                                                {copiedId === `${ep.id}-req-desk` ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-teal-400" />
                                                        <span className="text-teal-400 text-[10px]">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span className="text-[10px]">Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="p-4 overflow-x-auto">
                                            <pre className="font-mono text-xs text-teal-300 whitespace-pre">
                                                {ep.code[activeLang]}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Response Snippet Card */}
                                    <div className="bg-slate-900 rounded-xl border border-slate-800/80 overflow-hidden">
                                        <div className="bg-slate-900/60 px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800/60 text-slate-400">
                                            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                                                <PlayCircle className="w-3.5 h-3.5 text-emerald-400" /> 
                                                <span>JSON Response (200 OK)</span>
                                            </div>
                                            <button 
                                                onClick={() => handleCopy(`${ep.id}-res-desk`, ep.response)}
                                                className="flex items-center gap-1 hover:text-white text-slate-500 transition-colors py-1 px-2 rounded-md hover:bg-slate-850"
                                            >
                                                {copiedId === `${ep.id}-res-desk` ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-teal-400" />
                                                        <span className="text-teal-400 text-[10px]">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span className="text-[10px]">Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="p-4 overflow-x-auto max-h-[360px] overflow-y-auto">
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
