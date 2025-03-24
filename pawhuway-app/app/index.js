import { Redirect } from "expo-router";
import { useFonts } from 'expo-font';

export default function Index() {
  const [fontsLoaded] = useFonts({
    'LEMON MILK Medium': require('../assets/fonts/lemon_milk.otf'),
  });

  if (!fontsLoaded) {
    return null; // Prevent rendering until fonts are loaded
  };


  return <Redirect href="/auth/sign-in" />;
}
