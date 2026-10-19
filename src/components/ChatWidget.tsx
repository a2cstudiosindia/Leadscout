'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

// Function to parse markdown and render as React elements
function formatMessage(text: string) {
    // Split by lines to handle lists
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let isNumberedList = false;

    const processLine = (line: string, index: number) => {
        // Check for numbered list
        const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
        if (numberedMatch) {
            if (!isNumberedList && listItems.length > 0) {
                // End previous bullet list
                elements.push(<ul key={`ul-${index}`} className="list-disc pl-4 my-1">{listItems.map((item, i) => <li key={i}>{formatInline(item)}</li>)}</ul>);
                listItems = [];
            }
            isNumberedList = true;
            listItems.push(numberedMatch[2]);
            return;
        }

        // Check for bullet list
        const bulletMatch = line.match(/^[-•]\s+(.+)$/);
        if (bulletMatch) {
            if (isNumberedList && listItems.length > 0) {
                // End previous numbered list
                elements.push(<ol key={`ol-${index}`} className="list-decimal pl-4 my-1">{listItems.map((item, i) => <li key={i}>{formatInline(item)}</li>)}</ol>);
                listItems = [];
            }
            isNumberedList = false;
            listItems.push(bulletMatch[1]);
            return;
        }

        // End any pending list
        if (listItems.length > 0) {
            if (isNumberedList) {
                elements.push(<ol key={`ol-${index}`} className="list-decimal pl-4 my-1">{listItems.map((item, i) => <li key={i}>{formatInline(item)}</li>)}</ol>);
            } else {
                elements.push(<ul key={`ul-${index}`} className="list-disc pl-4 my-1">{listItems.map((item, i) => <li key={i}>{formatInline(item)}</li>)}</ul>);
            }
            listItems = [];
            isNumberedList = false;
        }

        // Regular paragraph
        if (line.trim()) {
            elements.push(<p key={`p-${index}`} className="my-1">{formatInline(line)}</p>);
        } else if (index > 0 && index < lines.length - 1) {
            elements.push(<br key={`br-${index}`} />);
        }
    };

    lines.forEach(processLine);

    // Handle any remaining list items
    if (listItems.length > 0) {
        if (isNumberedList) {
            elements.push(<ol key="ol-end" className="list-decimal pl-4 my-1">{listItems.map((item, i) => <li key={i}>{formatInline(item)}</li>)}</ol>);
        } else {
            elements.push(<ul key="ul-end" className="list-disc pl-4 my-1">{listItems.map((item, i) => <li key={i}>{formatInline(item)}</li>)}</ul>);
        }
    }

    return <>{elements}</>;
}

// Format inline markdown (bold, italic)
function formatInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Match **bold** and *italic*
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        if (match[2]) {
            // Bold: **text**
            parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>);
        } else if (match[3]) {
            // Italic: *text*
            parts.push(<em key={match.index}>{match[3]}</em>);
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hello! I am LeadScout\'s assistant. How can I help with your lead prospecting, audits, or agency workflow today?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(-6) // Send last 6 messages for context
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again later.'
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[var(--neutral-900)] hover:bg-black text-white shadow-md transition-all duration-200 hover:scale-105 flex items-center justify-center group border border-white/10"
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? (
                    <X className="w-5 h-5" />
                ) : (
                    <>
                        <MessageCircle className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--brand-500)] rounded-full animate-pulse" />
                    </>
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[480px] max-h-[calc(100vh-120px)] bg-[var(--surface)] rounded-[var(--r-xl)] shadow-lg flex flex-col overflow-hidden border border-[var(--border)] animate-fade-in">
                    {/* Header */}
                    <div className="bg-[var(--neutral-950)] px-4 py-3 flex items-center gap-3 border-b border-[var(--sidebar-border)]">
                        <div className="w-8 h-8 rounded-[var(--r-md)] bg-[var(--brand-500)] flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white text-xs font-semibold">LeadScout AI Assistant</h3>
                            <p className="text-white/60 text-[11px]">Agency prospecting & workflow guidance</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--canvas)]">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${message.role === 'user'
                                        ? 'bg-[var(--neutral-900)] text-white'
                                        : 'bg-[var(--brand-50)] text-[var(--brand-600)] border border-[var(--border)]'
                                        }`}
                                >
                                    {message.role === 'user' ? (
                                        <User className="w-3.5 h-3.5 text-white" />
                                    ) : (
                                        <Bot className="w-3.5 h-3.5" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[78%] px-3.5 py-2 rounded-[var(--r-md)] text-xs leading-relaxed ${message.role === 'user'
                                        ? 'bg-[var(--neutral-900)] text-white'
                                        : 'bg-[var(--surface)] text-[var(--ink-primary)] shadow-xs border border-[var(--border)]'
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap chat-message">
                                        {formatMessage(message.content)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="flex gap-2">
                                <div className="w-7 h-7 rounded-full bg-[var(--brand-50)] text-[var(--brand-600)] border border-[var(--border)] flex items-center justify-center">
                                    <Bot className="w-3.5 h-3.5" />
                                </div>
                                <div className="bg-[var(--surface)] px-3.5 py-2 rounded-[var(--r-md)] border border-[var(--border)] shadow-xs">
                                    <div className="flex gap-1 py-1">
                                        <span className="w-1.5 h-1.5 bg-[var(--ink-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-[var(--ink-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-[var(--ink-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-[var(--surface)] border-t border-[var(--border)]">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask a question..."
                                className="input flex-1 text-xs py-2"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="btn btn-primary btn-sm flex items-center gap-1.5"
                                aria-label="Send message"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-3.5 h-3.5" />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            Powered by AI • Responses may not always be accurate
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
