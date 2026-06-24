import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../services/api';

// Valid roles from the backend User model enum
const ROLES = [
  { value: 'reception', label: 'Reception' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'chiefdoctor', label: 'Chief Doctor' },
];

export default function LoginScreen() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('reception');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      if (token) router.replace('/dashboard');
      else setCheckingAuth(false);
    });
  }, []);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await api.post('/auth/register', {
          username: username.trim(),
          password,
          role,
          fullName: fullName.trim() || username.trim(),
        });
      }
      const { data } = await api.post('/auth/login', {
        username: username.trim(),
        password,
      });
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      router.replace('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Could not connect. Make sure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>🏥 Hospital Portal</Text>
          <Text style={styles.subtitle}>
            {isRegister ? 'Create your staff account' : 'Sign in to your staff account'}
          </Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          {isRegister && (
            <Field label="Full Name (optional)">
              <TextInput style={styles.input} placeholder="e.g. Dr. Jane Smith"
                placeholderTextColor="#475569" value={fullName}
                onChangeText={setFullName} autoCapitalize="words" />
            </Field>
          )}

          <Field label="Username">
            <TextInput style={styles.input} placeholder="Enter your username"
              placeholderTextColor="#475569" value={username}
              onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
          </Field>

          <Field label="Password">
            <TextInput style={styles.input} placeholder="Enter your password"
              placeholderTextColor="#475569" value={password}
              onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} />
          </Field>

          {isRegister && (
            <Field label="Role">
              <View style={styles.roleGrid}>
                {ROLES.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleChip, role === r.value && styles.roleChipActive]}
                    onPress={() => setRole(r.value)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.roleChipText, role === r.value && styles.roleChipTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
          )}

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>{isRegister ? 'Create Account' : 'Sign In'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggle} onPress={() => { setIsRegister(!isRegister); setError(''); }} disabled={loading}>
            <Text style={styles.toggleText}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.toggleLink}>{isRegister ? 'Sign In' : 'Sign Up'}</Text>
            </Text>
          </TouchableOpacity>
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
  splash: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%', maxWidth: 440, backgroundColor: '#1E293B',
    borderRadius: 20, padding: 28, borderWidth: 1, borderColor: '#334155',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#F1F5F9', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  errorBox: {
    backgroundColor: '#450A0A', borderColor: '#991B1B', borderWidth: 1,
    borderRadius: 10, padding: 12, marginBottom: 20,
  },
  errorText: { color: '#FCA5A5', fontSize: 13, textAlign: 'center' },
  input: {
    backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155',
    borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14,
    fontSize: 15, color: '#F1F5F9',
  },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8,
    borderWidth: 1, borderColor: '#334155', backgroundColor: '#0F172A',
  },
  roleChipActive: { borderColor: '#0D9488', backgroundColor: 'rgba(13,148,136,0.15)' },
  roleChipText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  roleChipTextActive: { color: '#2DD4BF' },
  btn: {
    backgroundColor: '#0D9488', borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  toggle: { marginTop: 20, alignItems: 'center' },
  toggleText: { color: '#64748B', fontSize: 14 },
  toggleLink: { color: '#38BDF8', fontWeight: '600' },
});
