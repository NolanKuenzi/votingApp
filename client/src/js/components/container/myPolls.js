import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import deleteCookie from '../../controllers/deleteCookie';

const MyPolls = () => {
  const usrEmail = useSelector(state => state.userEmail);
  const [userPolls, setUserPolls] = useState([]);
  const [editPoll, setEditPoll] = useState([]);
  const [editPollId, setEditPollId] = useState('');
  const [editPollName, setEditPollName] = useState('');
  const [addPollInputVal, setAddPollInputVal] = useState('');
  const dispatch = useDispatch();

  const checkLoginStatus = () =>
    new Promise(resolve => {
      resolve(
        fetch('https://young-dawn-72099.herokuapp.com/api/checkToken', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    })
      .then(dta => {
        if (dta.status !== 200) {
          return 'unauthorized';
        }
        return 'success';
      })
      .catch(err => 'unauthorized');

  const unauthorizedFunc = () => {
    deleteCookie('email');
    dispatch({ type: 'USER_EMAIL', payload: null });
    dispatch({ type: 'CURRENT_COMPONENT', payload: 'polls' });
    alert('Unauthorized. Please login to view your polls.');
  };

  const editPollFunc = e => {
    const Id = e.target.id;
    const pollName = e.target.name;
    return new Promise(resolve => {
      resolve(checkLoginStatus());
    })
      .then(rtrnDta => {
        if (rtrnDta !== 'success') {
          unauthorizedFunc();
          return;
        }
        fetch(`https://young-dawn-72099.herokuapp.com/api/userPolls/edit/${Id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(data => data.json())
          .then(jsonDta => {
            setEditPoll(jsonDta.data);
            setEditPollId(Id);
            setEditPollName(pollName);
          })
          .catch(err => {
            alert(err);
          });
      })
      .catch(err => {
        alert(err);
      });
  };

  const deletePollFunc = e => {
    const Id = e.target.id;
    return new Promise(resolve => {
      resolve(checkLoginStatus());
    })
      .then(rtrnDta => {
        if (rtrnDta !== 'success') {
          unauthorizedFunc();
          return;
        }
        fetch(`https://young-dawn-72099.herokuapp.com/api/userPolls/delete/${Id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(dta => dta.json())
          .then(jsonDta => {
            setUserPolls(jsonDta.data);
          })
          .catch(err => {
            alert(err);
          });
      })
      .catch(err => {
        alert(err);
      });
  };

  const cancelFunc = () => {
    setEditPoll([]);
    setEditPollId('');
    setEditPollName('');
  };

  const delPollEntryFunc = e => {
    const entryName = e.target.id;
    return new Promise(resolve => {
      resolve(checkLoginStatus());
    })
      .then(rtrnDta => {
        if (rtrnDta !== 'success') {
          unauthorizedFunc();
          return;
        }
        fetch(
          `https://young-dawn-72099.herokuapp.com/api/userPolls/deleteEntry/${usrEmail}/${editPollId}/${entryName}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
          .then(dta => dta.json())
          .then(jsonDta => {
            if (jsonDta.error !== undefined) {
              throw jsonDta.error;
            }
            setEditPoll(jsonDta.data);
          })
          .catch(err => {
            alert(err);
          });
      })
      .catch(err => {
        alert(err);
      });
  };

  const addPollEntryFunc = () =>
    new Promise(resolve => {
      resolve(checkLoginStatus());
    })
      .then(rtrnDta => {
        if (rtrnDta !== 'success') {
          unauthorizedFunc();
          return;
        }
        fetch(
          `https://young-dawn-72099.herokuapp.com/api/userPolls/addEntry/${usrEmail}/${editPollId}/${addPollInputVal}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
          .then(dta => dta.json())
          .then(jsonDta => {
            if (jsonDta.error !== undefined) {
              throw jsonDta.error;
            }
            setEditPoll(jsonDta.data);
            setAddPollInputVal('');
          })
          .catch(err => {
            alert(err);
          });
      })
      .catch(err => {
        alert(err);
      });

  useEffect(() => {
    fetch(`https://young-dawn-72099.herokuapp.com/api/userPolls/${usrEmail}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(dta => dta.json())
      .then(jsonDta => {
        setUserPolls(jsonDta.data);
      })
      .catch(err => {
        alert(err);
      });
  }, []); /* eslint-disable-line */

  return (
    <div id="myPollsBody">
      <div id="myPollsDiv">
        {userPolls.length === 0 ? (
          <div>
            <span>No polls currently submitted</span>
          </div>
        ) : (
          <table id="myPollsTable">
            <tbody>
              {userPolls.map(item => (
                <tr key={item._id}>
                  <td>
                    <span className="myPollName">{item.Name}</span>{' '}
                  </td>
                  <td>
                    <span className="editBtn">
                      <button
                        type="button"
                        className="btnStyles"
                        name={item.Name}
                        id={item._id}
                        onClick={e => editPollFunc(e)}
                      >
                        Edit
                      </button>
                    </span>
                  </td>
                  <td>
                    <span className="deleteBtn">
                      <button
                        data-testid={`tDelBtn-${item.Name}`}
                        type="button"
                        id={item._id}
                        className="btnStyles"
                        onClick={e => deletePollFunc(e)}
                      >
                        Delete
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div id="editPollDiv">
        {editPoll.length === 0 ? null : (
          <div id="editPollStyleDiv">
            <div className="cancelBtnDiv">
              <button type="button" className="btnStyles" onClick={() => cancelFunc()}>
                Cancel
              </button>
            </div>
            <h3>{`Edit '${editPollName}' Poll`}:</h3>
            <table id="editPollTable">
              <tbody>
                {editPoll.map(item => (
                  <tr key={item}>
                    <td>
                      <span className="editPollEntryList">{item}</span>
                    </td>
                    <td>
                      <span className="delPollEntryBtn">
                        <button
                          type="button"
                          data-testid={item}
                          id={item}
                          className="btnStyles"
                          onClick={e => delPollEntryFunc(e)}
                        >
                          X
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div id="addPollSection">
              <span id="addPollEntryInput">
                <input
                  data-testid="addEntryInput"
                  type="text"
                  className="txtInputs"
                  value={addPollInputVal}
                  onChange={e => setAddPollInputVal(e.target.value)}
                  placeholder="Add New Poll Entry"
                ></input>
              </span>
              <br />
              <span id="addPollEntryBtnSpan">
                <button type="button" className="btnStyles" onClick={() => addPollEntryFunc()}>
                  Add
                </button>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPolls;
