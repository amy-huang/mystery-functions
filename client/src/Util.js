/**
 * Provides client helper methods for logging user actions.
 */
class Util {
  // Get local time in client browser
  static getCurrentTime() {
    var today = new Date()
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    return date + ' ' + time
  }

  // Generate a new key for an input evaluation, for use in displaying it
  static newDisplayKey() {
    if (localStorage.getItem('displayKey') === null) {
      localStorage.setItem('displayKey', 0)
    } else {
      var k = parseInt(localStorage.getItem('displayKey')) + 1
      localStorage.setItem('displayKey', k)
    }
    return localStorage.getItem('displayKey')
  }

  // Generate a new key for identifying action order in the database
  static newServerKey() {
    if (localStorage.getItem('serverKey') === null) {
      localStorage.setItem('serverKey', 0)
    } else {
      var k = parseInt(localStorage.getItem('serverKey')) + 1
      localStorage.setItem('serverKey', k)
    }
    return localStorage.getItem('serverKey')
  }

  // Send action JSON to server to be made into database row
  static async sendToServer(action) {
    const response = await fetch('/api/store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action),
    })
    const body = await response.text()
    console.log(body)
  }

}

export default Util