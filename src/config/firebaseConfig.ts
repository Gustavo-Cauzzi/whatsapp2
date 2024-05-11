// import { firebase } from "@react-native-firebase/firestore";
import firebase from '@react-native-firebase/app';

if (!firebase.apps.length) {
  firebase.initializeApp({
    appId: '1:680814345970:android:4ab112ebab332137be9a6b',
    projectId: 'tde2-ucs-disp-moveis',
    apiKey: 'AIzaSyBvU76AqVBHbnjzla5jaqoNqO0XVERC9XY',
    databaseURL: 'https://tde2-ucs-disp-moveis.firebaseio.com',
    messagingSenderId: '680814345970',
    storageBucket: 'https://tde2-ucs-disp-moveis.storage.firebase.com',
  });
}
