import AsyncStorage from '@react-native-async-storage/async-storage';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {create} from 'zustand';

interface UserContext {
  authenticated: boolean;
  user?: FirebaseAuthTypes.UserCredential;
  setUser: (user: FirebaseAuthTypes.UserCredential) => void;
  logout: () => void;
}

const LAST_LOGGED_USER = '@whats2/last_logged_user';

export const useUser = create<UserContext>(set => ({
  authenticated: false,
  user: undefined,
  setUser: user => {
    saveUser(user);
    set(state => ({...state, user, authenticated: !!user}));
  },
  logout: () => ({
    authenticated: false,
    user: undefined,
  }),
}));

export const loadLastLoggedUser = async () => {
  const storedUser = await AsyncStorage.getItem(LAST_LOGGED_USER);
  if (!storedUser) return;
  const user = JSON.parse(storedUser) as FirebaseAuthTypes.UserCredential;
  const {setUser} = useUser();
  setUser(user);
  return user;
};

const saveUser = (user: FirebaseAuthTypes.UserCredential) => {
  AsyncStorage.setItem(LAST_LOGGED_USER, JSON.stringify(user));
};
