import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const Reset = () => {
  const [email, setEmail] = useState('');
  const userEmail = useSelector(state => state.userEmail);
  const submitReset = e => {
    e.preventDefault();
    if (userEmail !== null) {
      alert('User is already logged in');
      return;
    }
    if (email === '') {
      alert('Please complete required fields');
      return;
    }
    fetch('https://young-dawn-72099.herokuapp.com/api/reset', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    })
      .then(dta => dta.json())
      .then(jsonDta => {
        if (jsonDta.error !== undefined) {
          throw jsonDta.error;
        }
        alert(`An email has been sent to ${email} with instructions for resetting your password`);
        setEmail('');
      })
      .catch(error => {
        alert(error);
      });
  };
  return (
    <div id="resetDiv">
      <h3>Reset Password:</h3>
      <form onSubmit={e => submitReset(e)}>
        <input
          placeholder="Email"
          className="txtInputs"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <br />
        <button type="submit" className="btnStyles">
          Reset
        </button>
      </form>
    </div>
  );
};

export default Reset;
