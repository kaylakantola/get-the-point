import React from "react";
import ReactDOM from "react-dom";
import dotenv from "dotenv";
const axios = require("axios");
dotenv.config();

const formatAddress = address => address.split(" ").join("+");

const formatURL = address =>
  `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${
    process.env.GOOGLE_MAPS_KEY
  }`;

const getLatLng = ({ id, address }) => {
  const formattedAddress = formatAddress(address);
  axios
    .get(formatURL(formattedAddress))
    .then(res => {
      const result = {
        id,
        address,
        result: res.data.results[0].geometry.location
      };
      console.log(result);
    })
    .catch(e => console.log("e", e));
};

const addresses = [
  { id: 1, address: "1162 Julian Clark Rd, Charleston, SC" },
  { id: 2, address: "46 Enmore Street, Andover, MA" }
];

const App = () => {
  const addys = addresses.map(a => getLatLng(a));
  console.log({ addys });
  return <div className="kick">rendered!!!!</div>;
};

ReactDOM.render(<App />, document.getElementById("root"));
