import React, { useState, useEffect } from 'react';
import { GoogleCharts } from 'google-charts';

const Poll = () => {
  const [pollName, setPollName] = useState('');
  const [pollDta, setPollDta] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');

  const submitVote = e => {
    e.preventDefault();
    if (selectedItem === '') {
      alert('Please select an option.');
      return;
    }
    fetch('https://young-dawn-72099.herokuapp.com/api/handleVote', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: pollName,
        item: selectedItem,
      }),
    })
      .then(dta => dta.json())
      .then(jsonDta => {
        if (jsonDta.error !== undefined) {
          throw jsonDta.error;
        }
        setPollName(jsonDta.data[0].Name);
        jsonDta.data[0].PollInfo = JSON.parse(jsonDta.data[0].PollInfo);
        setPollDta(jsonDta.data[0].PollInfo);
        const chartDtaArr = jsonDta.data[0].PollInfo.map(item => [item.name, item.count]);
        chartDtaArr.unshift(['Chart', 'Data']);
        const drawChart = () => {
          const options = {
            backgroundColor: 'silver',
            is3D: true,
            sliceVisibilityThreshold: 0,
            pieSliceText: 'value',
          };
          const data = GoogleCharts.api.visualization.arrayToDataTable(chartDtaArr);
          const pieChart = new GoogleCharts.api.visualization.PieChart(
            document.getElementById('chartDiv')
          );
          pieChart.draw(data, options);
        };
        GoogleCharts.load(drawChart);
      })
      .catch(error => {
        alert(error);
      });
  };

  useEffect(() => {
    let iden = window.location.pathname;
    iden = iden.slice(7);
    iden = 'TH3IxRfLexbTHvPAt3Z1zOCom';

    fetch(`https://young-dawn-72099.herokuapp.com/api/polls/${iden}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(dta => dta.json())
      .then(jsonDta => {
        if (jsonDta.error !== undefined) {
          throw jsonDta.error;
        }
        setPollName(jsonDta.data[0].Name);
        jsonDta.data[0].PollInfo = JSON.parse(jsonDta.data[0].PollInfo);
        setPollDta(jsonDta.data[0].PollInfo);
        const chartDtaArr = jsonDta.data[0].PollInfo.map(item => [item.name, item.count]);
        chartDtaArr.unshift(['Chart', 'Data']);
        const drawChart = () => {
          const options = {
            backgroundColor: 'silver',
            is3D: true,
            sliceVisibilityThreshold: 0,
            pieSliceText: 'value',
          };
          const data = GoogleCharts.api.visualization.arrayToDataTable(chartDtaArr);
          const pieChart = new GoogleCharts.api.visualization.PieChart(
            document.getElementById('chartDiv')
          );
          pieChart.draw(data, options);
        };
        GoogleCharts.load(drawChart);
      })
      .catch(error => {
        alert(error);
      });
  }, []); /* eslint-disable-line */
  return (
    <div id="pollDiv">
      <div id="pollFormDiv">
        <form onSubmit={e => submitVote(e)}>
          <span id="pollTitleSpan">{pollName}</span>
          <br />
          <span id="voteForSpan">I'd like to vote for...</span>
          <br />
          <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
            <option value="">Choose an option...</option>
            {pollDta.map(item => (
              <option value={item.name} key={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <br />
          <button id="pollVoteBtn" type="submit" className="btnStyles">
            submit
          </button>
        </form>
      </div>
      <div id="chartDiv">
        <canvas id="chartCanvas"></canvas>
      </div>
    </div>
  );
};

export default Poll;
