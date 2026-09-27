import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "./src/context/AppContext";
import HomeScreen from "./src/screens/HomeScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <HomeScreen />
      </AppProvider>
    </SafeAreaProvider>
  );
}
