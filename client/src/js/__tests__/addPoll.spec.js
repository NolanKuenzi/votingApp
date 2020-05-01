import { enableFetchMocks } from 'jest-fetch-mock';
import React from 'react';
import { createStore } from 'redux';
import regeneratorRuntime, { async } from 'regenerator-runtime';
import { wait, cleanup, fireEvent } from '@testing-library/react';
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

  it('A poll can be added', async () => {
    fetch
      .once(
        JSON.stringify({
          msg: 'Success',
        })
      )
      .once(
        JSON.stringify({
          data: [
            { Name: 'pollName00', _id: 'rz9phMlHkXFEkZouxCgxVQYgD' },
            { Name: 'pollName01', _id: 'XUyh2tmKpSYCKHugYpnRFxvwI' },
            { Name: 'testPoll', _id: '5f4h2V8KpFvcWk0pYpnRFvxqL' },
          ],
        })
      );
    const store = createStore(() => ({ currentComp: 'addPoll', userEmail: '' }));
    const { container } = render(<Main />, { store });
    const addPollTxtInput = container.querySelector('[id="addPollTxtInput"]');
    const addPollTextarea = container.querySelector('[id="addPollTextarea"]');
    const addPollSubBtn = container.querySelector('[id="addPollSubBtn"]');

    fireEvent.change(addPollTxtInput, { target: { value: 'testPoll' } });
    fireEvent.change(addPollTextarea, { target: { value: 'Entry0;Entry1;Entry2;Entry3' } });
    fireEvent.click(addPollSubBtn);
    await wait(async () => {
      expect(addPollTxtInput.textContent).toBe('');
      expect(addPollTextarea.textContent).toBe('');
      expect(addPollTxtInput.textContent).not.toContain('testPoll');
      expect(addPollTextarea.textContent).not.toContain('Entry0;Entry1;Entry2;Entry3');
    });
  });
});
