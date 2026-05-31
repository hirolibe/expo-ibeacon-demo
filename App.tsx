import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { type DetectedBeacon, startScan, stopScan } from './src/beaconScanner';

type ScanState = 'idle' | 'scanning' | 'detected';

export default function App() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [latestBeacon, setLatestBeacon] = useState<DetectedBeacon | null>(null);
  const detectedRef = useRef(false);

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  async function handleStart() {
    detectedRef.current = false;
    setScanState('scanning');
    setLatestBeacon(null);

    try {
      await startScan((beacons) => {
        if (!detectedRef.current) {
          detectedRef.current = true;
        }
        setScanState('detected');
        setLatestBeacon(beacons[0] ?? null);
      });
    } catch (e) {
      setScanState('idle');
      Alert.alert('エラー', e instanceof Error ? e.message : String(e));
    }
  }

  function handleStop() {
    stopScan();
    setScanState('idle');
    setLatestBeacon(null);
    detectedRef.current = false;
  }

  const isScanning = scanState === 'scanning' || scanState === 'detected';

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Text style={styles.title}>iBeacon デモ</Text>

      {scanState === 'detected' && (
        <View style={styles.detectedBox}>
          <Text style={styles.detectedText}>iBeacon信号を検出しました！</Text>
        </View>
      )}

      {scanState === 'scanning' && (
        <View style={styles.scanningBox}>
          <Text style={styles.scanningText}>スキャン中…</Text>
          <Text style={styles.scanningSubText}>iBeacon を近づけてください</Text>
        </View>
      )}

      {scanState === 'idle' && (
        <View style={styles.idleBox}>
          <Text style={styles.idleText}>待機中</Text>
        </View>
      )}

      {latestBeacon && (
        <View style={styles.beaconInfo}>
          <Text style={styles.beaconInfoTitle}>検出ビーコン情報</Text>
          <Text style={styles.beaconInfoText}>UUID: {latestBeacon.uuid}</Text>
          <Text style={styles.beaconInfoText}>Major: {latestBeacon.major}</Text>
          <Text style={styles.beaconInfoText}>Minor: {latestBeacon.minor}</Text>
          <Text style={styles.beaconInfoText}>RSSI: {latestBeacon.rssi} dBm</Text>
        </View>
      )}

      <View style={styles.buttonArea}>
        {!isScanning ? (
          <Pressable style={[styles.button, styles.buttonStart]} onPress={handleStart}>
            <Text style={styles.buttonText}>スキャン開始</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.button, styles.buttonStop]} onPress={handleStop}>
            <Text style={styles.buttonText}>スキャン停止</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  detectedBox: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    borderWidth: 2,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  detectedText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#155724',
    textAlign: 'center',
  },
  scanningBox: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 2,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  scanningText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#856404',
  },
  scanningSubText: {
    fontSize: 14,
    color: '#856404',
    marginTop: 8,
  },
  idleBox: {
    backgroundColor: '#e9ecef',
    borderColor: '#adb5bd',
    borderWidth: 2,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  idleText: {
    fontSize: 20,
    color: '#6c757d',
  },
  beaconInfo: {
    backgroundColor: '#ffffff',
    borderColor: '#dee2e6',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    gap: 4,
  },
  beaconInfoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 4,
  },
  beaconInfoText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  buttonArea: {
    width: '100%',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonStart: {
    backgroundColor: '#007bff',
  },
  buttonStop: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
