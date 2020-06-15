/**
 * This file sets up the URLs of each page in relation to the base URL, and passes in
 * the necessary props to each page. Each mystery function guessing screen needs to know
 * how many total functions there are, which one they are in the sequence, their
 * mystery function object, and the next guessing screen.
 */
import React from 'react'
import { Route, HashRouter, Switch } from 'react-router-dom'
import GuessingScreen from './screens/GuessingScreen'
import StartScreen from './screens/StartScreen'
import SumBetween from './functions/SumBetween'
import ThankYouScreen from './screens/ThankYouScreen'
import Average from './functions/Average'
import Median from './functions/Median'
import SecondIntoFirstDivisible from './functions/SecondIntoFirstDivisible'
import FirstIntoSecondDivisible from './functions/FirstIntoSecondDivisible'
import SumParityBool from './functions/SumParityBool';
import SumParityInt from './functions/SumParityInt';
import Induced from './functions/Induced';
import IsDag from './predicates/IsDag'
import ThreeCycle from './predicates/ThreeCycle'
import IsBipartite from './predicates/IsBipartite'

// Decides randomly which object to return; used for deciding which of a 
// matched pair of functions should be given to a user
function coinFlip(first, second) {
  const flip = Math.random()
  if (flip < .5) {
    return first
  } else {
    return second
  }
}

// Shuffles an array. Taken from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
// Used for randomizing the order of functions presented
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

// Initialize the list of functions. No matched pairs for mystery predicates,
// only mystery functions
var funcs = []
// Example of matched pair function
// funcs.push(coinFlip(Average, Median))
funcs.push(IsDag)
funcs.push(ThreeCycle)
funcs.push(IsBipartite)
shuffle(funcs)

export default props => (
  <HashRouter>
    <Switch>
      <Route exact path='/' render={(props) => <StartScreen {...props} nextPage='/first'></StartScreen>} />
      <Route exact path='/first' render={(props) => <GuessingScreen {...props} funcObj={funcs[0]} nextPage={'/second'} current={0} total={funcs.length}></GuessingScreen>} />
      <Route exact path='/second' render={(props) => <GuessingScreen {...props} funcObj={funcs[1]} nextPage={'/third'} current={1} total={funcs.length}></GuessingScreen>} />
      <Route exact path='/third' render={(props) => <GuessingScreen {...props} funcObj={funcs[2]} nextPage={'/thanks'} current={2} total={funcs.length}></GuessingScreen>} />
      <Route exact path='/thanks' render={(props) => <ThankYouScreen></ThankYouScreen>} />
    </Switch>
  </HashRouter>
)