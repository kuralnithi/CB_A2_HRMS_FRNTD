"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, FileText, Database, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  sources?: any[];
  sql?: string;
  rows?: any[];
  actionResult?: any;
};

export default function ChatPanel({ user }: { user: any }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi ${user.email.split("@")[0]}! I'm the NovaWorks PeopleOps Copilot. How can I help you today?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/router`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({ message: userMsg.content })
      });

      if (!res.ok) throw new Error("Failed to get response");
      
      const json = await res.json();

      // Backend returns: { success, data: { intent, confidence, data: { answer, sources, sql, rows, result } } }
      const payload = json.data || {};
      const inner = payload.data || {};

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: inner.answer || payload.answer || (json.success === false ? (json.error || "I encountered an error.") : "I encountered an error processing your request."),
        intent: payload.intent,
        sources: inner.sources,
        sql: inner.sql,
        rows: inner.rows,
        actionResult: inner.result
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I'm having trouble connecting to the server right now. (${error.message})`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case "POLICY_QA": return <FileText className="h-3 w-3 mr-1" />;
      case "SQL_QUERY": return <Database className="h-3 w-3 mr-1" />;
      case "HR_ACTION": return <Zap className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  const formatTable = (rows: any[]) => {
    if (!rows || rows.length === 0) return null;
    const columns = Object.keys(rows[0]);
    
    return (
      <div className="mt-4 border rounded-md overflow-x-auto bg-white dark:bg-zinc-950">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-900 border-b">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                  {col.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                {columns.map(col => (
                  <td key={col} className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 md:p-6" ref={scrollRef}>
        <div className="space-y-6 pb-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <Avatar className={`h-8 w-8 mt-1 ${msg.role === "user" ? "bg-zinc-200 dark:bg-zinc-800" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"}`}>
                {msg.role === "user" ? (
                  <AvatarFallback className="text-xs">U</AvatarFallback>
                ) : (
                  <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                )}
              </Avatar>
              
              <div className={`flex max-w-[85%] flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white" 
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }`}>
                  <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {/* Intent Tag */}
                {msg.intent && msg.intent !== "UNKNOWN" && (
                  <div className="flex items-center text-[10px] font-medium text-zinc-500 uppercase px-1">
                    {getIntentIcon(msg.intent)}
                    {msg.intent.replace("_", " ")}
                  </div>
                )}
                
                {/* Sources for Policy RAG */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.sources.map((s, i) => (
                      <div key={i} className="flex items-center text-xs bg-zinc-100 dark:bg-zinc-800 border rounded px-2 py-1 text-zinc-600 dark:text-zinc-400">
                        <FileText className="h-3 w-3 mr-1" />
                        {s.title}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* SQL Table Results */}
                {msg.rows && msg.rows.length > 0 && formatTable(msg.rows)}
                
                {/* Admin/Manager SQL View */}
                {msg.sql && (
                  <div className="mt-2 w-full text-xs font-mono bg-zinc-950 text-zinc-300 p-2 rounded border border-zinc-800 overflow-x-auto">
                    <div className="text-[10px] text-zinc-500 mb-1 font-sans uppercase">Generated Query (Admin/Manager view only)</div>
                    {msg.sql}
                  </div>
                )}
                
                {/* Blocked Action Alert */}
                {msg.actionResult?.blocked && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-2 w-full">
                    <AlertCircle className="h-4 w-4" />
                    Action Blocked: {msg.actionResult.reason}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-4">
              <Avatar className="h-8 w-8 mt-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-3 text-sm flex items-center gap-2 w-20 justify-center h-10 shadow-sm">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t p-4 bg-white dark:bg-zinc-950">
        <form onSubmit={handleSubmit} className="flex gap-2 relative max-w-4xl mx-auto w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about HR policies or run a query..."
            className="flex-1 rounded-full px-4 border-zinc-300 dark:border-zinc-700 focus-visible:ring-blue-600"
            disabled={loading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            disabled={loading || !input.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </>
  );
}
