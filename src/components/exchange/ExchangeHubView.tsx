"use client";

import { useState, useEffect } from "react";
import { getExchangeListings, createExchangeListing, claimExchangeListing } from "@/app/hub-actions";
import { ExchangeCategory, DealType } from "@/lib/database.types";
import { 
    Globe2, 
    Plus, 
    DollarSign, 
    Tag, 
    MapPin, 
    CheckCircle2, 
    Clock, 
    ArrowRight, 
    Sparkles, 
    Search, 
    Share2, 
    Mail, 
    ShieldCheck, 
    Layers, 
    Users, 
    Send,
    HelpCircle,
    Lock,
    X,
    Briefcase
} from "lucide-react";
import toast from "react-hot-toast";

interface Listing {
    id: string;
    creator_id: string;
    title: string;
    category: ExchangeCategory;
    description: string;
    budget_range?: string | null;
    location?: string | null;
    deal_type: DealType;
    bounty_amount?: number | null;
    commission_percentage?: number | null;
    status: 'open' | 'in_progress' | 'claimed' | 'closed';
    claimed_by?: string | null;
    contact_email?: string | null;
    created_at: string;
}

const CATEGORIES: { id: string; label: string }[] = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'web_dev', label: 'Web Design & Dev' },
    { id: 'seo', label: 'SEO & Content' },
    { id: 'ads', label: 'PPC & Paid Ads' },
    { id: 'ecommerce', label: 'Shopify / E-Commerce' },
    { id: 'app_dev', label: 'Mobile / SaaS Dev' },
    { id: 'other', label: 'Other Services' },
];

