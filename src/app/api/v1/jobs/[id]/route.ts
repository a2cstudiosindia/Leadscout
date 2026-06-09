import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, ApiContext } from '@/lib/api-middleware';
import { getJob } from '@/lib/job-queue';

export const GET = withApiAuth(async (
    _req: NextRequest,
    context: ApiContext,
    routeContext: { params: Promise<{ id: string }> }
) => {
    const { id: jobId } = await routeContext.params;

    if (!jobId) {
        return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    const job = await getJob(jobId, context.userId);
    if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        data: {
            id: job.id,
            url: job.url,
            leadId: job.lead_id,
            status: job.status,
            report: job.result_data,
            error: job.error_message,
            createdAt: job.created_at,
            completedAt: job.completed_at,
        },
    });
}, { action: 'api' });
