/**
 * This is the server process that listens on port 5000 for requests from the
 * frontend to store subject actions in the database.
 */
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const { Client, Pool } = require('pg')
const app = express()
// Listen on port 5000
const port = process.env.PORT || 5000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Create a new connection pool
const conPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  max: 20,
})
// Create actions table if it doesn't exist yet
conPool.query('create table if not exists actions (userID VARCHAR (255), fcnName VARCHAR (255), actionID INTEGER, actionType VARCHAR (255), time TIMESTAMP, input VARCHAR (255), output VARCHAR (255), quizQ INTEGER, actualOutput VARCHAR (255), result BOOLEAN, finalGuess VARCHAR (255) )', (err, result) => {
})

// Process request
app.post('/api/store', async (req, res) => {
  var action = req.body
  var id = action.id
  var name = action.fcn
  var key = action.key
  var type = action.type
  var time = action.time

  if (type === "eval_input") {
    in_str = action.in
    out_str = action.out

    conPool.query(`insert into actions (userID, fcnName, actionID, actionType, time, input, output) values ($1, $2, $3, $4, $5, $6, $7)`, [id, name, key, type, time, in_str, out_str], (err, result) => {
      if (!err) {
        res.send(`Success!`)
      } else {
        res.send(`Failed! `, err.name, err.message, err.stack)
      }
    })
  } else if (type === "final_answer") {
    finalGuess = action.finalGuess

    conPool.query(`insert into actions (userID, fcnName, actionID, actionType, time, finalGuess) values ($1, $2, $3, $4, $5, $6)`, [id, name, key, type, time, finalGuess], (err, result) => {
      if (!err) {
        res.send(`Success!`)
      } else {
        res.send(`Failed! `, err.name, err.message, err.stack)
      }
    })
  } else if (type === "quiz_answer") {
    in_str = action.in
    out_str = action.out
    actual_str = action.actual
    question = action.q
    result = action.result
    
    conPool.query(`insert into actions (userID, fcnName, actionID, actionType, time, input, output, actualOutput, quizQ, result) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [id, name, key, type, time, in_str, out_str, actual_str, question, result], (err, result) => {
      if (!err) {
        res.send(`Success!`)
      } else {
        res.send(`Failed! `, err.name, err.message, err.stack)
      }
    })
  } else if (type === "cheat_attempt") {
    in_str = action.in
    out_str = action.out

    conPool.query(`insert into actions (userID, fcnName, actionID, actionType, time, input, output) values ($1, $2, $3, $4, $5, $6, $7)`, [id, name, key, type, time, in_str, out_str], (err, result) => {
      if (!err) {
        res.send(`Success!`)
      } else {
        res.send(`Failed! `, err.name, err.message, err.stack)
      }
    })
  }
})

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')))

  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
  })
}

app.listen(port, () => console.log(`Listening on port ${port}`))
