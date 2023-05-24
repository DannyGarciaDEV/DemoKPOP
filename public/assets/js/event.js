var msgBtn = document.getElementsByClassName("msgBtn");

// TODO research on getById() for the button and any other data inputs
Array.from(msgBtn).forEach(function (element) {
  element.addEventListener('click', function (e) {
    e.preventDefault();
    let content = this.parentNode.childNodes[1].value
    // NEVER TRUST THE CLIENT
    // let summary = this.parentNode.parentNode.parentNode.childNodes[41].childNodes[1].innerHTML
    // let user = this.parentNode.parentNode.parentNode.childNodes[41].childNodes[3].innerHTML

    // TODO POST message
    // TODO update to only include message attributes
    // TODO check if we need the event ID
    const eventIdRoute = window.location.pathname;
    fetch(`${eventIdRoute}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'content': content
      })
    })
      .then(response => {
        if (response.ok) return response.json()
      })
      .then(data => {
        window.location.reload(true);
        // TODO update the html with the new message

      })
  })
})


const attendeeButton = document.getElementById("attend-button");

attendeeButton.addEventListener("click", (e) => {
    const eventIdRoute = window.location.pathname;
    fetch(`${eventIdRoute}/attend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) return response.json()
      })
      .then(data => {
        window.location.reload(true);

      });
});

