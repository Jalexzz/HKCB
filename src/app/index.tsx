import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setBlockStateAndReload, saveWhitelist } from '../../modules/my-call-manager';

const BUNDLE_ID = 'com.jalexzzStudio.hkCallBlocker';

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
  const [whitelistActive, setWhitelistActive] = useState(false);
  const [whitelistProcessing, setWhitelistProcessing] = useState(false);
  
  const [status, setStatus] = useState({ 1: false, 2: false, 3: false });
  const [processing, setProcessing] = useState({ 1: false, 2: false, 3: false });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      const wl = await AsyncStorage.getItem('shield_whitelist');
      const p1 = await AsyncStorage.getItem('shield_1');
      const p2 = await AsyncStorage.getItem('shield_2');
      const p3 = await AsyncStorage.getItem('shield_3');
      
      setWhitelistActive(wl === 'ON');
      setStatus({ 1: p1 === 'ON', 2: p2 === 'ON', 3: p3 === 'ON' });
      setIsReady(true);
    };
    loadState();
  }, []);

  // BUTTON 1: Dedicated Whitelist & Caller ID Sync
  const toggleWhitelist = async () => {
    setWhitelistProcessing(true);
    const newState = !whitelistActive;
    const identifier = `${BUNDLE_ID}.call-directory-whitelist`;

    try {
      // Step A: Save arrays to App Group shared memory
      await saveWhitelist(DATA_PREFIXES, DATA_SPECIFICS);
      // Step B: Reload Whitelist extension
      await setBlockStateAndReload(newState, identifier);
      
      await AsyncStorage.setItem('shield_whitelist', newState ? 'ON' : 'OFF');
      setWhitelistActive(newState);
    } catch (error) {
      Alert.alert('Action Required', 'Please enable "HK Blocker (Caller ID & Whitelist)" in iOS Settings > Phone > Call Blocking.');
    } finally {
      setWhitelistProcessing(false);
    }
  };

  // BUTTONS 2, 3, 4: Blocker Shields (Part 1, 2, 3)
  const toggleShield = async (part: 1 | 2 | 3) => {
    setProcessing(prev => ({ ...prev, [part]: true }));
    const newState = !status[part];
    const identifier = `${BUNDLE_ID}.call-directory-${part}`;

    try {
      await setBlockStateAndReload(newState, identifier);
      await AsyncStorage.setItem(`shield_${part}`, newState ? 'ON' : 'OFF');
      setStatus(prev => ({ ...prev, [part]: newState }));
    } catch (error) {
      Alert.alert('Action Required', `Please enable "HK Blocker (Part ${part})" in iOS Settings > Phone > Call Blocking.`);
    } finally {
      setProcessing(prev => ({ ...prev, [part]: false }));
    }
  };

  if (!isReady) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Call Control Center</Text>
      <Text style={styles.subtitle}>Independent Whitelist & Modular Block Shields</Text>

      {/* --- WHITELIST & CALLER ID CARD --- */}
      <View style={[styles.card, styles.whitelistCard]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>VIP Whitelist & Caller ID</Text>
            <Text style={styles.cardSubtitle}>Hospitals, Banks, Schools & Gov</Text>
          </View>
          {whitelistProcessing ? (
            <ActivityIndicator size="small" color="#000" />
          ) : whitelistActive ? (
            <Text style={{ color: 'green', fontWeight: 'bold' }}>ACTIVE 🟢</Text>
          ) : (
            <Text style={{ color: 'red', fontWeight: 'bold' }}>OFF</Text>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.button, whitelistProcessing && styles.buttonDisabled, whitelistActive ? styles.btnOff : styles.btnWhitelist]} 
          onPress={toggleWhitelist}
          disabled={whitelistProcessing}
        >
          <Text style={styles.buttonText}>
            {whitelistProcessing ? 'Syncing...' : whitelistActive ? 'Disable Whitelist' : 'Sync & Enable Whitelist'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>BLOCK SHIELDS (3 PREFIX)</Text>

      {/* --- BLOCKER SHIELD CARDS (PARTS 1 - 3) --- */}
      {[1, 2, 3].map((part) => {
        const isActive = status[part as 1 | 2 | 3];
        const isProc = processing[part as 1 | 2 | 3];

        return (
          <View key={part} style={[styles.card, isActive ? styles.bgActive : styles.bgInactive]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Blocker Shield Part {part}</Text>
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
                {isProc ? 'Syncing...' : isActive ? 'Deactivate' : 'Activate Shield'}
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
  whitelistCard: { backgroundColor: '#f0f4ff', borderColor: '#c7d8ff' },
  bgActive: { backgroundColor: '#e6ffe6', borderColor: '#b3ffb3' },
  bgInactive: { backgroundColor: '#fff', borderColor: '#eee' },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 25, marginTop: 5 },
  sectionHeader: { fontSize: 12, fontWeight: 'bold', color: '#888', alignSelf: 'flex-start', marginBottom: 10, marginTop: 10, letterSpacing: 1 },
  card: { padding: 20, borderRadius: 15, borderWidth: 1, width: '100%', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  button: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnWhitelist: { backgroundColor: '#5856D6' },
  btnOn: { backgroundColor: '#007AFF' },
  btnOff: { backgroundColor: '#FF3B30' },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
