import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Recipient {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  displayName?: string;
  email?: string;
}

interface ChatWindowProps {
  recipient: Recipient;
  onClose: () => void;
}

export default function ChatWindow({ recipient, onClose }: ChatWindowProps) {
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!recipient || !auth.currentUser) return;

    const chatId = [auth.currentUser.uid, recipient.id].sort().join('_');
    const q = query(
      collection(db, 'direct_messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChatMessages(messages);
      setLoading(false);

      // Mark unread messages as read
      const unreadMessages = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.recipientId === auth.currentUser?.uid && data.read === false;
      });

      if (unreadMessages.length > 0) {
        unreadMessages.forEach(msgDoc => {
          updateDoc(doc(db, 'direct_messages', msgDoc.id), { read: true });
        });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'direct_messages');
      setLoading(false);
    });

    return unsubscribe;
  }, [recipient]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !recipient || !auth.currentUser) return;

    setSending(true);
    try {
      const chatId = [auth.currentUser.uid, recipient.id].sort().join('_');
      
      // We'll also use the API proxy for offline notifications
      // But for now, let's keep direct Firestore write for speed
      await addDoc(collection(db, 'direct_messages'), {
        chatId,
        senderId: auth.currentUser.uid,
        recipientId: recipient.id,
        text: messageText,
        read: false,
        createdAt: serverTimestamp(),
        senderName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0],
      });
      
      // (Removed /api/messages/send-notification sending as no backend is configured)

      setMessageText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'direct_messages');
    } finally {
      setSending(false);
    }
  };

  const recipientDisplayName = recipient.firstName || recipient.name || recipient.displayName || recipient.email?.split('@')[0] || 'Sister';

  return (
    <motion.div 
      initial={{ scale: 0.9, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.9, y: 20, opacity: 0 }}
      className="bg-[#0a0a0a] border border-white/10 w-full max-w-md h-[500px] flex flex-col shadow-2xl relative z-[1001]"
    >
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-gold/20 rounded-full flex items-center justify-center">
            <MessageSquare size={14} className="text-brand-gold" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white">
              Chat with {recipientDisplayName}
            </h3>
            <p className="text-[8px] text-white/40 uppercase tracking-tighter">Secure & Encrypted Messaging Node</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors cursor-pointer p-1">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans custom-scrollbar bg-black/40">
        {loading ? (
          <div className="h-full flex items-center justify-center text-center p-8">
            <Loader2 size={16} className="text-brand-gold animate-spin" />
            <p className="text-[10px] text-white/20 uppercase tracking-widest ml-2">Mapping thread...</p>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-8">
            <p className="text-[10px] text-white/20 italic uppercase tracking-widest">No previous communiques found. Start the sisterhood exchange below.</p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.senderId === auth.currentUser?.uid ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[80%] p-3 text-xs leading-relaxed ${
                msg.senderId === auth.currentUser?.uid 
                  ? 'bg-brand-gold text-brand-black rounded-l-xl rounded-tr-xl font-medium' 
                  : 'bg-white/5 border border-white/10 text-white rounded-r-xl rounded-tl-xl'
              }`}>
                {msg.text}
              </div>
              <span className="text-[7px] text-white/20 mt-1 uppercase font-mono tracking-tighter">
                {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Syncing...'}
              </span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-white/10 flex gap-2 bg-brand-black">
        <input 
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-white/5 border border-white/10 p-2.5 text-xs text-white rounded-none focus:border-brand-gold outline-none"
        />
        <button 
          type="submit"
          disabled={sending || !messageText.trim()}
          className="bg-brand-gold text-brand-black p-2.5 rounded-none hover:bg-white transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send size={16} />
        </button>
      </form>
    </motion.div>
  );
}
