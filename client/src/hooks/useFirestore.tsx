import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";

export function useFirestoreCollection(collectionName: string, constraints?: any[]) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q = collection(db, collectionName);
    
    if (constraints && constraints.length > 0) {
      q = query(q, ...constraints) as any;
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to dates
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
        }));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}

export function useUserDocuments() {
  const { userData } = useAuth();
  return useFirestoreCollection(
    'documents', 
    userData ? [where('userId', '==', userData.id), orderBy('uploadedAt', 'desc')] : []
  );
}

export function useUserDeadlines() {
  const { userData } = useAuth();
  const globalDeadlines = useFirestoreCollection(
    'deadlines',
    [where('isGlobal', '==', true), orderBy('dueDate', 'asc')]
  );
  
  const userDeadlines = useFirestoreCollection(
    'deadlines',
    userData ? [where('userId', '==', userData.id), orderBy('dueDate', 'asc')] : []
  );

  return {
    data: [...globalDeadlines.data, ...userDeadlines.data],
    loading: globalDeadlines.loading || userDeadlines.loading,
    error: globalDeadlines.error || userDeadlines.error
  };
}

export function useUserNotifications() {
  const { userData } = useAuth();
  return useFirestoreCollection(
    'notifications',
    userData ? [where('userId', '==', userData.id), orderBy('sentAt', 'desc')] : []
  );
}
