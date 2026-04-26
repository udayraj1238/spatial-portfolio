'use client'

import { useChat } from '@ai-sdk/react'
import { Sparkles, Send, Code, User, Loader2, Sparkle } from 'lucide-react'
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
          timerRef.current = setTimeout(trickle, 50); 
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
        .markdown-content strong { color: #00f0ff; }
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
    { label: "Tell me about Uday", prompt: "Who is Uday Raj and what is his background?" },
    { label: "What are his best projects?", prompt: "Tell me about Uday's most impressive technical projects." },
    { label: "Why should I hire him?", prompt: "What makes Uday a great candidate for a role in AI or Software Engineering?" },
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
      width: '100%', maxWidth: '850px', height: '82vh',
      background: 'rgba(5, 10, 15, 0.85)', backdropFilter: 'blur(25px)',
      border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '32px',
      display: 'flex', boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
      overflow: 'hidden', pointerEvents: 'auto', flexDirection: 'column'
    }}>
      {/* Simple, Beautiful Header */}
      <div style={{
        padding: '1.2rem 2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 10px #00f0ff' }} />
          <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 500, color: '#fff', letterSpacing: '0.5px' }}>
            Uday Raj <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginLeft: '5px' }}>| Digital Assistant</span>
          </h2>
        </div>
        <Sparkles size={18} color="#00f0ff" opacity={0.6} />
      </div>

      {/* Messages */}
      <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', scrollBehavior: 'smooth' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <div style={{ 
              width: '70px', height: '70px', borderRadius: '20px', background: 'rgba(0, 240, 255, 0.05)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', 
              border: '1px solid rgba(0, 240, 255, 0.2)'
            }}>
              <Sparkle size={35} color="#00f0ff" />
            </div>
            <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 600, marginBottom: '0.8rem' }}>Welcome!</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', maxWidth: '500px', margin: '0 auto 3rem', lineHeight: 1.7, fontSize: '1.05rem' }}>
              I'm here to help you learn about Uday's projects and experience. Feel free to ask me anything!
            </p>
            
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {quickPrompts.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.prompt)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff', padding: '0.8rem 1.8rem', borderRadius: '18px',
                    cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)'; e.currentTarget.style.borderColor = '#00f0ff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
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
              <div style={{ 
                width: '38px', height: '38px', borderRadius: '12px', 
                background: m.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0, 240, 255, 0.12)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
              }}>
                {m.role === 'user' ? <User size={18} color="#fff" /> : <Code size={18} color="#00f0ff" />}
              </div>
              <div style={{
                maxWidth: '78%',
                background: m.role === 'user' ? '#00f0ff' : 'rgba(255, 255, 255, 0.04)',
                color: m.role === 'user' ? '#000' : '#fff',
                padding: '1.1rem 1.4rem',
                borderRadius: m.role === 'user' ? '22px 22px 4px 22px' : '4px 22px 22px 22px',
                fontSize: '1.05rem',
                boxShadow: m.role === 'user' ? '0 8px 20px rgba(0, 240, 255, 0.2)' : 'none'
              }}>
                {m.role === 'user' ? content : <SmoothStream text={content} isStreaming={isLatestLoading} />}
              </div>
            </div>
          );
        })}
        {status === 'submitted' && <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}><Loader2 size={18} className="animate-spin" color="#00f0ff" /><div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Thinking...</div></div>}
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.5rem 2rem 2.5rem', background: 'rgba(0,0,0,0.1)' }}>
        <form onSubmit={(e) => { e.preventDefault(); if (!text.trim() || isLoading) return; handleSend(text); setText(''); }} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
          <input
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Ask me anything..." disabled={isLoading}
            style={{ 
              flex: 1, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', 
              padding: '1.2rem 4rem 1.2rem 1.5rem', borderRadius: '18px', color: '#fff', outline: 'none', fontSize: '1rem'
            }}
          />
          <button
            type="submit" disabled={!text.trim() || isLoading}
            style={{ 
              position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', 
              background: text.trim() && !isLoading ? '#00f0ff' : 'transparent', border: 'none', 
              color: text.trim() && !isLoading ? '#000' : 'rgba(255,255,255,0.1)', padding: '0.7rem', 
              borderRadius: '14px', display: 'flex' 
            }}
          >
            {isLoading ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
          </button>
        </form>
      </div>
    </div>
  )
}
