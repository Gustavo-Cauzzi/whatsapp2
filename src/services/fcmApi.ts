import axios from 'axios';

interface INotificationData {
  to: string;
  title: string;
  body: string;
}

export const sendFCMNotification = async ({
  body,
  title,
  to,
}: INotificationData) => {
  // console.log('enviando');
  // const a = await axios
  //   .post(
  //     'https://fcm.googleapis.com/fcm/send',
  //     {
  //       to,
  //       notification: {
  //         title,
  //         body,
  //         mutable_content: true,
  //         sound: 'Tri-tone',
  //       },
  //     },
  //     {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: 'AIzaSyBvU76AqVBHbnjzla5jaqoNqO0XVERC9XY',
  //       },
  //     },
  //   )
  //   .catch(err => console.error(err));
  // console.log('a: ', a);
  // return a;
};
