import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import deleteCookie from '../../controllers/deleteCookie';

const Polls = () => {
  const [pollList, setPollList] = useState([]);
  const dispatch = useDispatch();

  const newPollFunc = () => {
    fetch('https://young-dawn-72099.herokuapp.com/api/checkToken', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(dta => {
        if (dta.status !== 200 && dta.status !== 500) {
          alert('Unauthorized. Please login to create a poll.');
          deleteCookie('email');
          dispatch({ type: 'USER_EMAIL', payload: null });
        } else {
          dispatch({ type: 'CURRENT_COMPONENT', payload: 'addPoll' });
        }
      })
      .catch(err => {
        alert(err);
      });
  };

  const viewPoll = e => {
    e.persist();
    fetch(`https://young-dawn-72099.herokuapp.com/api/${e.target.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(dta => dta.json())
      .then(jsonDta => {
        if (jsonDta.error !== undefined) {
          throw jsonDta.error;
        }
        window.location.href = `https://young-dawn-72099.herokuapp.com/polls/${e.target.id}`;
      })
      .catch(err => {
        alert(err);
      });
  };

  useEffect(() => {
    fetch('https://young-dawn-72099.herokuapp.com/api/getPolls', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(dta => dta.json())
      .then(jsonDta => {
        setPollList(jsonDta.data);
      })
      .catch(err => {
        alert('Poll data failed to load. Please try again');
      });
  }, []); /* eslint-disable-line */
  return (
    <div id="pollsBGroundDiv">
      <div>
        <h3>Select a poll to see the results and vote, or sign-in to make a new poll.</h3>
      </div>
      <div>
        <div id="newPollBtnDiv">
          <button type="button" id="newPollBtn" onClick={() => newPollFunc()}>
            Create a New Poll
          </button>
        </div>
      </div>
      <div id="pollsBody">
        <ul id="pollsUl">
          {pollList.length === 0
            ? null
            : pollList.map(item => (
                <li className="pollsLi" id={item._id} key={item._id} onClick={e => viewPoll(e)}>
                  {item.Name}
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
};

export default Polls;
