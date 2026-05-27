"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { MessageSquare, Plus, Trash2, ChevronLeft, ChevronRight, MessageSquarePlus, X, Sparkles, Bot } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpen,
  setIsOpen,
  isMobile
}: ChatSidebarProps) {
  // Group sessions by date
  const groupedSessions = sessions.reduce((acc, session) => {
    const date = new Date(session.updated_at);
    const today = new Date();
    let group = "Older";
    
    if (date.toDateString() === today.toDateString()) {
      group = "Today";
    } else if (date > new Date(today.setDate(today.getDate() - 7))) {
      group = "Previous 7 Days";
    } else if (date > new Date(today.setDate(today.getDate() - 30))) {
      group = "Previous 30 Days";
    }

    if (!acc[group]) acc[group] = [];
    acc[group].push(session);
    return acc;
  }, {} as Record<string, ChatSession[]>);

  const groupOrder = ["Today", "Previous 7 Days", "Previous 30 Days", "Older"];

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`
          flex flex-col bg-gradient-to-b from-white/35 via-white/15 to-white/5 dark:from-zinc-900/35 dark:via-zinc-950/15 dark:to-zinc-950/5 backdrop-blur-2xl border-r border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
          transition-all duration-300 ease-in-out h-full select-none
          ${isOpen ? "w-64" : "w-0 overflow-hidden border-r-0"}
          ${isMobile ? "absolute z-50 left-0" : "relative"}
        `}
      >
        <div className="p-4 border-b border-white/20 dark:border-white/5 flex flex-col gap-3 shrink-0 bg-white/10 dark:bg-black/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
              </div>
              <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                History
              </span>
            </div>
            
            {isMobile && (
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-white/20 dark:hover:bg-white/5 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={onNewSession}
            className="group relative overflow-hidden flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)] dark:hover:shadow-[0_8px_20px_rgba(79,70,229,0.4)] w-full justify-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-white/20 cursor-pointer"
          >
            {/* Glossy sheen shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            <MessageSquarePlus className="h-4 w-4" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar min-w-[16rem]">
          {sessions.length === 0 ? (
            <div className="text-center text-zinc-400 dark:text-zinc-500 text-sm mt-10 flex flex-col items-center gap-2">
              <Bot className="h-8 w-8 opacity-30 animate-bounce" />
              <span className="font-medium text-xs">No recent sessions</span>
            </div>
          ) : (
            groupOrder.map(group => {
              if (!groupedSessions[group] || groupedSessions[group].length === 0) return null;
              return (
                <div key={group} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 mb-2 px-2">
                    <span className="h-1 w-1 rounded-full bg-blue-500 dark:bg-blue-450 shadow-[0_0_6px_#3b82f6]" />
                    <h3 className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                      {group}
                    </h3>
                  </div>
                  {groupedSessions[group].map(session => {
                    const isActive = activeSessionId === session.id;
                    return (
                      <div 
                        key={session.id}
                        className={`
                          group relative flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-sm
                          transition-all duration-300 border
                          ${isActive 
                            ? 'bg-gradient-to-r from-blue-500/15 to-indigo-500/15 dark:from-blue-500/20 dark:to-indigo-500/20 border-blue-500/35 dark:border-blue-400/30 text-blue-700 dark:text-blue-300 font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] scale-[1.01]' 
                            : 'bg-white/5 dark:bg-white/1 border-transparent hover:border-white/20 dark:hover:border-white/5 hover:bg-white/20 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:translate-x-0.5'}
                        `}
                        onClick={() => onSelectSession(session.id)}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-650 shadow-[0_0_8px_#3b82f6]" />
                        )}
                        <MessageSquare className={`h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-blue-500" : "opacity-60"}`} />
                        <span className="truncate flex-1 text-xs">{session.title}</span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className={`
                            p-1 rounded-lg text-zinc-400 hover:text-red-650 dark:hover:text-red-400 bg-transparent hover:bg-red-500/10 hover:border-red-500/20 border border-transparent
                            transition-all shrink-0
                            ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                          `}
                          title="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Sidebar Toggle Button (when closed) */}
      {!isOpen && !isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute top-1/2 left-0 -translate-y-1/2 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-md border border-l-0 border-white/40 dark:border-white/10 p-2.5 rounded-r-2xl text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 z-10 shadow-lg hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-350 hover:scale-110 active:scale-95 cursor-pointer"
          title="Open sidebar"
        >
          <ChevronRight className="h-4 w-4 animate-pulse" />
        </button>
      )}
      
      {/* Sidebar Close Button (when open) */}
      {isOpen && !isMobile && (
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-1/2 -ml-4 left-64 -translate-y-1/2 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-md border border-white/40 dark:border-white/10 p-1.5 rounded-full text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 z-20 shadow-lg hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-350 hover:scale-110 active:scale-95 cursor-pointer"
          title="Close sidebar"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}
    </>
  );
}