export default function ExchangeHubView() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showPostModal, setShowPostModal] = useState(false);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [claimedModal, setClaimedModal] = useState<{ title: string; email: string } | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        category: "web_dev" as ExchangeCategory,
        description: "",
        budget_range: "$2,000 - $5,000",
        location: "United States (Remote)",
        deal_type: "referral_commission" as DealType,
        bounty_amount: 100,
        commission_percentage: 10,
        contact_email: "",
    });

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await getExchangeListings(selectedCategory);
            if (res.success && res.listings) {
                setListings(res.listings as any);
            }
        } catch (e) {
            console.error("Fetch listings error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [selectedCategory]);

    const handleCreateListing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.description.trim()) {
            toast.error("Please fill in title and description");
            return;
        }

        try {
            const res = await createExchangeListing({
                ...formData,
                bounty_amount: Number(formData.bounty_amount) || 0,
                commission_percentage: Number(formData.commission_percentage) || 10,
            });

            if (res.success) {
                toast.success("Opportunity posted to the Exchange!");
                setShowPostModal(false);
                setFormData({
                    title: "",
                    category: "web_dev",
                    description: "",
                    budget_range: "$2,000 - $5,000",
                    location: "United States (Remote)",
                    deal_type: "referral_commission",
                    bounty_amount: 100,
                    commission_percentage: 10,
                    contact_email: "",
                });
                fetchListings();
            } else {
                toast.error(res.error || "Failed to post listing");
            }
        } catch (err: any) {
            toast.error(err.message || "Error posting listing");
        }
    };

    const handleClaim = async (listing: Listing) => {
        setClaimingId(listing.id);
        try {
            const res = await claimExchangeListing(listing.id);
            if (res.success) {
                toast.success("Opportunity claimed successfully!");
                setClaimedModal({
                    title: res.title || listing.title,
                    email: res.contactEmail || "partner@agency.com",
                });
                fetchListings();
            } else {
                toast.error(res.error || "Could not claim listing");
            }
        } catch (e: any) {
            toast.error("Error claiming listing");
        } finally {
            setClaimingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink-primary)] flex items-center gap-2.5">
                        <Globe2 className="w-6 h-6 text-[var(--brand-500)]" />
                        B2B Deal & Client Exchange
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--ink-tertiary)] mt-1">
                        Turn out-of-scope leads into referral revenue, and claim pre-vetted client deals from verified agencies.
                    </p>
                </div>

                <button
                    onClick={() => setShowPostModal(true)}
                    className="btn btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    <span>Post Client Opportunity</span>
                </button>
            </div>

            {/* How It Works Explainer Card */}
            <div className="card p-5 border border-[var(--border)] bg-[var(--surface)] shadow-xs relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--brand-600)] uppercase tracking-wider">
                            <Briefcase className="w-3.5 h-3.5" />
                            Agency Referral Network
                        </div>
                        <h2 className="text-sm sm:text-base font-semibold text-[var(--ink-primary)]">
                            Monetize leads outside your niche and claim ready-to-close projects
                        </h2>
                        <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                            When prospects request services you don&apos;t offer (like Shopify or Paid Ads), post them here instead of letting them bounce. Earn a structured 10% referral commission upon closing.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-[var(--ink-secondary)] border-t md:border-t-0 md:border-l border-[var(--border)] pt-3 md:pt-0 md:pl-6 shrink-0">
                        <div>
                            <span className="block font-bold text-sm text-[var(--ink-primary)] tabular-nums">10%</span>
                            <span className="text-[11px] text-[var(--ink-tertiary)]">Standard Referral</span>
                        </div>
                        <div>
                            <span className="block font-bold text-sm text-[var(--ink-primary)] tabular-nums">100%</span>
                            <span className="text-[11px] text-[var(--ink-tertiary)]">Verified Agencies</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-[var(--r-md)] transition-all whitespace-nowrap shrink-0 ${
                            selectedCategory === cat.id
                                ? 'bg-[var(--brand-500)] text-white shadow-xs font-semibold'
                                : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--ink-secondary)] hover:bg-[var(--neutral-100)]'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Opportunity Listings Grid */}
            {loading ? (
                <div className="py-20 text-center text-xs font-medium text-[var(--ink-muted)]">
                    Loading Exchange Network Opportunities...
                </div>
            ) : listings.length === 0 ? (
                <div className="card p-12 text-center border-dashed border-[var(--border-strong)] space-y-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand-50)] text-[var(--brand-500)] mx-auto flex items-center justify-center">
                        <Globe2 className="w-5 h-5" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                        <h3 className="font-semibold text-[var(--ink-primary)] text-sm">No Opportunities in this Category</h3>
                        <p className="text-xs text-[var(--ink-tertiary)]">
                            Be the first to post an out-of-scope lead or client request to monetize referrals in your network.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowPostModal(true)}
                        className="btn btn-primary"
                    >
                        Post First Opportunity
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {listings.map((item) => (
                        <div
                            key={item.id}
                            className="card p-4 flex flex-col justify-between hover:border-[var(--border-strong)] hover:shadow-sm transition-all space-y-3"
                        >
                            <div className="space-y-2.5">
                                {/* Top Category & Status Badge */}
                                <div className="flex items-center justify-between">
                                    <span className="badge badge-default uppercase tracking-wider text-[10px]">
                                        {item.category.replace('_', ' ')}
                                    </span>

                                    <span className={`badge ${
                                        item.status === 'open' 
                                            ? 'badge-success' 
                                            : 'badge-default text-[var(--ink-muted)]'
                                    }`}>
                                        {item.status === 'open' ? (
                                            <>
                                                <CheckCircle2 size={11} className="text-emerald-600" />
                                                <span>Open to Claim</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock size={11} />
                                                <span>Claimed</span>
                                            </>
                                        )}
                                    </span>
                                </div>

                                <h3 className="font-semibold text-sm text-[var(--ink-primary)] leading-snug">
                                    {item.title}
                                </h3>

                                <p className="text-xs text-[var(--ink-secondary)] leading-relaxed line-clamp-3">
                                    {item.description}
                                </p>

                                {/* Metadata tags */}
                                <div className="pt-2 border-t border-[var(--border)] space-y-1 text-xs text-[var(--ink-tertiary)]">
                                    {item.budget_range && (
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Est. Budget: <strong className="text-[var(--ink-primary)] font-medium tabular-nums">{item.budget_range}</strong></span>
                                        </div>
                                    )}
                                    {item.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                                            <span>{item.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Footer: Reward & Action */}
                            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] uppercase font-semibold text-[var(--ink-muted)] block tracking-wider">Referral Terms</span>
                                    <span className="text-xs font-bold text-[var(--brand-600)] tabular-nums">
                                        {item.deal_type === 'referral_commission'
                                            ? `${item.commission_percentage || 10}% Commission`
                                            : item.deal_type === 'fixed_bounty'
                                            ? `$${item.bounty_amount} Bounty`
                                            : 'Free Share'}
                                    </span>
                                </div>

                                {item.status === 'open' ? (
                                    <button
                                        onClick={() => handleClaim(item)}
                                        disabled={claimingId === item.id}
                                        className="btn btn-primary btn-sm"
                                    >
                                        <span>Claim Deal</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                ) : (
                                    <span className="text-xs text-[var(--ink-muted)] italic">
                                        Claimed by Partner
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Post Opportunity Modal */}
            {showPostModal && (
                <div className="modal-backdrop">
                    <div className="modal-content max-w-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-[var(--brand-50)] text-[var(--brand-600)] rounded-[var(--r-md)]">
                                    <Globe2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--ink-primary)] text-sm">Post to Deal Exchange</h3>
                                    <p className="text-xs text-[var(--ink-tertiary)]">Monetize unserviced leads with trusted agency partners</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPostModal(false)}
                                className="text-[var(--ink-muted)] hover:text-[var(--ink-primary)] p-1 rounded-[var(--r-sm)] transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateListing} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                    Opportunity Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Local Clinic looking for custom Shopify Store"
                                    className="input"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                        Service Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                                        className="select"
                                    >
                                        <option value="web_dev">Web Design & Dev</option>
                                        <option value="seo">SEO & Content</option>
                                        <option value="ads">PPC & Paid Ads</option>
                                        <option value="ecommerce">Shopify / E-Commerce</option>
                                        <option value="app_dev">Mobile / SaaS Dev</option>
                                        <option value="other">Other Services</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                        Estimated Budget
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.budget_range}
                                        onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                                        placeholder="e.g. $3,000 - $6,000"
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                    Lead Details & Requirements *
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Client requested custom checkout integration and local inventory sync. We only do web design so passing this to an e-commerce specialist..."
                                    className="input"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                        Referral Terms
                                    </label>
                                    <select
                                        value={formData.deal_type}
                                        onChange={(e: any) => setFormData({ ...formData, deal_type: e.target.value })}
                                        className="select"
                                    >
                                        <option value="referral_commission">10% Referral Commission on Close</option>
                                        <option value="fixed_bounty">Fixed Upfront Bounty ($)</option>
                                        <option value="free_share">Free Community Share</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1">
                                        Your Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.contact_email}
                                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                        placeholder="partner@youragency.com"
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPostModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Publish Opportunity
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Claimed Modal - Partner Contact Reveal */}
            {claimedModal && (
                <div className="modal-backdrop">
                    <div className="modal-content max-w-md text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--success-50)] text-emerald-600 mx-auto flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-[var(--ink-primary)] text-sm">Deal Claimed Successfully</h3>
                            <p className="text-xs text-[var(--ink-tertiary)]">{claimedModal.title}</p>
                        </div>

                        <div className="card p-3 bg-[var(--canvas)] border border-[var(--border)] text-xs text-[var(--ink-secondary)] space-y-1">
                            <span className="text-[11px] text-[var(--ink-muted)] block">Direct Partner Contact:</span>
                            <a 
                                href={`mailto:${claimedModal.email}?subject=LeadScout Exchange: Inquiring about ${claimedModal.title}`}
                                className="font-mono font-medium text-[var(--brand-600)] hover:underline text-xs block"
                            >
                                {claimedModal.email}
                            </a>
                        </div>

                        <p className="text-[11px] text-[var(--ink-tertiary)]">
                            Reach out to finalize client introduction and referral agreement.
                        </p>

                        <button
                            onClick={() => setClaimedModal(null)}
                            className="btn btn-primary w-full"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
