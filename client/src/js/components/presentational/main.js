import React from 'react';
import { useSelector } from 'react-redux';
import TopMenu from '../container/topMenu';
import Polls from '../container/polls';
import SignInPg from '../container/signInPg';
import AddPoll from '../container/addPoll';
import Poll from '../container/poll';
import MyPolls from '../container/myPolls';

const Main = () => {
  const currentComp = useSelector(state => state.currentComp);
  return (
    <div>
      <TopMenu />
      {currentComp === 'polls' ? <Polls /> : null}
      {currentComp === 'signIn' ? <SignInPg /> : null}
      {currentComp === 'addPoll' ? <AddPoll /> : null}
      {currentComp === 'poll' ? <Poll /> : null}
      {currentComp === 'myPolls' ? <MyPolls /> : null}
    </div>
  );
};

export default Main;
