import firestore, {Filter} from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
import {create} from 'zustand';
import {Chat} from '../types/chat';
import {Message} from '../types/message';
import {User} from '../types/user';
import {
  snapshotGroupedBy,
  snapshotToArray,
  snapshotToMap,
  snapshotToOne,
} from '../utils/FirebaseUtils';
import {useUser} from './userContext';

export interface WaChat extends Chat {
  otherUser: User;
  messages: Record<string, Message>;
}

interface ISendMessageParams {
  message: string;
  chatId: string;
}

interface UserContext {
  chats: Record<string, WaChat>;
  isLoading: boolean;
  openChatId?: string;
  actions: {
    setOpenChat: (chatId?: string) => any;
    createChat: (otherUserEmail: string) => Promise<WaChat>;
    loadChats: () => any;
    sendMessage: (params: ISendMessageParams) => any;
  };
}

export const useChats = create<UserContext>(set => ({
  chats: {},
  isLoading: false,
  openChatId: undefined,
  actions: {
    async createChat(otherUserEmail: string) {
      const {user} = useUser.getState();
      const {chats} = useChats.getState();

      if (!user) throw new Error('Usuário não está logado');
      if (user.email === otherUserEmail)
        throw new Error('Não é possível criar um chat com você mesmo');
      if (
        Object.values(chats).some(
          chat => chat.otherUser.email === otherUserEmail,
        )
      )
        throw new Error('Chat já existe');

      set(state => ({...state, isLoading: true}));
      const newChat = await createChat(otherUserEmail).finally(() =>
        set(state => ({...state, isLoading: false})),
      );
      set(state => ({
        ...state,
        chats: {...state.chats, [newChat.chatId]: newChat},
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
      console.log('chats: ', chats);
      set(state => ({
        ...state,
        chats: Object.fromEntries(chats.map(chat => [chat.chatId, chat])),
      }));
    },
    setOpenChat: chatId => set(state => ({...state, openChatId: chatId})),
    async sendMessage({chatId, message}) {
      set(state => ({...state, isLoading: true}));
      const newMessage = await sendMessage({chatId, message});
      const {chats} = useChats.getState();
      const chatToEdit = chats[chatId];
      chatToEdit.messages[newMessage.messageId] = newMessage;
      set(state => ({
        ...state,
        isLoading: false,
        chats: {...chats, [chatId]: chatToEdit},
      }));
    },
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

  console.log('currentUserId: ', currentUserId);
  const chats = await Promise.all(
    [`creatorUserId`, `recipientUserId`].map(field =>
      firestore()
        .collection('Chats')
        .where(field, '==', currentUserId)
        .get()
        .then(snapshotToArray<Chat>),
    ),
  ).then(res => res.flat());

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
    messages:
      messagesByChatId[chat.chatId]?.reduce(
        (acc, message) => ({...acc, [message.messageId]: message}),
        {},
      ) ?? [],
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

  return {...newChat, otherUser, messages: {}};
};

const sortMessagesAsync = async (
  messagesByChatId: Record<string, Message[]>,
): Promise<Record<string, Message[]>> => {
  return Promise.all(
    Object.entries(messagesByChatId).map(async ([key, messages]) => [
      key,
      messages.sort((a, b) => a.timestamp - b.timestamp),
    ]),
  ).then(Object.fromEntries);
};

const sendMessage = async ({chatId, message}: ISendMessageParams) => {
  const {user} = useUser.getState();
  if (!user?.uid) throw new Error(`Usuário não encontrado`);
  return await firestore()
    .collection('Messages')
    .add({
      chatId,
      message,
      messageId: String(uuid.v4()),
      timestamp: Date.now(),
      senderId: user.uid,
    } as Message)
    .then(doc => doc.get().then(doc => doc.data() as Message));
};
