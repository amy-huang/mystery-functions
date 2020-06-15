import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Typography, createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import withStyles from '@material-ui/styles/withStyles';
import { green, red } from '@material-ui/core/colors';

const styles = theme => ({
  text: {
    fontSize: 14,
  },
});

class EvalGuessLine extends Component {
  theme = createMuiTheme({
    palette: {
      primary: {
        main: green['A700'],
      },
      secondary: {
        main: red['A700'],
      }
    }
  })

  render() {
    var classes = this.props;
    var resultStyle;
    if (classes.result === "YES") {
      resultStyle = "primary";
    } else {
      resultStyle = "secondary";
    }
    return (
      <MuiThemeProvider theme={this.theme}>
        <Grid container direction="row" spacing={2} justify="flex-start" height={20}>
          <Grid item>
            <Typography className={classes.text}>Does</Typography>
          </Grid>
          <Grid item>
            <Typography className={classes.text}>{JSON.stringify(classes.in)}</Typography>
          </Grid>
          <Grid item>
            <Typography className={classes.text}>evaluate to</Typography>
          </Grid>
          <Grid item>
            <Typography className={classes.text}>{JSON.stringify(classes.out)}</Typography>
          </Grid>
          <Grid item>
            <Typography className={classes.text}>?</Typography>
          </Grid>
          <Grid item>
            <Typography color={resultStyle} className={classes.text}>{classes.result}</Typography>
          </Grid>
          <Grid item>
            <Typography className={classes.text}>{JSON.stringify(classes.reason)}</Typography>
          </Grid>
        </Grid>
      </MuiThemeProvider>
    )
  }
}

export default withRouter(withStyles(styles)(EvalGuessLine));