import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setBlockStateAndReload, saveWhitelist } from '../../modules/my-call-manager';

const BUNDLE_ID = 'com.jalexzzStudio.hkCallBlocker';

// Institutional prefix blocks with comprehensive descriptive group labels
// Institutional prefix blocks with comprehensive descriptive group labels
const DATA_PREFIXES_META = [
  // --- Hospital Authority ---
  { prefix: 8523505, group: "Hospital Authority - Prince of Wales Hospital (Sha Tin)" },
  { prefix: 8523506, group: "Hospital Authority - Queen Elizabeth Hospital Cluster" },
  { prefix: 8522255, group: "Hospital Authority - Queen Mary Hospital (Pok Fu Lam)" },
  { prefix: 8523949, group: "Hospital Authority - United Christian Hospital (Kwun Tong)" },
  { prefix: 8523408, group: "Hospital Authority - Caritas Medical Centre (Sham Shui Po)" },
  { prefix: 8523513, group: "Hospital Authority - Hong Kong Children's Hospital" },
  { prefix: 8523517, group: "Hospital Authority - Kwong Wah Hospital" },
  { prefix: 8522990, group: "Hospital Authority - Princess Margaret Hospital" },
  { prefix: 8522468, group: "Hospital Authority - Tuen Mun Hospital" },
  { prefix: 8523129, group: "Hospital Authority - North District & Nethersole Hospital" },

  // --- Universities & Higher Education ---
  { prefix: 8523943, group: "The Chinese University of Hong Kong (CUHK)" },
  { prefix: 8522859, group: "The University of Hong Kong (HKU) - Main Campus Block 1" },
  { prefix: 8523917, group: "The University of Hong Kong (HKU) - Main Campus Block 2" },
  { prefix: 8522358, group: "The Hong Kong University of Science and Technology (HKUST)" },
  { prefix: 8523469, group: "The Hong Kong University of Science and Technology (HKUST) - Block 2" },
  { prefix: 8522766, group: "The Hong Kong Polytechnic University (PolyU) - Main Campus" },
  { prefix: 8523400, group: "The Hong Kong Polytechnic University (PolyU) - Block 2" },
  { prefix: 8523442, group: "City University of Hong Kong (CityU)" },
  { prefix: 8523411, group: "Hong Kong Baptist University (HKBU)" },
  { prefix: 8522948, group: "The Education University of Hong Kong (EdUHK)" },
  { prefix: 8522616, group: "Lingnan University (LU)" },
  { prefix: 8523120, group: "Hong Kong Metropolitan University (HKMU)" },
  { prefix: 8523963, group: "The Hang Seng University of Hong Kong (HSUHK)" },
  { prefix: 8522806, group: "Hong Kong Shue Yan University (HKSYU)" },
  { prefix: 8522584, group: "The Hong Kong Academy for Performing Arts (HKAPA)" },

  // --- Government & Public Services ---
  { prefix: 8523142, group: "Government - 1823 Integrated Call Centre Support" },
  { prefix: 8523919, group: "Government - Legislative Council Secretariat" },
  { prefix: 8523821, group: "Government - Immigration Department Administration" },
  { prefix: 8523594, group: "Government - Inland Revenue Department (IRD)" },
  { prefix: 8523971, group: "Government - Department of Health Enquiries" },
  { prefix: 8523162, group: "Government - Housing Department Enquiries" },
  { prefix: 8523583, group: "Government - Social Welfare Department Hotline" },
  { prefix: 8523842, group: "Government - Transport Department Licensing" },

  // --- Public Utilities & Infrastructure ---
  { prefix: 8522678, group: "Utility - CLP Power Hong Kong Customer Services" },
  { prefix: 8522880, group: "Utility - The Hong Kong and China Gas (Towngas)" },
  { prefix: 8522887, group: "Utility - HK Electric Customer Services" },
  { prefix: 8522881, group: "Infrastructure - MTR Corporation Enquiries" }
];

const DATA_PREFIXES = DATA_PREFIXES_META.map(item => item.prefix);

const DATA_SPECIFICS: Record<string, string> = {
  // --- Government & Regulatory Bodies ---
  "85231015555": "Companies Registry",
  "85237596888": "Customs & Excise Department Hotline",
  "85225277177": "Hong Kong Police Force General Hotline",
  "85236618000": "Hong Kong Police Force Headquarters",
  "85228788196": "Hong Kong Monetary Authority (HKMA)",
  "85222842288": "Securities and Futures Commission (SFC)",
  "85229180102": "Mandatory Provident Fund Schemes Authority (MPFA)",
  "85229292222": "Consumer Council Hotline",
  "85225118211": "Equal Opportunities Commission (EOC)",
  "85234236666": "PCPD Doxxing & Fraud Prevention Hotline",
  "85227122712": "Housing Authority Hotline",
  "85228042600": "Transport Department Hotline",
  "85223432255": "Social Welfare Department Hotline",

  // --- Traditional & Virtual Commercial Banks ---
  "85222333000": "HSBC Personal Banking Hotline",
  "85228220228": "Hang Seng Bank Customer Service",
  "85228868868": "Standard Chartered Hong Kong",
  "85239882388": "Bank of China (Hong Kong)",
  "85236080000": "The Bank of East Asia (BEA)",
  "85228600333": "Citibank Hong Kong",
  "85221895588": "ICBC (Asia) Customer Service",
  "85227795533": "China Construction Bank (Asia)",
  "85222908888": "DBS Bank (Hong Kong)",
  "85228159919": "OCBC Bank (Hong Kong)",
  "85228288000": "Dah Sing Bank Customer Service",
  "85228180282": "Shanghai Commercial Bank",
  "85222876767": "China CITIC Bank International",
  "85228065050": "Fubon Bank (Hong Kong)",
  "85222699888": "Bank of Communications (Hong Kong)",
  "85226280299": "Nanyang Commercial Bank",
  
  // --- Virtual Banks ---
  "85236653665": "ZA Bank (Virtual Bank)",
  "85238986988": "WeLab Bank (Virtual Bank)",
  "85229292998": "Livi Bank (Virtual Bank)"

  // --- Other ---
  "85260832065": "Honey Shan"
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
