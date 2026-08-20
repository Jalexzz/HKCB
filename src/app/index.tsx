import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { setBlockStateAndReload } from '../../modules/my-call-manager'; // Fixed path for subfolder

const EXTENSION_IDENTIFIER = 'com.jalexzzStudio.hkCallBlocker.FirstCallDirectory'; //

// Institutional prefix blocks with comprehensive descriptive group labels
const DATA_PREFIXES_META = [
  // --- Hospital Authority ---
  { prefix: 8523505, group: "Hospital Authority - Prince of Wales Hospital (Sha Tin)" },
  { prefix: 8523506, group: "Hospital Authority - Queen Elizabeth Hospital Cluster" },
  { prefix: 8523949, group: "Hospital Authority - United Christian Hospital (Kwun Tong)" },
  { prefix: 8523408, group: "Hospital Authority - Caritas Medical Centre (Sham Shui Po)" },
  { prefix: 8523513, group: "Hospital Authority - Hong Kong Children's Hospital" },
  { prefix: 8523517, group: "Hospital Authority - Kwong Wah Hospital" },
  { prefix: 8523129, group: "Hospital Authority - Kowloon Hospital" },
  { prefix: 8523501, group: "Hospital Authority - Queen Mary Hospital" },
  { prefix: 8523504, group: "Hospital Authority - Princess Margaret Hospital" },
  { prefix: 8523507, group: "Hospital Authority - Tuen Mun Hospital" },
  { prefix: 8523125, group: "Hospital Authority - Pamela Youde Nethersole Eastern Hospital" },
  { prefix: 8523941, group: "Hospital Authority - Hong Kong Eye Hospital" },
  { prefix: 8523467, group: "Hospital Authority - North Lantau Hospital" },

  // --- Universities & Higher Education ---
  { prefix: 8523943, group: "The Chinese University of Hong Kong (CUHK)" },
  { prefix: 8523917, group: "The University of Hong Kong (HKU)" },
  { prefix: 8523469, group: "The Hong Kong University of Science and Technology (HKUST)" },
  { prefix: 8523400, group: "The Hong Kong Polytechnic University (PolyU)" },
  { prefix: 8523442, group: "City University of Hong Kong (CityU)" },
  { prefix: 8523411, group: "Hong Kong Baptist University (HKBU)" },
  { prefix: 8523120, group: "Hong Kong Metropolitan University (HKMU)" },
  { prefix: 8523963, group: "The Hang Seng University of Hong Kong (HSUHK)" },
  { prefix: 8523190, group: "The Education University of Hong Kong (EdUHK)" },
  { prefix: 8523762, group: "HKU SPACE" },
  { prefix: 8523928, group: "Vocational Training Council (VTC)" },

  // --- Traditional Banks ---
  { prefix: 8523948, group: "Standard Chartered Bank (Hong Kong)" },
  { prefix: 8523608, group: "The Bank of East Asia (BEA)" },
  { prefix: 8523988, group: "Bank of China (Hong Kong)" },
  { prefix: 8523668, group: "DBS Bank (Marketing/Sales)" },

  // --- Law Enforcement & Major Government ---
  { prefix: 8523142, group: "HKSAR Government - 1823 Call Centre (Outbound)" },
  { prefix: 8523152, group: "HKSAR Government - 1823 Call Centre (Outbound)" },
  { prefix: 8523661, group: "Hong Kong Police Force (Headquarters & Regional Stations)" },
  { prefix: 8523759, group: "Customs and Excise Department" },
  { prefix: 8523919, group: "Legislative Council (LegCo Secretariat)" },
  { prefix: 8523961, group: "Department of Health" },

  // --- Telecom & Utilities ---
  { prefix: 8523999, group: "HKBN (Hong Kong Broadband Network)" },
  { prefix: 8523626, group: "HKBN (Hong Kong Broadband Network)" },
  { prefix: 8523162, group: "3HK (Three Hong Kong)" },
  { prefix: 8523166, group: "3HK (Three Hong Kong)" },
];

const DATA_PREFIXES = DATA_PREFIXES_META.map(item => item.prefix);

const DATA_SPECIFICS = {};

