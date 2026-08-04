import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setBlockStateAndReload } from '../modules/my-call-manager';

// Ensure this exactly matches your app.json bundleIdentifier
const BUNDLE_ID = 'com.jalexzzStudio.hkCallBlocker'; 

const DATA_PREFIXES = [
  8523505, 8523506, 8523949, 8523408, 8523513, 8523129,
  8523943, 8523917, 8523442, 8523400, 8523411, 8523963,
  8523142, 8523919, 8523821
];

const DATA_SPECIFICS = {
  "85231015555": "Companies Registry",
  "85237596888": "Customs Dept",
  "85239001111": "HK Police Force HQ",
  "85236670800": "HSBC Customer Services",
  "85237141388": "Hang Seng Helpline",
  "85237181818": "Standard Chartered",
  "85239882388": "Bank of China HK"
};

export default function IndexScreen() {
  const [status, setStatus] = useState({ 1: false, 2: false, 3: false });
  const [processing, setProcessing] = useState({ 1: false, 2: false, 3: false });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      const p1 = await AsyncStorage.getItem('shield_1');
      const p2 = await AsyncStorage.getItem('shield_2');
      const p3 = await AsyncStorage.getItem('shield_3');
      setStatus({ 1: p1 === 'ON', 2: p2 === 'ON', 3: p3 === 'ON' });
      setIsReady(true);
    };
    loadState();
  }, []);

  const toggleShield = async (part: 1 | 2 | 3) => {
    setProcessing(prev => ({ ...prev, [part]: true }));
    const newState = !status[part];
    
    // Dynamically targets call-directory-1, 2, or 3 based on the button pressed
    const identifier = `${BUNDLE_ID}.call-directory-${part}`;

    try {
      await setBlockStateAndReload(newState, identifier, DATA_PREFIXES, DATA_SPECIFICS);
      await AsyncStorage.setItem(`shield_${part}`, newState ? 'ON' : 'OFF');
      setStatus(prev => ({ ...prev, [part]: newState }));
    } catch (error) {
      Alert.alert(
        'Action Required', 
        `Please enable "HK Blocker (Part ${part})" inside iOS Settings > Phone > Call Blocking.`
      );
    } finally {
      setProcessing(prev => ({ ...prev, [part]: false }));
    }
  };

  if (!isReady) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tri-Shield Blocker</Text>
      <Text style={styles.subtitle}>Memory-optimized multi-extension system</Text>

      {[1, 2, 3].map((part) => {
        const isActive = status[part as 1 | 2 | 3];
        const isProc = processing[part as 1 | 2 | 3];

        return (
          <View key={part} style={[styles.card, isActive ? styles.bgActive : styles.bgInactive]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Shield Part {part}</Text>
              {isProc ? (
                <ActivityIndicator size="small" color="#000" />
              ) : isActive ? (
                <Text style={{ color: 'green', fontWeight: 'bold' }}>ON 🛡️</Text>
              ) : (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>OFF</Text>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.button, isProc && styles.buttonDisabled, isActive ? styles.btnOff : styles.btnOn]} 
              onPress={() => toggleShield(part as 1 | 2 | 3)}
              disabled={isProc}
            >
              <Text style={styles.buttonText}>
                {isProc ? 'Syncing...' : isActive ? 'Deactivate' : 'Activate'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  bgActive: { backgroundColor: '#e6ffe6', borderColor: '#b3ffb3' },
  bgInactive: { backgroundColor: '#fff', borderColor: '#eee' },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 30, marginTop: 5 },
  card: { padding: 25, borderRadius: 15, borderWidth: 1, width: '100%', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 20, fontWeight: '600' },
  button: { paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  btnOn: { backgroundColor: '#007AFF' },
  btnOff: { backgroundColor: '#FF3B30' },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
