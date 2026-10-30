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
            content: "Hello! I am LeadScout's AI assistant. How can I help with your lead prospecting, audits, or agency workflow today?"
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
                className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-zinc-900 hover:bg-black text-white shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center group border border-zinc-700"
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? (
                    <X className="w-5 h-5" />
                ) : (
                    <>
                        <MessageCircle className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-zinc-400 rounded-full animate-pulse" />
                    </>
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[480px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 animate-fade-in">
                    {/* Header */}
                    <div className="bg-zinc-900 px-4 py-3 flex items-center gap-3 border-b border-zinc-800">
                        <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white text-xs font-semibold">LeadScout AI Assistant</h3>
                            <p className="text-zinc-400 text-[11px]">Agency prospecting & workflow guidance</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                                        message.role === 'user'
                                            ? 'bg-zinc-900 text-white'
                                            : 'bg-white text-zinc-900 border border-zinc-200'
                                    }`}
                                >
                                    {message.role === 'user' ? (
                                        <User className="w-3.5 h-3.5 text-white" />
                                    ) : (
                                        <Bot className="w-3.5 h-3.5" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[78%] px-3.5 py-2 rounded-xl text-xs leading-relaxed ${
                                        message.role === 'user'
                                            ? 'bg-zinc-900 text-white'
                                            : 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
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
                                <div className="w-7 h-7 rounded-full bg-white text-zinc-900 border border-zinc-200 flex items-center justify-center">
                                    <Bot className="w-3.5 h-3.5" />
                                </div>
                                <div className="bg-white px-3.5 py-2 rounded-xl border border-zinc-200 shadow-xs">
                                    <div className="flex gap-1 py-1">
                                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-zinc-200">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask a question..."
                                className="flex-1 px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
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
