import React, { Component } from 'react';
import './App.css';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import {Bar} from 'react-chartjs-2';
import moment from 'moment'

class App extends Component {
  constructor(props){
    super(props)

    this.state = {
      showBar: false,
      dataset: {}, // Graph outer object
      apiData: {} // Full request api data
    }
  }

  componentDidMount(){
    this.fetchPrometheusData();
  }

  fetchPrometheusData = () => {
    let currentDate = new Date()
    let previousDate = new Date()
    previousDate.setDate(previousDate.getDate() - 1);
    previousDate.setHours(previousDate.getHours() + 23);

    fetch('add-prometheus-url-here' + previousDate.getTime()/1000.0 + '&end=' + currentDate.getTime()/1000.0 + '&step=60s')
      .then(data => data.json())
      .then((data) => { 
        console.log('Data: ', data)

        let primaryDropDownData = [];

        data.data.result.forEach(function(value, index) {
          primaryDropDownData.push(value.metric.controller_class)
        })  

        primaryDropDownData = [...new Set(primaryDropDownData)]

        this.setState({
          primaryDropDownData: primaryDropDownData,
          showBar: true,
          primaryDropDownValue: '',
          apiData: data
        })
       }); 
  }

  primaryDropDownOnSelect = (selectedValue) => {
    if (this.state.primaryDropDownValue !== selectedValue.value) {
      this.setState({
        secondaryDropDownValue: '',
        dataset: {}
      })  
    }

    let secondaryDropDownData = [];
    this.state.apiData.data.result.forEach(function(value, index) {
      if (value.metric.controller_class === selectedValue.value) {
        secondaryDropDownData.push(value.metric.pod);
      }
    })

    this.setState({
      primaryDropDownValue: selectedValue.value,
      secondaryDropDownData: secondaryDropDownData
    })
  }

  secondaryDropDownOnSelect = (selectedValue) => {
    let labels = [];
    let data = [];
    let primaryValue = this.state.primaryDropDownValue;

    this.state.apiData.data.result.forEach(function(value, index) {
      console.log('controller class: ', value.metric.controller_class);
      console.log('pod: ', value.metric.pod);
      console.log('Selected value: ', selectedValue.value);
      console.log('Primary value: ', primaryValue);
      if (value.metric.controller_class === primaryValue && value.metric.pod === selectedValue.value) {
        console.log('Value: ', value)
        value.values.forEach(function(value, index) {
          labels.push(moment.unix(value[0]).format("hh:mm"));
          data.push(value[1]);
        })
      }
    })

    let dataset = {
      labels: labels,
      datasets: [
        {
          label: selectedValue.value,
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
          hoverBackgroundColor: 'blue',
          hoverBorderColor: 'blue',
          data: data,
        }
      ]
    };

    this.setState({
      dataset: dataset,
      secondaryDropDownValue: selectedValue.value
    })
  }

  render() {
    return (
      <div className="App">
        <div>
          <h1>Nginx Ingress Controller Config Last Reload Successful</h1>
         
          {this.state.showBar &&
          <div>
            <h3>Select controller class</h3>
            <div style={{margin:'auto', width:'300px'}}>
              <Dropdown options={this.state.primaryDropDownData} onChange={this.primaryDropDownOnSelect} value={this.state.primaryDropDownValue} placeholder="Select an option" />
            </div>
            {this.state.primaryDropDownValue && 
            <div>
              <h3>Select pod</h3>
              <div style={{margin:'auto', width:'300px'}}>
                <Dropdown options={this.state.secondaryDropDownData} onChange={this.secondaryDropDownOnSelect} value={this.state.secondaryDropDownValue} placeholder="Select an option" />
              </div>
            </div>}
              <Bar
                data={this.state.dataset}
                height={250}
                options={{
                  barPercentage: 0.2,
                  barThickness: 0.5,
                  maintainAspectRatio: false,
                  scales: {
                    xAxes: [{
                      ticks: {
                          maxTicksLimit: 20
                      }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                  },
                }}
              />
          </div>}
        </div>
      </div>
    );
  }
}

export default App;
