(function () {
  function send(url, data) {
    return fetch(url, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-OBR-Pontuador': '1' },
      body: JSON.stringify(data),
    }).then(function (response) {
      return response.json().then(function (body) {
        if (!response.ok) throw new Error(body.error || 'Não foi possível concluir.');
        return body;
      });
    });
  }

  var login = document.getElementById('obr-volunteer-login');
  if (login) {
    var secret = document.getElementById('obr-volunteer-password');
    var feedback = document.getElementById('obr-volunteer-feedback');
    var modality = document.getElementById('obr-volunteer-modality');
    if (new URLSearchParams(location.search).get('modalidade') === 'artistica') modality.value = 'artistica';
    login.addEventListener('submit', function (event) {
      event.preventDefault();
      var button = login.querySelector('button');
      button.disabled = true;
      feedback.textContent = '';
      send('/tournamenter-obr/voluntario-api/login', { password: secret.value }).then(function () {
        location.replace(modality.value === 'artistica' ? '/tournamenter-obr/voluntario-artistica' : '/tournamenter-obr/voluntario');
      }).catch(function (error) {
        feedback.textContent = error.message;
        secret.select();
        button.disabled = false;
      });
    });
  }

}());
