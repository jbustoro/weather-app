import React from "react";
import Weather from "../Weather/Weather";
import "./App.css";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="bg" />
        <Weather />
      </div>
    );
  }
}

export default App;
