import React, { useState } from 'react';

const ResetPass = props => {
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const componentProps = { ...props };
  const submitResetPass = e => {
    e.preventDefault();
    if (resetCode === '' || newPassword === '' || confirmPass === '') {
      alert('Please complete required fields');
      return;
    }
    if (newPassword !== confirmPass) {
      alert('Passwords do not match');
      return;
    }
    fetch('https://young-dawn-72099.herokuapp.com/api/newPass', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: componentProps.resetUsrPass,
        resetCode,
        newPassword,
      }),
    })
      .then(dta => dta.json())
      .then(jsonDta => {
        if (jsonDta.error !== undefined) {
          throw jsonDta.error;
        }
        alert('Your pasword has been updated');
        window.location = 'https://young-dawn-72099.herokuapp.com';
      })
      .catch(error => {
        alert(error);
      });
  };
  return (
    <div id="resetPassDiv">
      <span id="resetPassSpan">
        <h3>Reset Password for: {componentProps.resetUsrPass}</h3>
      </span>
      <form onSubmit={e => submitResetPass(e)}>
        <input
          type="text"
          placeholder="Reset Code"
          className="txtInputs"
          value={resetCode}
          onChange={e => setResetCode(e.target.value)}
        ></input>
        <br />
        <input
          type="password"
          placeholder="New Password"
          className="txtInputs"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        ></input>
        <br />
        <input
          type="password"
          placeholder="Confirm Password"
          className="txtInputs"
          value={confirmPass}
          onChange={e => setConfirmPass(e.target.value)}
        ></input>
        <br />
        <button type="submit" className="btnStyles">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ResetPass;
