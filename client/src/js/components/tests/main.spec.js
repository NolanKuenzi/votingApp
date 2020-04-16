// Integration Tests
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { render, waitForDomChange } from '@testing-library/react';
import regeneratorRuntime, { async } from 'regenerator-runtime';
import fetchMock from 'fetch-mock';
import { initialState, rootReducer } from '../../reducers/index.js';
import Main from '../presentational/main';

const fetch = require('node-fetch');

function renderWithRedux(
  ui,
  { initialState, store = createStore(rootReducer, initialState) } = {}
) {
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
}

describe('Tests', () => {
  beforeAll(() => {
    global.fetch = fetch;
  });

  afterAll(() => {
    fetchMock.restore();
  });
  test('List of Polls is displayed', async () => {
    fetchMock.mock(
      'http://localhost:3000/api/getPolls',

      {
        data: [
          { Name: 'Name0', _id: 'rz9phMlHkXFEkZouxCgxVQYgD' },
          { Name: 'Name1', _id: 'XUyh2tmKpSYCKHugYpnRFxvwI' },
        ],
      }
    );
    const { container } = renderWithRedux(<Main />);
    await waitForDomChange();
    const pollsUl = container.querySelector('[id="pollsUl"]');
    expect(pollsUl.textContent).toContain('Name0');
    expect(pollsUl.textContent).toContain('Name1');
  });
});
