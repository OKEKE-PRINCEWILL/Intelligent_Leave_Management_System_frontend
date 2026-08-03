import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, ChevronRight, MessageCircle, Send, X } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { aiApi } from "../../api/ai.api"

interface ChatMessage {
  id: number
  role: "user" | "assistant"
  text: string
  keyPoints?: string[]
}

export function FloatingAiAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hi. Need any help?",
      keyPoints: ["Ask me about leave policy, balances, approvals, or how to use ILMS."],
    },
  ])
  const nextId = useRef(2)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  const askMutation = useMutation({
    mutationFn: aiApi.askPolicyQuestion,
    onSuccess: (answer) => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "assistant",
          text: answer.answer,
          keyPoints: answer.keyPoints,
        },
      ])
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "assistant",
          text: "I could not reach the assistant service just now. Please try again in a moment.",
        },
      ])
    },
  })

  const submit = () => {
    const question = input.trim()
    if (!question || askMutation.isPending) return
    setMessages((prev) => [...prev, { id: nextId.current++, role: "user", text: question }])
    setInput("")
    askMutation.mutate(question)
  }

  return (
    <div style={{ position: "fixed", right: "24px", bottom: "22px", zIndex: 300 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            style={{
              width: "360px",
              maxWidth: "calc(100vw - 32px)",
              height: "520px",
              maxHeight: "calc(100vh - 120px)",
              background: "#fff",
              color: "#2A1E12",
              borderRadius: "16px",
              boxShadow: "0 24px 70px rgba(15, 23, 42, 0.22)",
              overflow: "hidden",
              marginBottom: "14px",
              border: "1px solid #EFE7DD",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "16px 18px", background: "#8B5A2B", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 800 }}>
                <Bot size={18} />
                AI Assistant
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close assistant" style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map((message) => (
                <div key={message.id} style={{ display: "flex", justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "84%",
                      borderRadius: message.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: message.role === "user" ? "#8B5A2B" : "#F8F5F1",
                      color: message.role === "user" ? "#fff" : "#2A1E12",
                      padding: "10px 12px",
                      fontSize: "13px",
                      lineHeight: 1.55,
                    }}
                  >
                    <div>{message.text}</div>
                    {message.keyPoints && message.keyPoints.length > 0 && (
                      <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "5px" }}>
                        {message.keyPoints.slice(0, 4).map((point) => (
                          <div key={point} style={{ display: "flex", gap: "5px", color: message.role === "user" ? "#fff" : "#53627A" }}>
                            <ChevronRight size={12} style={{ marginTop: "3px", flexShrink: 0 }} />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {askMutation.isPending && (
                <div style={{ color: "#53627A", fontSize: "13px", padding: "0 4px" }}>Typing...</div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: "12px", borderTop: "1px solid #EFE7DD", display: "flex", gap: "8px" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit()
                }}
                placeholder="Ask about leave..."
                style={{
                  flex: 1,
                  border: "1px solid #E3D8C9",
                  borderRadius: "999px",
                  padding: "10px 12px",
                  outline: "none",
                  fontSize: "13px",
                }}
              />
              <button
                onClick={submit}
                disabled={!input.trim() || askMutation.isPending}
                aria-label="Send message"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "none",
                  background: "#8B5A2B",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  opacity: !input.trim() || askMutation.isPending ? 0.55 : 1,
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((value) => !value)}
        aria-label="Open AI assistant"
        style={{
          marginLeft: "auto",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          border: "none",
          background: "#8B5A2B",
          color: "#fff",
          boxShadow: "0 12px 30px rgba(139, 90, 43, 0.32)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <MessageCircle size={22} />
      </button>
    </div>
  )
}
