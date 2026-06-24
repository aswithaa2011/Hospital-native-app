import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../services/api';

interface StaffMember { _id: string; username: string; fullName: string; }

export default function AssignNurseScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [nurses, setNurses] = useState<StaffMember[]>([]);
  const [nurseId, setNurseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingNurses, setLoadingNurses] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/staff?roles=nurse')
      .then(({ data }) => setNurses(data))
      .catch(() => setError('Failed to load nurses.'))
      .finally(() => setLoadingNurses(false));
  }, []);

  const handleSubmit = async () => {
    if (!nurseId) { setError('Please select a nurse.'); return; }
    setError(''); setLoading(true);
    try {
      await api.put(`/patient/assign-nurse/${id}`, { nurseId });
      router.back();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign nurse.');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assign Nurse</Text>
          <Text style={styles.patientLabel}>Patient: <Text style={styles.patientName}>{name}</Text></Text>
          {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>⚠ {error}</Text></View>}
          {loadingNurses
            ? <ActivityIndicator color="#0D9488" style={{ marginTop: 20 }} />
            : nurses.length === 0
              ? <Text style={styles.noStaff}>No nurses registered yet.</Text>
              : (
                <View style={styles.grid}>
                  {nurses.map((n) => (
                    <TouchableOpacity
                      key={n._id}
                      style={[styles.chip, nurseId === n._id && styles.chipActive]}
                      onPress={() => setNurseId(n._id)}
                    >
                      <Text style={[styles.chipText, nurseId === n._id && styles.chipTextActive]}>
                        {n.fullName || n.username}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => router.back()} disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.submitBtn]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Assign</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flexGrow: 1, padding: 16 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#F1F5F9', marginBottom: 8 },
  patientLabel: { fontSize: 14, color: '#94A3B8', marginBottom: 20 },
  patientName: { color: '#38BDF8', fontWeight: '700' },
  errorBox: { backgroundColor: '#450A0A', borderColor: '#991B1B', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#FCA5A5', fontSize: 13, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0F172A' },
  chipActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.15)' },
  chipText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  chipTextActive: { color: '#60A5FA' },
  noStaff: { color: '#64748B', fontSize: 14, marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  cancelText: { color: '#94A3B8', fontWeight: '600', fontSize: 15 },
  submitBtn: { backgroundColor: '#3B82F6' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
