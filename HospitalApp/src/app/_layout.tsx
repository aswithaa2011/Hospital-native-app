import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#F1F5F9',
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ title: "Dashboard", headerBackVisible: false }} />
      <Stack.Screen name="admit-patient" options={{ title: "Admit Patient" }} />
      <Stack.Screen name="assign-nurse" options={{ title: "Assign Nurse" }} />
      <Stack.Screen name="assign-room" options={{ title: "Assign Room & Doctor" }} />
      <Stack.Screen name="add-diagnosis" options={{ title: "Patient Diagnosis" }} />
      <Stack.Screen name="review-patient" options={{ title: "Review & Discharge" }} />
    </Stack>
  );
}
