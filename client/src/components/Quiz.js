/**
 * Component for the quiz
 */
import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'
import { TextField } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import withStyles from '@material-ui/styles/withStyles'
import { withRouter } from 'react-router-dom'
import Util from '../Util'

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.grey['100'],
    overflow: 'hidden',
    backgroundSize: 'cover',
    backgroundPosition: '0 400px',
    paddingBottom: 200,
    alignContent: 'center',
    alignItems: 'center',
    width: 1000
  },
  grid: {
    width: 1200,
    marginTop: 40,
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 20px)'
    },
  },
  panel: {
    width: 1000,
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
  gridListWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  fontResize: {
    fontSize: 20
  }
})

class Quiz extends Component {
  constructor(props) {
    super(props)
    this.state = {
      question: 0,  // Which question to be displayed 
      answered: false, // Whether question answered or not
      text: this.props.funcObj.outputPlaceHolderText(), // Set default output text if needed
      done: false,  // Whether user finished all questions for this func
      showAnswer: false, // Whether to show answer for function or not
      notMovingOn: true, // To stop showing answer in case next page loads before we navigate to guessing screen
      gotItRight: false, // Whether question was answered correctly
    }
  }

  funcObj = this.props.funcObj // The function object
  inputGens = this.funcObj.inputGenerators() // Array of functions that simply return the inputs for the quiz questions
  currInput = "" // Text of current input for quiz question
  answerText = "" // Text indicating whether submitted answer is correct or not
  setNextQ = this.props.setNextQ // Function for telling the guessing screen which question inputs can't be evaluated

  // Get the input for the current question
  questionInput = () => {
    var newInput = this.inputGens[this.state.question]()
    this.currInput = newInput
    return newInput
  }

  // Submit answer to quiz question 
  submitAnswer = (submitted) => {
    if (this.state.answered === true) {
      return
    }
    // Check for empty or ill-formed output
    if (submitted === "") {
      alert("Please submit an answer!")
      return
    }
    if (!this.funcObj.validOutput(submitted)) {
      alert("'" + submitted + "' is not a valid output of this function")
      return
    }

    // Calculate actual output and see if submitted one matches
    var actual
    if (this.funcObj.numArgs === 2) {
      actual = this.funcObj.function(this.currInput[0], this.currInput[1])
    } else {
      actual = this.funcObj.function(this.currInput)
    }
    const submittedAsVal = this.funcObj.parseOutput(submitted)
    const gotCorrect = this.funcObj.equivalentOutputs(submittedAsVal, actual)

    // Construct action object and send to server 
    if (localStorage.getItem(this.funcObj.description()) === null) {
      var action = {}
      action.id = localStorage.getItem('userID')
      action.fcn = this.funcObj.description()
      action.type = "quiz_answer"
      action.in = this.funcObj.inputDBStr(this.currInput)
      action.out = this.funcObj.outputDBStr(submittedAsVal)
      action.q = this.state.question.toString()
      action.actual = this.funcObj.outputDBStr(actual)
      action.result = gotCorrect.toString()
      action.time = Util.getCurrentTime()
      action.key = Util.newServerKey()

      Util.sendToServer(action)
    }

    // Show text onscreen to say if answer is correct
    var answerText = ""
    if (gotCorrect) {
      answerText = "Nice, that's correct!"
    } else {
      answerText = "Incorrect"
    }
    this.setState({ 'answerText': answerText })
    this.setState({ 'answered': true })

    // Determine if all quiz questions are done
    if (this.state.question + 1 >= this.inputGens.length) {
      this.setState({ done: true })
    }

    // Set state of getting question correct or not, to determine what
    // options are shown
    if (gotCorrect) {
      this.setState({ gotItRight: true })
    } else {
      this.setState({ gotItRight: false })
    }
  }

  // Reset state variables upon moving on to next question
  goToNextQuestion = () => {
    if (this.state.question + 1 < this.inputGens.length) {
      this.setState({
        question: this.state.question + 1,
        answered: false,
        text: "",
        answerText: ""
      })
    }
    this.setNextQ(this.state.question + 2)
  }

  // Construct and submit final guess about function to server
  submitFinalGuess = () => {
    var guess = Object()
    guess.id = localStorage.getItem('userID')
    guess.fcn = this.funcObj.description()
    guess.type = "final_answer"
    guess.finalGuess = this.props.guessText
    guess.time = Util.getCurrentTime()

    if (localStorage.getItem(this.funcObj.description()) === null) {
      guess.key = Util.newServerKey()
      localStorage.setItem(this.funcObj.description(), 'Done')
      Util.sendToServer(guess)
    }
    this.setState({
      showAnswer: true
    })
  }

  // Go to the next function page (evaluation screen)
  toNextFunc = (nextPage) => {
    this.props.resetFcn()
    this.props.cancelFcn()
    this.props.history.push(nextPage)
  }

  // Return a button component for going to next function
  toNextFuncButton = (nextPage) => {
    if (nextPage === undefined) {
      return (<div></div>)
    }
    return (
      <Grid item>
        <Button color="primary" variant="contained" className={this.props.actionButton} onClick={() => { this.toNextFunc(nextPage) }}>
          Next
        </Button>
      </Grid>
    )
  }

