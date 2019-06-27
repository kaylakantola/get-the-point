import React, { Component } from "react";
import ReactDOM from "react-dom";
import dotenv from "dotenv";
const { dropLast, splitEvery, unnest } = require("ramda");
//import fs from "fs-extra";
const axios = require("axios");
const papa = require("papaparse");
const csvFile = require("./addresses.csv");

dotenv.config();

const formatAddress = address => address.split(" ").join("+");

const formatURL = address =>
  `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${
    process.env.GOOGLE_MAPS_KEY
  }`;

const goForIt = ({ formattedAddress, wellID, address }) => {
  return new Promise(resolve => {
    axios
      .get(formatURL(formattedAddress))
      .then(res => {
        //console.log("res", res);
        const result = {
          wellID,
          address,
          lat: res.data.results[0].geometry.location.lat,
          lng: res.data.results[0].geometry.location.lng
        };
        resolve(result);
      })
      .catch(e => console.log("e", e));
  });
};

const getLatLng = ({ wellID, address }) => {
  return new Promise(resolve => {
    const formattedAddress = formatAddress(address);
    goForIt({ formattedAddress, wellID, address })
      .then(res => resolve(res))
      .catch(e => e);
  });
};
//
// const addresses = [
//   { id: 1, address: "1162 Julian Clark Rd, Charleston, SC" },
//   { id: 2, address: "46 Enmore Street, Andover, MA" }
// ];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      addresses: [],
      newThing: []
    };
    this.click = this.click.bind(this);
    this.youreDone = this.youreDone.bind(this);
  }

  componentDidMount() {
    papa.parse(require("./addresses.csv"), {
      download: true,
      header: true,
      complete: res => {
        const split = splitEvery(100, dropLast(1, res.data));
        return this.setState({ addresses: split });
      }
    });
  }

  click(c, a) {
    this.setState({ count: c + 1 });
    Promise.all(a[c].map(a => getLatLng(a)))
      .then(res => {
        this.setState({ newThing: [...this.state.newThing, res] });
      })
      .catch(e => e);
  }

  youreDone(a) {
    const oneArray = unnest(a);
    const csv = papa.unparse(oneArray);
    console.log(csv);
    // fs.outputFile("./newAddresses.csv", csv)
    //   .then(() => {
    //     console.log("done"); // => hello!
    //   })
    //   .catch(err => {
    //     console.error(err);
    //   });
  }

  render() {
    const { count, newThing, addresses } = this.state;
    const length = addresses.length;

    return (
      <div>
        <div
          role="button"
          onClick={() =>
            count === length
              ? this.youreDone(newThing)
              : this.click(count, addresses)
          }
        >
          click
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
