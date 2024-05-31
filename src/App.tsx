import React, {ReactNode, useEffect} from 'react';
import {Routes} from './routes';
import './utils/LogUtils';
import './config/firebaseConfig';
import {loadLastLoggedUser, useUser} from './contexts/userContext';

const App: () => ReactNode = () => {
  const setUser = useUser(state => state.setUser);

  useEffect(() => {
    loadLastLoggedUser().then(user => user && setUser(user));
  }, []);

  return <Routes />;
};

export default App;
