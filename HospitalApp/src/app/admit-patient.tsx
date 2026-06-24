import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';

interface StaffMember {
  _id: string;
  username: string;
  fullName: string;
  role: string;
}

export default function AdmitPatientScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [contact, setContact] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [nurseId, setNurseId] = useState('');
  const [nurses, setNurses] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingNurses, setLoadingNurses] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/staff?roles=nurse')
      .then(({ data }) => setNurses(data))
      .catch(() => {})
      .finally(() => setLoadingNurses(false));
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !age.trim() || !symptoms.trim()) {
      setError('Name, age and symptoms are required.');
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0) {
      setError('Please enter a valid age.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/patient/admit', {
        name: name.trim(),
        age: ageNum,
        contact: contact.trim(),
        symptoms: symptoms.trim(),
        nurseId: nurseId || undefined,
      });
      router.back();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to admit patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admit New Patient</Text>

          {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>⚠ {error}</Text></View>}

          <Field label="Patient Name *">
            <TextInput style={styles.input} placeholder="e.g. John Doe"
              placeholderTextColor="#475569" value={name} onChangeText={setName} autoCapitalize="words" />
          </Field>

          <Field label="Age *">
            <TextInput style={styles.input} placeholder="e.g. 45"
              placeholderTextColor="#475569" value={age} onChangeText={setAge} keyboardType="number-pad" />
          </Field>

          <Field label="Contact Number">
            <TextInput style={styles.input} placeholder="e.g. +91 9876543210"
              placeholderTextColor="#475569" value={contact} onChangeText={setContact} keyboardType="phone-pad" />
          </Field>

          <Field label="Symptoms / Reason for Admission *">
            <TextInput style={[styles.input, styles.textArea]} placeholder="Describe symptoms..."
              placeholderTextColor="#475569" value={symptoms} onChangeText={setSymptoms}
              multiline numberOfLines={4} />
          </Field>

          <Field label="Assign Nurse (optional)">
            {loadingNurses ? (
              <ActivityIndicator color="#0D9488" />
            ) : nurses.length === 0 ? (
              <Text style={styles.noStaff}>No nurses available</Text>
            ) : (
              <View style={styles.nurseGrid}>
                <TouchableOpacity
                  style={[styles.nurseChip, !nurseId && styles.nurseChipActive]}
                  onPress={() => setNurseId('')}
                >
                  <Text style={[styles.nurseChipText, !nurseId && styles.nurseChipTextActive]}>None</Text>
                </TouchableOpacity>
                {nurses.map((n) => (
                  <TouchableOpacity
                    key={n._id}
                    style={[styles.nurseChip, nurseId === n._id && styles.nurseChipActive]}
                    onPress={() => setNurseId(n._id)}
                  >
                    <Text style={[styles.nurseChipText, nurseId === n._id && styles.nurseChipTextActive]}>
                      {n.fullName || n.username}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Field>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => router.back()} disabled={loading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.submitBtn]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Admit Patient</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#CBD5E1', marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flexGrow: 1, padding: 16 },
  card: {
    backgroundColor: '#1E293B', borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: '#334155',
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#F1F5F9', marginBottom: 20 },
  errorBox: { backgroundColor: '#450A0A', borderColor: '#991B1B', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#FCA5A5', fontSize: 13, textAlign: 'center' },
  input: {
    backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155',
    borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, fontSize: 15, color: '#F1F5F9',
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  nurseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nurseChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0F172A' },
  nurseChipActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.15)' },
  nurseChipText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  nurseChipTextActive: { color: '#60A5FA' },
  noStaff: { color: '#64748B', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  cancelBtnText: { color: '#94A3B8', fontWeight: '600', fontSize: 15 },
  submitBtn: { backgroundColor: '#0D9488' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
