import React from "react";
import Weather from "../Weather/Weather";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Weather App</h1>
        </header>
        <Weather />
      </div>
    );
  }
}

export default App;
