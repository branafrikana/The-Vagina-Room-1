import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { motion } from 'motion/react';

interface ExclusiveContent {
  id: string;
  title: string;
  type: 'webinar' | 'recording';
  url: string;
  createdAt: Timestamp;
}

export default function InnerCircleContent() {
  const [content, setContent] = useState<ExclusiveContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'exclusiveContent'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setContent(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExclusiveContent)));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'exclusiveContent');
    });
    return unsubscribe;
  }, []);

  if (loading) return <div className="text-white/50 text-sm">Loading content...</div>;

  return (
    <section className="p-6 border border-white/10 bg-white/[0.02]">
      <h2 className="text-xl font-black mb-4">Inner Circle Content</h2>
      <p className="text-white/60 mb-4">Access exclusive webinars and live event recordings.</p>
      {content.length === 0 ? (
        <p className="text-white/50 text-sm">No exclusive content available yet.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {content.map(item => (
            <motion.li key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:text-white flex items-center justify-between">
                <span>• {item.title}</span>
                <span className="text-[10px] uppercase bg-white/10 px-2 py-0.5">{item.type}</span>
              </a>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
