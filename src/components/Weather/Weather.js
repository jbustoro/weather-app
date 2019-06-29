import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { Button, Flex, Form, FormGroup, Input } from "styled-minimal";
import treeChanges from "tree-changes";
import { getWeather } from "../../actions";
import { STATUS } from "../../constants";

export class Weather extends React.Component {
  state = {
    query: ""
  };

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    weather: PropTypes.object.isRequired
  };

  componentDidMount() {
    // const { query } = this.state;
    // const { dispatch } = this.props;
    // dispatch(getWeather(query));
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
        output = <h3>OK</h3>;
      } else {
        output = <h3>Nothing found</h3>;
      }
    } else {
      output = <h3>Loading...</h3>;
    }

    return (
      <div>
        {output}

        <Flex justifyContent="left">
          <Form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Input type="text" name="query" placeholder="Search city..." />
            </FormGroup>
            <Button type="submit">SUBMIT</Button>{" "}
          </Form>
        </Flex>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { weather: state.weather };
}

export default connect(mapStateToProps)(Weather);
