'use client'

import { useChat } from '@ai-sdk/react'
import { Sparkles, Send, Code, User, Loader2, Cpu } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

// --- SMOOTH TYPEWRITER COMPONENT ---
// This component trickles the text out at a controlled pace even if the stream is fast.
function SmoothStream({ text, isStreaming }: { text: string, isStreaming: boolean }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // If the incoming text is ahead of what we're showing, start trickling
    if (text.length > displayedText.length) {
      if (timerRef.current) return; // Already trickling

      const trickle = () => {
        setDisplayedText(prev => {
          const nextChar = text[prev.length];
          if (nextChar === undefined) {
            timerRef.current = null;
            return prev;
          }
          
          // Speed control: adjust this for "elegance"
          // We take more than one char if we are far behind to keep it "smooth" but not too slow
          const gap = text.length - prev.length;
          const charsToAdd = gap > 20 ? 3 : 1; 
          
          const nextChunk = text.slice(prev.length, prev.length + charsToAdd);
          
          timerRef.current = setTimeout(trickle, 25); // 25ms per step
          return prev + nextChunk;
        });
      };

      trickle();
    } else if (!isStreaming && text.length === displayedText.length) {
      // Stream finished and we've caught up
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [text, displayedText, isStreaming]);

  // If it's not a stream (e.g. an old message), just show it immediately
  const finalContent = isStreaming ? displayedText : text;

  return (
    <div className="markdown-content">
      <ReactMarkdown>{finalContent}</ReactMarkdown>
    </div>
  );
}

export default function ChatTerminal() {
  const { messages, sendMessage, error, status } = useChat()
  const [text, setText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  const quickPrompts = [
    { label: "Who is Uday?", prompt: "Give me a professional summary of Uday Raj and his background." },
    { label: "Tell me about your projects", prompt: "What are your most significant engineering projects?" },
    { label: "Why hire him?", prompt: "What makes Uday a strong candidate for an AI or Software Engineering role?" },
  ]

  const handleSend = (content: string) => {
    if (!content.trim() || isLoading) return
    sendMessage({ text: content })
  }

  const getMessageText = (message: any) => {
    return message.parts
      ?.filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('\n') || '';
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '850px',
      height: '80vh',
      background: 'rgba(5, 10, 15, 0.85)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(0, 240, 255, 0.2)',
      borderRadius: '24px',
      display: 'flex',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 240, 255, 0.05)',
      overflow: 'hidden',
      pointerEvents: 'auto',
      flexDirection: 'column',
      transition: 'all 0.3s ease'
    }}>
      {/* Premium Header */}
      <div style={{
        padding: '1.2rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.1), transparent)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#00f0ff',
            boxShadow: '0 0 10px #00f0ff'
          }} />
          <h2 style={{ 
            fontSize: '1.1rem', 
            margin: 0, 
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: '#fff',
          }}>
            Uday Raj <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, marginLeft: '5px' }}>| Digital Assistant</span>
          </h2>
        </div>
        <Sparkles size={18} color="#00f0ff" opacity={0.6} />
      </div>

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem', animation: 'fadeIn 1s ease' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'rgba(0, 240, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '1px solid rgba(0, 240, 255, 0.3)'
            }}>
              <Cpu size={32} color="#00f0ff" />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Hi! I'm Uday's AI companion.</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: '450px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
              I'm here to help you explore Uday's professional journey, technical expertise, and core engineering projects.
            </p>
            
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {quickPrompts.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.prompt)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: 'auto'
                  }}
                  onMouseOver={(e) => { 
                    e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)'; 
                    e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => { 
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; 
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, index) => {
          const content = getMessageText(m);
          // Only use typewriter for the very last message while it's loading
          const isLatestLoading = index === messages.length - 1 && status === 'streaming';
          
          return (
            <div key={index} style={{
              display: 'flex',
              gap: '1.2rem',
              alignItems: 'flex-start',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: m.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0, 240, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: m.role !== 'user' ? '1px solid rgba(0, 240, 255, 0.3)' : 'none',
                flexShrink: 0
              }}>
                {m.role === 'user' ? <User size={18} color="#fff" /> : <Code size={18} color="#00f0ff" />}
              </div>
              <div style={{
                maxWidth: '75%',
                background: m.role === 'user' ? '#00f0ff' : 'rgba(255, 255, 255, 0.04)',
                color: m.role === 'user' ? '#000' : '#fff',
                padding: '1rem 1.2rem',
                borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                lineHeight: 1.6,
                fontSize: '1rem',
                boxShadow: m.role === 'user' ? '0 4px 15px rgba(0, 240, 255, 0.3)' : 'none'
              }}>
                {m.role === 'user' ? (
                  content
                ) : (
                  <SmoothStream text={content} isStreaming={isLatestLoading} />
                )}
              </div>
            </div>
          );
        })}
        
        {status === 'submitted' && (
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'rgba(0, 240, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 240, 255, 0.2)'
            }}>
              <Loader2 size={18} className="animate-spin" color="#00f0ff" />
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              Thinking...
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(255, 50, 50, 0.1)',
            border: '1px solid rgba(255, 50, 50, 0.3)',
            color: '#ff8888',
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            Something went wrong. Let me try re-connecting.
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.5rem 2rem 2rem', background: 'rgba(0,0,0,0.2)' }}>
        <form onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim() || isLoading) return
          handleSend(text)
          setText('')
        }} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '1.2rem 4rem 1.2rem 1.5rem',
              borderRadius: '18px',
              color: '#fff',
              fontFamily: 'inherit',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.5)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            style={{
              position: 'absolute',
              right: '0.8rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: text.trim() && !isLoading ? '#00f0ff' : 'transparent',
              border: 'none',
              color: text.trim() && !isLoading ? '#000' : 'rgba(255,255,255,0.2)',
              cursor: text.trim() && !isLoading ? 'pointer' : 'default',
              padding: '0.7rem',
              borderRadius: '12px',
              display: 'flex',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  )
}
