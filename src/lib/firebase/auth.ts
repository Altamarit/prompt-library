import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from 'firebase/auth';
import { getFirebaseApp } from './config';

let _auth: Auth | null = null;

function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return signInWithPopup(getFirebaseAuth(), googleProvider);
}

export async function signOut() {
  return firebaseSignOut(getFirebaseAuth());
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function getIdToken(): Promise<string | null> {
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export function getCurrentUser(): User | null {
  return getFirebaseAuth().currentUser;
}
