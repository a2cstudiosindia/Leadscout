import { NextRequest, NextResponse } from 'next/server';
import { processNextJob } from '@/lib/job-queue';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let processed = 0;
    const maxJobs = 5;

    for (let i = 0; i < maxJobs; i++) {
        const didProcess = await processNextJob();
        if (!didProcess) break;
        processed++;
    }

    return NextResponse.json({ success: true, processed });
}
