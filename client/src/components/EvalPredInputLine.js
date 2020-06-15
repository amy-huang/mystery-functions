/**
 * Component for displaying an input evaluation for a mystery predicate
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

class EvalPredInputLine extends Component {
  render() {
    var classes = this.props;
    return (
      <Grid container direction="column" spacing={1} justify="flex-start">
        <Grid item>
          <Typography style={{whiteSpace: 'pre'}} className={classes.text}>{classes.in}</Typography>
        </Grid>

        <Grid container spacing={1} item direction="row">
          <Grid item>
            <Typography className={classes.text}>evaluates to</Typography>
          </Grid>
          <Grid item>
          <Button variant="contained"><Typography className={classes.text}>{classes.out}</Typography></Button>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

export default withRouter(withStyles(styles)(EvalPredInputLine));