import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { setBlockStateAndReload } from '../../modules/my-call-manager'; // Fixed path for subfolder[cite: 5]

const EXTENSION_IDENTIFIER = 'com.jalexzzStudio.hkCallBlocker.call-directory'; //[cite: 5]

export default function IndexScreen() {
  const [isActive, setIsActive] = useState(false); //[cite: 5]
  const [isProcessing, setIsProcessing] = useState(false); //[cite: 5]
  const [isReady, setIsReady] = useState(false); //[cite: 5]

  // Inputs for range testing
  const [startNumber, setStartNumber] = useState('85230000000');
  const [endNumber, setEndNumber] = useState('85231000000');

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Call Control Center</Text>
      <Text style={styles.subtitle}>Independent Whitelist & Modular Block Shields</Text>

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
            placeholder="85231000000"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isProcessing && styles.buttonDisabled, isActive ? styles.btnOff : styles.btnOn]} //[cite: 5]
        onPress={toggleShield} //[cite: 5]
        disabled={isProcessing} //[cite: 5]
      >
        {globalProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.masterButtonText}>⚡ Master Sync & Enable All Shields</Text>
        )}
      </TouchableOpacity>

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

      {/* --- BLOCKER SHIELD CARDS --- */}
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

      {/* --- DATABASE OVERVIEW SECTION WITH DESCRIPTIONS --- */}
      <View style={styles.dataSection}>
        <TouchableOpacity style={styles.dataToggle} onPress={() => setShowData(!showData)}>
          <Text style={styles.dataToggleText}>
            {showData ? 'Hide Database Rules ⬆️' : 'View Database Rules & Descriptions ⬇️'}
          </Text>
        </TouchableOpacity>

        {showData && (
          <View style={styles.dataContent}>
            
            <Text style={styles.dataHeader}>🛡️ Blocked Ranges (10,000,000 Numbers)</Text>
            <View style={styles.dataBox}>
              <Text style={styles.dataText}>Part 1: 852 3000 0000 ➔ 852 3399 9999</Text>
              <Text style={styles.dataText}>Part 2: 852 3400 0000 ➔ 852 3699 9999</Text>
              <Text style={styles.dataText}>Part 3: 852 3700 0000 ➔ 852 3999 9999</Text>
            </View>

            <Text style={styles.dataHeader}>✅ Exact Whitelist & Caller ID Names</Text>
            <View style={styles.dataBox}>
              {Object.entries(DATA_SPECIFICS).map(([number, name]) => (
                <Text key={number} style={styles.dataText}>
                  <Text style={styles.boldNum}>{number.replace(/(\d{3})(\d{4})(\d{4})/, '+$1 $2 $3')}</Text> ➔ {name}
                </Text>
              ))}
            </View>

            <Text style={styles.dataHeader}>✅ Allowed Institutional Block Groups</Text>
            <Text style={styles.dataSubText}>Bypasses blocking for entire 10,000 number prefix blocks:</Text>
            <View style={styles.dataBox}>
              {DATA_PREFIXES_META.map(item => (
                <View key={item.prefix} style={styles.itemRow}>
                  <Text style={styles.boldNum}>+{item.prefix} XXXX</Text>
                  <Text style={styles.groupDesc}>{item.group}</Text>
                </View>
              ))}
            </View>

          </View>
        )}
      </View>
      
    </ScrollView>
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
