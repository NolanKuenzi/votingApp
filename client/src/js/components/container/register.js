import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const userEmail = useSelector(state => state.userEmail);
  const dispatch = useDispatch();
  const submitRegister = e => {
    e.preventDefault();
    if (userEmail !== null) {
      alert('User is already logged in');
      return;
    }
    if (password === '' || email === '' || confirmPassword === '') {
      alert('Please complete required fields');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (password.length < 5) {
      alert('Password must be at least five characters long');
      return;
    }
    fetch('https://young-dawn-72099.herokuapp.com/api/register', {
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
        alert('Registration successful!');
        document.cookie = `email=${email}`;
        dispatch({ type: 'USER_EMAIL', payload: email });
        window.location = 'https://young-dawn-72099.herokuapp.com';
      })
      .catch(error => {
        alert(error);
      });
  };
  return (
    <div id="registerDiv">
      <h3>Register:</h3>
      <form onSubmit={e => submitRegister(e)}>
        <input
          placeholder="Email"
          type="text"
          className="txtInputs"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <br />
        <input
          placeholder="Password"
          type="password"
          className="txtInputs"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <br />
        <input
          placeholder="Confirm Password"
          type="password"
          className="txtInputs"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
        <br />
        <button type="submit" className="btnStyles">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
