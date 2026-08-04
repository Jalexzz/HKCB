import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { setBlockStateAndReload } from '../../modules/my-call-manager'; // Fixed path for subfolder

const EXTENSION_IDENTIFIER = 'com.jalexzzStudio.hkCallBlocker.call-directory';

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

    // Define your test range here (or grab them from state/text inputs)
    const testStartNumber = 85230000000;
    const testEndNumber = 85230000050; // Smaller range for quicker testing

    try {
      // Update this call to match the new Expo Module signature
      await setBlockStateAndReload(newState, testStartNumber, testEndNumber, EXTENSION_IDENTIFIER);
      await AsyncStorage.setItem('shieldStatus', newState ? 'ON' : 'OFF');
      setIsActive(newState);
    } catch (error) {
      Alert.alert(
        'Action Required',
        'Please go to iOS Settings > Phone > Call Blocking & Identification and enable this app.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isReady) return null;

  return (
    <View style={[styles.container, isActive ? styles.bgActive : styles.bgInactive]}>
      <Text style={styles.title}>Persistent Spam Blocker</Text>
      <Text style={styles.subtitle}>Blocks HK numbers starting with 3</Text>

      <View style={styles.card}>
        {isProcessing ? (
          <>
            <ActivityIndicator size="large" color="#000" />
            <Text style={[styles.statusText, { marginTop: 10 }]}>Syncing 10M numbers...</Text>
          </>
        ) : isActive ? (
          <Text style={[styles.statusText, { color: 'green' }]}>SHIELD IS ON 🛡️</Text>
        ) : (
          <Text style={[styles.statusText, { color: 'red' }]}>SHIELD IS OFF</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, isProcessing && styles.buttonDisabled, isActive ? styles.btnOff : styles.btnOn]}
        onPress={toggleShield}
        disabled={isProcessing}
      >
        <Text style={styles.buttonText}>
          {isProcessing ? 'Please wait...' : isActive ? 'Turn OFF Shield' : 'Turn ON Shield'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.instructions}>
        When ON, this app continues blocking calls in the background permanently, even if you close the app or restart your phone.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  bgActive: { backgroundColor: '#e6ffe6' },
  bgInactive: { backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 40, marginTop: 5 },
  card: { padding: 30, backgroundColor: '#fff', borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, alignItems: 'center', justifyContent: 'center', width: '100%', height: 150, marginBottom: 40 },
  statusText: { fontSize: 22, fontWeight: 'bold' },
  button: { paddingHorizontal: 30, paddingVertical: 18, borderRadius: 30, width: '100%', alignItems: 'center', marginBottom: 20 },
  btnOn: { backgroundColor: '#007AFF' },
  btnOff: { backgroundColor: '#FF3B30' },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  instructions: { fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 }
});