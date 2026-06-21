import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { AppProvider } from '@/store/AppContext';
import './app.scss';

function App(props) {
  useEffect(() => {
    console.log('[App] Component mounted');
  }, []);

  useDidShow(() => {
    console.log('[App] Page showed');
  });

  useDidHide(() => {
    console.log('[App] Page hidden');
  });

  return <AppProvider>{props.children}</AppProvider>;
}

export default App;
