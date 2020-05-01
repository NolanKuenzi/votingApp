import { enableFetchMocks } from 'jest-fetch-mock';
import React from 'react';
import { createStore } from 'redux';
import regeneratorRuntime, { async } from 'regenerator-runtime';
import { wait, cleanup } from '@testing-library/react';
import { render } from '../test-utils';
import Main from '../components/presentational/main';
import '@testing-library/jest-dom/extend-expect';

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

  test('An individual poll can be viewed', async () => {
    delete window.location;
    window.location = {
      // href: 'http://localhost/polls/rz9phMlHkXFEkZouxCgxVQYgD',
      search: 'http://localhost/polls/rz9phMlHkXFEkZouxCgxVQYgD',
      pathname: '/polls/rz9phMlHkXFEkZouxCgxVQYgD',
    };
    fetch.once(
      JSON.stringify({
        data: [
          {
            _id: 'fc5YZd3L1t7uFLtJlLKYhRAwq',
            _ips: null,
            Name: 'testPollName0',
            User: 'mr.nolank@gmail.com',
            PollInfo:
              '[{"name":"testEntry0","count":0},{"name":"testEntry1","count":0},{"name":"testEntry2","count":0}]',
          },
        ],
      })
    );
    const store = createStore(() => ({ currentComp: 'poll', userEmail: '' }));
    const { container } = render(<Main />, { store });
    const pollDiv = container.querySelector('[id="pollDiv"]');
    await wait(async () => {
      expect(fetch.mock.calls.length).toEqual(1);
      expect(pollDiv.textContent).toContain("I'd like to vote for...");
      expect(pollDiv.textContent).toContain('Choose an option...');
      expect(pollDiv.textContent).toContain('submit');
    });
  });
});
