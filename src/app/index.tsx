import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { saveWhitelist, setBlockStateAndReload } from '../../modules/my-call-manager';

const BUNDLE_ID = 'com.jalexzzStudio.hkCallBlocker';

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

const DATA_SPECIFICS: Record<string, string> = {
  // --- Traditional & Virtual Banks ---
  // "85239882388": "Bank of China (Hong Kong)",
  // "85236653665": "ZA Bank Hotline",
  // "85238963896": "Mox Bank Hotline",
  // "85237618888": "WeLab Bank Hotline",
  // "85238978888": "Livi Bank Hotline",
  // "85238438888": "Ant Bank Hotline",

  // --- Specific Government & Public Main Lines ---
  // "85239193333": "Legislative Council Secretariat",
  
  // --- Other ---
  // "85260832065": "Honey Shan"
};

export default function IndexScreen() {
  const [whitelistActive, setWhitelistActive] = useState(false);
  const [whitelistProcessing, setWhitelistProcessing] = useState(false);
  
  const [status, setStatus] = useState({ 1: false, 2: false, 3: false });
  const [processing, setProcessing] = useState({ 1: false, 2: false, 3: false });
  const [globalProcessing, setGlobalProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const [showData, setShowData] = useState(false);

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

  const handleMasterSyncAndEnable = async () => {
    setGlobalProcessing(true);
    try {
      await saveWhitelist(DATA_PREFIXES, DATA_SPECIFICS);
      await setBlockStateAndReload(true, `${BUNDLE_ID}.call-directory-whitelist`);

      for (let part = 1; part <= 3; part++) {
        await setBlockStateAndReload(true, `${BUNDLE_ID}.call-directory-${part}`);
      }

      await AsyncStorage.multiSet([
        ['shield_whitelist', 'ON'],
        ['shield_1', 'ON'],
        ['shield_2', 'ON'],
        ['shield_3', 'ON']
      ]);

      setWhitelistActive(true);
      setStatus({ 1: true, 2: true, 3: true });
      
      Alert.alert(
        'Synchronization Complete', 
        'All blocked ranges and enterprise whitelists have been successfully compiled into iOS CallKit.'
      );
    } catch (error) {
      Alert.alert(
        'Action Required in iOS Settings', 
        'Please go to iOS Settings > Phone > Call Blocking & Identification and ensure all 4 HK Blocker modules are toggled ON.'
      );
    } finally {
      setGlobalProcessing(false);
    }
  };

  const toggleWhitelist = async () => {
    setWhitelistProcessing(true);
    const newState = !whitelistActive;
    const identifier = `${BUNDLE_ID}.call-directory-whitelist`;

    try {
      await saveWhitelist(DATA_PREFIXES, DATA_SPECIFICS);
      await setBlockStateAndReload(newState, identifier);
      await AsyncStorage.setItem('shield_whitelist', newState ? 'ON' : 'OFF');
      setWhitelistActive(newState);
    } catch (error) {
      Alert.alert('Action Required', 'Please enable "HK Blocker (Caller ID & Whitelist)" in iOS Settings > Phone > Call Blocking.');
    } finally {
      setWhitelistProcessing(false);
    }
  };

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

      {/* MASTER SYNC BUTTON */}
      <TouchableOpacity 
        style={[styles.masterButton, globalProcessing && styles.buttonDisabled]} 
        onPress={handleMasterSyncAndEnable}
        disabled={globalProcessing}
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
  container: { flexGrow: 1, alignItems: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  masterButton: { backgroundColor: '#FF9500', padding: 18, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  masterButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
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
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  dataSection: { width: '100%', marginTop: 20, marginBottom: 40 },
  dataToggle: { backgroundColor: '#eee', padding: 15, borderRadius: 10, alignItems: 'center' },
  dataToggleText: { fontSize: 16, fontWeight: '600', color: '#333' },
  dataContent: { marginTop: 15, padding: 10 },
  dataHeader: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#222' },
  dataSubText: { fontSize: 12, color: '#666', marginBottom: 5, fontStyle: 'italic' },
  dataBox: { backgroundColor: '#f8f8f8', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  dataText: { fontSize: 14, color: '#444', marginBottom: 6 },
  boldNum: { fontWeight: 'bold', color: '#000', fontSize: 13 },
  itemRow: { marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 6 },
  groupDesc: { fontSize: 13, color: '#0055aa', marginTop: 2 }
});
