import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Tabs from './Tabs.js';

class TabsWrapper extends Component {
  render() {
    const children = {
      guesses: this.props.guesses,
      updateFunc: this.props.updateFunc,
      funcObj: this.props.funcObj,
      nextPage: this.props.nextPage,
      toQuiz: this.props.toQuiz,
      getNextQ: this.props.getNextQ
    };
    return (
      <Tabs>{children}</Tabs>
    );
  }
}
export default withRouter(TabsWrapper);