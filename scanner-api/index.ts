import express from 'express';
import cors from 'cors';
import { Scanner } from './lib/scanner';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main scan endpoint
app.post('/scan', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, error: 'URL is required' });
    }

    // Validate URL format
    try {
        new URL(url);
    } catch {
        return res.status(400).json({ success: false, error: 'Invalid URL format' });
    }

    console.log(`[SCAN] Starting scan for: ${url}`);
    const startTime = Date.now();

    const scanner = new Scanner();
    try {
        const report = await scanner.scan(url);
        await scanner.close();

        const duration = Date.now() - startTime;
        console.log(`[SCAN] Completed in ${duration}ms - Score: ${report.overallScore}`);

        return res.json({ success: true, report });
    } catch (error: any) {
        console.error('[SCAN] Error:', error);
        await scanner.close();
        return res.status(500).json({ success: false, error: error.message || 'Scan failed' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Scanner API running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Scan:   POST http://localhost:${PORT}/scan`);
});
