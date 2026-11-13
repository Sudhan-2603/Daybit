import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAyrC1S8pwDBHDDN8xQlttqVRv4T-eWnU4',
  authDomain: 'fity-500005.firebaseapp.com',
  projectId: 'fity-500005',
  storageBucket: 'fity-500005.firebasestorage.app',
  messagingSenderId: '119520094804',
  appId: '1:119520094804:web:4225035c4e8e301de9dbc1',
  measurementId: 'G-H2PZX2CJCS',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Analytics can be unavailable in Tauri webviews, privacy restricted browsers, or SSR.
export const analyticsReady = typeof window === 'undefined'
  ? Promise.resolve(null)
  : isSupported()
      .then((supported) => supported ? getAnalytics(firebaseApp) : null)
      .catch(() => null);
