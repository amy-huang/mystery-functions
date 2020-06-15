import React, { Component } from 'react'
import withStyles from '@material-ui/styles/withStyles'
import { withRouter } from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import TabsWrapper from '../components/TabsWrapper'
import Paper from '@material-ui/core/Paper'
import { GridList, GridListTile } from '@material-ui/core'
import EvalGuessLine from '../components/EvalGuessLine'
import EvalInputLine from '../components/EvalInputLine'
import DummyLine from '../components/DummyLine'
import Quiz from '../components/Quiz';

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

// Creates blank tiles to go in the console gridlist, so that new submissions
// appear at the bottom and not the top 
function dummyTiles() {
  var guesses = []
  var numTiles = gridListHeight / 80
  for (var i = 1; i <= numTiles; i++) {
    guesses.push({
      key: i * -1,
      type: "dummy_line"
    })
  }
  return guesses
}

class GuessingScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      quiz: false,
      guessText: ""
    }
    this.setNextQ(0)
  }

  guesses = []
  scrolling = false
  scrollId

  // To keep track of inputs allowed to be evaluated
  nextQ = 0

  // If not at bottom of screen yet, scroll stop repeated call if reached
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

  // Update the guesses list shown in the console, and scroll down to new guess
  guessMade = () => {
    this.setState({ guesses: this.guesses, scrollId: this.scrollId, scrolling: this.scrolling })
    if (!this.scrolling) {
      this.scrollId = setInterval(this.scrollDown, 10)
      this.scrolling = true
    }
  }

  getLine(tile, gridlist) {
    if (tile.type === "dummy_line") {
      return (
        <DummyLine></DummyLine>
      )
    }
    if (tile.type === "eval_input") {
      return (
        <EvalInputLine in={tile.in} out={tile.out}></EvalInputLine>
      )
    }
    if (tile.type === "eval_pair") {
      return (
        <Grid container spacing={1}>
          <Grid item>
            <EvalGuessLine in={tile.in} out={tile.out} result={tile.result}></EvalGuessLine>
          </Grid>
          <Grid item><i>({tile.reason})</i></Grid>
        </Grid>
      )
    }
    if (tile.type === "final_answer") {
      return (
        <Grid container spacing={1}>
          <Grid item><i>Guess: {tile.reason}</i></Grid>
        </Grid>
      )
    }
  }

  // When quiz taken and then move on
  resetGuesses = () => {
    this.guesses = dummyTiles()
  }

  quizOff = () => {
    this.setState({ 
      quiz: false, 
      guessText: ""
    })
  }

  quizOn = (guessText) => {
    if (guessText === "") {
      var text = "Please submit a non-blank guess."
      alert(text)
      return
    }
    this.setNextQ(1)
    this.setState({
      quiz: true,
      guessText: guessText
    })
  }

  // functions for getting and setting next Q to answer
  getNextQ = () => {
    return this.nextQ
  }

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

    return (
      <React.Fragment>
        <CssBaseline />
        < div className={classes.root} >
          {/* Center all Grids */}
          {this.state.quiz ?
            < Grid container justify="center" spacing={4} direction="row" alignContent="center">
              {/* Quiz zone */}
              < Grid container item className={classes.panel}>
                <Quiz nextPage={this.props.nextPage} guessText={this.state.guessText} funcObj={this.props.funcObj} cancelFcn={this.quizOff} resetFcn={this.resetGuesses} setNextQ={this.setNextQ}></Quiz>
              </ Grid>

              {/* Current guess and function output type */}
              < Grid container item className={classes.smallPanel} direction="column" spacing={4}>
                {/* Output type description */}
                < Grid item>
                  <Typography color="secondary" variant="h6">Your current guess: </Typography>{this.state.guessText}
                </Grid>
                < Grid item>
                  <Typography color="secondary" variant="h6">Output type: </Typography>{this.props.funcObj.outputDescription()}
                </Grid>
              </ Grid>
            </Grid>
            :
            < Grid container justify="center" spacing={4}>
              < Grid container item spacing={4} className={classes.panel} alignContent="flex-start" >
                {/* Function signature */}
                < Grid item xs={12} >
                  Mystery function <b>{this.props.current + 1}</b> out of <b>{this.props.total}</b> takes an input of type
                    <ol>
                    {Array(funcObj.numArgs).fill(<li>
                      <Typography variant="h6">{this.props.funcObj.inputDescription()}</Typography>
                    </li>)}
                  </ol>
                  and an output of type
                  <ol>
                    <li>
                      <Typography variant="h6">{this.props.funcObj.outputDescription()}</Typography>
                    </li>
                  </ol>
                </Grid>

                {/* Tabs */}
                <Grid item xs={12} >
                  <TabsWrapper guesses={this.guesses} funcObj={this.props.funcObj} updateFunc={this.guessMade} toQuiz={this.quizOn} getNextQ={this.getNextQ}></TabsWrapper>
                </Grid>
              </Grid>

              {/* Console */}
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