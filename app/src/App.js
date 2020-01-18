/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from "react";
import DonutChart from "./components/DonutChart";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      revenueDs: [],
      impresionsDs: [],
      visitsDs: []
    };
  }

  componentDidMount() {
    this.getDs();
  }
  getDs() {
    Promise.all([fetch("api/revenue"), fetch("api/impresions"), fetch("api/visits")])
      .then(([res1, res2, res3]) => Promise.all([res1.json(), res2.json(), res3.json()]))
      .then(([data1, data2, data3]) => {
        this.setState({
          revenueDs: data1.data,
          impresionsDs: data2.data,
          visitsDs: data3.data
        });
      })
      .catch((err) => console.log(err));

    // fetch("api/revenue")
    //   .then((res) => res.json())
    //   .then((data) => {
    //     this.setState({
    //       revenueDs: data.data
    //     });
    //   })
    //   .catch((err) => console.log(err));
  }

  render() {
    const { revenueDs, impresionsDs, visitsDs } = this.state;
    return (
      <div className="grid-container">
        <div className="grid-item">
          <DonutChart ds={revenueDs} color="green" />
        </div>
        <div className="grid-item">
          <DonutChart ds={impresionsDs} color="blue" />
        </div>
        <div className="grid-item">
          <DonutChart ds={visitsDs} color="orange" />
        </div>
      </div>
    );
  }
}
export default App;
