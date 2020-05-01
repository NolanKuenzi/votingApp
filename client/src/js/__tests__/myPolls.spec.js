import { enableFetchMocks } from 'jest-fetch-mock';
import React from 'react';
import { createStore } from 'redux';
import regeneratorRuntime, { async } from 'regenerator-runtime';
import { wait, cleanup, fireEvent } from '@testing-library/react';
import { render, screen } from '../test-utils';
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
  it(`A user's polls can be displayed`, async () => {
    fetch.once(
      JSON.stringify({
        data: [
          { Name: 'pollName00', _id: 'rz9phMlHkXFEkZouxCgxVQYgD' },
          { Name: 'pollName01', _id: 'XUyh2tmKpSYCKHugYpnRFxvwI' },
        ],
      })
    );
    const store = createStore(() => ({ currentComp: 'myPolls', userEmail: 'mr.nolank@gmail.com' }));
    const { container } = render(<Main />, { store });
    const myPollsDiv = container.querySelector('[id="myPollsDiv"');
    await wait(() => {
      expect(fetch.mock.calls.length).toEqual(1);
      expect(myPollsDiv.textContent).toContain('pollName00');
      expect(myPollsDiv.textContent).toContain('pollName01');
      expect(myPollsDiv.textContent).toContain('Edit');
      expect(myPollsDiv.textContent).toContain('Delete');
    });
  });
  describe('Edit poll tests', () => {
    it('A poll entry can be added and deleted', async () => {
      fetch
        .once(
          JSON.stringify({
            data: [{ Name: 'pollName00', _id: 'rz9phMlHkXFEkZouxCgxVQYgD' }],
          })
        )
        .once(JSON.stringify({ msg: 'Success' }))
        .once(
          JSON.stringify({
            data: ['Entry0', 'Entry1', 'Entry2'],
          })
        )
        .once(JSON.stringify({ msg: 'Success' }))
        .once(
          JSON.stringify({
            data: ['Entry0', 'Entry1', 'Entry2', 'Entry3'],
          })
        )
        .once(JSON.stringify({ msg: 'Success' }))
        .once(
          JSON.stringify({
            data: ['Entry1', 'Entry2', 'Entry3'],
          })
        )
        .once(JSON.stringify({ msg: 'Success' }))
        .once(
          JSON.stringify({
            data: ['Entry1', 'Entry2'],
          })
        );
      const store = createStore(() => ({
        currentComp: 'myPolls',
        userEmail: 'mr.nolank@gmail.com',
      }));
      const { container, getByTestId } = render(<Main />, { store });

      await wait(async () => {
        const editBtn = screen.getByText('Edit');
        fireEvent.click(editBtn);
        const editPollDiv = container.querySelector('[id="editPollDiv"]');
        await wait(async () => {
          expect(editPollDiv.textContent).toContain('Entry0');
          expect(editPollDiv.textContent).toContain('Entry1');
          expect(editPollDiv.textContent).toContain('Entry2');
          const addEntryInput = getByTestId('addEntryInput');
          const addBtn = screen.getByText('Add');
          fireEvent.change(addEntryInput, { target: { value: 'Entry3' } });
          fireEvent.click(addBtn);
          await wait(async () => {
            expect(editPollDiv.textContent).toContain('Entry3');
            const delEntry0 = getByTestId('Entry0');
            fireEvent.click(delEntry0);
            await wait(async () => {
              expect(editPollDiv.textContent).not.toContain('Entry0');
              expect(editPollDiv.textContent).toContain('Entry1');
              expect(editPollDiv.textContent).toContain('Entry2');
              expect(editPollDiv.textContent).toContain('Entry3');
              const delEntry3 = getByTestId('Entry3');
              fireEvent.click(delEntry3);
              await wait(() => {
                expect(editPollDiv.textContent).not.toContain('Entry0');
                expect(editPollDiv.textContent).toContain('Entry1');
                expect(editPollDiv.textContent).toContain('Entry2');
                expect(editPollDiv.textContent).not.toContain('Entry3');
                expect(fetch.mock.calls.length).toEqual(9);
              });
            });
          });
        });
      });
    });
    it('Editing a poll can be canceled', async () => {
      fetch
        .once(
          JSON.stringify({
            data: [{ Name: 'pollName00', _id: 'rz9phMlHkXFEkZouxCgxVQYgD' }],
          })
        )
        .once(JSON.stringify({ msg: 'Success' }))
        .once(
          JSON.stringify({
            data: ['Entry0', 'Entry1', 'Entry2'],
          })
        );
      const store = createStore(() => ({
        currentComp: 'myPolls',
        userEmail: 'mr.nolank@gmail.com',
      }));
      const { container } = render(<Main />, { store });
      const editPollDiv = container.querySelector('[id="editPollDiv"]');
      await wait(async () => {
        const editBtn = screen.getByText('Edit');
        fireEvent.click(editBtn);
        await wait(() => {
          expect(editPollDiv.textContent).toContain('Entry0');
          expect(editPollDiv.textContent).toContain('Entry1');
          expect(editPollDiv.textContent).toContain('Entry2');
          const cancelBtn = screen.getByText('Cancel');
          fireEvent.click(cancelBtn);
          expect(editPollDiv.textContent).not.toContain('Entry0');
          expect(editPollDiv.textContent).not.toContain('Entry1');
          expect(editPollDiv.textContent).not.toContain('Entry2');
          expect(fetch.mock.calls.length).toEqual(3);
        });
      });
    });
  });
  describe('Delete Poll', () => {
    it('Delete Poll test', async () => {
      fetch
        .once(
          JSON.stringify({
            data: [
              { Name: 'pollName00', _id: 'rz9phMlHkXFEkZouxCgxVQYgD' },
              { Name: 'pollName01', _id: 'XUyh2tmKpSYCKHugYpnRFxvwI' },
            ],
          })
        )
        .once(JSON.stringify({ msg: 'Success' }))
        .once(
          JSON.stringify({
            data: [{ Name: 'pollName01', _id: 'XUyh2tmKpSYCKHugYpnRFxvwI' }],
          })
        );
      const store = createStore(() => ({
        currentComp: 'myPolls',
        userEmail: 'mr.nolank@gmail.com',
      }));
      const { container, getByTestId } = render(<Main />, { store });
      const myPollsDiv = container.querySelector('[id="myPollsDiv"');
      await wait(async () => {
        expect(myPollsDiv.textContent).toContain('pollName00');
        expect(myPollsDiv.textContent).toContain('pollName01');
        const delPollBtn = getByTestId('tDelBtn-pollName00');
        fireEvent.click(delPollBtn);
        await wait(() => {
          expect(myPollsDiv.textContent).not.toContain('pollName00');
          expect(myPollsDiv.textContent).toContain('pollName01');
          expect(fetch.mock.calls.length).toEqual(3);
        });
      });
    });
  });
});
