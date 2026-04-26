'use client'

import { useChat } from '@ai-sdk/react'
import { Sparkles, Send, Code, User, Loader2, Info, Activity, Database } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

// --- ELEGANT TYPEWRITER ---
function SmoothStream({ text, isStreaming }: { text: string, isStreaming: boolean }) {
  const [displayedText, setDisplayedText] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (text.length > displayedText.length) {
      if (timerRef.current) return;
      const trickle = () => {
        setDisplayedText(prev => {
          const nextPart = text.slice(prev.length);
          if (!nextPart) { timerRef.current = null; return prev; }
          const match = nextPart.match(/^(\s*\S+)/);
          const chunk = match ? match[0] : nextPart.slice(0, 1);
          timerRef.current = setTimeout(trickle, 60); 
          return prev + chunk;
        });
      };
      trickle();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = null; };
  }, [text, displayedText.length]);

  const finalContent = isStreaming ? displayedText : text;
  return (
    <div className="markdown-content prose prose-invert max-w-none">
      <ReactMarkdown>{finalContent}</ReactMarkdown>
      <style jsx global>{`
        .markdown-content p { margin-bottom: 1rem; line-height: 1.7; }
        .markdown-content strong { color: #00f0ff; text-shadow: 0 0 10px rgba(0, 240, 255, 0.3); }
      `}</style>
    </div>
  );
}

