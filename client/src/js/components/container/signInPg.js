import React, { useState, useEffect } from 'react';
import Login from './login';
import Register from './register';
import Reset from './reset';
import ResetPass from './resetPass';
import Footer from '../presentational/footer';

const SignInPg = () => {
  const [loginArrow, setLoginArrow] = useState('▲');
  const [registerArrow, setRegisterArrow] = useState('▼');
  const [reset, setReset] = useState(false);
  const [renderResetPass, setRenderResetPass] = useState(false);

  const toggleArrow = e => {
    if (e.target.id === 'loginArrow') {
      if (loginArrow === '▲') {
        setLoginArrow('▼');
      } else {
        setLoginArrow('▲');
        setRegisterArrow('▼');
      }
    }
    if (e.target.id === 'registerArrow') {
      if (registerArrow === '▼') {
        setRegisterArrow('▲');
        setLoginArrow('▼');
      } else {
        setRegisterArrow('▼');
      }
    }
    setReset(false);
    setRenderResetPass(false);
  };
  const renderReset = () => {
    setReset(true);
    setLoginArrow('▼');
    setRegisterArrow('▼');
    setRenderResetPass(false);
  };
  useEffect(() => {
    if (window.location.search.indexOf('?resetPass=') !== -1) {
      setRenderResetPass(window.location.search.slice(window.location.search.indexOf('=') + 1));
      setLoginArrow('▼');
    }
  }, []);
  return (
    <div id="signInDiv">
      <div id="signInDivInTop">
        <div className="sidTop_Div" onClick={e => toggleArrow(e)} id="loginArrow">
          Login <span className="arrownSpans">{loginArrow}</span>
        </div>
        <div className="sidTop_Div" onClick={e => toggleArrow(e)} id="registerArrow">
          Register <span className="arrownSpans">{registerArrow}</span>
        </div>
      </div>
      <div id="signInDivInBottom">
        <div>
          <div>{loginArrow === '▲' ? <Login /> : null}</div>
          <div>{registerArrow === '▲' ? <Register /> : null}</div>
          <div>{reset === true ? <Reset /> : null}</div>
          <div>
            {renderResetPass !== false ? <ResetPass resetUsrPass={renderResetPass} /> : null}
          </div>
        </div>
      </div>
      <div id="forgotPassDiv" onClick={() => renderReset()}>
        Forgot Password?
      </div>
      <br />
      <Footer />
    </div>
  );
};
export default SignInPg;
