import React, {useEffect} from 'react';
import {LogBox} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';

import AppStack from './src/screens/AppStack';
import AuthStack from './src/screens/AuthStack';

import {Auth} from '@psyrenpark/auth';

import useUserInfo from './src/Hooks/useUserInfo';
import useAlert from './src/Hooks/useAlert';

import TEST from './TEST';
import CodePush from './src/common/CodePush';
import FCM from './src/common/FCMContainer';
import {apiObject} from './src/common/API';

LogBox.ignoreAllLogs();

const App = () => {
  const alert = useAlert();
  const {isSessionAlive, setUserInfo} = useUserInfo();

  const _getUserInfo = async () => {
    try {
      const apiResult = await apiObject.getUserInfo();

      // if (apiResult.is_block) {
      //   alert({
      //     type: 'info',
      //     title: '[계정 일시적 차단 안내]',
      //     body: '회원님의 계정에서 의심스러운 활동이 감지되어 보안을 위해 계정이 일시적으로 사용중지되었습니다. 자세한 내용은 고객센터로 문의주세요.',
      //     btnText: '확인',
      //   });
      // } else {
      setUserInfo({
        isSessionAlive: true,
        userNo: apiResult.user_no,
        userUUID: apiResult.user_uuid,
        userEmail: apiResult.user_email,
        userImage: apiResult.user_profile_image,
        userName: apiResult.user_name,
        userNickName: apiResult.user_nick_name,
        userPhone: apiResult.user_phone_no,
        userType: apiResult.user_type,
        isPaid: apiResult.is_paid,
        isExit: apiResult.is_chat_exit,
        isBlock: apiResult.is_block,
      });
      // }
    } catch (error) {
      console.log('🚀 ~ _getUserInfo= ~ error', error);
    }
  };

  const _isSessionAlive = async () => {
    Auth.currentSessionProcess(
      async success => {
        _getUserInfo();
      },
      error => {
        console.log('🚀 ~ _isSessionAlive= ~ error', error);
      }
    );
  };

  useEffect(() => {
    _isSessionAlive();

    SplashScreen.hide();
  }, []);

  return (
    <NavigationContainer>
      <CodePush />
      {isSessionAlive ? (
        <FCM>
          <AppStack />
          {/* <TEST /> */}
        </FCM>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default App;
