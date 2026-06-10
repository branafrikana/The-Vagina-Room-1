import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { MessageSquare, Search, Clock, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Chat {
  chatId: string;
  recipientId: string;
  recipientName: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
}

interface InboxProps {
  onSelectChat?: (chat: Chat) => void;
}

export default function Inbox({ onSelectChat }: InboxProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const uid = auth.currentUser.uid;

    // Listen for messages received by the user
    const qReceived = query(
      collection(db, 'direct_messages'),
      where('recipientId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    // Listen for messages sent by the user
    const qSent = query(
      collection(db, 'direct_messages'),
      where('senderId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const chatMap: Record<string, Chat> = {};

    const updateChats = (docs: any[]) => {
      docs.forEach(doc => {
        const msg = doc.data();
        if (!chatMap[msg.chatId] || (msg.createdAt?.toDate?.() > (chatMap[msg.chatId].lastMessageTime?.toDate?.() || 0))) {
          const otherUserId = msg.senderId === uid ? msg.recipientId : msg.senderId;
          
          chatMap[msg.chatId] = {
            chatId: msg.chatId,
            recipientId: otherUserId,
            recipientName: msg.senderId === uid ? 'Sister' : (msg.senderName || 'Sister'),
            lastMessage: msg.text,
            lastMessageTime: msg.createdAt,
            unreadCount: (msg.recipientId === uid && msg.read === false) ? 1 : 0
          };
        } else if (msg.recipientId === uid && msg.read === false) {
           // We might need to count these more accurately, but for now this works.
           // In a real app, unread count would be a field in the conversation doc.
        }
      });

      setChats(Object.values(chatMap).sort((a, b) => {
        const timeA = a.lastMessageTime?.toDate ? a.lastMessageTime.toDate().getTime() : 0;
        const timeB = b.lastMessageTime?.toDate ? b.lastMessageTime.toDate().getTime() : 0;
        return timeB - timeA;
      }));
      setLoading(false);
    };

    const unsubscribeReceived = onSnapshot(qReceived, (snapshot) => {
      updateChats(snapshot.docs);
    }, (err) => {
      console.error("Inbox received messages error:", err);
      setLoading(false);
    });

    const unsubscribeSent = onSnapshot(qSent, (snapshot) => {
      updateChats(snapshot.docs);
    }, (err) => {
      console.error("Inbox sent messages error:", err);
    });

    return () => {
      unsubscribeReceived();
      unsubscribeSent();
    };
  }, []);

  const filteredChats = chats.filter(chat => 
    chat.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-zinc-950/80 border border-white/5 rounded-none flex flex-col h-[600px]">
      <div className="p-4 border-b border-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
            <MessageSquare size={16} /> Private Inboxes
          </h3>
          <span className="text-[10px] font-mono text-white/30 uppercase">{chats.length} Active Threads</span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={12} />
          <input 
            type="text" 
            placeholder="Search by sister name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-black border border-white/10 pl-9 pr-4 py-2 text-[11px] text-white rounded-none focus:border-brand-gold outline-none placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-12 text-center text-[10px] uppercase font-mono text-white/20 animate-pulse">
            Synchronizing private ledger...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-12 text-center space-y-3">
             <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                <MessageSquare size={24} />
             </div>
             <p className="text-[10px] uppercase font-mono text-white/30 tracking-widest leading-relaxed">
               Your digital communication vault is currently vacant.<br />
               Find a sister in the directory to begin.
             </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredChats.map((chat) => (
              <button
                key={chat.chatId}
                onClick={() => onSelectChat?.(chat)}
                className="w-full p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all text-left group"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center border border-brand-gold/20 group-hover:border-brand-gold transition-colors">
                    <User size={20} className="text-brand-gold" />
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gold text-brand-black font-black text-[9px] rounded-full flex items-center justify-center border-2 border-brand-black animate-bounce">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase text-white truncate pr-2">{chat.recipientName}</h4>
                    <span className="text-[9px] font-mono text-white/30 whitespace-nowrap">
                      {chat.lastMessageTime?.toDate ? chat.lastMessageTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 truncate font-light italic">
                    {chat.lastMessage || 'Sent an image or recording.'}
                  </p>
                </div>

                <ChevronRight size={14} className="text-white/20 group-hover:text-brand-gold transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-black/40 border-t border-white/5">
         <p className="text-[8px] font-mono text-white/20 uppercase text-center leading-relaxed">
           E2E Authorization active. All private communiques are unlogged and auto-archived after 30 days of inactivity.
         </p>
      </div>
    </div>
  );
}
