import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { db } from './firebase';

interface UserData extends DocumentData {
  id: string;
  totalEarnings?: number;
  isMember?: boolean;
}

export async function fetchAggregateAnalytics() {
  const usersSnap = await getDocs(collection(db, 'users'));
  const submissionsSnap = await getDocs(collection(db, 'submissions'));
  
  const users = usersSnap.docs.map(d => ({id: d.id, ...d.data()})) as UserData[];
  
  const totalRevenue = users.reduce((sum, u) => sum + (u.totalEarnings || 0), 0);
  const activeMembers = users.filter(u => u.isMember).length;
  const communityEngagement = submissionsSnap.docs.length;
  
  return {
    totalRevenue,
    activeMembers,
    communityEngagement,
    timestamp: Date.now()
  };
}
