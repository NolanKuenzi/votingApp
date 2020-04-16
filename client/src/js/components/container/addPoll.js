import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import deleteCookie from '../../controllers/deleteCookie';

const AddPoll = () => {
  const [pollName, setPollName] = useState('');
  const [entries, setEntries] = useState('');
  const userEmail = useSelector(state => state.userEmail);
  const dispatch = useDispatch();

  const submitPoll = e => {
    e.preventDefault();
    if (pollName === '' || entries === '') {
      alert('Please fill out required fields');
      return;
    }
    fetch('https://young-dawn-72099.herokuapp.com/api/newPoll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pollName,
        user: userEmail,
        entries,
      }),
    })
      .then(dta => dta.json())
      .then(jsonDta => {
        if (jsonDta.error !== undefined) {
          throw jsonDta.error;
        }
        setPollName('');
        setEntries('');
      })
      .catch(error => {
        alert(error);
        if (
          error === 'Unauthorized: Please Login to Continue' ||
          error === 'Unauthorized: Invalid Credentials, Please try again'
        ) {
          deleteCookie('email');
          dispatch({ type: 'USER_EMAIL', payload: null });
          dispatch({ type: 'CURRENT_COMPONENT', payload: 'polls' });
        }
      });
  };
  const cancelFunc = () => {
    dispatch({ type: 'CURRENT_COMPONENT', payload: 'polls' });
  };
  return (
    <div id="addPollDiv">
      <span id="addPollSpan">New Poll</span>
      <form onSubmit={e => submitPoll(e)} id="addPollForm">
        <span>Poll Name:</span>
        <br />
        <input
          type="text"
          id="addPollTxtInput"
          className="txtInputs"
          value={pollName}
          onChange={e => setPollName(e.target.value)}
          placeholder="Poll Name"
        ></input>
        <br />
        <br />
        <span>Poll Entries:</span>
        <br />
        <textarea
          type="text"
          id="addPollTextarea"
          className="txtInputs"
          value={entries}
          onChange={e => setEntries(e.target.value)}
          placeholder="Seperate each entry with a semicolon"
        ></textarea>
        <br />
        <button type="submit" className="btnStyles" id="addPollSubBtn">
          Submit
        </button>
        <button
          type="button"
          className="btnStyles"
          id="addPollCancelBtn"
          onClick={() => cancelFunc()}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddPoll;
