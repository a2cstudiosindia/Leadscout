import { createAdminClient } from '@/lib/supabase/admin';
import { Scanner } from '@/lib/scanner';
import { ScanReport } from '@/lib/scanner/types';
import { incrementUsage, trackEvent } from '@/lib/subscription';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ScanJob {
    id: string;
    user_id: string;
    url: string;
    lead_id: string | null;
    status: JobStatus;
    result_data: ScanReport | null;
    error_message: string | null;
    created_at: string;
    completed_at: string | null;
}

async function executeScan(url: string): Promise<ScanReport> {
    const scannerApiUrl = process.env.SCANNER_API_URL;

    if (scannerApiUrl) {
        const response = await fetch(`${scannerApiUrl}/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Scanner API error');
        }
        return data.report;
    }

    const scanner = new Scanner();
    try {
        return await scanner.scan(url);
    } finally {
        await scanner.close();
    }
}

export async function enqueueJob(userId: string, url: string, leadId?: string): Promise<string> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('scan_jobs')
        .insert({
            user_id: userId,
            url,
            lead_id: leadId || null,
            status: 'queued',
        })
        .select('id')
        .single();

    if (error || !data) {
        throw new Error('Failed to enqueue scan job');
    }

    return data.id;
}

export async function getJob(jobId: string, userId?: string): Promise<ScanJob | null> {
    const supabase = createAdminClient();
    let query = supabase.from('scan_jobs').select('*').eq('id', jobId);

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data } = await query.single();
    return data as ScanJob | null;
}

export async function getUserJobs(userId: string, limit = 20): Promise<ScanJob[]> {
    const supabase = createAdminClient();

    const { data } = await supabase
        .from('scan_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    return (data || []) as ScanJob[];
}

export async function processNextJob(): Promise<boolean> {
    const supabase = createAdminClient();

    const { data: jobs } = await supabase
        .from('scan_jobs')
        .select('*')
        .eq('status', 'queued')
        .order('created_at', { ascending: true })
        .limit(1);

    const job = jobs?.[0] as ScanJob | undefined;
    if (!job) return false;

    await supabase
        .from('scan_jobs')
        .update({ status: 'running' })
        .eq('id', job.id);

    try {
        const report = await executeScan(job.url);

        await supabase
            .from('scan_jobs')
            .update({
                status: 'completed',
                result_data: report,
                completed_at: new Date().toISOString(),
            })
            .eq('id', job.id);

        await incrementUsage('audits');
        await trackEvent('audit_run', { url: job.url, score: report.overallScore, jobId: job.id });

        if (job.lead_id) {
            await supabase.from('reports').insert({
                lead_id: job.lead_id,
                overall_score: report.overallScore,
                scan_data: report,
            });
            await supabase.from('leads').update({ status: 'audited' }).eq('id', job.lead_id);
        }

        return true;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Scan failed';
        await supabase
            .from('scan_jobs')
            .update({
                status: 'failed',
                error_message: message,
                completed_at: new Date().toISOString(),
            })
            .eq('id', job.id);
        return true;
    }
}

export async function processJobById(jobId: string): Promise<void> {
    const supabase = createAdminClient();
    const job = await getJob(jobId);
    if (!job || job.status !== 'queued') return;

    await supabase.from('scan_jobs').update({ status: 'running' }).eq('id', jobId);

    try {
        const report = await executeScan(job.url);

        await supabase
            .from('scan_jobs')
            .update({
                status: 'completed',
                result_data: report,
                completed_at: new Date().toISOString(),
            })
            .eq('id', jobId);

        await incrementUsage('audits');
        await trackEvent('audit_run', { url: job.url, score: report.overallScore, jobId });

        if (job.lead_id) {
            await supabase.from('reports').insert({
                lead_id: job.lead_id,
                overall_score: report.overallScore,
                scan_data: report,
            });
            await supabase.from('leads').update({ status: 'audited' }).eq('id', job.lead_id);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Scan failed';
        await supabase
            .from('scan_jobs')
            .update({
                status: 'failed',
                error_message: message,
                completed_at: new Date().toISOString(),
            })
            .eq('id', jobId);
    }
}
