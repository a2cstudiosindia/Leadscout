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
            content: 'Hi! 👋 I\'m LeadScout\'s AI assistant. How can I help you today?'
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
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center group"
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <MessageCircle className="w-6 h-6" />
                        {/* Pulse animation */}
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                    </>
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold">LeadScout Assistant</h3>
                            <p className="text-white/80 text-xs">Ask me anything about LeadScout</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                        ? 'bg-teal-500'
                                        : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                                        }`}
                                >
                                    {message.role === 'user' ? (
                                        <User className="w-4 h-4 text-white" />
                                    ) : (
                                        <Bot className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${message.role === 'user'
                                        ? 'bg-teal-500 text-white rounded-br-md'
                                        : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                                        }`}
                                >
                                    <div className="text-sm whitespace-pre-wrap chat-message">
                                        {formatMessage(message.content)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white flex items-center justify-center hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Send message"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
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
