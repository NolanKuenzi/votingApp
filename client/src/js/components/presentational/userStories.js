import React from 'react';
import Footer from './footer';

const UserStories = () => (
  <div>
    <div>
      <ol>
        <li>Only allow your site to be loading in an iFrame on your own pages.</li>
        <li>Do not allow DNS prefetching.</li>
        <li>Only allow your site to send the referrer for your own pages.</li>
        <li>
          I can <b>POST</b> a thread to a specific message board by passing form data text and
          delete_password to <i>/api/threads/{'{board}'}</i>.(Recomend res.redirect to board page
          /b/
          {'{board}'}) Saved will be _id, text, created_on(date&time), bumped_on(date&time, starts
          same as created_on), reported(boolean), delete_password, & replies(array).
        </li>
        <li>
          I can <b>POST</b> a reply to a thead on a specific board by passing form data text,
          delete_password, & thread_id to <i>/api/replies/{'{board}'}</i> and it will also update
          the bumped_on date to the comments date.(Recomend res.redirect to thread page /b/
          {'{board}'}/{'{thread_id}'}) In the thread's 'replies' array will be saved _id, text,
          created_on, delete_password, & reported.
        </li>
        <li>
          I can <b>GET</b> an array of the most recent 10 bumped threads on the board with only the
          most recent 3 replies from <i>/api/threads/{'{board}'}</i>. The reported and
          delete_passwords fields will not be sent.
        </li>
        <li>
          I can <b>GET</b> an entire thread with all it's replies from{' '}
          <i>
            /api/replies/{'{board}'}?thread_id={'{thread_id}'}
          </i>
          . Also hiding the same fields.
        </li>
        <li>
          I can delete a thread completely if I send a DELETE request to{' '}
          <i>/api/threads/{'{board}'}</i> and pass along the thread_id & delete_password. (Text
          response will be 'incorrect password' or 'success')
        </li>
        <li>
          I can delete a post(just changing the text to '[deleted]') if I send a <b>DELETE</b>{' '}
          request to <i>/api/replies/{'{board}'}</i> and pass along the thread_id, reply_id, {'&'}{' '}
          delete_password. (Text response will be 'incorrect password' or 'success')
        </li>
        <li>
          I can report a thread and change it's reported value to true by sending a <b>PUT</b>{' '}
          request to
          <i>/api/threads/{'{board}'} </i>and pass along the thread_id. (Text response will be
          'success')
        </li>
        <li>
          I can report a reply and change it's reported value to true by sending a <b>PUT</b>{' '}
          request to
          <i>/api/replies/{'{board}'}</i> and pass along the thread_id & reply_id. (Text response
          will be 'success')
        </li>
        <li>Complete functional tests that wholely test routes and pass.</li>
      </ol>
    </div>
    <div id="tableDiv">
      <table>
        <tbody>
          <tr>
            <td className="tableHeader"></td>
            <td className="tableHeader">
              <b>GET</b>
            </td>
            <td className="tableHeader">
              <b>POST</b>
            </td>
            <td className="tableHeader">
              <b>PUT</b>
            </td>
            <td className="tableHeader">
              <b>DELETE</b>
            </td>
          </tr>
          <tr>
            <td className="tableSide">
              <b>/api/threads{'{board}'}</b>
            </td>
            <td>list recent threads</td>
            <td>create thread</td>
            <td>report thread</td>
            <td>delete thread with password</td>
          </tr>
          <tr>
            <td className="tableSide">
              <b>/api/replies{'{board}'}</b>
            </td>
            <td>show all replies on thread</td>
            <td>create reply on thread</td>
            <td>report reply on thread</td>
            <td>change reply to '[deleted]' on thread</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div id="testingLinkDiv">
      <span>
        <a href="https://shielded-coast-12579.herokuapp.com/b/general">
          Go to testing <i>'/b/general/'</i> board
        </a>
      </span>
    </div>
    <Footer />
  </div>
);

export default UserStories;
