import {Chat} from '../../pages/Chat';
import {Home} from '../../pages/Home';
import Login from '../../pages/Login';
import {screenBuilder} from './stackNavigatorBuilder';

const createScreen = screenBuilder('wa');

export const screens = [
  createScreen('Login', Login),
  createScreen('Home', Home),
  createScreen('Chat', Chat),
];
export type TBuilderScreenList = typeof screens;
