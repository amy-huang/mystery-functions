class Util {
  static getCurrentTime() {
    var today = new Date()
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    return date + ' ' + time
  }

  static newDisplayKey() {
    if (localStorage.getItem('displayKey') === null) {
      localStorage.setItem('displayKey', 0)
    } else {
      var k = parseInt(localStorage.getItem('displayKey')) + 1
      localStorage.setItem('displayKey', k)
    }
    return localStorage.getItem('displayKey')
  }

  static newServerKey() {
    if (localStorage.getItem('serverKey') === null) {
      localStorage.setItem('serverKey', 0)
    } else {
      var k = parseInt(localStorage.getItem('serverKey')) + 1
      localStorage.setItem('serverKey', k)
    }
    return localStorage.getItem('serverKey')
  }

  static async sendToServer(obj) {
    // console.log(JSON.stringify(obj))
    const response = await fetch('/api/store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obj),
    })
    const body = await response.text()
    console.log(body)
  }

}

export default Util