import { DeviceEventEmitter, EmitterSubscription } from 'react-native';
import * as BeaconRadar from 'react-native-beacon-radar';

// ======================================================
// 自分のビーコンの UUID に書き換えてください
// ======================================================
export const BEACON_UUID = 'YOUR-BEACON-UUID-HERE';

export type DetectedBeacon = {
  uuid: string;
  major: number;
  minor: number;
  rssi: number;
  distance: number;
};

type AuthStatus = string | { status: string };

async function requestPermission(): Promise<boolean> {
  const raw = (await (BeaconRadar as unknown as {
    getAuthorizationStatus: () => Promise<AuthStatus>;
  }).getAuthorizationStatus()) as AuthStatus;

  const status = typeof raw === 'string' ? raw : raw.status;

  if (status === 'authorizedWhenInUse' || status === 'authorizedAlways') {
    return true;
  }

  const result = (await BeaconRadar.requestWhenInUseAuthorization()) as AuthStatus;
  const granted = typeof result === 'string' ? result : result.status;
  return granted === 'authorizedWhenInUse' || granted === 'authorizedAlways';
}

let subscription: EmitterSubscription | null = null;

export async function startScan(onDetected: (beacons: DetectedBeacon[]) => void): Promise<void> {
  const permitted = await requestPermission();
  if (!permitted) {
    throw new Error('位置情報の権限が許可されていません');
  }

  subscription = DeviceEventEmitter.addListener(
    'onBeaconsDetected',
    (raw: DetectedBeacon[] | DetectedBeacon | undefined | null) => {
      const beacons: DetectedBeacon[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
      if (beacons.length > 0) {
        onDetected(beacons);
      }
    },
  );

  BeaconRadar.startScanning(BEACON_UUID, {
    useForegroundService: false,
    useBackgroundScanning: false,
  });
}

export function stopScan(): void {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
  try {
    BeaconRadar.stopScanning();
  } catch {
    // 既に停止済みの場合は無視
  }
}
