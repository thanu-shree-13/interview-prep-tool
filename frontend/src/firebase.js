import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBA3lTmXrKt-iNc__DHL3d2WuOQFCT7Jyc",
  authDomain: "interview-prep-tool-e3156.firebaseapp.com",
  projectId: "interview-prep-tool-e3156",
  storageBucket: "interview-prep-tool-e3156.firebasestorage.app",
  messagingSenderId: "96145675685",
  appId: "1:96145675685:web:585901a44409dec1bbc44c",
  measurementId: "G-1DYK5069XG"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app