/**
 * This is the first screen subjects see. It contains images that have text and pictures to explain the
 * Mystery Functions/Predicates activity, and a text box to enter a student ID in. 
 * The text box is auto-filled with the 'id' HTTP request parameter if one is provided, and the subject
 * can change it if it is incorrect.
 * This functionality was used for the IU version of the study, in which the software Sonos was used
 * to distribute study URLs to subjects.
 */
import React, { Component } from 'react'
import withStyles from '@material-ui/styles/withStyles'
import { withRouter } from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import { TextField, Typography } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import first from '../pics/1-time.jpg'
import second from '../pics/2-predicates.jpg'
import third from '../pics/3-instances.jpg'
import fourth from '../pics/4-quiz.jpg'
import fifth from '../pics/5-goodluck.jpg'
// Styling
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
      // Set the ID retrieved from URL and also the ID text box text to it
      retrievedID: new URLSearchParams(window.location.search).get('id'),
      enteredID: new URLSearchParams(window.location.search).get('id')
    }
  }

  // Change the user ID stored to the given text 
  updateUserID = (text) => {
    // Only set the user ID stored if the study hasn't already been done on this browser
    if (localStorage.getItem('started') === null) {
      localStorage.setItem('userID', text.trim())
    }
    // Set state so that the text box displayed text is updated
    this.setState({ enteredID: text.trim() })
  }

  // Check if an ID is valid
  validID = (id) => {
    if (typeof id !== "string") {
      return false
    }

    // Brown cs login regex - need some alphanumeric characters, possibly followed by number
    return /^[a-z]+[0-9]*$/.test(id)
  }

  // Called when the button to move on from this screen is clicked
  begin = () => {
    // First check if this study has already been completed by this user
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
        alert("Your ID should only contain lowercase letters, or lowercase letters and then a number.")
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
          {/* Instruction images */}
          <Grid item className={classes.panel}>
            <Paper className={classes.paper}>
              <img src={first} alt="time expectation" />
            </Paper>
          </Grid>
          <Grid item className={classes.panel}>
            <Paper className={classes.paper}>
              <img src={second} alt="predicates" />
            </Paper>
          </Grid>
          <Grid item className={classes.panel}>
            <Paper className={classes.paper}>
              <img src={third} alt="instances" />
            </Paper>
          </Grid>
          <Grid item className={classes.panel}>
            <Paper className={classes.paper}>
              <img src={fourth} alt="quiz" />
            </Paper>
          </Grid>
          <Grid item className={classes.panel}>
            <Paper className={classes.paper}>
              <img src={fifth} alt="good luck" />
            </Paper>
          </Grid>

          {/* ID entering instructions and submission area */}
          <Grid container item spacing={4} className={classes.panel} direction="column">
            {/* Notify the user about a retrieved ID, if any */}
            {this.state.retrievedID !== null ?
              <Grid item>
                <Typography variant="h6" >We retrieved the ID <b>'{this.state.retrievedID}'</b> from your URL. Correct this in the text box below if needed.</Typography>
              </Grid>
              :
              null
            }

            {/* Text box for entering ID */}
            <Grid item>
              <Typography variant="h5">Enter your cs login.</Typography>
              <TextField defaultValue={this.state.enteredID} label="Enter your cs login here" onKeyUp={(e) => { this.updateUserID(e.target.value) }} >
              </TextField>
            </Grid>

            {/* Button to move on to next page */}
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
