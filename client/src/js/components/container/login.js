import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const userEmail = useSelector(state => state.userEmail);
  const dispatch = useDispatch();
  const submitLogin = e => {
    e.preventDefault();
    if (userEmail !== null) {
      alert('User is already logged in');
      return;
    }
    if (password === '' || email === '') {
      alert('Please complete required fields');
      return;
    }
    fetch('https://young-dawn-72099.herokuapp.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then(dta => dta.json())
      .then(jsonDta => {
        if (jsonDta.error !== undefined) {
          throw jsonDta.error;
        }
        document.cookie = `email=${email}`;
        dispatch({ type: 'USER_EMAIL', payload: email });
        window.location = 'https://young-dawn-72099.herokuapp.com';
      })
      .catch(error => {
        alert(error);
      });
  };
  return (
    <div id="loginDiv">
      <span id="loginSpan">
        <h3>Login:</h3>
      </span>
      <form onSubmit={e => submitLogin(e)}>
        <input
          type="text"
          placeholder="Email"
          className="txtInputs"
          value={email}
          onChange={e => setEmail(e.target.value)}
        ></input>
        <br />
        <input
          type="password"
          placeholder="Password"
          className="txtInputs"
          value={password}
          onChange={e => setPassword(e.target.value)}
        ></input>
        <br />
        <button type="submit" className="btnStyles">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;
