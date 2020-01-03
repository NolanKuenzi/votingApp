import React, { useState, useEffect } from 'react';

const Polls = () => {
  const [pollNameList, setPollNameList] = useState([]);
  return (
    <div>
      <div id="topSectionDiv">
        <span>
          Home
          <button type="button" id="homeBtn">
            Sign In
          </button>
        </span>
      </div>
      <div id="header">
        <h2>Voting App</h2>
        <h4>Select a poll to see the results and vote, or sign-in to make a new poll.</h4>
      </div>
    </div>
  );
};

export default Polls;
