getUserButton.addEventListener('click', () => {
  apiRequest("/users", 'GET', body)
    .then(data => {
      console.log(data);
    })
    .catch(error => console.error(error));
});

