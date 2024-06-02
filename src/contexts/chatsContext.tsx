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
import {sendFCMNotification} from '../services/fcmApi';

export interface WaChat extends Chat {
  otherUser: User;
  messages: Record<string, Message>;
  hasUnseenMessage?: boolean;
}

interface ISendMessageParams {
  message: string;
  chatId: string;
}

interface ChatContext {
  chats: Record<string, WaChat>;
  isLoading: boolean;
  openChatId?: string;
  lastTimeFetched?: number;
  actions: {
    setOpenChat: (chatId?: string) => any;
    createChat: (otherUserEmail: string) => Promise<WaChat>;
    loadChats: () => any;
    sendMessage: (params: ISendMessageParams) => any;
    updateChats: () => Promise<any>;
    removeUnseenFlag: (chatId: string) => any;
  };
}

export const useChats = create<ChatContext>(set => ({
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
      set(state => ({
        ...state,
        chats: Object.fromEntries(chats.map(chat => [chat.chatId, chat])),
        lastTimeFetched: Date.now(),
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
    updateChats: async () => {
      const userId = useUser.getState().user?.uid;
      const {chats} = useChats.getState();
      const newMessagesByChatId = await getNewMessages();
      const newChatsIds = Object.keys(newMessagesByChatId).filter(
        chatId => !(chatId in chats),
      );
      const newChats = await getChatsByIds([...new Set(newChatsIds)]).then(
        chats =>
          chats.filter(
            chat =>
              chat.creatorUserId === userId || chat.recipientUserId === userId,
          ),
      );
      const mergedChats = {
        ...chats,
        ...newChats.reduce(
          (acc, curr) => ({...acc, [curr.chatId]: curr}),
          {} as typeof chats,
        ),
      };
      Object.entries(newMessagesByChatId)
        .filter(([chatId]) => chatId in mergedChats)
        .forEach(([chatId, messages]) => {
          messages.forEach(message => {
            mergedChats[chatId].messages[message.messageId] = message;
          });
          mergedChats[chatId].hasUnseenMessage = true;
        });
      set(state => ({
        ...state,
        chats: mergedChats,
        lastTimeFetched: Date.now(),
      }));
    },
    removeUnseenFlag(chatId) {
      const {chats} = useChats.getState();
      chats[chatId].hasUnseenMessage = false;
      set(state => ({...state, chats: {...chats}}));
    },
  },
}));

const getOtherUser = (chat: Chat) =>
  chat.creatorUserId === useUser.getState().user?.uid
    ? chat.recipientUserId
    : chat.creatorUserId;

const getChatsOfCurrentUser = async (
  currentUserId: string,
): Promise<WaChat[]> => {
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
  if (!user) throw new Error('User not found');

  const otherUser = await firestore()
    .collection('Users')
    .where('email', '==', otherUserEmail)
    .limit(1)
    .get()
    .then(snapshotToOne<User>);

  if (!otherUser)
    throw new Error(`Usuário de email ${otherUserEmail} não encontrado`);

  const newChat = {
    chatId: uuid.v4(),
    creatorUserId: user.uid,
    recipientUserId: otherUser.id,
  } as Chat;
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
  const {chats} = useChats.getState();
  if (!user?.uid) throw new Error(`Usuário não encontrado`);

  const newMessage = await firestore()
    .collection('Messages')
    .add({
      chatId,
      message,
      messageId: String(uuid.v4()),
      timestamp: Date.now(),
      senderId: user.uid,
    } as Message)
    .then(doc => doc.get().then(doc => doc.data() as Message));

  const otherUser = chats[newMessage.chatId].otherUser;
  if (otherUser.token)
    sendFCMNotification({
      body: newMessage.message,
      title: `Nova mensagem de ${otherUser.name}`,
      to: otherUser.token,
    });

  return newMessage;
};

const getNewMessages = async () => {
  const {lastTimeFetched, chats} = useChats.getState();
  const userId = useUser.getState().user?.uid;
  return firestore()
    .collection('Messages')
    .where(`timestamp`, `>`, lastTimeFetched ?? 0)
    .get()
    .then(
      snapshotGroupedBy<Message, string>(
        message => message.chatId,
        message => message.senderId !== userId,
      ),
    )
    .then(sortMessagesAsync);
};

const getChatsByIds = async (ids: string[]) => {
  if (!ids.length) return [];

  const chats = await firestore()
    .collection('Chats')
    .where(`chatId`, `in`, ids)
    .get()
    .then(snapshotToArray<Chat>);

  if (!chats.length) return [];

  const allOtherUsers = [...new Set(chats.map(getOtherUser))];

  const usersById = await firestore()
    .collection('Users')
    .where('id', 'in', allOtherUsers)
    .get()
    .then(snapshotToMap<User, string>(user => user.id));

  return chats.map(
    chat =>
      ({
        ...chat,
        otherUser: usersById[getOtherUser(chat)],
        messages: {},
      } as WaChat),
  );
};

const getNewMessages = async () => {
  const {lastTimeFetched, chats} = useChats.getState();
  const userId = useUser.getState().user?.uid;
  return firestore()
    .collection('Messages')
    .where(`timestamp`, `>`, lastTimeFetched ?? 0)
    .get()
    .then(
      snapshotGroupedBy<Message, string>(
        message => message.chatId,
        message => message.senderId !== userId,
      ),
    )
    .then(sortMessagesAsync);
};

const getChatsByIds = async (ids: string[]) => {
  if (!ids.length) return [];

  console.log('ids: ', ids);
  const chats = await firestore()
    .collection('Chats')
    .where(`chatId`, `in`, ids)
    .get()
    .then(snapshotToArray<Chat>);

  if (!chats.length) return [];

  const allOtherUsers = [...new Set(chats.map(getOtherUser))];

  const usersById = await firestore()
    .collection('Users')
    .where('id', 'in', allOtherUsers)
    .get()
    .then(snapshotToMap<User, string>(user => user.id));

  return chats.map(
    chat =>
      ({
        ...chat,
        otherUser: usersById[getOtherUser(chat)],
        messages: {},
      } as WaChat),
  );
};
