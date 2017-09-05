const server = {
    'server1': 'http://localhost:4200/intercept/',
    'server2': 'http://dev11.rogers.com/mbh/intercept/'
}
const portals = ['RD', 'RDC', 'BSSS', 'BSSP', 'EWP', 'UNISON', 'RBAM'];
const loader = document.querySelector('.loader');
loader.classList.add('hidden');
var tokenReq;

document.addEventListener('DOMContentLoaded', () => {
    var buttons = document.querySelectorAll('.btn');
    var radioButtons = $('.radio-buttons > input');
    var redBar = document.querySelector('.active-bar');
    var messageBox = document.querySelector('.message-box');
    var errorBox = document.querySelector('.error-message');
    var form = document.querySelector('.form')
    var haveCurrentToken = false;
    errorBox.classList.add('hidden');
    tokenReq = JSON.parse(localStorage.getItem('TokenRequest'));
    var currentServer;
    radioButtons.click((e) => {
        currentServer = server[e.target.id];
    });
    haveCurrentToken = tokenReq ? true : false;
    console.log(tokenReq, haveCurrentToken);
    if (haveCurrentToken) {
        buttons[1].disabled = false;
        buttons[3].disabled = false;
    } else {
        buttons[1].disabled = true;
        buttons[3].disabled = true;

    }
    if (tokenReq) {
        currentServer = tokenReq.server;
        if (tokenReq.server === server['server1']) {
            radioButtons[0].checked = true;
        } else {
            radioButtons[1].checked = true;
        }
        document.querySelector('.request').innerHTML = JSON.stringify(tokenReq.req, undefined, 2);
        document.querySelector('.responsedata').innerHTML = JSON.stringify(tokenReq.res, undefined, 2);
        document.querySelector('.intercept-link').innerHTML = `${currentServer}${tokenReq.res.token}`;
        document.querySelector('.intercept-link').href = `${currentServer}${tokenReq.res.token}`;
    } else {
        radioButtons[0].checked = true;
        currentServer = server['server1'];
    }

    buttons[0].addEventListener('click', () => {
        messageBox.classList.add('hidden');
        form.classList.remove('hidden');
        redBar.classList.remove('move-right');
    });
    buttons[1].addEventListener('click', () => {
        messageBox.classList.remove('hidden');
        form.classList.add('hidden');
        redBar.classList.add('move-right');
    });
    buttons[2].addEventListener('click', () => {
        loader.classList.remove('hidden');
        // const selects = document.querySelectorAll('.enter-details select');
        const postObj = {
            "portal": portals[Math.ceil(Math.random() * 10) % 7],
            "firstName": faker.name.firstName(),
            "lastName": faker.name.lastName(),
            "email": faker.internet.email(),
            "companyName": faker.company.companyName(),
            "language": Math.random() > 0.5 ? 'en' : 'fr'
        }
        this.callAPI(postObj, buttons, currentServer, errorBox);
    });
    buttons[3].addEventListener('click', () => {
        const inputs = document.querySelectorAll('.enter-details input');
        const selects = document.querySelectorAll('.enter-details select');
        selects[0].value = tokenReq.req.portal;
        inputs[0].value = tokenReq.req.firstName;
        inputs[1].value = tokenReq.req.lastName;
        inputs[2].value = tokenReq.req.email;
        inputs[3].value = tokenReq.req.companyName;
        selects[1].value = tokenReq.req.language
    });
    buttons[4].addEventListener('click', () => {
        loader.classList.remove('hidden');
        const selects = document.querySelectorAll('.enter-details select');
        const inputs = document.querySelectorAll('.enter-details input');
        const postObj = {
            "portal": selects[0].value,
            "firstName": inputs[0].value,
            "lastName": inputs[1].value,
            "email": inputs[2].value,
            "companyName": inputs[3].value,
            "language": selects[1].value
        }
        this.callAPI(postObj, buttons, currentServer, errorBox);
    });
    buttons[5].addEventListener('click', () => {
        errorBox.classList.add('hidden');
    });
});

callAPI = (data, buttons, currentServer, errorBox) => {
    const postObj = data;
    console.log(postObj);
    const url = "http://10.73.114.170/mbh/v1/encrypttoken";
    callFunction = (res) => {
        var event = new CustomEvent('click')
        buttons[1].dispatchEvent(event);
        haveCurrentToken = true;
        buttons[1].disabled = false;
        tokenReq = { 'req': postObj, 'res': res, 'server': currentServer };
        localStorage.setItem('TokenRequest', JSON.stringify({ 'req': postObj, 'res': res, 'server': currentServer }));
        document.querySelector('.request').innerHTML = JSON.stringify(postObj, undefined, 2);
        document.querySelector('.responsedata').innerHTML = JSON.stringify(res, undefined, 2);
        document.querySelector('.intercept-link').innerHTML = `${currentServer}${res.token}`;
        document.querySelector('.intercept-link').href = `${currentServer}${res.token}`;
        loader.classList.add('hidden');
    }
    $.ajax({
        url: url,
        type: "POST",
        headers: {
            "Accept": "application/json; charset=utf-8",
            "Content-Type": "application/json; charset=utf-8"
        },
        data: JSON.stringify(postObj),
        success: callFunction,
        dataType: "json"
    }).fail((err) => {
        if (err['responseText']) {
            document.querySelector('.message').innerHTML = err['responseText'];
        } else {
            document.querySelector('.message').innerHTML = 'Error!! Please check if you are connected to VPN.'
        }
        document.querySelector('.error-object').innerHTML = JSON.stringify(postObj, undefined, 2);
        loader.classList.add('hidden');
        errorBox.classList.remove('hidden');
        setTimeout(() => {
            errorBox.classList.add('hidden');
        }, 10000);
    })
}