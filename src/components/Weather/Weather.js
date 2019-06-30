import {
  faTemperatureHigh,
  faTint,
  faWind
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import {
  Badge,
  Box,
  Container,
  Flex,
  Form,
  FormGroup,
  Heading,
  Image,
  Input,
  Legend
} from "styled-minimal";
import treeChanges from "tree-changes";
import Windrose from "windrose";
import { getWeather } from "../../actions";
import capital from "../../assets/capitals/capital.jpeg";
import { STATUS } from "../../constants";
import "./Weather.css";

export class Weather extends React.Component {
  // TODO Set query to users location
  state = {
    query: "Madrid"
  };

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    weather: PropTypes.object.isRequired
  };

  componentDidMount() {
    // Set state with the query and and dispatch getWeather action
    const { query } = this.state;
    const { dispatch } = this.props;

    dispatch(getWeather(query));
  }

  componentWillReceiveProps(nextProps) {
    const { changedTo } = treeChanges(this.props, nextProps);

    // TODO Set 404 page when the status changes to error
    if (changedTo("weather.status", STATUS.ERROR)) {
      console.log(nextProps.weather.message);
    }
  }

  handleSubmit = e => {
    // Prevent from refreshing the page
    e.preventDefault();

    const { dispatch } = this.props;
    const formData = new FormData(e.target);
    const query = formData.get("query");

    // If the query is not null set the state and dispatch getWeather action
    if (query) {
      this.setState({
        query
      });

      dispatch(getWeather(query));
    }
  };

  /**
   *
   * @param {*} main (Main weather)
   * @param {*} pod (Day or night)
   */
  getCurrentAnimation(main, pod) {
    switch (main) {
      case "Clear":
        return pod === "d"
          ? // Randomly return sunny (more provability) or rainbow on clear day
            Math.random() >= 0.1
            ? "sunny"
            : "rainbow"
          : "starry";
      case "Clouds":
        return "cloudy";
      case "Rain" || "Drizzle":
        return "rainy";
      case "Thunderstorm":
        return "stormy";
      case "Snow":
        return "snowy";

      default:
        return "rainbow";
    }
  }

  /**
   *
   * @param {*} list (Weather 5 day / 3 hour forecast)
   */
  getWeakWeather(list) {
    // TODO Fix Each child in a list should have a unique "key" prop.
    // Divide weather list (3 hour forecast) in days weather list
    let dayAux = -1;
    let dayIndex = -1;
    const daysWeatherList = [];

    list.forEach(element => {
      const { dt_txt } = element;
      const day = moment(dt_txt).format("d");

      if (day === dayAux) {
        daysWeatherList[dayIndex].push(element);
      } else {
        dayAux = day;
        dayIndex++;
        daysWeatherList.push([element]);
      }
    });

    // Form list with Objects with the average weather values for each day
    const daysWeatherAverage = daysWeatherList.map((dayWeatherList, index) => {
      // Get current day
      const [{ dt_txt }] = dayWeatherList;
      const day = moment(dt_txt).format("dddd");
      // Initialize temperatures and icons array
      const tempMaxArray = [];
      const tempMinArray = [];
      const icons = [];

      // Fill temperatures and icons array with the current day values
      dayWeatherList.forEach(element => {
        const {
          main: { temp_max, temp_min },
          weather: [{ icon }]
        } = element;

        tempMaxArray.push(temp_max);
        tempMinArray.push(temp_min);
        icons.push(icon);
      });

      // Get temperature min/max averages for the day
      const averageTempMax =
        tempMaxArray.reduce((total, tempMax) => total + tempMax) /
        tempMaxArray.length;
      const averageTempMin =
        tempMinArray.reduce((total, tempMin) => total + tempMin) /
        tempMinArray.length;

      // Count how many times the icon appears in icons array
      const iconCounts = icons.reduce((counts, element) => {
        counts[element] = ++counts[element] || 1;

        return counts;
      }, {});

      // Get the most repeated icon
      // TODO Check when should appear night icon (01n)
      const mostRepeatedIcon = Object.keys(iconCounts).reduce((a, b) =>
        iconCounts[a] > iconCounts[b] ? a : b
      );

      // Form Object with the average weather values for the current day
      const dayWeatherAverage = {
        day: day,
        tempMax: averageTempMax,
        tempMin: averageTempMin,
        icon: mostRepeatedIcon
      };

      return dayWeatherAverage;
    });

    return daysWeatherAverage;
  }

  render() {
    const { weather } = this.props;
    const data = weather.data;

    let output;

    if (weather.status === STATUS.READY) {
      // If we received weather data from the api, create current weather and weak weather
      if (data) {
        const {
          city: { name, timezone },
          list
        } = data;
        const momentJsDate = moment.utc().utcOffset(timezone / 60); // utcOffset takes offset in minutes, timezone is the offset in seconds
        const date = momentJsDate.format("dddd, MMMM Do YYYY");

        // Current weather
        const [
          {
            main: { humidity, pressure, temp },
            sys: { pod },
            weather: [{ description, main }],
            wind: { deg, speed }
          }
        ] = list;

        const animation = this.getCurrentAnimation(main, pod);

        const { symbol } = Windrose.getPoint(deg, { depth: 1 }); // With depth 1 returns the main 8 compass points (N, NE, E, SE, S, SW, W, NW).

        const currentWeather = (
          <Container
            className="currenWeather"
            backgroundImage={`url(${capital})`}
            mt="4"
          >
            <Flex justifyContent="center">
              <Heading mt="3">{name}</Heading>
            </Flex>
            <Flex justifyContent="center">
              <Legend color="white">{date}</Legend>
            </Flex>
            <Flex justifyContent="space-around">
              <Flex>
                <span className="temp-symbol">{`${temp > 0 ? "+" : "-"}`}</span>
                <h1 className="temp">
                  {`${temp.toFixed()}`}
                  <span className="temp-symbol celsius">°</span>
                </h1>
              </Flex>
              <div className={animation} />
              <Flex flexDirection="column" alignItems="start">
                <Flex>
                  <FontAwesomeIcon icon={faTemperatureHigh} />
                  <p>{`${(pressure * 0.7500616827).toFixed()} mm Hg`}</p>
                </Flex>
                <Flex>
                  <FontAwesomeIcon icon={faTint} />
                  <p>{`${humidity}% Humidity`}</p>
                </Flex>

                <Flex>
                  <FontAwesomeIcon icon={faWind} />
                  <p>{`${speed}m/s ${symbol}`}</p>
                </Flex>
              </Flex>
            </Flex>

            <Flex justifyContent="center">
              <Badge mb="4">
                {description.charAt(0).toUpperCase() + description.slice(1)}
              </Badge>
            </Flex>
          </Container>
        );

        const weakWeather = (
          <Container className="weakWeather">
            <Flex>
              {this.getWeakWeather(list).map(weather => {
                const { day, tempMax, tempMin, icon } = weather;

                return (
                  <Box className="dayWeather" width="100%">
                    <Flex flexDirection="column">
                      <Legend mt="2" color="white">
                        {day}
                      </Legend>
                      <Image
                        alt="Weather icon"
                        src={`http://openweathermap.org/img/wn/${icon}@2x.png`}
                      />
                      <Legend color="white">
                        <span>{`${temp > 0 ? "+" : "-"}`}</span>
                        {`${tempMax.toFixed()}°/${tempMin.toFixed()}°`}
                      </Legend>
                    </Flex>
                  </Box>
                );
              })}
            </Flex>
          </Container>
        );

        output = (
          <Container>
            {currentWeather}
            {weakWeather}
          </Container>
        );
      } else {
        output = <h3>Nothing found</h3>;
      }
    }

    return (
      <Container>
        {output}
        <Flex justifyContent="center" mt="4">
          <Form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Input
                className="search"
                type="text"
                name="query"
                bg="inherit"
                color="white"
                borderRadius="10px"
                placeholder="Search city..."
              />
            </FormGroup>
            {/* <Button type="submit">SUBMIT</Button> */}
          </Form>
        </Flex>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return { weather: state.weather };
}

export default connect(mapStateToProps)(Weather);
