import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  return (
    <SafeAreaProvider>
      {<Stack screenoptions={{ headerShown: false }}>
      {/* //   <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
        // <Stack.Screen name="auth/sign-up" options={{ title: "Sign Up" }} /> */}
      </Stack>}
    </SafeAreaProvider>
  );
}
