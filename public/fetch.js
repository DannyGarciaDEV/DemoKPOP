const counters = document.querySelectorAll('.counter');

counters.forEach(counter => {
  counter.addEventListener('click', () => {
    const objectIdElement = counter.closest('.item').querySelector('.objectId');
    if (!objectIdElement) {
      console.error('Object ID element not found.');
      return;
    }

    const objectId = objectIdElement.innerText;

    fetch('/counter', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ objectId })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });
});
