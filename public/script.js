

console.log('hello world :o');


const username = document.getElementById('username');
const pw = document.getElementById('pw');
const form = document.getElementById('main__form');

// listen for the form to be submitted and add a new dream when it is
form.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();

  // reset form 
  username.value = '';
  pw.value = '';
  username.focus();
};
