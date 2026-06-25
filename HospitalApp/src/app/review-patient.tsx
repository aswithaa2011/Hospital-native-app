import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../services/api';

export default function ReviewPatientScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [chiefNotes, setChiefNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      await api.put(`/patient/review/${id}`, { chiefNotes: chiefNotes.trim() });
      router.back();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to review patient.');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Review & Discharge</Text>
          <Text style={styles.patientLabel}>Patient: <Text style={styles.patientName}>{name}</Text></Text>
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>⚠ {error}</Text></View> : null}
          <Text style={styles.fieldLabel}>Chief Doctor Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter final review notes..."
            placeholderTextColor="#475569"
            value={chiefNotes} onChangeText={setChiefNotes}
            multiline numberOfLines={5}
          />
          <Text style={styles.hint}>
            Submitting this will mark the patient as Reviewed and discharge them from active tracking.
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => router.back()} disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.submitBtn]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Confirm Review</Text>}
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
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#CBD5E1', marginBottom: 6 },
  input: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, fontSize: 15, color: '#F1F5F9' },
  textArea: { height: 120, textAlignVertical: 'top', marginBottom: 12 },
  hint: { fontSize: 13, color: '#64748B', marginBottom: 20, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  cancelText: { color: '#94A3B8', fontWeight: '600', fontSize: 15 },
  submitBtn: { backgroundColor: '#10B981' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
