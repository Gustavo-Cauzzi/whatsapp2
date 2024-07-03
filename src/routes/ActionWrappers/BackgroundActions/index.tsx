import React, {PropsWithChildren} from 'react';
import BackgroundService from 'react-native-background-actions';
import {timeOutOfTheAppTask} from './timerOutOfTheApp';
import {OutOfTheAppDialog} from './OutOfTheAppDialog';

const options = {
  taskName: 'out_of_app_timer',
  taskTitle: 'Sentimos sua falta!',
  taskDesc: 'Volte por favor!',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#0ff', // ?
  // linkingURI: 'yourSchemeHere://chat/jane', // ?
  parameters: {},
};

export const BackgroundActions: React.FC<PropsWithChildren> = ({children}) => {
  return (
    <>
      <OutOfTheAppDialog />
      {children}
    </>
  );
};

BackgroundService.stop();
BackgroundService.start(timeOutOfTheAppTask, options);
