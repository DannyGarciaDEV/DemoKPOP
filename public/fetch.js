const counters = document.querySelectorAll('.counter');

counters.forEach(function (counter) {
  counter.addEventListener('click', function () {
    const objectIdElement = this.parentNode.parentNode.querySelector('.objectId');
    const objectId = objectIdElement.innerText;

    fetch('/counter', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        objectId: objectId
      })
    })
      .then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Error: ' + response.status);
        }
      })
      .then(function (data) {
        window.location.reload();
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
  });
});