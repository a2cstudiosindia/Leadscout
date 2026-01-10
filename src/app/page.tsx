"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Search, BarChart3, FileText, Users, ArrowRight, Star, Shield, Menu, X } from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Clean Animated Gradient - flows from top to bottom */}
      <div className="landing-gradient z-0">
        <div className="gradient-beam" />
      </div>

      {/* Navbar */}
      <nav className="p-4 max-w-7xl mx-auto flex justify-between items-center relative z-10" role="navigation" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2" aria-label="LeadScout Home">
          <div className="p-1.5 bg-teal-400 rounded-lg text-white">
            <Zap size={16} fill="currentColor" aria-hidden="true" />
          </div>
          <span className="font-bold text-lg text-gray-800 tracking-tight">LeadScout</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-teal-500 focus:text-teal-500 focus:outline-none focus:underline transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-teal-500 focus:text-teal-500 focus:outline-none focus:underline transition-colors">How It Works</a>
          <a href="#testimonials" className="hover:text-teal-500 focus:text-teal-500 focus:outline-none focus:underline transition-colors">Testimonials</a>
          <Link href="/pricing" className="hover:text-teal-500 focus:text-teal-500 focus:outline-none focus:underline transition-colors">Pricing</Link>
          <Link href="/docs/api" className="hover:text-teal-500 focus:text-teal-500 focus:outline-none focus:underline transition-colors">API Docs</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex gap-3">
          <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 rounded-lg">Log in</Link>
          <Link href="/login" className="px-4 py-2 bg-teal-400 text-white rounded-lg font-medium hover:bg-teal-500 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2">Get Started Free</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 bg-white z-50 pt-20 px-6 animate-in slide-in-from-top duration-300"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} aria-hidden="true" />
          </button>
          <nav className="flex flex-col gap-6 text-lg font-medium" aria-label="Mobile menu">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-gray-800 hover:text-teal-500 py-2 border-b border-gray-100">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-gray-800 hover:text-teal-500 py-2 border-b border-gray-100">How It Works</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-gray-800 hover:text-teal-500 py-2 border-b border-gray-100">Testimonials</a>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-gray-800 hover:text-teal-500 py-2 border-b border-gray-100">Pricing</Link>
            <div className="flex flex-col gap-3 mt-4">
              <Link href="/login" className="text-center px-4 py-3 text-gray-600 border border-gray-200 rounded-xl font-medium">Log in</Link>
              <Link href="/login" className="text-center px-4 py-3 bg-teal-400 text-white rounded-xl font-medium hover:bg-teal-500">Get Started Free</Link>
            </div>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-teal-50/80 backdrop-blur-sm text-teal-600 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-teal-100">
              <Zap size={14} />
              Trusted by 500+ digital agencies worldwide
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
              Find Clients Who Need You.<br />
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">Close Deals Faster.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              LeadScout automatically discovers local businesses with underperforming websites.
              Generate professional audit reports in seconds and convert prospects into paying clients.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link href="/login" className="px-8 py-4 bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-teal-500 hover:to-teal-600 shadow-lg shadow-teal-200/50 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                Start Free Trial
                <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold text-lg hover:border-teal-400 hover:text-teal-500 transition-all">
                Watch Demo
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-4">No credit card required • Free 14-day trial</p>
          </div>

          {/* Right Column - Circuit Board Tech Animation */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="circuit-board w-full max-w-md aspect-square relative">
              {/* Main Circuit Lines - SVG with animated energy flow */}

              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none">
                {/* Base circuit lines (static, dimmer) */}
                <line x1="200" y1="200" x2="50" y2="200" stroke="#2DD4BF" strokeWidth="2" opacity="0.2" />
                <line x1="200" y1="200" x2="350" y2="200" stroke="#2DD4BF" strokeWidth="2" opacity="0.2" />
                <path d="M 200 200 L 120 200 L 80 160 L 30 160" stroke="#2DD4BF" strokeWidth="2" fill="none" opacity="0.15" />
                <path d="M 200 200 L 150 200 L 100 150 L 100 80" stroke="#2DD4BF" strokeWidth="2" fill="none" opacity="0.15" />
                <path d="M 200 200 L 280 200 L 320 160 L 370 160" stroke="#2DD4BF" strokeWidth="2" fill="none" opacity="0.15" />
                <path d="M 200 200 L 250 200 L 300 150 L 300 80" stroke="#2DD4BF" strokeWidth="2" fill="none" opacity="0.15" />
                <path d="M 200 200 L 120 200 L 80 240 L 30 240" stroke="#2DD4BF" strokeWidth="2" fill="none" opacity="0.15" />
                <path d="M 200 200 L 150 200 L 100 250 L 100 320" stroke="#2DD4BF" strokeWidth="2" fill="none" opacity="0.15" />
                <path d="M 200 200 L 280 200 L 320 240 L 370 240" stroke="#2DD4BF" strokeWidth="2" fill="none" opacity="0.15" />
                <path d="M 200 200 L 250 200 L 300 250 L 300 320" stroke="#2DD4BF" strokeWidth="2" fill="none" opacity="0.15" />
                <line x1="200" y1="200" x2="200" y2="60" stroke="#2DD4BF" strokeWidth="2" opacity="0.15" />
                <line x1="200" y1="200" x2="200" y2="340" stroke="#2DD4BF" strokeWidth="2" opacity="0.15" />

                {/* Animated energy waves - Horizontal Left */}
                <line x1="200" y1="200" x2="50" y2="200" stroke="url(#pulseGradientH)" strokeWidth="3" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 150;150 0;0 150" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" />
                </line>

                {/* Animated energy waves - Horizontal Right */}
                <line x1="200" y1="200" x2="350" y2="200" stroke="url(#pulseGradientH)" strokeWidth="3" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 150;150 0;0 150" dur="2s" repeatCount="indefinite" begin="0.5s" />
                  <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
                </line>

                {/* Animated wave - Top Left angled */}
                <path d="M 200 200 L 120 200 L 80 160 L 30 160" stroke="url(#pulseGradientH)" strokeWidth="3" fill="none" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 250;60 190;120 130;180 70;250 0" dur="2.5s" repeatCount="indefinite" begin="0.2s" />
                  <animate attributeName="opacity" values="0;1;1;1;0" dur="2.5s" repeatCount="indefinite" begin="0.2s" />
                </path>

                {/* Animated wave - Top Right angled */}
                <path d="M 200 200 L 280 200 L 320 160 L 370 160" stroke="url(#pulseGradientH)" strokeWidth="3" fill="none" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 250;60 190;120 130;180 70;250 0" dur="2.5s" repeatCount="indefinite" begin="0.7s" />
                  <animate attributeName="opacity" values="0;1;1;1;0" dur="2.5s" repeatCount="indefinite" begin="0.7s" />
                </path>

                {/* Animated wave - Bottom Left angled */}
                <path d="M 200 200 L 120 200 L 80 240 L 30 240" stroke="url(#pulseGradientH)" strokeWidth="3" fill="none" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 250;60 190;120 130;180 70;250 0" dur="2.5s" repeatCount="indefinite" begin="1.2s" />
                  <animate attributeName="opacity" values="0;1;1;1;0" dur="2.5s" repeatCount="indefinite" begin="1.2s" />
                </path>

                {/* Animated wave - Bottom Right angled */}
                <path d="M 200 200 L 280 200 L 320 240 L 370 240" stroke="url(#pulseGradientH)" strokeWidth="3" fill="none" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 250;60 190;120 130;180 70;250 0" dur="2.5s" repeatCount="indefinite" begin="1.7s" />
                  <animate attributeName="opacity" values="0;1;1;1;0" dur="2.5s" repeatCount="indefinite" begin="1.7s" />
                </path>

                {/* Animated wave - Vertical Up */}
                <line x1="200" y1="200" x2="200" y2="60" stroke="url(#pulseGradientV)" strokeWidth="3" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 140;140 0;0 140" dur="2s" repeatCount="indefinite" begin="0.3s" />
                  <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" begin="0.3s" />
                </line>

                {/* Animated wave - Vertical Down */}
                <line x1="200" y1="200" x2="200" y2="340" stroke="url(#pulseGradientV)" strokeWidth="3" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 140;140 0;0 140" dur="2s" repeatCount="indefinite" begin="0.8s" />
                  <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" begin="0.8s" />
                </line>

                {/* Animated wave - Top Left vertical branch */}
                <path d="M 200 200 L 150 200 L 100 150 L 100 80" stroke="url(#pulseGradientH)" strokeWidth="3" fill="none" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 220;55 165;110 110;165 55;220 0" dur="3s" repeatCount="indefinite" begin="0.4s" />
                  <animate attributeName="opacity" values="0;1;1;1;0" dur="3s" repeatCount="indefinite" begin="0.4s" />
                </path>

                {/* Animated wave - Top Right vertical branch */}
                <path d="M 200 200 L 250 200 L 300 150 L 300 80" stroke="url(#pulseGradientH)" strokeWidth="3" fill="none" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 220;55 165;110 110;165 55;220 0" dur="3s" repeatCount="indefinite" begin="0.9s" />
                  <animate attributeName="opacity" values="0;1;1;1;0" dur="3s" repeatCount="indefinite" begin="0.9s" />
                </path>

                {/* Animated wave - Bottom Left vertical branch */}
                <path d="M 200 200 L 150 200 L 100 250 L 100 320" stroke="url(#pulseGradientH)" strokeWidth="3" fill="none" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 220;55 165;110 110;165 55;220 0" dur="3s" repeatCount="indefinite" begin="1.4s" />
                  <animate attributeName="opacity" values="0;1;1;1;0" dur="3s" repeatCount="indefinite" begin="1.4s" />
                </path>

                {/* Animated wave - Bottom Right vertical branch */}
                <path d="M 200 200 L 250 200 L 300 250 L 300 320" stroke="url(#pulseGradientH)" strokeWidth="3" fill="none" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0 220;55 165;110 110;165 55;220 0" dur="3s" repeatCount="indefinite" begin="1.9s" />
                  <animate attributeName="opacity" values="0;1;1;1;0" dur="3s" repeatCount="indefinite" begin="1.9s" />
                </path>

                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="pulseGradientH" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0" />
                    <stop offset="30%" stopColor="#2DD4BF" stopOpacity="1" />
                    <stop offset="50%" stopColor="#5EEAD4" stopOpacity="1" />
                    <stop offset="70%" stopColor="#2DD4BF" stopOpacity="1" />
                    <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="pulseGradientV" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0" />
                    <stop offset="30%" stopColor="#2DD4BF" stopOpacity="1" />
                    <stop offset="50%" stopColor="#5EEAD4" stopOpacity="1" />
                    <stop offset="70%" stopColor="#2DD4BF" stopOpacity="1" />
                    <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
                  </linearGradient>
                  {/* Glowing filter */}
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              </svg>

              {/* Circuit Nodes */}
              <div className="circuit-node" style={{ top: '38%', left: '7%', animationDelay: '0s' }} />
              <div className="circuit-node" style={{ top: '38%', right: '7%', animationDelay: '0.5s' }} />
              <div className="circuit-node" style={{ bottom: '38%', left: '7%', animationDelay: '1s' }} />
              <div className="circuit-node" style={{ bottom: '38%', right: '7%', animationDelay: '1.5s' }} />

              {/* Ring Nodes */}
              <div className="circuit-ring" style={{ top: '17%', left: '23%', animationDelay: '0.3s' }} />
              <div className="circuit-ring" style={{ top: '17%', right: '23%', animationDelay: '0.8s' }} />
              <div className="circuit-ring" style={{ bottom: '17%', left: '23%', animationDelay: '1.3s' }} />
              <div className="circuit-ring" style={{ bottom: '17%', right: '23%', animationDelay: '1.8s' }} />
              <div className="circuit-ring" style={{ top: '12%', left: '48%', animationDelay: '0.2s' }} />
              <div className="circuit-ring" style={{ bottom: '12%', left: '48%', animationDelay: '1.2s' }} />

              {/* Floating Particles */}
              <div className="tech-particle" style={{ top: '25%', left: '15%', animationDelay: '0s' }} />
              <div className="tech-particle" style={{ top: '30%', right: '20%', animationDelay: '1s' }} />
              <div className="tech-particle" style={{ bottom: '25%', left: '20%', animationDelay: '2s' }} />
              <div className="tech-particle" style={{ bottom: '30%', right: '15%', animationDelay: '3s' }} />
              <div className="tech-particle" style={{ top: '45%', left: '10%', animationDelay: '1.5s' }} />
              <div className="tech-particle" style={{ top: '45%', right: '10%', animationDelay: '2.5s' }} />

              {/* Hexagon decorations */}
              <div className="hex-shape" style={{ top: '8%', left: '8%', animationDelay: '0s' }} />
              <div className="hex-shape" style={{ top: '8%', right: '8%', animationDelay: '2.5s', animationDirection: 'reverse' }} />
              <div className="hex-shape" style={{ bottom: '8%', left: '8%', animationDelay: '5s' }} />
              <div className="hex-shape" style={{ bottom: '8%', right: '8%', animationDelay: '7.5s', animationDirection: 'reverse' }} />

              {/* Central Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="circuit-icon-container">
                  <Zap size={56} className="text-white drop-shadow-[0_0_15px_rgba(45,212,191,0.8)]" fill="white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-500 mt-1">Leads Generated</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-500 mt-1">Agencies Trust Us</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">85%</div>
              <div className="text-sm text-gray-500 mt-1">Conversion Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">4.9/5</div>
              <div className="text-sm text-gray-500 mt-1">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Scale Your Agency</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Powerful tools designed specifically for digital marketing agencies looking to automate their lead generation.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-400 group-hover:text-white transition-colors">
              <Search size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">Smart Lead Discovery</h3>
            <p className="text-gray-600 leading-relaxed">Find businesses by location and industry using Google Places integration. Discover "Dentists in New York" or "Restaurants in LA" instantly.</p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-400 group-hover:text-white transition-colors">
              <BarChart3 size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">Automated Website Audits</h3>
            <p className="text-gray-600 leading-relaxed">Scan websites for performance issues, missing SEO elements, broken links, and mobile responsiveness problems in seconds.</p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-400 group-hover:text-white transition-colors">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">White-Label Reports</h3>
            <p className="text-gray-600 leading-relaxed">Generate professional PDF reports branded with your agency logo. Perfect for client meetings and cold outreach campaigns.</p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-400 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">Built-in CRM</h3>
            <p className="text-gray-600 leading-relaxed">Manage your leads, track status, add notes, and monitor your sales pipeline all in one place. Never lose a potential client again.</p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-400 group-hover:text-white transition-colors">
              <BarChart3 size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">Analytics Dashboard</h3>
            <p className="text-gray-600 leading-relaxed">Track your performance with detailed analytics. Monitor leads, conversion rates, and revenue potential at a glance.</p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-400 group-hover:text-white transition-colors">
              <Shield size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">API Access</h3>
            <p className="text-gray-600 leading-relaxed">Integrate LeadScout with your existing tools using our REST API. Automate your workflow and scale your operations.</p>
          </div>
        </div>

        {/* Coming Soon Feature Highlight */}
        <div className="mt-12 p-8 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl border border-purple-100 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
              COMING SOON
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-2xl mb-2 text-gray-900">AI Auto-Call Handling</h3>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                Let AI make outbound calls to your leads for qualification, follow-up, and appointment scheduling.
                Our intelligent voice agents will help you convert more prospects while you focus on closing deals.
              </p>
              <p className="text-purple-600 font-medium mt-4">Available exclusively for Enterprise customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How LeadScout Works</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Three simple steps to start generating qualified leads for your agency.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-400 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="font-bold text-xl mb-3 text-white">Search for Businesses</h3>
              <p className="text-gray-400">Enter a business type and location. LeadScout searches Google Places to find real businesses in your target area.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-400 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="font-bold text-xl mb-3 text-white">Run Website Audits</h3>
              <p className="text-gray-400">With one click, scan their website for issues like slow loading, missing SSL, poor mobile experience, and SEO problems.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-400 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="font-bold text-xl mb-3 text-white">Close the Deal</h3>
              <p className="text-gray-400">Download a professional audit report, share it with the prospect, and show them exactly how you can help their business.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by Agencies Worldwide</h2>
          <p className="text-lg text-gray-500">See what our customers have to say about LeadScout.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">&quot;LeadScout has completely transformed how we find clients. We went from 5 leads per week to 50+. The audit reports are incredibly professional.&quot;</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold">JD</div>
              <div>
                <div className="font-bold text-gray-800">James Davis</div>
                <div className="text-sm text-gray-500">CEO, Digital Growth Agency</div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">&quot;The white-label reports are a game changer. Clients are impressed before we even get on a call. Our close rate has increased by 40%.&quot;</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">SM</div>
              <div>
                <div className="font-bold text-gray-800">Sarah Mitchell</div>
                <div className="text-sm text-gray-500">Founder, WebPro Solutions</div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">&quot;Best investment we made this year. The API integration lets us automate our entire lead generation process. Saves us hours every week.&quot;</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">RK</div>
              <div>
                <div className="font-bold text-gray-800">Raj Kumar</div>
                <div className="text-sm text-gray-500">Director, TechScale Marketing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-400 to-teal-500 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Grow Your Agency?</h2>
          <p className="text-lg text-teal-50 mb-8 max-w-2xl mx-auto">Join 500+ agencies using LeadScout to automate their lead generation. Start your free trial today.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login" className="px-8 py-4 bg-white text-teal-600 rounded-xl font-bold text-lg hover:bg-gray-50 shadow-lg transition-all flex items-center justify-center gap-2">
              Start Free Trial
              <ArrowRight size={18} />
            </Link>
            <Link href="/pricing" className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 transition-all">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-teal-400 rounded-lg text-white">
                  <Zap size={16} fill="currentColor" />
                </div>
                <span className="font-bold text-lg text-white">LeadScout</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">Automate your agency&apos;s lead generation with smart discovery, instant audits, and professional reports.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-teal-400 transition-colors">Features</a></li>
                <li><Link href="/pricing" className="hover:text-teal-400 transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/privacy-policy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2026 LeadScout Inc. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-teal-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-teal-400 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-teal-400 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
