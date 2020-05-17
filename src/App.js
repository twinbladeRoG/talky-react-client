import 'webrtc-adapter';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Provider } from 'react-redux';
import Router from './Router';
import './index.scss';
import store from './redux/store';

const App = () => (
  <Provider store={store}>
    <Router />
    <ToastContainer />
  </Provider>
);

export default App;
