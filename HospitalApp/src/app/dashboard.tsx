import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  FlatList, Alert, Platform, StatusBar, RefreshControl, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import api from '../services/api';

interface UserInfo {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

interface Patient {
  _id: string;
  name: string;
  age: number;
  contact?: string;
  symptoms: string;
  status: string;
  roomNumber?: string;
  diagnosis?: string;
  reviewed?: boolean;
  assignedNurse?: { _id: string; username: string; fullName: string };
  assignedDoctor?: { _id: string; username: string; fullName: string };
}

const STATUS_COLORS: Record<string, string> = {
  'Admitted': '#F59E0B',
  'Nurse Assigned': '#3B82F6',
  'Room Assigned': '#8B5CF6',
  'Reported To Chief': '#EF4444',
  'Reviewed': '#10B981',
};

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('user').then((u) => {
      if (u) setUser(JSON.parse(u));
    });
  }, []);

  const getEndpoint = (role: string) => {
    if (role === 'doctor') return '/patient/my-patients';
    if (role === 'chiefdoctor') return '/patient/reported';
    return '/patient/all'; // reception, nurse
  };

  const fetchPatients = useCallback(async (isRefresh = false) => {
    if (!user) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const { data } = await api.get(getEndpoint(user.role));
      setPatients(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load patients.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchPatients(); }, [fetchPatients]));

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/');
  };

  const roleLabel: Record<string, string> = {
    reception: '🏥 Reception',
    nurse: '💉 Nurse',
    doctor: '🩺 Doctor',
    chiefdoctor: '⭐ Chief Doctor',
  };

  const canAdmit = user?.role === 'reception';
  const canAssignNurse = user?.role === 'reception';
  const canAssignRoom = user?.role === 'nurse';
  const canDiagnose = user?.role === 'doctor';
  const canReview = user?.role === 'chiefdoctor';

  const renderPatient = ({ item }: { item: Patient }) => {
    const statusColor = STATUS_COLORS[item.status] || '#64748B';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.patientName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <InfoChip label="Age" value={`${item.age} yrs`} />
          {item.roomNumber ? <InfoChip label="Room" value={item.roomNumber} /> : null}
          {item.assignedNurse ? <InfoChip label="Nurse" value={item.assignedNurse.fullName || item.assignedNurse.username} /> : null}
          {item.assignedDoctor ? <InfoChip label="Doctor" value={item.assignedDoctor.fullName || item.assignedDoctor.username} /> : null}
        </View>

        <Text style={styles.symptoms} numberOfLines={2}>🩺 {item.symptoms}</Text>

        {item.diagnosis ? (
          <Text style={styles.diagnosis} numberOfLines={2}>📋 Diagnosis: {item.diagnosis}</Text>
        ) : null}

        <View style={styles.cardActions}>
          {canAssignNurse && item.status === 'Admitted' ? (
            <ActionBtn label="Assign Nurse" color="#3B82F6"
              onPress={() => router.push({ pathname: '/assign-nurse', params: { id: item._id, name: item.name } })} />
          ) : null}
          {canAssignRoom && (item.status === 'Nurse Assigned' || item.status === 'Admitted') ? (
            <ActionBtn label="Assign Room & Doctor" color="#8B5CF6"
              onPress={() => router.push({ pathname: '/assign-room', params: { id: item._id, name: item.name } })} />
          ) : null}
          {canDiagnose && item.status === 'Room Assigned' ? (
            <ActionBtn label="Add Diagnosis" color="#0D9488"
              onPress={() => router.push({ pathname: '/add-diagnosis', params: { id: item._id, name: item.name } })} />
          ) : null}
          {canReview && !item.reviewed ? (
            <ActionBtn label="Review & Discharge" color="#10B981"
              onPress={() => router.push({ pathname: '/review-patient', params: { id: item._id, name: item.name } })} />
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Stack.Screen
        options={{
          title: user ? `${roleLabel[user.role] ?? user.role}` : 'Dashboard',
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {canAdmit ? (
        <TouchableOpacity style={styles.admitBar} onPress={() => router.push('/admit-patient')} activeOpacity={0.85}>
          <Text style={styles.admitBarText}>+ Admit New Patient</Text>
        </TouchableOpacity>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchPatients()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(p) => p._id}
          renderItem={renderPatient}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchPatients(true)}
              tintColor="#0D9488" colors={['#0D9488']} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No Patients</Text>
              <Text style={styles.emptySubtitle}>
                {canAdmit
                  ? 'Tap "+ Admit New Patient" to get started.'
                  : 'No patients assigned to you yet.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

function ActionBtn({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { borderColor: color, backgroundColor: color + '18' }]}
      onPress={onPress} activeOpacity={0.75}
    >
      <Text style={[styles.actionBtnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  list: { padding: 14, paddingBottom: 32 },
  admitBar: {
    backgroundColor: '#0D9488', marginHorizontal: 14, marginTop: 14,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  admitBarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  logoutBtn: {
    marginRight: 14, paddingVertical: 5, paddingHorizontal: 12,
    borderRadius: 8, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155',
  },
  logoutText: { color: '#F43F5E', fontWeight: '600', fontSize: 13 },
  loadingText: { color: '#94A3B8', marginTop: 10 },
  errorText: { color: '#FCA5A5', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: '#334155', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  retryText: { color: '#F1F5F9', fontWeight: '600' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#475569', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#334155', textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: '#1E293B', borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#334155',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  patientName: { fontSize: 17, fontWeight: '700', color: '#F1F5F9', flex: 1, marginRight: 8 },
  statusBadge: { borderWidth: 1, borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: { backgroundColor: '#0F172A', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  chipLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  chipValue: { fontSize: 12, color: '#CBD5E1', fontWeight: '600' },
  symptoms: { fontSize: 13, color: '#94A3B8', marginBottom: 6, lineHeight: 18 },
  diagnosis: { fontSize: 13, color: '#6EE7B7', marginBottom: 6, lineHeight: 18 },
  cardActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, borderTopWidth: 1, borderTopColor: '#1E3A52', paddingTop: 10 },
  actionBtn: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
});
