import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../services/api';

interface StaffMember { _id: string; username: string; fullName: string; }

export default function AssignRoomScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/staff?roles=doctor')
      .then(({ data }) => setDoctors(data))
      .catch(() => setError('Failed to load doctors.'))
      .finally(() => setLoadingDoctors(false));
  }, []);

  const handleSubmit = async () => {
    if (!roomNumber.trim()) { setError('Room number is required.'); return; }
    if (!doctorId) { setError('Please select a doctor.'); return; }
    setError(''); setLoading(true);
    try {
      await api.put(`/patient/assign-room/${id}`, { roomNumber: roomNumber.trim(), doctorId });
      router.back();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign room.');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assign Room & Doctor</Text>
          <Text style={styles.patientLabel}>Patient: <Text style={styles.patientName}>{name}</Text></Text>
          {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>⚠ {error}</Text></View>}

          <View style={{ marginBottom: 16 }}>
            <Text style={styles.fieldLabel}>Room Number *</Text>
            <TextInput style={styles.input} placeholder="e.g. 204-B"
              placeholderTextColor="#475569" value={roomNumber} onChangeText={setRoomNumber} />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={styles.fieldLabel}>Assign Doctor *</Text>
            {loadingDoctors
              ? <ActivityIndicator color="#0D9488" />
              : doctors.length === 0
                ? <Text style={styles.noStaff}>No doctors available.</Text>
                : (
                  <View style={styles.grid}>
                    {doctors.map((d) => (
                      <TouchableOpacity
                        key={d._id}
                        style={[styles.chip, doctorId === d._id && styles.chipActive]}
                        onPress={() => setDoctorId(d._id)}
                      >
                        <Text style={[styles.chipText, doctorId === d._id && styles.chipTextActive]}>
                          {d.fullName || d.username}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
          </View>

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
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#CBD5E1', marginBottom: 6 },
  input: {
    backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155',
    borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, fontSize: 15, color: '#F1F5F9',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0F172A' },
  chipActive: { borderColor: '#8B5CF6', backgroundColor: 'rgba(139,92,246,0.15)' },
  chipText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  chipTextActive: { color: '#A78BFA' },
  noStaff: { color: '#64748B', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  cancelText: { color: '#94A3B8', fontWeight: '600', fontSize: 15 },
  submitBtn: { backgroundColor: '#8B5CF6' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
