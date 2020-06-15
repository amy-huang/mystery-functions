import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Typography } from '@material-ui/core';
import withStyles from '@material-ui/styles/withStyles';


const styles = theme => ({
  text: {
    fontSize: 14,
    fontStyle: "italic",
  },
});

class FinalGuessLine extends Component {
  render() {
    var classes = this.props;
    return (
      <Grid container direction="row" spacing={1} justify="flex-start" height={20}>
        <Grid item>
          <Typography className={classes.text}>Your guess:</Typography>
        </Grid>
        <Grid item>
          <Typography className={classes.text}>{classes.finalGuess}</Typography>
        </Grid>
      </Grid>
    )
  }
}

export default withRouter(withStyles(styles)(FinalGuessLine));