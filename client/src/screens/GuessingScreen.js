/**
 * The main guessing screen for each mystery function. When the user goes to the quiz,
 * this same page is used, but the quiz components are displayed onscreen instead.
 * All of the display console logic is here, but the logic for the tabs is in within Tabs
 * contained by TabsWrapper, and the quiz logic in Quiz.
 */
import React, { Component } from 'react'
import withStyles from '@material-ui/styles/withStyles'
import { withRouter } from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import TabsWrapper from '../components/TabsWrapper'
import Paper from '@material-ui/core/Paper'
import { GridList, GridListTile } from '@material-ui/core'
import EvalInputLine from '../components/EvalInputLine'
import Quiz from '../components/Quiz';
import EvalPredInputLine from '../components/EvalPredInputLine'

const gridListHeight = 500

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.grey['100'],
    overflow: 'hidden',
    backgroundSize: 'cover',
    backgroundPosition: '0 400px',
    paddingBottom: 200,
    alignContent: 'center',
    alignItems: 'center'
  },
  grid: {
    width: 1200,
    marginTop: 40,
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 20px)'
    },
  },
  panel: {
    width: 600,
    marginTop: 40,
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 20px)'
    },
  },
  smallPanel: {
    width: 300,
    marginTop: 40,
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 20px)'
    },
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
  gridList: {
    width: 400,
    height: gridListHeight,
    alignContent: 'flex-start',
  },
  gridListWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
})

class GuessingScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // At beginning, not in quiz state
      quiz: false,
      // No submitted function guess yet
      guessText: ""
    }
    // Lowest quiz question number not seen yet is 0
    this.setNextQ(0)
  }

  // For display of inputs evaluated - 'guesses' is a misnomer;
  // the console onscreen only displays the inputs evaluated and their outputs
  guesses = []
  // For getting the console to scroll down if needed to the newest input evaluated
  scrolling = false
  scrollId

  // To keep track of inputs allowed to be evaluated - if inputs are seen during
  // the quiz, then they can't be evaluated after returning to evaluation
  nextQ = 0

  // If not at bottom of console yet, scroll down until it is
  scrollDown = () => {
    if (this.gridlist === null) {
      return
    }
    if (this.gridlist.scrollTop < this.gridlist.scrollHeight - gridListHeight) {
      this.gridlist.scrollTop += 5
    } else {
      clearInterval(this.scrollId)
      this.scrolling = false
    }
  }

  // Update the input output pairs shown in the console, and scroll down to new guess
  guessMade = () => {
    this.setState({ guesses: this.guesses, scrollId: this.scrollId, scrolling: this.scrolling })
    if (!this.scrolling) {
      this.scrollId = setInterval(this.scrollDown, 10)
      this.scrolling = true
    }
  }

  // Create a new display object for the console. eval_input is for function inputs evaluated;
  // eval_pred_input is for predicate inputs. They have different text formatting needs
  getLine(tile, gridlist) {
    if (tile.type === "eval_input") {
      return (
        <EvalInputLine in={tile.in} out={tile.out}></EvalInputLine>
      )
    }
    if (tile.type === "eval_pred_input") {
      return (
        <EvalPredInputLine in={tile.in} out={tile.out}></EvalPredInputLine>
      )
    }
  }

  // If moving on to next function, reset console and quiz questions seen
  resetGuesses = () => {
    this.guesses = []
    this.setNextQ(-1)
  }

  // Return to evaluation screen
  quizOff = () => {
    this.setState({ 
      quiz: false, 
      guessText: ""
    })
  }

  // Go to quiz screen
  quizOn = (guessText) => {
    if (guessText === "") {
      var text = "Please submit a non-blank guess."
      alert(text)
      return
    }
    this.setNextQ(1)
    this.setState({
      quiz: true,
      guessText: guessText.trim()
    })
  }

  // Get the lowest question number that hasn't been seen yet
  getNextQ = () => {
    return this.nextQ
  }
  // Set lowest question number that hasn't been seen yet
  // If given -1, resets to 0
  setNextQ = (next) => {
    // Reset
    if (next === -1) {
      this.nextQ = 0
    }

    // Set max q seen so far
    if (next > this.nextQ) {
      this.nextQ = next
    }
  }

  render() {
    const { classes } = this.props
    var funcObj = this.props.funcObj
    window.scrollTo(0,0)

    return (
      <React.Fragment>
        <CssBaseline />
        < div className={classes.root} >
          {/* This screen can either be in quiz mode or evaluation mode */}

          {this.state.quiz ?
            // Quiz mode
            < Grid container justify="center" spacing={2} direction="row" alignItems="center">
              {/* Display the output type of the function/predicate for reference, and text of guess submitted upon going to quiz */}
              < Grid container item className={classes.smallPanel} direction="column" spacing={4} alignContent="center" >
                {/* Output type description */}
                < Grid item>
                  <Typography variant="h6">Output type: </Typography>{funcObj.outputDescription()}
                </Grid>

                {/* Current guess description */}
                < Grid item>
                  <Typography color="secondary" variant="h6">Your current guess: </Typography>
                  <Typography style={{whiteSpace: 'pre'}} color="secondary"><b>{this.state.guessText}</b></Typography>
                </Grid>
              </ Grid>

              {/* Quiz component here, which contains the question text and text box for submitting an output */}
              < Grid container item className={classes.panel}>
                <Quiz nextPage={this.props.nextPage} guessText={this.state.guessText} funcObj={funcObj} cancelFcn={this.quizOff} resetFcn={this.resetGuesses} setNextQ={this.setNextQ}></Quiz>
              </ Grid>
            </Grid>
            :
            // Evaluation mode
            < Grid container justify="center" spacing={4}>
              < Grid container item spacing={4} className={classes.panel} alignContent="flex-start" >
                {/* Function signature: input and output types */}
                < Grid item>
                  Mystery predicate <b>{this.props.current + 1}</b> out of <b>{this.props.total}</b> takes in a 
                    <ul>
                    {Array(funcObj.numArgs).fill(<li>
                     {funcObj.inputDescription()}
                    </li>)}
                    </ul>
                  and outputs a 
                  <ul>
                    <li>
                      {funcObj.outputDescription()}
                    </li>
                  </ul>
                  <Typography color="secondary">The only operators supported are union (+) and cartesian product (-`{'>'}`) on single atoms. Also, you can specify an empty set like so: Node = none
                  
                  </Typography>
                </Grid>

                {/* Tabs for input evaluation and guess submission */}
                <Grid item xs={12} >
                  <TabsWrapper guesses={this.guesses} funcObj={funcObj} funcObj={funcObj} updateFunc={this.guessMade} toQuiz={this.quizOn} getNextQ={this.getNextQ}></TabsWrapper>
                </Grid>
              </Grid>

              {/* Console for displaying input evaluations */}
              <Grid container item spacing={4} className={classes.panel}>
                <Paper className={classes.paper}>
                  <div className={classes.gridListWrapper}>
                    <Grid container spacing={4} alignContent="center">
                      <Grid item>
                        <GridList className={classes.gridList} cellHeight="auto" spacing={4} cols={1} ref={(elem) => { this.gridlist = elem }}>
                          {this.guesses.map(tile => (
                            <GridListTile key={tile.key} cols={1} rows={1}>
                              {this.getLine(tile)}
                              <br></br>
                            </GridListTile>
                          ))}
                        </GridList>
                      </Grid>
                    </Grid>
                  </div>
                </Paper>
              </Grid>
            </Grid>
          }
        </div>
      </React.Fragment >
    )
  }
}

export default withRouter(withStyles(styles)(GuessingScreen))