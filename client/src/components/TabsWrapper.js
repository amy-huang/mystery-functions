/**
 * Wrapper for the Tabs component
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Tabs from './Tabs.js';

class TabsWrapper extends Component {
  render() {
    const children = {
      guesses: this.props.guesses, // array of input output pair display components on the guessing screen console
      updateFunc: this.props.updateFunc, // adds input evaluations to the guessing screen console
      funcObj: this.props.funcObj, // function object for the current mystery function
      nextPage: this.props.nextPage, // next mystery function page
      toQuiz: this.props.toQuiz, // function that switches the guessing screen from evaluation mode to quiz mode 
      getNextQ: this.props.getNextQ // function that returns the lowest quiz question that hasn't been seen yet
    };
    return (
      <Tabs>{children}</Tabs>
    );
  }
}
export default withRouter(TabsWrapper);