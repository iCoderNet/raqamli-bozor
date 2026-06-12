import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, MessageSquare, Loader2, ChevronDown } from 'lucide-react'
import { agentApi } from '../api/client'

const SUGGESTIONS = [
  "Eng ko'p qarzdor bozorlar qaysilar?",
  "Jami daromad qancha?",
  "Transport kirishining o'rtacha narxi?",
  "Qaysi savdo joylarida aktiv holat past?",
]

export default function AgentChat({ dashboardContext }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Salom! Men Raqamli Bozor yordamchisiman 🤖\nBozorlar statistikasi, savdo joylari yoki qarzlar haqida savollaringizga javob berishga tayyorman.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  async function sendMessage(text) {
    const userMsg = text || input.trim()
    if (!userMsg || loading) return
    setInput('')

    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const apiMessages = newMessages.filter(m => m.role !== 'system')
      const res = await agentApi.chat(apiMessages, dashboardContext)
      setMessages(prev => [...prev, { role: 'assistant', content: res.message }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.'
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 btn btn-primary btn-circle shadow-xl w-14 h-14"
        title="AI Yordamchi"
      >
        {open ? <ChevronDown size={22} /> : <Bot size={22} />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] flex flex-col
                        bg-base-100 rounded-2xl shadow-2xl border border-base-200 overflow-hidden"
             style={{ height: '520px' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white">
            <div className="avatar placeholder">
              <div className="bg-white/20 rounded-full w-9">
                <Bot size={18} className="m-auto" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">Bozor AI Yordamchi</p>
              <p className="text-xs text-white/70 leading-tight">Statistika va tahlil bo'yicha yordam</p>
            </div>
            <button onClick={() => setOpen(false)} className="btn btn-ghost btn-xs btn-circle text-white">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`chat ${msg.role === 'user' ? 'chat-end' : 'chat-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="chat-image avatar placeholder">
                    <div className="bg-primary/20 rounded-full w-8">
                      <Bot size={14} className="m-auto text-primary" />
                    </div>
                  </div>
                )}
                <div className={`chat-bubble text-sm whitespace-pre-wrap leading-relaxed max-w-xs
                  ${msg.role === 'user'
                    ? 'chat-bubble-primary'
                    : 'bg-base-200 text-base-content'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat chat-start">
                <div className="chat-image avatar placeholder">
                  <div className="bg-primary/20 rounded-full w-8">
                    <Bot size={14} className="m-auto text-primary" />
                  </div>
                </div>
                <div className="chat-bubble bg-base-200 text-base-content flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-sm">Javob yozilmoqda...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="btn btn-xs btn-ghost border border-base-300 text-xs font-normal normal-case
                             hover:btn-primary hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-base-200 flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Savolingizni yozing..."
              rows={1}
              className="textarea textarea-bordered flex-1 text-sm resize-none min-h-[2.5rem] max-h-24
                         focus:outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="btn btn-primary btn-square"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
