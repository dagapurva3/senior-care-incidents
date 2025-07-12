import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGp91PsqKtBrjBeDD0taST5LkgA9IzUGU",
  authDomain: "senior-care-incidents.firebaseapp.com",
  projectId: "senior-care-incidents",
  storageBucket: "senior-care-incidents.firebasestorage.app",
  messagingSenderId: "127206415894",
  appId: "1:127206415894:web:e31f7f91b3605cbbf01f37",
  measurementId: "G-JVSM8NTPST",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
