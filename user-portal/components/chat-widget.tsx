"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 overflow-hidden rounded-2xl glass-strong shadow-2xl"
          >
            <div className="flex items-center gap-2.5 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-violet-600/20 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500">
                <Bot className="h-4 w-4 text-white" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">RZE AI Assistant</p>
                <p className="text-[11px] text-emerald-400">● Online</p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-white/5 p-3 text-sm text-slate-300">
                Hi! Need help? Chat with us! I can help with accounts, loans, or investments.
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-white/10 p-3">
              <input
                type="text"
                placeholder="Type your message…"
                className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              <Button size="icon" className="h-9 w-9">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-xl shadow-blue-500/40 transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
