import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import deleteCookie from '../../controllers/deleteCookie';

const TopMenu = () => {
  const currentComp = useSelector(state => state.currentComp);
  const userEmail = useSelector(state => state.userEmail);
  const dispatch = useDispatch();

  const homeFunc = () => {
    if (window.location.search !== '' || window.location.pathname !== '/polls') {
      window.location.href = 'https://young-dawn-72099.herokuapp.com/polls?';
      return;
    }
    dispatch({ type: 'CURRENT_COMPONENT', payload: 'polls' });
  };

  const signInOutFunc = e => {
    if (e.target.innerText === 'Log Out') {
      fetch('https://young-dawn-72099.herokuapp.com/api/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(dta => {
          if (dta.status !== 200) {
            throw dta.statusText;
          }
          if (currentComp === 'addPoll') {
            dispatch({ type: 'CURRENT_COMPONENT', payload: 'polls' });
          }
          deleteCookie('email');
          dispatch({ type: 'USER_EMAIL', payload: null });
        })
        .catch(error => {
          alert(error);
        });
      return;
    }
    if (currentComp !== 'signIn' && e.target.innerText !== 'Log Out') {
      dispatch({ type: 'CURRENT_COMPONENT', payload: 'signIn' });
    }
    if (currentComp === 'addPoll') {
      dispatch({ type: 'CURRENT_COMPONENT', payload: 'polls' });
    }
    deleteCookie('email');
    dispatch({ type: 'USER_EMAIL', payload: null });
  };
  const usrPollsFunc = () => {
    fetch('https://young-dawn-72099.herokuapp.com/api/checkToken', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(dta => {
        if (dta.status !== 200 && dta.status !== 500) {
          alert('Unauthorized. Please login to view your polls.');
          deleteCookie('email');
          dispatch({ type: 'USER_EMAIL', payload: null });
          return;
        }
        dispatch({ type: 'CURRENT_COMPONENT', payload: 'myPolls' });
      })
      .catch(err => {
        alert(err);
      });
  };
  useEffect(() => {
    if (window.location.search.indexOf('?resetPass=') !== -1) {
      dispatch({ type: 'CURRENT_COMPONENT', payload: 'signIn' });
      return;
    }
    if (window.location.pathname !== '/polls') {
      dispatch({ type: 'CURRENT_COMPONENT', payload: 'poll' });
    }
  }, []); /* eslint-disable-line */
  return (
    <div>
      <div id="topMenuTitle">
        <span id="topMenuSpan">Voting App</span>
      </div>
      <div id="topMenuBtnsDiv">
        <button type="button" className="topMenuBtns" onClick={() => homeFunc()}>
          Home
        </button>
        <button type="button" className="topMenuBtns" onClick={e => signInOutFunc(e)}>
          {userEmail === null ? 'Sign In' : 'Log Out'}
        </button>
        <br />
        <div id="signedInDiv">
          {userEmail === null ? null : (
            <div>
              <span>
                Signed in as <span id="signedInEmailSpan">{userEmail}</span>
              </span>
              <br />
              <span id="viewPollsSpan" onClick={() => usrPollsFunc()}>
                View your polls
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopMenu;
