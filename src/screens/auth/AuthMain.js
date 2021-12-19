import React, {useEffect, useState} from 'react';
import {Keyboard, SafeAreaView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import {Button, CheckBox, Header, Input} from 'react-native-elements';
import FastImage from 'react-native-fast-image';

import scale from '../../common/Scale';
import {isEmpty} from '../../common/Utils';
import useAlert from '../../Hooks/useAlert';
import useLoading from '../../Hooks/useLoading';
import useUserInfo from '../../Hooks/useUserInfo';

import {Auth, AuthType} from '@psyrenpark/auth';
import {apiObject} from '../../common/API';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthMain = props => {
  const alert = useAlert();
  const {isLoading, setIsLoading} = useLoading();
  const {setUserInfo} = useUserInfo();

  const [inputEmail, setInputEmail] = useState(__DEV__ ? 'testsv@ruu.kr' : '');
  const [inputPass, setInputPass] = useState(__DEV__ ? 'asdf123!' : '');
  const [isSaveEmailChecked, setIsSaveEmailChecked] = useState(false);

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

  const _onSignInPress = async () => {
    try {
      Auth.signInProcess(
        {
          authType: AuthType.EMAIL,
          email: inputEmail,
          password: inputPass,
        },
        async success => {
          console.log('_onSignInPress -> success', '로그인 성공==');
          _getUserInfo();
        },
        async needConfirm => {
          console.log('_onSignInPress -> needConfirm', '이메일 인증 필요==');
          // props.navigation.navigate('SignUp', {
          //   TAB_INDEX: 1,
          //   USER_EMAIL: requestDataForm.email,
          //   USER_PASS: requestDataForm.password,
          // });
        },
        error => {
          console.log('_onSignInPress -> error', error);
          alert({
            type: 'info',
            title: '[로그인 오류]',
            body: '아이디 또는 비밀번호가 틀렸습니다.',
            btnText: '확인',
          });
        },
        setIsLoading
      );
    } catch (error) {
      console.log('🚀 ~ const_onSignInPress= ~ error', error);
      alert({
        type: 'info',
        title: '[로그인 오류]',
        body: '아이디 또는 비밀번호가 틀렸습니다.',
        btnText: '확인',
      });
    }
  };

  useEffect(() => {
    const _isFirstTimeOpen = async () => {
      const isFirstTimeOpen = await AsyncStorage.getItem('@stockRoom_WelcomeInvite');

      if (!isFirstTimeOpen) {
        props.navigation.reset({routes: [{name: 'OnBoard'}]});
      }
    };

    _isFirstTimeOpen();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{...styles.container}}>
        <Header
          backgroundColor="transparent"
          statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'dark-content', animated: true}}
          containerStyle={{borderBottomWidth: 0}}
        />
        <SafeAreaView style={{...styles.contents}}>
          <View style={{...styles.viewInner}}>
            <Text style={{...styles.txtTitle}}>로그인</Text>
            <Input
              placeholder="이메일 입력"
              placeholderTextColor="#dddddd"
              value={inputEmail}
              onChangeText={text => setInputEmail(text)}
              keyboardType={'email-address'}
              autoCapitalize="none"
              containerStyle={{paddingHorizontal: 0}}
            />
            <Input
              placeholder="비밀번호 입력"
              placeholderTextColor="#dddddd"
              value={inputPass}
              onChangeText={text => setInputPass(text)}
              secureTextEntry={true}
              containerStyle={{paddingHorizontal: 0}}
            />
            {/* <CheckBox
              checked={isSaveEmailChecked}
              title="이메일 저장"
              textStyle={{fontSize: scale(13), color: '#555555', fontWeight: 'bold'}}
              iconType="ionicon"
              uncheckedIcon="ios-square"
              uncheckedColor="#e4e4e4"
              checkedIcon="ios-checkbox"
              checkedColor="#c01920"
              containerStyle={{...styles.viewCheckBoxArea}}
              onPress={() => setIsSaveEmailChecked(!isSaveEmailChecked)}
            /> */}
            <Button
              disabled={!(!isEmpty(inputEmail) && !isEmpty(inputPass))}
              title="로그인"
              titleStyle={{fontSize: scale(18), color: 'white', fontWeight: 'bold'}}
              buttonStyle={{paddingVertical: scale(13), borderRadius: scale(5), backgroundColor: '#c01920'}}
              onPress={_onSignInPress}
              containerStyle={{marginVertical: scale(20)}}
              loading={isLoading}
            />
            <View style={{...styles.viewRowArea}}>
              {/* <TouchableOpacity>
                <Text style={{...styles.txtFind}}>이메일 찾기</Text>
              </TouchableOpacity>
              <Text style={{...styles.txtFind}}>|</Text> */}
              <TouchableOpacity onPress={() => props.navigation.navigate('ResetPass')}>
                <Text style={{...styles.txtFind}}>비밀번호 찾기</Text>
              </TouchableOpacity>
              <Text style={{...styles.txtFind}}>|</Text>
              <TouchableOpacity onPress={() => props.navigation.navigate('Consent')}>
                <Text style={{...styles.txtFind}}>회원가입 </Text>
              </TouchableOpacity>
            </View>
            {/* <View style={{...styles.viewRowArea, marginTop: scale(30)}}>
              <TouchableOpacity>
                <FastImage
                  source={require('../../../assets/images/drawable-xxxhdpi/apple_logo.png')}
                  style={{...styles.imgSocialLogo}}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <FastImage
                  source={require('../../../assets/images/drawable-xxxhdpi/kakao_logo.png')}
                  style={{...styles.imgSocialLogo}}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <FastImage
                  source={require('../../../assets/images/drawable-xxxhdpi/naver_logo.png')}
                  style={{...styles.imgSocialLogo}}
                />
              </TouchableOpacity>
            </View> */}
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AuthMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewInner: {
    padding: scale(15),
  },
  txtTitle: {
    fontSize: scale(25),
    color: '#222222',
    fontWeight: 'bold',
    marginBottom: scale(25),
  },
  viewCheckBoxArea: {
    backgroundColor: 'white',
    borderWidth: 0,
    padding: 0,
    marginLeft: 0,
    marginRight: 0,
    margin: 0,
  },
  viewRowArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  txtFind: {
    fontSize: scale(14),
    fontWeight: 'bold',
  },
  imgSocialLogo: {
    width: scale(45),
    height: scale(45),
  },
});
