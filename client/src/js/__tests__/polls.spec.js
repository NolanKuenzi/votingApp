import { enableFetchMocks } from 'jest-fetch-mock';
import React from 'react';
import { createStore } from 'redux';
import regeneratorRuntime, { async } from 'regenerator-runtime';
import { wait, cleanup } from '@testing-library/react';
import { render, fireEvent, screen } from '../test-utils';
import '@testing-library/jest-dom/extend-expect';
import Main from '../components/presentational/main';

enableFetchMocks();
const originalLocation = window.location;

describe('Tests', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  afterEach(() => {
    window.location = originalLocation;
    cleanup();
  });

  test('List of Polls is displayed', async () => {
    fetch.once(
      JSON.stringify({
        data: [
          { Name: 'pollName00', _id: 'rz9phMlHkXFEkZouxCgxVQYgD' },
          { Name: 'pollName01', _id: 'XUyh2tmKpSYCKHugYpnRFxvwI' },
        ],
      })
    );
    const store = createStore(() => ({ currentComp: 'polls', userEmail: '' }));
    const { container } = render(<Main />, { store });
    const pollsUl = container.querySelector('[id="pollsUl"]');
    await wait(() => {
      expect(fetch.mock.calls.length).toEqual(1);
      expect(pollsUl.textContent).toContain('pollName00');
      expect(pollsUl.textContent).toContain('pollName01');
    });
  });
});
