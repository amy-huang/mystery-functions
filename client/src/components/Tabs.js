import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import { TextField } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Util from '../Util'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}))

// For storing user input
var evalInputStr = ""
var evalInputReason = ""
var finalGuess = ""

// To make 2 arguments possible, let's just build a different
// text box component with its associated fcns.
var evalInputFirstStr = ""
var evalInputSecondStr = ""

// To prevent evaluation of quiz inputs
var forbiddenInputs = []

export default function SimpleTabs(props) {
  const classes = useStyles()

  // For switching tabs
  const [value, setValue] = React.useState(0)
  function handleChange(event, newValue) {
    setValue(newValue)
  }

  // Passed down from GuessingScreen for adding to guesses
  // and evaluating expressions with mystery function
  var guesses = props.children.guesses
  var updateFunc = props.children.updateFunc
  var funcObj = props.children.funcObj
  var toQuiz = props.children.toQuiz
  var getNextQ = props.children.getNextQ

  // Set default input
  evalInputStr = funcObj.inputPlaceHolderText()

  // Get inputs used in quiz
  var gens = funcObj.inputGenerators()
  gens.forEach((g) => {forbiddenInputs.push(g())})

  function evalDoubleInput() {
    if (!funcObj.validInput(evalInputFirstStr)) {
      alert("First input '" + evalInputFirstStr + "' is not valid for this function")
      return
    }
    if (!funcObj.validInput(evalInputSecondStr)) {
      alert("Second input '" + evalInputSecondStr + "' is not valid for this function")
      return
    }

    var firstParsed = funcObj.parseInput(evalInputFirstStr)
    var secondParsed = funcObj.parseInput(evalInputSecondStr)
    var evaluated = funcObj.function(firstParsed, secondParsed)

    var currentlyForbidden = forbiddenInputs.slice(0,  getNextQ())
    // console.log("next Q is", getNextQ())
    var forbiddenFound = false
    currentlyForbidden.forEach((inputs) => { 
      if (funcObj.equivalentInputs(inputs[0], firstParsed) === true && funcObj.equivalentInputs(inputs[1], secondParsed) === true) {
        alert("Cannot evaluate inputs seen during a quiz attempt!")
        var action = {}
        action.id = localStorage.getItem('userID')
        action.fcn = funcObj.description()
        action.type = "cheat_attempt"
        action.time = Util.getCurrentTime()
        action.in = firstDBstr + " " + secondDBstr
        action.out = funcObj.outputDBStr(evaluated)
        if (localStorage.getItem(funcObj.description()) === null) {
          // console.log("sent to server", serverGuess)
          action.key = Util.newServerKey()
          Util.sendToServer(action)
        }
        forbiddenFound = true
      }
     })
     if (forbiddenFound === true) {
       return
     }

    var serverGuess = {}
    var displayGuess = {}
    serverGuess.id = localStorage.getItem('userID')
    displayGuess.id = localStorage.getItem('userID')
    serverGuess.fcn = funcObj.description()
    displayGuess.fcn = funcObj.description()
    serverGuess.type = "eval_input"
    displayGuess.type = "eval_input"
    displayGuess.key = Util.newDisplayKey()
    serverGuess.time = Util.getCurrentTime()
    displayGuess.time = Util.getCurrentTime()

    var firstDBstr = funcObj.inputDBStr(firstParsed)
    var secondDBstr = funcObj.inputDBStr(secondParsed)
    serverGuess.in = firstDBstr + " " + secondDBstr

    var firstDisplayStr = funcObj.inputDisplayStr(firstParsed)
    var secondDisplayStr = funcObj.inputDisplayStr(secondParsed)
    displayGuess.in = firstDisplayStr + ", " + secondDisplayStr

    serverGuess.out = funcObj.outputDBStr(evaluated)
    displayGuess.out = funcObj.outputDisplayStr(evaluated)

    serverGuess.finalGuess = evalInputReason.trim()
    displayGuess.finalGuess = evalInputReason.trim()

    if (localStorage.getItem(funcObj.description()) === null) {
      // console.log("sent to server", serverGuess)
      serverGuess.key = Util.newServerKey()
      Util.sendToServer(serverGuess)
    }

    // Update in, out values for display
    guesses.push(displayGuess)
    updateFunc()
  }

  function evalInput() {
    if (!funcObj.validInput(evalInputStr)) {
      alert("'" + evalInputStr + "' is not a valid input to this function")
      return
    }

    var asVal = funcObj.parseInput(evalInputStr)
    var evaluated = funcObj.function(asVal)

    var currentlyForbidden = forbiddenInputs.slice(0,  getNextQ())
    // console.log("next Q is", getNextQ())
    var forbiddenFound = false
    currentlyForbidden.forEach((input) => { 
      if (funcObj.equivalentInputs(input, asVal) === true) {
        alert("Cannot evaluate inputs seen during a quiz attempt!")
        var action = {}
        action.id = localStorage.getItem('userID')
        action.fcn = funcObj.description()
        action.type = "cheat_attempt"
        action.time = Util.getCurrentTime()
        action.in = funcObj.inputDBStr(asVal)
        action.out = funcObj.outputDBStr(evaluated)
        if (localStorage.getItem(funcObj.description()) === null) {
          // console.log("sent to server", serverGuess)
          action.key = Util.newServerKey()
          Util.sendToServer(action)
        }
        forbiddenFound = true
      }
     })
     if (forbiddenFound === true) {
       return
     }

    // nextQ is 0 upon starting fcn
    // is question + 1 upon seeing each question

    var serverGuess = {}
    var displayGuess = {}
    serverGuess.id = localStorage.getItem('userID')
    displayGuess.id = localStorage.getItem('userID')
    serverGuess.fcn = funcObj.description()
    displayGuess.fcn = funcObj.description()
    serverGuess.type = "eval_input"
    displayGuess.type = "eval_input"
    // serverGuess.key = actionKey
    displayGuess.key = Util.newDisplayKey()

    serverGuess.in = funcObj.inputDBStr(asVal)
    displayGuess.in = funcObj.inputDisplayStr(asVal)

    serverGuess.out = funcObj.outputDBStr(evaluated)
    displayGuess.out = funcObj.outputDisplayStr(evaluated)

    serverGuess.finalGuess = evalInputReason.trim()
    displayGuess.finalGuess = evalInputReason.trim()
    serverGuess.time = Util.getCurrentTime()
    displayGuess.time = Util.getCurrentTime()
    if (localStorage.getItem(funcObj.description()) === null) {
      // console.log("sent to server", serverGuess)
      serverGuess.key = Util.newServerKey()
      Util.sendToServer(serverGuess)
    }

    // Update in, out values for display
    guesses.push(displayGuess)
    updateFunc()
  }

  function goToQuiz() {
    toQuiz(finalGuess)
    finalGuess = ""
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Evaluate Input" {...a11yProps(0)} />
          {/* <Tab label="Input/Output pair" {...a11yProps(1)} /> */}
          <Tab label="Make Guess" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <Grid container spacing={4}>
          <Grid container item spacing={4} direction="column">
            {funcObj.numArgs === 2 ?
              <Grid container item spacing={4}>
                <Grid item>
                  <TextField label="First input" onChange={(e) => { evalInputFirstStr = e.target.value }} onKeyUp={(e) => { if (e.keyCode === 13) { evalDoubleInput() } }} helperText="ENTER to submit" defaultValue={funcObj.inputPlaceHolderText()}>
                  </TextField>
                </Grid>
                <Grid item>
                  <TextField label="Second input" onChange={(e) => { evalInputSecondStr = e.target.value }} onKeyUp={(e) => { if (e.keyCode === 13) { evalDoubleInput() } }} helperText="ENTER to submit" defaultValue={funcObj.inputPlaceHolderText()}>
                  </TextField>
                </Grid>
              </Grid>

              :
              <Grid item>
                <TextField label="Input" onChange={(e) => { evalInputStr = e.target.value }} onKeyUp={(e) => { if (e.keyCode === 13) { evalInput() } }} helperText="ENTER to submit" defaultValue={funcObj.inputPlaceHolderText()}>
                </TextField>
              </Grid>
            }
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Grid container spacing={4} direction="column">
          <Grid item>
            <TextField multiline={true} rows={4} fullWidth={true} variant="outlined" placeholder="What do you think this function does?" onChange={(e) => { finalGuess = e.target.value }}>
            </TextField>
          </Grid>
          <Grid item>
            <div>
              <Button color='primary' variant="contained" className={classes.actionButton} onClick={goToQuiz}>
                To Quiz
                </Button>
            </div>
          </Grid>
        </Grid>
      </TabPanel>
    </div >
  )
}