import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, ApiContext } from '@/lib/api-middleware';
import { getUserJobs } from '@/lib/job-queue';

export const GET = withApiAuth(async (_req: NextRequest, context: ApiContext) => {
    const jobs = await getUserJobs(context.userId, 50);

    return NextResponse.json({
        success: true,
        data: jobs.map((job) => ({
            id: job.id,
            url: job.url,
            leadId: job.lead_id,
            status: job.status,
            report: job.result_data,
            error: job.error_message,
            createdAt: job.created_at,
            completedAt: job.completed_at,
        })),
    });
}, { action: 'api' });