  // Return component that lists the submitted function guess and our description
  answerComponent = () => {
    return (
      <div>
        <Grid item>
          <Typography variant="h5">Your answer</Typography>
          <Typography variant="h6">{this.props.guessText}</Typography>
          <Typography variant="h1">

            - - - - - - - -

          </Typography>
          <Typography variant="h5">Our answer</Typography>
          <Typography variant="h6">{this.funcObj.answerText()}</Typography>
        </Grid>
        <Grid item>
          {this.toNextFuncButton(this.props.nextPage)}
        </Grid>
      </div>
    )
  }

  // Return button for submitting final guess and seeing description of function after answering
  // all quiz questions correctly
  submitGuessButton = () => {
    return (
      <Grid item>
        <Button color='primary' variant="contained" type="submit" onClick={this.submitFinalGuess}>
          <Typography variant="h4">Submit guess and see answer</Typography>
        </Button>
      </Grid>
    )
  }

  // Return button for moving on to the next quiz question after the current one is answered
  // successfully
  nextQuestionButton = () => {
    return (
      < Grid item >
        <Button variant="contained" type="submit" onClick={this.goToNextQuestion}>
          Next Question
        </Button>
      </Grid >
    )
  }

  // Return button for giving up after answering quiz question incorrectly, which would go
  // directly to description of function
  giveUpButton = () => {
    return (
      <Grid item>
        <Button variant="contained" type="submit" onClick={this.submitFinalGuess}>
          Give up and show answer
        </Button>
      </Grid>
    )
  }

  // Component for displaying the quiz question and text box for submitting answer
  questionDisplay = (my_classes) => {
    this.setNextQ(this.state.question + 1)

    return (
      <div>
        <Grid item>
          {/* Display text of the quiz question */}
          <Typography> Question {this.state.question + 1} out of {this.inputGens.length}:  </Typography>
          {this.funcObj.numArgs === 2
            ?
            <Typography variant="h3">What would this function output for {this.funcObj.inputDisplayStr(this.questionInput()[0])} and {this.funcObj.inputDisplayStr(this.questionInput()[1])}? </Typography>
            :
            <div>
              <Typography variant="h6" style={{whiteSpace: 'pre-wrap'}}>What would the predicate output given this input? </Typography>
              <br></br>
              <Typography variant="h6" style={{whiteSpace: 'pre-wrap'}} variant="h4">{this.funcObj.inputDisplayStr(this.questionInput())} </Typography>
            </div>
          }

          {/* Text box for submitting answer to quiz question */}
          <TextField onChange={(e) => { this.setState({ text: e.target.value }) }} value={this.state.text} onKeyUp={(e) => { if (e.keyCode === 13) { this.submitAnswer(e.target.value) } }} helperText="ENTER to submit" disabled={this.state.answered}>
          </TextField>
        </Grid>

        {/* Text for indicating whether quiz question was answered correctly */}
        <Grid padding={8} margin={8} item>
          <Typography variant="h5">{this.state.answerText}</Typography>
        </Grid>
      </div>
    )
  }

  // Return button for returning to evaluation screen after answering quiz question incorrectly
  retractGuessButton = () => {
    return (
      <div>
        <Grid item>
          <Button variant="contained" type="submit" onClick={this.props.cancelFcn}>
            Retract guess and go back to evaluator
          </Button>
        </Grid>
      </div>
    )
  }

  render() {
    var my_classes = this.props;
    return (
      <div>
        < Grid container item spacing={6} className={my_classes.panel}>
          {/* Button to go back to evaluation screen */}
          < Grid item>
            {
              this.state.showAnswer ?
                null
                :
                <div>{
                  this.state.answered ?
                    <div>{
                      this.state.gotItRight ?
                        null
                        :
                        <div>{this.retractGuessButton()}</div>
                    }</div>
                    : null
                }
                </div>
            }
          </ Grid>

          {/* Show either the function answer (description of it) or the current quiz question */}
          <Grid item>
            {
              this.state.showAnswer ?
                <div>{this.answerComponent()}</div>
                :
                <div>
                  {
                    this.state.notMovingOn ?
                      <div>{this.questionDisplay(my_classes)}</div>
                      :
                      null}
                </div>
            }
          </Grid>

          {/* Button to next question */}
          < Grid item>
            {this.state.done ?
              null
              :
              <div>
                {
                  this.state.showAnswer ?
                    null
                    :
                    <div>{
                      this.state.answered ?
                        <div>{
                          this.state.gotItRight ?
                            <div>{this.nextQuestionButton()}</div>
                            :
                            null
                        }</div>
                        : null
                    }
                    </div>
                }</div>
            }
            {/* Button to give up on guessing */}
            {
              this.state.showAnswer ?
                null
                :
                <div>{
                  this.state.answered ?
                    <div>{
                      this.state.gotItRight ?
                        null
                        :
                        <div>{this.giveUpButton()}</div>
                    }</div>
                    : null
                }
                </div>
            }
          </ Grid>

          {/* Button to go to function answer after answering all quiz questions correctly */}
          < Grid item>
            {
              this.state.showAnswer ?
                null
                :
                <div>{
                  this.state.done ?
                    <div>{
                      this.state.gotItRight ?
                        <div>{this.submitGuessButton()}</div>
                        :
                        null
                    }</div> :
                    null
                }</div>
            }
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withRouter(withStyles(styles)(Quiz));