/**
 * Functions for creating the tabs for input evaluation and guess submission on the evaluation screen
 */
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
import ConcreteInstParsing from '../predicates/ConcreteInstParsing'

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";

// Components making up the tabs
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
  panel: {
    height: 280, 
  },
}))

// For storing user input strings
var evalInputStr = "" // Stores the input string for input evaluation
var funcGuess = "" // Stores string from guess submission
var evalInputFirstStr = "" // First input string for 2 input functions
var evalInputSecondStr = "" // Second input string for 2 input functions
var instanceText = "" // Input string for mystery predicate input instance

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

  // Set default instance for mystery predicate
  if (localStorage.getItem('instanceText') === null) {
    instanceText = funcObj.inputPlaceHolderText()
  } else {
    instanceText = localStorage.getItem('instanceText') 
  }

  // Set default input for mystery function
  evalInputStr = funcObj.inputPlaceHolderText()

  /**
   * Function for evaluating inputs of a 2 input mystery function
   */
  function evalDoubleInput() {
    // Check validity of both input strings
    if (!funcObj.validInput(evalInputFirstStr)) {
      alert("First input '" + evalInputFirstStr + "' is not valid for this function")
      return
    }
    if (!funcObj.validInput(evalInputSecondStr)) {
      alert("Second input '" + evalInputSecondStr + "' is not valid for this function")
      return
    }
    // Parse the inputs to objects
    var firstParsed = funcObj.parseInput(evalInputFirstStr)
    var secondParsed = funcObj.parseInput(evalInputSecondStr)
    var evaluated = funcObj.function(firstParsed, secondParsed)
    // Get formatted strings for use in the database
    var firstDBstr = funcObj.inputDBStr(firstParsed)
    var secondDBstr = funcObj.inputDBStr(secondParsed)

    // Check to see if input being evaluated is allowed to be evaluated (if it was seen during a quiz)
    var gens = funcObj.inputGenerators()
    var forbiddenInputs = []
    gens.forEach((g) => {forbiddenInputs.push(g())})
    var currentlyForbidden = forbiddenInputs.slice(0,  getNextQ())
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
          action.key = Util.newServerKey()
          Util.sendToServer(action)
        }
        forbiddenFound = true
      }
     })
     if (forbiddenFound === true) {
       return
     }

    // Send an input evaluation log action to the server, and also build an
    // action object for use in displaying the evaluation in the guessing screen console
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

    serverGuess.in = firstDBstr + " " + secondDBstr

    var firstDisplayStr = funcObj.inputDisplayStr(firstParsed)
    var secondDisplayStr = funcObj.inputDisplayStr(secondParsed)
    displayGuess.in = firstDisplayStr + ", " + secondDisplayStr

    serverGuess.out = funcObj.outputDBStr(evaluated)
    displayGuess.out = funcObj.outputDisplayStr(evaluated)

    serverGuess.finalGuess = funcGuess.trim()
    displayGuess.finalGuess = funcGuess.trim()

    // Only if this function wasn't already done (description not already seen)
    if (localStorage.getItem(funcObj.description()) === null) {
      // console.log("sent to server", serverGuess)
      serverGuess.key = Util.newServerKey()
      Util.sendToServer(serverGuess)
    }

    // Update the display console
    guesses.push(displayGuess)
    updateFunc()
  }

  /**
   * Function for evaluating inputs of a 1 input mystery function
   */
  function evalInput() {
    if (!funcObj.validInput(evalInputStr)) {
      alert("'" + evalInputStr + "' is not a valid input to this function")
      return
    }

    var asVal = funcObj.parseInput(evalInputStr)
    var evaluated = funcObj.function(asVal)

    var gens = funcObj.inputGenerators()
    var forbiddenInputs = []
    gens.forEach((g) => {forbiddenInputs.push(g())})
    var currentlyForbidden = forbiddenInputs.slice(0, getNextQ())
    // console.log("next Q is", getNextQ())
    var forbiddenFound = false
    currentlyForbidden.forEach((input) => { 
      // console.log("checking forbidden input", input, "against", asVal)
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

    serverGuess.finalGuess = funcGuess.trim()
    displayGuess.finalGuess = funcGuess.trim()
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

  // Changes guessing screen from evaluation mode to quiz mode
  function goToQuiz() {
    toQuiz(funcGuess)
    funcGuess = ""
  }

  // Updates the input text for mystery predicate an input instance
  function updateInstText(newValue) {
    instanceText = newValue
  }

  // Function for evaluting a concrete instance for a mystery predicate
  function evaluateInst() {
    if (!funcObj.validInst(instanceText)) {
      return
    }
    // Preserve submitted instance text; don't change back to default
    localStorage.setItem("instanceText", instanceText)

    var cleanInst = instanceText.trim().replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
    var result = funcObj.function(instanceText)

    var serverGuess = {}
    serverGuess.id = localStorage.getItem('userID')
    serverGuess.fcn = funcObj.description()
    serverGuess.type = "eval_input"
    serverGuess.in = cleanInst
    serverGuess.out = result.toString()
    serverGuess.finalGuess = funcGuess.trim()
    serverGuess.time = Util.getCurrentTime()
    if (localStorage.getItem(funcObj.description()) === null) {
      serverGuess.key = Util.newServerKey()
      Util.sendToServer(serverGuess)
    }

    var displayGuess = {}
    displayGuess.type = "eval_pred_input"
    displayGuess.key = Util.newDisplayKey()
    displayGuess.in = cleanInst
    displayGuess.out = result.toString()
    guesses.push(displayGuess)
    updateFunc()
  }

  return (
    <div className={classes.root}>
      {/* Tab names */}
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Evaluate Input" {...a11yProps(0)} />
          <Tab label="Make Guess" {...a11yProps(2)} />
        </Tabs>
      </AppBar>

      {/* Input evaluation tab body */}
      <TabPanel className={classes.panel} value={value} index={0}>
        <Grid container spacing={2}>
          {/* Text editor for concrete instances */}
          <Grid item>
            <AceEditor
              height={180}
              mode="javascript"
              theme="tomorrow"
              onChange={updateInstText}
              fontSize={18}
              showPrintMargin={false}
              showGutter={false}
              highlightActiveLine={true}
              value={instanceText}
              setOptions={{
              enableBasicAutocompletion: false,
              enableLiveAutocompletion: false,
              enableSnippets: false,
              showLineNumbers: false,
              tabSize: 2,
              }}/>
          </Grid>

          {/* Submit button for concrete instance */}
          <Grid item>
            <div>
              <Button color='primary' variant="contained" className={classes.actionButton} onClick={evaluateInst}>
                SUBMIT
                </Button>
            </div>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Function guess submission tab body */}
      <TabPanel value={value} index={1}>
        <Grid container spacing={4} direction="column">
          {/* Text box for guess */}
          <Grid item>
            <TextField multiline={true} rows={4} fullWidth={true} variant="outlined" placeholder="What do you think the predicate is?" onChange={(e) => { funcGuess = e.target.value }}>
            </TextField>
          </Grid>

          {/* Button to go to quiz */}
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