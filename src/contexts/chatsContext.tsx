import AsyncStorage from '@react-native-async-storage/async-storage';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {create} from 'zustand';
import firestore, {Filter} from '@react-native-firebase/firestore';
import {Chat} from '../types/chat';
import {User} from '../types/user';
import {Message} from '../types/message';
import {
  snapshotGroupedBy,
  snapshotToArray,
  snapshotToMap,
  snapshotToOne,
} from '../utils/FirebaseUtils';
import {useUser} from './userContext';
import uuid from 'react-native-uuid';

export interface WaChat extends Chat {
  otherUser: User;
  messages: Message[];
}

interface UserContext {
  chats: WaChat[];
  isLoading: boolean;
  createChat: (otherUserEmail: string) => Promise<WaChat>;
  loadChats: () => any;
}

export const userChats = create<UserContext>(set => ({
  chats: [],
  isLoading: false,
  async createChat(otherUserEmail: string) {
    const {user} = useUser.getState();
    const {chats} = userChats.getState();

    if (!user) throw new Error('Usuário não está logado');
    if (user.email === otherUserEmail)
      throw new Error('Não é possível criar um chat com você mesmo');
    if (chats.some(chat => chat.otherUser.email === otherUserEmail))
      throw new Error('Chat já existe');

    set(state => ({...state, isLoading: true}));
    const newChat = await createChat(otherUserEmail).finally(() =>
      set(state => ({...state, isLoading: false})),
    );
    set(state => ({
      ...state,
      chats: [newChat, ...state.chats],
    }));

    return newChat;
  },
  async loadChats() {
    const {user} = useUser.getState();
    if (!user) throw new Error('Usuário não está logado');

    set(state => ({...state, isLoading: true}));
    const chats = await getChatsOfCurrentUser(user.uid).finally(() =>
      set(state => ({...state, isLoading: false})),
    );
    set(state => ({
      ...state,
      chats,
    }));
  },
}));

const getChatsOfCurrentUser = async (
  currentUserId: string,
): Promise<WaChat[]> => {
  const getOtherUser = (chat: Chat) =>
    chat.creatorUserId === currentUserId
      ? chat.recipientUserId
      : chat.creatorUserId;
  console.log('Filter: ', Filter);

  // Filter.or(
  //   Filter('creatorUserId', '==', currentUserId),
  //   Filter('recipientUserId', '==', currentUserId),
  // ),
  console.log('currentUserId: ', currentUserId);
  const chats = await firestore()
    .collection('Chats')
    // .where({
    //   operator: 'OR',
    //   queries: [
    //     {
    //       fieldPath: 'creatorUserId',
    //       operator: '==',
    //       value: currentUserId,
    //     },
    //     {
    //       fieldPath: 'recipientUserId',
    //       operator: '==',
    //       value: currentUserId,
    //     },
    //   ],
    // })
    .where('creatorUserId', '==', currentUserId)
    // .where('recipientUserId','==', currentUserId)
    .get()
    .then(snapshotToArray<Chat>);

  if (!chats.length) return [];

  const allOtherUsers = [...new Set(chats.map(getOtherUser))];

  console.log('allOtherUsers: ', allOtherUsers);

  const [usersById, messagesByChatId] = await Promise.all([
    firestore()
      .collection('Users')
      .where('id', 'in', allOtherUsers)
      .get()
      .then(snapshotToMap<User, string>(user => user.id)),
    firestore()
      .collection('Messages')
      .where(
        'chatId',
        'in',
        chats.map(chat => chat.chatId),
      )
      .get()
      .then(snapshotGroupedBy<Message, string>(message => message.chatId))
      .then(sortMessagesAsync),
  ]);

  console.log('usersById: ', usersById);
  console.log('messagesByChatId: ', messagesByChatId);

  return chats.map(chat => ({
    ...chat,
    otherUser: usersById[getOtherUser(chat)],
    messages: messagesByChatId[chat.chatId] ?? [],
  }));
};

const createChat = async (otherUserEmail: string): Promise<WaChat> => {
  const {user} = useUser.getState();
  console.log('user: ', user);
  if (!user) throw new Error('User not found');

  const otherUser = await firestore()
    .collection('Users')
    .where('email', '==', otherUserEmail)
    .limit(1)
    .get()
    .then(snapshotToOne<User>);

  console.log('otherUser: ', otherUser);
  if (!otherUser)
    throw new Error(`Usuário de email ${otherUserEmail} não encontrado`);

  const newChat = {
    chatId: uuid.v4(),
    creatorUserId: user.uid,
    recipientUserId: otherUser.id,
  } as Chat;
  console.log('newChat: ', newChat);
  await firestore().collection('Chats').add(newChat);

  return {...newChat, otherUser, messages: []};
};

const sortMessagesAsync = async (
  messagesByChatId: Record<string, Message[]>,
): Promise<Record<string, Message[]>> => {
  return Promise.all(
    Object.entries(messagesByChatId).map(async ([key, messages]) => [
      key,
      messages.sort((a, b) => b.timestamp - a.timestamp),
    ]),
  ).then(Object.fromEntries);
};
