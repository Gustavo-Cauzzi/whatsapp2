import AsyncStorage from '@react-native-async-storage/async-storage';
import {FirebaseAuthTypes, firebase} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {create} from 'zustand';
import messaging from '@react-native-firebase/messaging';
import {User} from '../types/user';
import {snapshotToOne} from '../utils/FirebaseUtils';
import {PermissionsAndroid} from 'react-native';

interface Credentials {
  email: string;
  password: string;
}

interface UserContext {
  authenticated: boolean;
  user?: FirebaseAuthTypes.User;
  setUser: (user: FirebaseAuthTypes.User) => void;
  logout: () => void;
  signUp: (params: Credentials) => Promise<any>;
  login: (params: Credentials) => Promise<any>;
}

const LAST_LOGGED_USER = '@whats2/last_logged_user';

export const useUser = create<UserContext>(set => ({
  authenticated: false,
  user: undefined,
  setUser: user => {
    saveUser(user);
    set(state => ({...state, user, authenticated: !!user}));
  },
  logout: () => {
    cleanUser();
    set(state => ({
      ...state,
      authenticated: false,
      user: undefined,
    }));
  },
  signUp: async params => {
    const user = await createUser(params);
    saveUser(user);
    set(state => ({...state, user, authenticated: !!user}));
  },
  login: async cred => {
    const {user} = await login(cred);
    useUser.getState().setUser(user);
    await linkFCMToUser(user);
    set(state => ({...state, user, authenticated: !!user}));
  },
}));

export const loadLastLoggedUser = async () => {
  const storedUser = await AsyncStorage.getItem(LAST_LOGGED_USER);
  if (!storedUser) return;
  const user = JSON.parse(storedUser) as FirebaseAuthTypes.User;
  return user;
};

const linkFCMToUser = async (user: FirebaseAuthTypes.User) => {
  await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  await messaging().registerDeviceForRemoteMessages();
  const token = await messaging().getToken();

  let docId;
  await firestore()
    .collection('Users')
    .where('id', '==', user.uid)
    .get()
    .then(snapshot => {
      docId = snapshot.docs[0].id;
    });

  if (!user) throw new Error('User not found');

  await firestore()
    .collection('Users')
    .doc(docId)
    .update({
      token,
      email: user.email,
      id: user.uid,
      name: getName(user.email),
    } as User);
};

const saveUser = (user: FirebaseAuthTypes.User) => {
  AsyncStorage.setItem(LAST_LOGGED_USER, JSON.stringify(user));
};

const cleanUser = () => {
  AsyncStorage.removeItem(LAST_LOGGED_USER);
};

const login = ({email, password}: Credentials) => {
  return firebase.auth().signInWithEmailAndPassword(email, password);
};

const createUser = async ({email, password}: Credentials) => {
  const {user} = await firebase
    .auth()
    .createUserWithEmailAndPassword(email, password);

  const madeUpName = user.email?.split('@')[0];
  await firestore()
    .collection('Users')
    .add({
      id: user.uid,
      email: user.email,
      name: getName(user.email),
    } as User);

  return user;
};

const getName = (email: string | null) => email?.split('@')[0];

const getFCMToken = async () => {
  await messaging().registerDeviceForRemoteMessages();
  const token = await messaging().getToken();
  console.log('token: ', token);
  return token;
};