export default function IndexScreen() {
  const [isActive, setIsActive] = useState(false); //
  const [isProcessing, setIsProcessing] = useState(false); //
  const [isReady, setIsReady] = useState(false); //

  const [startNumber, setStartNumber] = useState('85230000000');
  const [endNumber, setEndNumber] = useState('85231000000');

  useEffect(() => {
    const loadState = async () => {
      const savedState = await AsyncStorage.getItem('shieldStatus'); //
      if (savedState === 'ON') {
        setIsActive(true); //
      }
      setIsReady(true); //
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

    setIsProcessing(true); //
    const newState = !isActive; //

    try {
      await setBlockStateAndReload(newState, parsedStart, parsedEnd, EXTENSION_IDENTIFIER);
      await AsyncStorage.setItem('shieldStatus', newState ? 'ON' : 'OFF'); //
      setIsActive(newState); //
    } catch (error) {
      Alert.alert(
        'Action Required',
        'Please go to iOS Settings > Phone > Call Blocking & Identification and enable this app.' //
      );
    } finally {
      setIsProcessing(false); //
    }
  };

  if (!isReady) return null; //

  return (
    <ScrollView 
      style={[isActive ? styles.bgActive : styles.bgInactive]} //
      contentContainerStyle={styles.container} //
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Persistent Spam Blocker</Text>
      <Text style={styles.subtitle}>Blocks HK numbers starting with 3</Text>

      <View style={styles.card}>
        {isProcessing ? (
          <>
            <ActivityIndicator size="large" color="#000" />
            <Text style={[styles.statusText, { marginTop: 10 }]}>Syncing numbers...</Text>
          </>
        ) : isActive ? (
          <Text style={[styles.statusText, { color: 'green' }]}>SHIELD IS ON 🛡️</Text> //
        ) : (
          <Text style={[styles.statusText, { color: 'red' }]}>SHIELD IS OFF</Text> //
        )}
      </View>

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
        style={[styles.button, isProcessing && styles.buttonDisabled, isActive ? styles.btnOff : styles.btnOn]} //
        onPress={toggleShield} //
        disabled={isProcessing} //
      >
        <Text style={styles.buttonText}>
          {isProcessing ? 'Please wait...' : isActive ? 'Turn OFF Shield' : 'Turn ON Shield'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.instructions}>
        When ON, this app continues blocking calls in the background permanently, even if you close the app or restart your phone.
      </Text>

      {true && (
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20, paddingBottom: 60 }, //
  bgActive: { backgroundColor: '#e6ffe6' }, //
  bgInactive: { backgroundColor: '#f9f9f9' }, //
  title: { fontSize: 24, fontWeight: 'bold' }, //
  subtitle: { fontSize: 16, color: '#555', marginBottom: 20, marginTop: 5 },
  card: { padding: 20, backgroundColor: '#fff', borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, alignItems: 'center', justifyContent: 'center', width: '100%', height: 120, marginBottom: 20 },
  statusText: { fontSize: 22, fontWeight: 'bold' }, //
  inputContainer: { width: '100%', marginBottom: 20 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  button: { paddingHorizontal: 30, paddingVertical: 18, borderRadius: 30, width: '100%', alignItems: 'center', marginBottom: 20 }, //
  btnOn: { backgroundColor: '#007AFF' }, //
  btnOff: { backgroundColor: '#FF3B30' }, //
  buttonDisabled: { backgroundColor: '#999' }, //
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }, //
  instructions: { fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 }, //
  masterButton: { backgroundColor: '#FF9500', padding: 18, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  masterButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  whitelistCard: { backgroundColor: '#f0f4ff', borderColor: '#c7d8ff' },
  sectionHeader: { fontSize: 12, fontWeight: 'bold', color: '#888', alignSelf: 'flex-start', marginBottom: 10, marginTop: 10, letterSpacing: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  btnWhitelist: { backgroundColor: '#5856D6' },
  dataSection: { width: '100%', marginTop: 20, marginBottom: 40 },
  dataToggle: { backgroundColor: '#eee', padding: 15, borderRadius: 10, alignItems: 'center' },
  dataToggleText: { fontSize: 16, fontWeight: '600', color: '#333' },
  dataContent: { marginTop: 15, padding: 10, width: '100%' },
  dataHeader: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#222' },
  dataSubText: { fontSize: 12, color: '#666', marginBottom: 5, fontStyle: 'italic' },
  dataBox: { backgroundColor: '#f8f8f8', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  dataText: { fontSize: 14, color: '#444', marginBottom: 6 },
  boldNum: { fontWeight: 'bold', color: '#000', fontSize: 13 },
  itemRow: { marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 6 },
  groupDesc: { fontSize: 13, color: '#0055aa', marginTop: 2 }
});
