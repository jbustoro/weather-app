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
  Container,
  Flex,
  Form,
  FormGroup,
  Heading,
  Image,
  Input
} from "styled-minimal";
import treeChanges from "tree-changes";
import Windrose from "windrose";
import { getWeather } from "../../actions";
import { STATUS } from "../../constants";
import "./Weather.css";

export class Weather extends React.Component {
  state = {
    query: "Madrid"
  };

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    weather: PropTypes.object.isRequired
  };

  componentDidMount() {
    const { query } = this.state;
    const { dispatch } = this.props;

    dispatch(getWeather(query));
  }

  componentWillReceiveProps(nextProps) {
    const { changedTo } = treeChanges(this.props, nextProps);

    if (changedTo("weather.status", STATUS.ERROR)) {
      console.log(nextProps.weather.message);
    }
  }

  handleSubmit = e => {
    e.preventDefault();

    const { dispatch } = this.props;
    const formData = new FormData(e.target);
    const query = formData.get("query");

    if (query) {
      this.setState({
        query
      });

      dispatch(getWeather(query));
    }
  };

  render() {
    const { weather } = this.props;
    const data = weather.data;
    let output;

    if (weather.status === STATUS.READY) {
      if (data) {
        const {
          city: { country, name, timezone },
          list
        } = data;
        const momentJsDate = moment.utc().utcOffset(timezone / 60); // utcOffset takes offset in minutes, timezone is the offset in seconds
        const date = momentJsDate.format("dddd, MMMM Do YYYY");
        const time = momentJsDate.format("hh:mm a");

        // Current weather
        const [
          {
            main: { humidity, pressure, temp },
            weather: [{ description, icon, main }],
            wind: { deg, speed }
          }
        ] = list;

        // TODO On clear sky check time to set sunny or starry
        let animation = "";

        switch (main) {
          case "Clear":
            animation = "sunny";
            break;
          case "Clouds":
            animation = "cloudy";
            break;
          case "Rain" || "Drizzle":
            animation = "rainy";
            break;
          case "Thunderstorm":
            animation = "stormy";
            break;
          case "Snow":
            animation = "snowy";
            break;

          default:
            animation = "rainbow";
            break;
        }

        // const image = (
        //   <Image
        //     alt="Weather icon"
        //     src={`http://openweathermap.org/img/wn/${icon}@2x.png`}
        //   />
        // );
        const { symbol } = Windrose.getPoint(deg, { depth: 1 }); // With value 1 returns the main 8 compass points (N, NE, E, SE, S, SW, W, NW).

        const currentWeather = (
          <Container>
            <Flex justifyContent="center">
              <Heading>{name}</Heading>
            </Flex>
            <Flex justifyContent="center">
              <p>{date}</p>
            </Flex>
            <Flex justifyContent="space-around">
              <Heading>{`${temp > 0 ? "+" : "-"}${temp}º`}</Heading>
              <Flex justifyContent="center">
                <div className={animation} />
              </Flex>
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

            <Flex justifyContent="center" mt="4">
              <Badge>
                {description.charAt(0).toUpperCase() + description.slice(1)}
              </Badge>
            </Flex>
          </Container>
        );

        // const fiveDaysWeather = <div />;

        // // 5 days weather
        // list.forEach(element => {
        //   const { clouds, dt, dt_txt, main, weather, wind } = element;
        // });

        output = currentWeather;
      } else {
        output = <h3>Nothing found</h3>;
      }
    }

    return (
      <Container>
        {output}
        <Flex justifyContent="center" mt="3">
          <Form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Input type="text" name="query" placeholder="Search city..." />
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
