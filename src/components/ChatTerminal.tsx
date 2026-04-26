'use client'

import { useChat } from '@ai-sdk/react'
import { Sparkles, Send, Code, User, Loader2, Cpu, ExternalLink } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

// --- CINEMATIC TYPEWRITER COMPONENT ---
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
          timerRef.current = setTimeout(trickle, 75); 
          return prev + chunk;
        });
      };
      trickle();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = null; };
  }, [text, displayedText.length]);

  const finalContent = isStreaming ? displayedText : text;
  return (
    <div className="markdown-content prose prose-invert max-w-none" style={{ 
      animation: 'fadeInSlide 0.5s ease-out forwards',
      opacity: 0,
      transform: 'translateY(10px)'
    }}>
      <ReactMarkdown>{finalContent}</ReactMarkdown>
      <style jsx global>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .markdown-content p { margin-bottom: 1rem; line-height: 1.7; }
        .markdown-content ul { margin-bottom: 1rem; padding-left: 1.5rem; }
        .markdown-content li { margin-bottom: 0.5rem; }
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
        const targetScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        scrollContainer.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  }, [messages, status]);

  const quickPrompts = [
    { label: "Engineering Philosophy", prompt: "What is Uday's core philosophy regarding Adversarial ML and Defensive AI?" },
    { label: "Technical Flagships", prompt: "Explain the strategic importance of Uday's SegFormer and PaliGemma research." },
    { label: "Strategic Value", prompt: "Why would Uday be a top-tier asset for a high-performance AI research team?" },
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
      width: '100%',
      maxWidth: '900px',
      height: '85vh',
      background: 'linear-gradient(145deg, rgba(5, 12, 20, 0.9), rgba(2, 5, 10, 0.95))',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(0, 240, 255, 0.15)',
      borderRadius: '32px',
      display: 'flex',
      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(0, 240, 255, 0.03)',
      overflow: 'hidden',
      pointerEvents: 'auto',
      flexDirection: 'column',
      fontFamily: '"Outfit", "Inter", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem 2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '12px', height: '12px', borderRadius: '50%', background: '#00f0ff', 
            boxShadow: '0 0 15px #00f0ff', animation: 'pulse 2s infinite' 
          }} />
          <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 500, letterSpacing: '1px', color: '#fff' }}>
            UDAY RAJ <span style={{ color: 'rgba(0, 240, 255, 0.5)', fontWeight: 300, marginLeft: '8px', fontSize: '0.9rem' }}>// STRATEGIC DIGITAL TWIN</span>
          </h2>
        </div>
        <a href="https://github.com/udayraj1238" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>
          <ExternalLink size={20} />
        </a>
      </div>

      {/* Messages */}
      <div 
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
          scrollBehavior: 'smooth'
        }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(0, 240, 255, 0.05)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', 
              border: '1px solid rgba(0, 240, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 240, 255, 0.1)'
            }}>
              <Cpu size={40} color="#00f0ff" />
            </div>
            <h1 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 600, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
              Advanced Intelligence Interface
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', maxWidth: '550px', margin: '0 auto 3rem', lineHeight: 1.7, fontSize: '1.1rem' }}>
              Welcome. This interface is synchronized with Uday Raj's latest research, project hubs, and engineering philosophy. How can I assist your evaluation today?
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {quickPrompts.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.prompt)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    padding: '1rem 2rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: 'auto'
                  }}
                  onMouseOver={(e) => { 
                    e.currentTarget.style.background = 'rgba(0, 240, 255, 0.08)'; 
                    e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 240, 255, 0.1)';
                  }}
                  onMouseOut={(e) => { 
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; 
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
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
          const isLatestLoading = index === messages.length - 1 && status === 'streaming';
          return (
            <div key={index} style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-start',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              animation: 'fadeUp 0.6s ease-out'
            }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '14px', 
                background: m.role === 'user' ? 'rgba(255,255,255,0.08)' : 'rgba(0, 240, 255, 0.12)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                border: m.role !== 'user' ? '1px solid rgba(0, 240, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.1)', 
                flexShrink: 0 
              }}>
                {m.role === 'user' ? <User size={20} color="#fff" /> : <Code size={20} color="#00f0ff" />}
              </div>
              <div style={{
                maxWidth: '80%',
                background: m.role === 'user' ? 'linear-gradient(135deg, #00f0ff, #0072ff)' : 'rgba(255, 255, 255, 0.03)',
                color: m.role === 'user' ? '#000' : '#fff',
                padding: '1.2rem 1.5rem',
                borderRadius: m.role === 'user' ? '24px 24px 4px 24px' : '4px 24px 24px 24px',
                lineHeight: 1.6,
                fontSize: '1.05rem',
                boxShadow: m.role === 'user' ? '0 10px 25px rgba(0, 114, 255, 0.3)' : 'none',
                border: m.role === 'assistant' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
              }}>
                {m.role === 'user' ? content : <SmoothStream text={content} isStreaming={isLatestLoading} />}
              </div>
            </div>
          );
        })}
        
        {status === 'submitted' && (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'rgba(0, 240, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
              <Loader2 size={20} className="animate-spin" color="#00f0ff" />
            </div>
            <div style={{ color: 'rgba(0, 240, 255, 0.4)', fontSize: '0.95rem', letterSpacing: '1px' }}>SYNCHRONIZING...</div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '2rem 2.5rem 2.5rem', background: 'rgba(0,0,0,0.3)' }}>
        <form onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim() || isLoading) return
          handleSend(text)
          setText('')
        }} style={{ display: 'flex', gap: '1.2rem', position: 'relative' }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Command the Digital Twin..."
            disabled={isLoading}
            style={{ 
              flex: 1, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', 
              padding: '1.4rem 4.5rem 1.4rem 1.8rem', borderRadius: '22px', color: '#fff', outline: 'none',
              fontSize: '1.1rem', transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            style={{ 
              position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', 
              background: text.trim() && !isLoading ? '#00f0ff' : 'transparent', border: 'none', 
              color: text.trim() && !isLoading ? '#000' : 'rgba(255,255,255,0.15)', padding: '0.8rem', 
              borderRadius: '15px', display: 'flex', transition: 'all 0.3s ease' 
            }}
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </form>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; box-shadow: 0 0 10px #00f0ff; }
          50% { transform: scale(1.2); opacity: 0.8; box-shadow: 0 0 25px #00f0ff; }
          100% { transform: scale(1); opacity: 1; box-shadow: 0 0 10px #00f0ff; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
