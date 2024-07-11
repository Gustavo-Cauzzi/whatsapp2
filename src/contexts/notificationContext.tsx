import axios from 'axios';
import {WaNotification} from '../routes/ActionWrappers/Notification';

interface NotificationParams {
  data: WaNotification;
  title: string;
  message: string;
  to: string;
}

export const sendNotification = async ({
  data,
  message,
  title,
  to,
}: NotificationParams) => {
  const body = {
    title,
    message,
    token: to,
    data: {
      json: JSON.stringify(data),
    },
  };
  console.log('body: ', body);
  const response = await axios
    .post('http://192.168.0.141:3333/send', body)
    .catch(console.error);
  console.log('response: ', response);
  return;
};
