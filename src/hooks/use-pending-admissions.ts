'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, query, where, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export function usePendingAdmissionsCount() {
    const { school } = useAuth();
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!school?.udise || !db) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'admissions'), 
            where('admissionDetails.udise', '==', school.udise),
            where('admissionDetails.status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setCount(snapshot.size);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching pending admissions count:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [school?.udise]);

    return { count, loading };
}
