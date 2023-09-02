const username = document.getElementById('username');
const password = document.getElementById('password');
const login = document.getElementById('login');
const userInfoDom = document.getElementById('userInfo');
const index = document.getElementById('index');
const indexInner = document.getElementById('indexInner');
const ACCESS_TOKEN = 'ACCESS_TOKEN';
const REFRESH_TOKEN = 'REFRESH_TOKEN';
let userInfo = {};

async function postLogin() {
  const data = await fetch('http://localhost:3000/login', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify({
      username: username.value,
      password: password.value,
    }),
  }).then((res) => res.json());

  const { accessToken, refreshToken } = data;
  localStorage.setItem(ACCESS_TOKEN, 'Bearer ' + accessToken);
  localStorage.setItem(REFRESH_TOKEN, refreshToken);
  userInfo = data.userInfo;
  userInfoDom.innerHTML += JSON.stringify(userInfo);
}

async function getIndex() {
  const data = await fetch('http://localhost:3000/index', {
    method: 'get',
    headers: {
      Authorization: localStorage.getItem(ACCESS_TOKEN),
    },
  }).then((res) => res.json());

  indexInner.innerHTML += JSON.stringify(data);
}
login.onclick = postLogin;
index.onclick = getIndex;
