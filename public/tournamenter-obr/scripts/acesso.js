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
  var admin = document.getElementById('obr-volunteer-admin');
  if (login) {
    var secret = document.getElementById('obr-volunteer-password');
    var feedback = document.getElementById('obr-volunteer-feedback');
    login.addEventListener('submit', function (event) {
      event.preventDefault();
      var button = login.querySelector('button');
      button.disabled = true;
      feedback.textContent = '';
      send('/tournamenter-obr/voluntario-api/login', { password: secret.value }).then(function () {
        location.replace('/tournamenter-obr/voluntario');
      }).catch(function (error) {
        feedback.textContent = error.message;
        secret.select();
        button.disabled = false;
      });
    });
  }

  if (admin) {
    var field = document.getElementById('obr-volunteer-admin-password');
    var status = document.getElementById('obr-volunteer-status');
    var revoke = document.getElementById('obr-volunteer-revoke');
    var update = admin.querySelector('button[type=submit]');
    function show(body) {
      status.textContent = !body.adminConfigured ? 'Configure primeiro a senha administrativa do Tournamenter.' :
        (body.enabled ? 'Acesso ativo.' : 'Acesso desativado.');
      update.disabled = !body.adminConfigured;
      revoke.disabled = !body.enabled;
    }
    function save(data) {
      update.disabled = true;
      revoke.disabled = true;
      send('/obr-pontuador-config', data).then(function (body) {
        field.value = '';
        show(body);
      }).catch(function (error) {
        status.textContent = error.message;
        update.disabled = false;
        revoke.disabled = false;
      });
    }
    fetch('/obr-pontuador-config', { credentials: 'same-origin' }).then(function (r) { return r.json(); })
      .then(show).catch(function () { status.textContent = 'Não foi possível consultar o acesso.'; });
    admin.addEventListener('submit', function (event) {
      event.preventDefault();
      save({ password: field.value });
    });
    revoke.addEventListener('click', function () {
      if (confirm('Revogar o acesso de todos os voluntários?')) save({ disable: true });
    });
  }

  var logout = document.getElementById('obr-volunteer-logout');
  if (logout && location.pathname.replace(/\/$/, '') === '/tournamenter-obr/voluntario') {
    logout.hidden = false;
    logout.addEventListener('click', function () {
      send('/tournamenter-obr/voluntario-api/logout', {}).then(function () {
        location.replace('/tournamenter-obr/acesso');
      }).catch(function (error) { window.alert(error.message); });
    });
  }
}());