export default function ChatTerminal() {
  const { messages, sendMessage, error, status } = useChat()
  const [text, setText] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') {
      const scrollContainer = containerRef.current;
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages, status]);

  const quickPrompts = [
    { label: "Tell me about Uday", prompt: "Give me a summary of Uday Raj and his background." },
    { label: "Check his best work", prompt: "Show me Uday's most significant technical projects." },
    { label: "Why hire him?", prompt: "What makes Uday a strong candidate for an AI or Engineering role?" },
  ]

  const handleSend = (content: string) => {
    if (!content.trim() || isLoading) return
    sendMessage({ text: content })
  }

  const getMessageText = (message: any) => {
    return message.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n') || '';
  }

  return (
    <div style={{
      width: '100%', maxWidth: '900px', height: '85vh',
      background: 'linear-gradient(145deg, rgba(5, 10, 20, 0.9), rgba(2, 5, 12, 0.95))',
      backdropFilter: 'blur(30px)', border: '1px solid rgba(0, 240, 255, 0.15)',
      borderRadius: '32px', display: 'flex', boxShadow: '0 40px 100px rgba(0, 0, 0, 0.8), inset 0 0 50px rgba(0, 240, 255, 0.02)',
      overflow: 'hidden', pointerEvents: 'auto', flexDirection: 'column', position: 'relative'
    }}>
      {/* --- LAVISH TECHNICAL DECORATIONS --- */}
      <div style={{ position: 'absolute', top: '15px', left: '15px', width: '20px', height: '20px', borderLeft: '2px solid #00f0ff', borderTop: '2px solid #00f0ff', opacity: 0.5 }} />
      <div style={{ position: 'absolute', top: '15px', right: '15px', width: '20px', height: '20px', borderRight: '2px solid #00f0ff', borderTop: '2px solid #00f0ff', opacity: 0.5 }} />
      <div style={{ position: 'absolute', bottom: '15px', left: '15px', width: '20px', height: '20px', borderLeft: '2px solid #00f0ff', borderBottom: '2px solid #00f0ff', opacity: 0.5 }} />
      <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '20px', height: '20px', borderRight: '2px solid #00f0ff', borderBottom: '2px solid #00f0ff', opacity: 0.5 }} />

      {/* Subtle Scanline Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0, 240, 255, 0.03) 0px, transparent 1px, transparent 2px)', pointerEvents: 'none', zIndex: 1 }} />

      {/* Simple Tech Header */}
      <div style={{ padding: '0.8rem 2.5rem', background: 'rgba(0, 240, 255, 0.05)', borderBottom: '1px solid rgba(0, 240, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'rgba(0, 240, 255, 0.6)', letterSpacing: '1px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={12} /> SYSTEM: ACTIVE</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Database size={12} /> HUB: CONNECTED</span>
        </div>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 10px #00f0ff', animation: 'pulse 2s infinite' }} />
      </div>

      <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600, color: '#fff', letterSpacing: '1px' }}>
            UDAY RAJ <span style={{ color: 'rgba(0, 240, 255, 0.5)', fontWeight: 300, marginLeft: '8px', fontSize: '0.9rem' }}>| DIGITAL ASSISTANT</span>
          </h2>
        </div>
        <Sparkles size={20} color="#00f0ff" opacity={0.8} />
      </div>

      {/* Messages */}
      <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '3rem', scrollBehavior: 'smooth', zIndex: 2 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(0, 240, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '1px solid rgba(0, 240, 255, 0.25)', boxShadow: '0 0 30px rgba(0, 240, 255, 0.1)' }}>
              <Info size={40} color="#00f0ff" />
            </div>
            <h1 style={{ color: '#fff', fontSize: '2.4rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.5px' }}>Hi, I'm Uday's AI.</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', maxWidth: '550px', margin: '0 auto 3.5rem', lineHeight: 1.8, fontSize: '1.1rem' }}>
              I am here to help you explore Uday's professional world. Ask me about his projects, skills, or why he would be a great fit for your team.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {quickPrompts.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.prompt)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff', padding: '1rem 2.2rem', borderRadius: '20px',
                    cursor: 'pointer', fontSize: '1rem', transition: 'all 0.4s ease', pointerEvents: 'auto'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)'; e.currentTarget.style.borderColor = '#00f0ff'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, index) => {
          const content = getMessageText(m);
          const isLatestLoading = index === messages.length - 1 && status === 'streaming';
          return (
            <div key={index} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: m.role === 'user' ? 'rgba(255,255,255,0.08)' : 'rgba(0, 240, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0 }}>
                {m.role === 'user' ? <User size={20} color="#fff" /> : <Code size={20} color="#00f0ff" />}
              </div>
              <div style={{
                maxWidth: '78%',
                background: m.role === 'user' ? 'linear-gradient(135deg, #00f0ff, #0072ff)' : 'rgba(255, 255, 255, 0.04)',
                color: m.role === 'user' ? '#000' : '#fff',
                padding: '1.2rem 1.6rem',
                borderRadius: m.role === 'user' ? '24px 24px 4px 24px' : '4px 24px 24px 24px',
                fontSize: '1.1rem',
                boxShadow: m.role === 'user' ? '0 10px 30px rgba(0, 114, 255, 0.3)' : 'none',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                {m.role === 'user' ? content : <SmoothStream text={content} isStreaming={isLatestLoading} />}
              </div>
            </div>
          );
        })}
        {status === 'submitted' && <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}><Loader2 size={20} className="animate-spin" color="#00f0ff" /><div style={{ color: 'rgba(0, 240, 255, 0.4)', fontSize: '0.9rem', letterSpacing: '2px' }}>THINKING...</div></div>}
      </div>

      {/* Input */}
      <div style={{ padding: '2.5rem 3.5rem 3.5rem', background: 'rgba(0,0,0,0.3)', zIndex: 2 }}>
        <form onSubmit={(e) => { e.preventDefault(); if (!text.trim() || isLoading) return; handleSend(text); setText(''); }} style={{ display: 'flex', gap: '1.2rem', position: 'relative' }}>
          <input
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Type your question here..." disabled={isLoading}
            style={{ 
              flex: 1, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', 
              padding: '1.4rem 4.5rem 1.4rem 1.8rem', borderRadius: '22px', color: '#fff', outline: 'none', fontSize: '1.1rem'
            }}
          />
          <button
            type="submit" disabled={!text.trim() || isLoading}
            style={{ 
              position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', 
              background: text.trim() && !isLoading ? '#00f0ff' : 'transparent', border: 'none', 
              color: text.trim() && !isLoading ? '#000' : 'rgba(255,255,255,0.15)', padding: '0.8rem', borderRadius: '16px', display: 'flex' 
            }}
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </form>
      </div>

      <style jsx global>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  )
}
