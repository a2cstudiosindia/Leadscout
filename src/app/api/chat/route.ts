import { NextRequest, NextResponse } from 'next/server';
import { LEADSCOUT_KNOWLEDGE_BASE, SYSTEM_PROMPT } from '@/lib/knowledge-base';

// Rate limiting - simple in-memory store (resets on server restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT) {
        return false;
    }

    record.count++;
    return true;
}

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'anonymous';

        // Check rate limit
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        const { message, history = [] } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Check for API key (OpenRouter)
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenRouter API key not configured' },
                { status: 500 }
            );
        }

        // Build messages array for OpenRouter API (OpenAI-compatible)
        const messages = [
            {
                role: 'system',
                content: `${SYSTEM_PROMPT}\n\nKnowledge Base:\n${LEADSCOUT_KNOWLEDGE_BASE}`
            },
            // Include conversation history
            ...history.map((msg: { role: string; content: string }) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            // Current user message
            {
                role: 'user',
                content: message
            }
        ];

        // Call OpenRouter API (using free deepseek model)
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://leadscout.app',
                'X-Title': 'LeadScout Chatbot',
            },
            body: JSON.stringify({
                model: 'mistralai/devstral-2512:free',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter API error:', errorData);
            return NextResponse.json(
                { error: 'Failed to get response from AI' },
                { status: 500 }
            );
        }

        const data = await response.json();

        // Extract the response text
        const aiResponse = data.choices?.[0]?.message?.content ||
            'Sorry, I could not generate a response. Please try again.';

        return NextResponse.json({ response: aiResponse });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'An error occurred processing your request' },
            { status: 500 }
        );
    }
}

