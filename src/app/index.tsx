import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { setBlockStateAndReload } from '../../modules/my-call-manager'; // Fixed path for subfolder[cite: 5]

const EXTENSION_IDENTIFIER = 'com.jalexzzStudio.hkCallBlocker.call-directory'; //[cite: 5]

export default function IndexScreen() {
  const [isActive, setIsActive] = useState(false); //[cite: 5]
  const [isProcessing, setIsProcessing] = useState(false); //[cite: 5]
  const [isReady, setIsReady] = useState(false); //[cite: 5]

  // Inputs for range testing
  const [startNumber, setStartNumber] = useState('85230000000');
  const [endNumber, setEndNumber] = useState('85230000050');

  useEffect(() => {
    const loadState = async () => {
      const savedState = await AsyncStorage.getItem('shieldStatus'); //[cite: 5]
      if (savedState === 'ON') {
        setIsActive(true); //[cite: 5]
      }
      setIsReady(true); //[cite: 5]
    };
    loadState();
  }, []);

  const toggleShield = async () => {
    const parsedStart = parseInt(startNumber, 10);
    const parsedEnd = parseInt(endNumber, 10);

    if (isNaN(parsedStart) || isNaN(parsedEnd)) {
      Alert.alert('Invalid Range', 'Please enter valid phone number values.');
      return;
    }

    if (parsedStart > parsedEnd) {
      Alert.alert('Invalid Range', 'Start number cannot be greater than end number.');
      return;
    }

    setIsProcessing(true); //[cite: 5]
    const newState = !isActive; //[cite: 5]

    try {
      await setBlockStateAndReload(newState, parsedStart, parsedEnd, EXTENSION_IDENTIFIER);
      await AsyncStorage.setItem('shieldStatus', newState ? 'ON' : 'OFF'); //[cite: 5]
      setIsActive(newState); //[cite: 5]
    } catch (error) {
      Alert.alert(
        'Action Required',
        'Please go to iOS Settings > Phone > Call Blocking & Identification and enable this app.' //[cite: 5]
      );
    } finally {
      setIsProcessing(false); //[cite: 5]
    }
  };

  if (!isReady) return null; //[cite: 5]

  return (
    <View style={[styles.container, isActive ? styles.bgActive : styles.bgInactive]}>
      <Text style={styles.title}>Persistent Spam Blocker</Text>
      <Text style={styles.subtitle}>Blocks HK numbers starting with 3</Text>

      <View style={styles.card}>
        {isProcessing ? (
          <>
            <ActivityIndicator size="large" color="#000" />
            <Text style={[styles.statusText, { marginTop: 10 }]}>Syncing numbers...</Text>
          </>
        ) : isActive ? (
          <Text style={[styles.statusText, { color: 'green' }]}>SHIELD IS ON 🛡️</Text> //[cite: 5]
        ) : (
          <Text style={[styles.statusText, { color: 'red' }]}>SHIELD IS OFF</Text> //[cite: 5]
        )}
      </View>

      {/* Inputs for testing speed */}
      <View style={styles.inputContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Number:</Text>
          <TextInput
            style={styles.input}
            value={startNumber}
            onChangeText={setStartNumber}
            keyboardType="numeric"
            placeholder="85230000000"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Number:</Text>
          <TextInput
            style={styles.input}
            value={endNumber}
            onChangeText={setEndNumber}
            keyboardType="numeric"
            placeholder="85230000050"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isProcessing && styles.buttonDisabled, isActive ? styles.btnOff : styles.btnOn]} //[cite: 5]
        onPress={toggleShield} //[cite: 5]
        disabled={isProcessing} //[cite: 5]
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
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }, //[cite: 5]
  bgActive: { backgroundColor: '#e6ffe6' }, //[cite: 5]
  bgInactive: { backgroundColor: '#f9f9f9' }, //[cite: 5]
  title: { fontSize: 24, fontWeight: 'bold' }, //[cite: 5]
  subtitle: { fontSize: 16, color: '#555', marginBottom: 20, marginTop: 5 },
  card: { padding: 20, backgroundColor: '#fff', borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, alignItems: 'center', justifyContent: 'center', width: '100%', height: 120, marginBottom: 20 },
  statusText: { fontSize: 22, fontWeight: 'bold' }, //[cite: 5]
  inputContainer: { width: '100%', marginBottom: 20 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  button: { paddingHorizontal: 30, paddingVertical: 18, borderRadius: 30, width: '100%', alignItems: 'center', marginBottom: 20 }, //[cite: 5]
  btnOn: { backgroundColor: '#007AFF' }, //[cite: 5]
  btnOff: { backgroundColor: '#FF3B30' }, //[cite: 5]
  buttonDisabled: { backgroundColor: '#999' }, //[cite: 5]
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }, //[cite: 5]
  instructions: { fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 } //[cite: 5]
});