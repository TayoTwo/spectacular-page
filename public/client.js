console.log('client.js loaded');

const username = document.getElementById('username');
const pw = document.getElementById('pw');
const form = document.getElementById('main__form');
let signingIn = document.getElementById('signingIn');

// listen for the form to be submitted and add a new dream when it is
form.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  // event.preventDefault();
  signingIn.value = signingIn.checked;
  console.log(username.value + " " + pw.value + " " + signingIn.value);

  // reset form
  // username.value = '';
  // pw.value = '';
  // signingIn = 'false';
  // username.focus();
};
