import AsyncStorage from '@react-native-async-storage/async-storage';
import {FirebaseAuthTypes, firebase} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {create} from 'zustand';
import {User} from '../types/user';

interface UserContext {
  authenticated: boolean;
  user?: FirebaseAuthTypes.User;
  setUser: (user: FirebaseAuthTypes.User) => void;
  logout: () => void;
  signUp: (params: CreateUserParams) => Promise<any>;
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
}));

export const loadLastLoggedUser = async () => {
  const storedUser = await AsyncStorage.getItem(LAST_LOGGED_USER);
  if (!storedUser) return;
  const user = JSON.parse(storedUser) as FirebaseAuthTypes.User;
  return user;
};

const saveUser = (user: FirebaseAuthTypes.User) => {
  AsyncStorage.setItem(LAST_LOGGED_USER, JSON.stringify(user));
};

const cleanUser = () => {
  AsyncStorage.removeItem(LAST_LOGGED_USER);
};

interface CreateUserParams {
  email: string;
  password: string;
}
const createUser = async ({email, password}: CreateUserParams) => {
  const {user} = await firebase
    .auth()
    .createUserWithEmailAndPassword(email, password);

  const madeUpName = user.email?.split('@')[0];
  await firestore()
    .collection('Users')
    .add({
      id: user.uid,
      email: user.email,
      name: madeUpName,
    } as User);

  return user;
};
