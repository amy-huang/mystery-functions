import React, { Component } from 'react'
import withStyles from '@material-ui/styles/withStyles'
import { withRouter } from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import { TextField, Typography } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import first from '../pics/time.png'
import second from '../pics/functions.png'
import third from '../pics/quiz.png'
import fourth from '../pics/goodluck.png'

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.grey['100'],
    overflow: 'hidden',
    backgroundSize: 'cover',
    backgroundPosition: '0 400px',
    paddingBottom: 200
  },
  grid: {
    width: 1200,
    marginTop: 40,
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 20px)'
    },
  },
  panel: {
    width: 775,
    marginTop: 40,
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 20px)'
    },
    fontSize: 16,
  },
  paper: {
    padding: theme.spacing(3),
    textAlign: 'left',
    color: theme.palette.text.secondary,
  },
  rangeLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(2)
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32
  },
  outlinedButtom: {
    textTransform: 'uppercase',
    margin: theme.spacing(1)
  },
  actionButtom: {
    textTransform: 'uppercase',
    margin: theme.spacing(1),
    width: 152
  },
  blockCenter: {
    padding: theme.spacing(2),
    textAlign: 'center'
  },
  block: {
    padding: theme.spacing(2),
  },
  box: {
    marginBottom: 40,
    height: 120
  },
  tallBox: {
    marginBottom: 40,
    height: 320
  },
  inlining: {
    display: 'inline-block',
    marginRight: 10
  },
  buttonBar: {
    display: 'flex'
  },
  alignRight: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  noBorder: {
    borderBottomStyle: 'hidden'
  },
  loadingState: {
    opacity: 0.05
  },
  loadingMessage: {
    position: 'absolute',
    top: '40%',
    left: '40%'
  },
  gridListWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
})

class StartScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      retrievedID: new URLSearchParams(window.location.search).get('id'),
      enteredID: new URLSearchParams(window.location.search).get('id')
    }
  }

  updateUserID = (text) => {
    if (localStorage.getItem('started') === null) {
      localStorage.setItem('userID', text.trim())
    }
    this.setState({ enteredID: text.trim() })
    // console.log("userID is '" + localStorage.getItem('userID') + "'")
    // console.log("retrieved '" + this.state.retrievedID + "'")
    // console.log("entered '" + this.state.enteredID + "'")
  }

  validID = (id) => {
    if (typeof id !== "string") {
      return false
    }

    // cs login regex - need alphanumeric characters, possibly followed by number
    return /^[a-zA-Z]+[0-9]*$/.test(id)
  }

  begin = () => {
    if (localStorage.getItem('started') === null) {
      // Nothing entered, which means id taken from URL
      if (localStorage.getItem('userID') === null) {
        localStorage.setItem('userID', this.state.enteredID)
      }

      // Check for empty or null IDs
      if (localStorage.getItem('userID') === null || localStorage.getItem('userID') === 'null' || localStorage.getItem('userID') === '') {
        alert("Invalid user ID of '" + localStorage.getItem('userID') + "'. Please re-enter your ID.")
        return
      }

      // Check for IDs with numbers in them
      if (this.validID(localStorage.getItem('userID')) === false) {
        alert("Your ID should only contain letters. For example, Amy Huang's ID would be 'ahuang'.")
        return
      }

      // Record start, and go to next page
      localStorage.setItem('started', true)
      this.props.history.push(this.props.nextPage)
   } else {
     alert("You've already done this experiment!")
   }
  }

  render() {
    const { classes } = this.props

    return (
      <React.Fragment>
      <CssBaseline />
      < div className={classes.root} >
        {/* Center all Grids */}
        < Grid container spacing={1} alignItems="center" direction="column">

          <Grid item className={classes.panel}>
            <Paper className={classes.paper}>
              <img src={first} alt="time expectation" />
            </Paper>
          </Grid>

          <Grid item className={classes.panel}>
            <Paper className={classes.paper}>
              <img src={second} alt="functions" />
            </Paper>
          </Grid>

          <Grid item className={classes.panel}>
            <Paper className={classes.paper}>
              <img src={third} alt="quiz" />
            </Paper>
          </Grid>

          <Grid item className={classes.panel}>
            <Paper className={classes.paper}>
              <img src={fourth} alt="good luck" />
            </Paper>
          </Grid>

          <Grid container item spacing={4} className={classes.panel} direction="column">
            {this.state.retrievedID !== null ?
              <Grid item>
                <Typography variant="h6" >We retrieved the ID <b>'{this.state.retrievedID}'</b> from your URL. Correct this in the text box below if needed.</Typography>
              </Grid>
              :
              null
            }

            <Grid item>
              <Typography variant="h5">Enter your IU username. Example: Amy Huang's ID would be <b>ahuang</b></Typography>
              <TextField defaultValue={this.state.enteredID} label="Enter your ID here" onKeyUp={(e) => { this.updateUserID(e.target.value) }} >
              </TextField>
            </Grid>

            <Grid item>
              <Button color='primary' variant="contained" type="submit" onClick={this.begin}>
                Begin!
              </Button>
            </Grid>
          </Grid>

        </Grid>
      </div>
    </React.Fragment >
    )
  }
}

export default withRouter(withStyles(styles)(StartScreen))
