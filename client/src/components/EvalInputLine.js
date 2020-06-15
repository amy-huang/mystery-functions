/**
 * Component for displaying an input evaluation for a mystery function
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Typography } from '@material-ui/core';
import withStyles from '@material-ui/styles/withStyles';
import Button from '@material-ui/core/Button'

const styles = theme => ({
  text: {
    fontSize: 14,
  },
});

class EvalInputLine extends Component {
  render() {
    var classes = this.props;
    return (
      <Grid container direction="row" spacing={1} justify="flex-start" alignItems="center">
        <Grid item>
          <Button variant="contained"><Typography className={classes.text}>{classes.in}</Typography></Button>
        </Grid>
        <Grid item>
          <Typography className={classes.text}>evaluates to</Typography>
        </Grid>
        <Grid item>
        <Button variant="contained"><Typography className={classes.text}>{classes.out}</Typography></Button>
        </Grid>
      </Grid>
    )
  }
}

export default withRouter(withStyles(styles)(EvalInputLine));