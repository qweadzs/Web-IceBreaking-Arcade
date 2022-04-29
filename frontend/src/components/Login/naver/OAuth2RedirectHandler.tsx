import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveToken } from '../../../common/api/jWT-Token';
import UserApi from '../../../common/api/UserApi';

function OAuth2RedirectHandler() {
  const code = new URL(window.location.href).searchParams.get('code');
  const { getNaverLoginResult } = UserApi;
  const navigate = useNavigate();
  // api 통신
  //백으로 code 넘기고 토큰 저장하고, api 통신 연결하고 로그인 이후의 화면으로 보내면 된다. ex, main
  const apiResult = async () => {
    const result = await getNaverLoginResult(code as string);
    console.log(result);
    saveToken(result.data.token);
    window.localStorage.setItem('userSeq', result.data.userSeq);
    navigate('/');
    return result;
  };
  useEffect(() => {
    const result = apiResult();
  }, []);
  return <>{code}</>;
}

export default OAuth2RedirectHandler;
