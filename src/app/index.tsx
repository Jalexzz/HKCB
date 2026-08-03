import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { setBlockStateAndReload } from '../../modules/my-call-manager';

const EXTENSION_IDENTIFIER = 'com.jalexzzStudio.hkCallBlocker.call-directory';

// --- FRONTEND WHITELIST DATA STATES ---
const DATA_PREFIXES = [
  8523505, 8523506, 8523949, 8523408, 8523513, 8523129, // Hospitals
  8523943, 8523917, 8523442, 8523400, 8523411, 8523963, // Universities
  8523142, 8523919, 8523821                            // Government
];

const DATA_SPECIFICS = {
  "85231015555": "Companies Registry",
  "85237596888": "Customs Dept",
  "85239001111": "HK Police Force HQ",
  "85236670800": "HSBC Customer Services",
  "85237141388": "Hang Seng Helpline",
  "85237181818": "Standard Chartered",
  "85239882388": "Bank of China HK",
  "85260832065": "Honey Shan"
};

export default function IndexScreen() {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      const savedState = await AsyncStorage.getItem('shieldStatus');
      if (savedState === 'ON') {
        setIsActive(true);
      }
      setIsReady(true);
    };
    loadState();
  }, []);

  const toggleShield = async () => {
    setIsProcessing(true);
    const newState = !isActive;

    try {
      // Pass the state flags along with both dynamic datasets directly down the bridge channel
      await setBlockStateAndReload(newState, EXTENSION_IDENTIFIER, DATA_PREFIXES, DATA_SPECIFICS);
      await AsyncStorage.setItem('shieldStatus', newState ? 'ON' : 'OFF');
      setIsActive(newState);
    } catch (error) {
      Alert.alert(
        'Action Required',
        'Please enable the extension inside iOS Settings > Phone > Call Blocking & Identification.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isReady) return null;

  return (
    <View style={[styles.container, isActive ? styles.bgActive : styles.bgInactive]}>
      <Text style={styles.title}>Dynamic Shield Blocker</Text>
      <Text style={styles.subtitle}>Whitelists passed directly via Frontend</Text>

      <View style={styles.card}>
        {isProcessing ? (
          <>
            <ActivityIndicator size="large" color="#000" />
            <Text style={[styles.statusText, { marginTop: 10 }]}>Writing to Shared Memory...</Text>
          </>
        ) : isActive ? (
          <Text style={[styles.statusText, { color: 'green' }]}>SHIELD IS LIVE 🛡️</Text>
        ) : (
          <Text style={[styles.statusText, { color: 'red' }]}>SHIELD IS INACTIVE</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, isProcessing && styles.buttonDisabled, isActive ? styles.btnOff : styles.btnOn]}
        onPress={toggleShield}
        disabled={isProcessing}
      >
        <Text style={styles.buttonText}>
          {isProcessing ? 'Please wait...' : isActive ? 'Deactivate Shield' : 'Activate Shield'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  bgActive: { backgroundColor: '#e6ffe6' },
  bgInactive: { backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 40, marginTop: 5 },
  card: { padding: 30, backgroundColor: '#fff', borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, alignItems: 'center', justifyContent: 'center', width: '100%', height: 150, marginBottom: 40 },
  statusText: { fontSize: 20, fontWeight: 'bold' },
  button: { paddingHorizontal: 30, paddingVertical: 18, borderRadius: 30, width: '100%', alignItems: 'center', marginBottom: 20 },
  btnOn: { backgroundColor: '#007AFF' },
  btnOff: { backgroundColor: '#FF3B30' },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});