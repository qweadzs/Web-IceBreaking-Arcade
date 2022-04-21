import { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import loadable from '@loadable/component';
import { ToastContainer } from 'react-toastify';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

const Main = loadable(() => import('./components/Main/Main'));
const Login = loadable(() => import('./components/Login/mainLogin'));
const KakaoRedirectHandler = loadable(() => import('./components/Login/kakao/OAuth2RedirectHandler'));
const NaverRedirectHandler = loadable(() => import('./components/Login/naver/OAuth2RedirectHandler'));
const GoogleRedirectHandler = loadable(() => import('./components/Login/google/OAuth2RedirectHandler'));

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth/callback/kakao" element={<KakaoRedirectHandler />} />
          <Route path="/oauth/callback/naver" element={<NaverRedirectHandler />} />
          <Route path="/oauth/callback/google" element={<GoogleRedirectHandler />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer autoClose={1500} style={{ width: '100%', display: 'inline' }} theme="colored" />
    </>
  );
}

export default App;
