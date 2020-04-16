import React from 'react';
import { Provider } from 'react-redux';
import Main from './main';
import store from '../../store/index.js';

const App = () => (
  <Provider store={store}>
    <div>
      <Main />
    </div>
  </Provider>
);

export default App;
