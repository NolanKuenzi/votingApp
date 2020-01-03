import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Main from './js/components/presentational/main';
import './css/style.css';

const App = () => (
  <div>
    <Main />
  </div>
);
ReactDOM.render(<App />, document.getElementById('app'));
