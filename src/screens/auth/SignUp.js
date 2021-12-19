import React, {useEffect, useState, useMemo, useCallback, useRef} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {addComma, isEmpty, isIOS, _chkEmail, _chkPhone} from '../../common/Utils';
import scale from '../../common/Scale';
import useAlert from '../../Hooks/useAlert';
import useLoading from '../../Hooks/useLoading';
import {apiObject} from '../../common/API';

import {Button, CheckBox, Header, Icon, Input} from 'react-native-elements';
import {TabView} from 'react-native-tab-view';
import {getBottomSpace, isIphoneX} from 'react-native-iphone-x-helper';
import Toast from 'react-native-simple-toast';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';

import {Auth, AuthType} from '@psyrenpark/auth';
import BannerImage from '../common/BannerImage';

const SignUp = props => {
  const alert = useAlert();
  const {isLoading, setIsLoading} = useLoading();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'one', title: '휴대폰인증'},
    {key: 'two', title: '계정입력'},
    {key: 'three', title: '기본정보설정'},
    {key: 'four', title: '유저타입'},
    {key: 'five', title: '투자정보'},
  ]);

  const [inputPhone, setInputPhone] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isSentCode, setIsSentCode] = useState(false);
  const [isPassedCode, setIsPassedCode] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [isAvailableEmail, setIsAvailableEmail] = useState(false);
  const [inputPass, setInputPass] = useState('');
  const [inputConfirmPass, setInputConfirmPass] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputNickName, setInputNickName] = useState('');
  const [requestData, setRequestData] = useState({
    userType: undefined,
    investment: '',
    securitiesType: {code_id: undefined, code_type_information: undefined},
    isFirstLeading: undefined,
  });
  const isMarketing = props.route.params.IS_MARKETING;
  const [directExit, setDirectExit] = useState(false);

  const [respConfirmData, setRespConfirmData] = useState({}); // 인증번호 전송 후 response 값
  const [investmentTypeData, setInvestmentTypeData] = useState([]); // 유저 타입 데이터
  const [investmentCompanyData, setInvestmentCompanyData] = useState([]); // 증권사 데이터

  // 각 탭에 따른 회원가입 타이틀
  const _renderTitle = () => {
    switch (index) {
      case 0:
      case 1:
        return '회원가입';

      case 2:
        return '기본정보설정';

      case 3:
        return '어떤 회원이신가요?';

      case 4:
        return '투자정보 입력';
    }
  };

  // 인증번호 전송
  const _onSendCodePress = async () => {
    try {
      const apiResult = await apiObject.postPreConfirmation(
        {
          user_phone_no: inputPhone,
        },
        setIsLoading
      );
      setIsSentCode(true);
      setRespConfirmData(apiResult);
      Toast.showWithGravity('인증번호가 전송되었습니다.', Toast.SHORT, Toast.CENTER);
    } catch (err) {
      console.log('🚀 ~ _onSendCodePress ~ error', err);

      if (Number(err?.response?.status) === 406) {
        Toast.show(
          err?.response?.data?.message || '네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
          Toast.SHORT
        );
        return;
      }

      // if (err.response) {
      //   // Request made and server responded
      //   console.log(err.response.data);
      //   console.log(err.response.status);
      //   console.log(err.response.headers);
      // } else if (err.request) {
      //   // The request was made but no response was received
      //   console.log(err.request);
      // } else {
      //   // Something happened in setting up the request that triggered an Error
      //   console.log('Error', err.message);
      // }

      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  // 인증번호 확인
  const _onCheckCodePress = async () => {
    try {
      await apiObject.putPreConfirmation(
        {
          user_phone_no: inputPhone,
          user_confirm_code: inputCode,
          pre_confirmation_no: respConfirmData.pre_confirmation_no,
        },
        setIsLoading
      );
      Toast.showWithGravity('인증번호가 확인되었습니다.', Toast.SHORT, Toast.CENTER);
      setIsPassedCode(true);
    } catch (error) {
      console.log('🚀 ~ _onCheckCodePress ~ error', error.response.data.data.message);
      Toast.show(error.response.data.data.message, Toast.SHORT);
    }
  };

  // 이메일 중복 확인
  const _onCheckEmailPress = async () => {
    try {
      await apiObject.checkToEmail({user_email: inputEmail});

      alert({
        type: 'check',
        title: '[사용가능]',
        body: '사용가능한 이메일입니다!',
        btnText: '확인',
      });
      setIsAvailableEmail(true);
    } catch (error) {
      console.log('🚀 ~ _onCheckEmailPress ~ error', error.response.data.message);
      Toast.show(error.response.data.message, Toast.SHORT);
    }
  };

  // 각 탭에 따른 버튼 disabled
  const _disabledProcess = () => {
    switch (index) {
      case 0:
        return isPassedCode;

      case 1:
        return isAvailableEmail && !isEmpty(inputPass) && !isEmpty(inputConfirmPass) && inputPass === inputConfirmPass;

      case 2:
        return !isEmpty(inputName) && !isEmpty(inputNickName) && inputNickName.length >= 2;

      case 3:
        return !isEmpty(requestData.userType);

      case 4:
        if (requestData.userType === 'A') {
          return (
            !isEmpty(requestData.investment) &&
            !isEmpty(requestData.securitiesType.code_id) &&
            !isEmpty(requestData.isFirstLeading)
          );
        } else {
          return !isEmpty(requestData.investment);
        }
    }
  };

  // 각 탭에 따른 버튼 액션
  const _onSignUpStepPress = async () => {
    Keyboard.dismiss();
    switch (index) {
      case 0:
        setIndex(1);
        break;

      case 1:
        setIndex(2);
        break;

      case 2:
        setIndex(3);
        break;

      case 3:
        if (requestData.userType === 'C') {
          // props.navigation.reset({routes: [{name: 'SignUpDone'}]});
          Auth.signUpProcess(
            {
              email: inputEmail,
              password: inputPass,
              authType: AuthType.EMAIL,
              lang: 'ko',
              cognitoRegComm: {
                user_name: inputName,
                user_nick_name: inputNickName,
                user_phone_no: inputPhone,
                user_inverst_type_code_id: requestData.userType,
                user_prediction_money: requestData.investment,
                user_stock_company_code_id: requestData.securitiesType.code_id,
                is_consult: requestData.isFirstLeading,
                is_marketing: isMarketing,
              },
            },
            async success => {
              setDirectExit(true);
              setTimeout(() => {
                props.navigation.replace('SignUpDone');
              }, 500);
            },
            error => {
              console.log('error => 가입실패 : ', error);
              Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
            },
            setIsLoading
          );
        } else {
          setIndex(4);
        }
        break;

      case 4:
        // props.navigation.reset({routes: [{name: 'SignUpDone'}]});
        Auth.signUpProcess(
          {
            email: inputEmail,
            password: inputPass,
            authType: AuthType.EMAIL,
            lang: 'ko',
            cognitoRegComm: {
              user_name: inputName,
              user_nick_name: inputNickName,
              user_phone_no: inputPhone,
              // user_phone_no: '01012345678',
              user_inverst_type_code_id: requestData.userType,
              user_prediction_money: requestData.investment,
              user_stock_company_code_id: requestData.securitiesType.code_id,
              is_consult: requestData.isFirstLeading,
              is_marketing: isMarketing,
            },
          },
          async success => {
            setDirectExit(true);
            setTimeout(() => {
              props.navigation.replace('SignUpDone');
            }, 500);
          },
          error => {
            console.log('error => 가입실패 : ', error);
            Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
          },
          setIsLoading
        );
        break;
    }
  };

  const _renderTabs = ({route}) => {
    switch (route.key) {
      case 'one':
        return (
          <ScrollView scrollEnabled={false} keyboardShouldPersistTaps="handled">
            <Input
              label="휴대폰번호"
              labelStyle={{...styles.txtLabel}}
              placeholder="휴대폰번호를 입력해주세요. (- 제외)"
              placeholderTextColor="#dddddd"
              style={{fontSize: scale(15)}}
              containerStyle={{paddingHorizontal: 0}}
              value={inputPhone}
              onChangeText={setInputPhone}
              keyboardType="number-pad"
              maxLength={11}
              rightIcon={
                <Button
                  disabled={!_chkPhone(inputPhone)}
                  title={isSentCode ? '재요청' : '인증'}
                  type="clear"
                  titleStyle={{...styles.txtInputRight}}
                  onPress={_onSendCodePress}
                  loading={isLoading}
                  loadingProps={{color: '#c01920'}}
                />
              }
            />
            <Input
              label="인증번호 입력"
              labelStyle={{...styles.txtLabel}}
              placeholder="인증번호 6자리를 입력해주세요."
              placeholderTextColor="#dddddd"
              style={{fontSize: scale(15)}}
              containerStyle={{paddingHorizontal: 0}}
              value={inputCode}
              onChangeText={setInputCode}
              keyboardType="number-pad"
              maxLength={6}
              rightIcon={
                <Button
                  disabled={!(isSentCode && inputCode.length === 6 && !isPassedCode)}
                  title={isPassedCode ? '인증완료' : '인증확인'}
                  type="clear"
                  titleStyle={{...styles.txtInputRight}}
                  onPress={_onCheckCodePress}
                  loading={isLoading}
                  loadingProps={{color: '#c01920'}}
                />
              }
            />
          </ScrollView>
        );

      case 'two':
        return (
          <ScrollView scrollEnabled={false} keyboardShouldPersistTaps="handled">
            <Input
              label="이메일"
              labelStyle={{...styles.txtLabel}}
              placeholder="이메일 주소를 입력해주세요."
              placeholderTextColor="#dddddd"
              style={{fontSize: scale(15)}}
              containerStyle={{paddingHorizontal: 0}}
              value={inputEmail}
              onChangeText={text => {
                setInputEmail(text);
                setIsAvailableEmail(false);
              }}
              keyboardType="email-address"
              rightIcon={
                <Button
                  disabled={!(_chkEmail(inputEmail) && !isAvailableEmail)}
                  title={isAvailableEmail ? '사용가능' : '중복확인'}
                  type="clear"
                  titleStyle={{...styles.txtInputRight}}
                  onPress={_onCheckEmailPress}
                  loading={isLoading}
                  loadingProps={{color: '#c01920'}}
                />
              }
            />
            <Input
              label="비밀번호"
              labelStyle={{...styles.txtLabel}}
              placeholder="6자리 이상의 비밀번호를 입력해주세요."
              placeholderTextColor="#dddddd"
              style={{fontSize: scale(15)}}
              containerStyle={{paddingHorizontal: 0}}
              value={inputPass}
              onChangeText={setInputPass}
              secureTextEntry={true}
            />
            <Input
              label="비밀번호 확인"
              labelStyle={{...styles.txtLabel}}
              placeholder="비밀번호를 한 번 더 입력해주세요."
              placeholderTextColor="#dddddd"
              style={{fontSize: scale(15)}}
              containerStyle={{paddingHorizontal: 0}}
              value={inputConfirmPass}
              onChangeText={setInputConfirmPass}
              secureTextEntry={true}
            />
          </ScrollView>
        );

      case 'three':
        return (
          <ScrollView scrollEnabled={false} keyboardShouldPersistTaps="handled">
            <Input
              label="이름"
              labelStyle={{...styles.txtLabel}}
              placeholder="실명을 입력해주세요."
              placeholderTextColor="#dddddd"
              style={{fontSize: scale(15)}}
              containerStyle={{paddingHorizontal: 0}}
              value={inputName}
              onChangeText={setInputName}
            />
            <Input
              label="닉네임"
              labelStyle={{...styles.txtLabel}}
              placeholder="채팅방에서 사용할 닉네임을 입력해주세요."
              placeholderTextColor="#dddddd"
              style={{fontSize: scale(15)}}
              containerStyle={{paddingHorizontal: 0}}
              value={inputNickName}
              onChangeText={setInputNickName}
              maxLength={10}
            />
            <Text style={{fontSize: scale(10), color: '#d2d2d2'}}>
              실명이 아니면 추후 서비스 이용에 제약이 있을 수 있습니다.
            </Text>
          </ScrollView>
        );

      case 'four':
        return (
          <ScrollView scrollEnabled={false} keyboardShouldPersistTaps="handled">
            <Text style={{...styles.txtLabel, marginBottom: scale(15)}}>타입 선택</Text>
            {investmentTypeData.map((investmentItem, investmentIndex) => (
              <TouchableOpacity
                key={`investment_${investmentIndex}`}
                style={{...styles.viewTypeArea(requestData.userType, investmentItem.code_id)}}
                onPress={() => setRequestData({...requestData, userType: investmentItem.code_id})}>
                <Text style={{...styles.txtTypeLabel(requestData.userType, investmentItem.code_id)}}>
                  {investmentItem.code_type_information}
                </Text>
                <Icon
                  type="ionicon"
                  name="ios-checkmark-circle"
                  size={scale(25)}
                  color={requestData.userType === investmentItem.code_id ? '#c01920' : '#dddddd'}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        );

      case 'five':
        return (
          <ScrollView scrollEnabled={false} keyboardShouldPersistTaps="handled">
            <Input
              label="예상 투자자금"
              labelStyle={{...styles.txtLabel}}
              placeholder="투자자금을 입력해주세요."
              placeholderTextColor="#dddddd"
              style={{fontSize: scale(15)}}
              containerStyle={{paddingHorizontal: 0}}
              value={addComma(requestData.investment)}
              onChangeText={text => setRequestData({...requestData, investment: text.replace(/,/gi, '')})}
              keyboardType="number-pad"
            />
            {requestData.userType === 'A' && (
              <>
                <Text style={{...styles.txtLabel}}>이용 증권사</Text>
                <View style={{...styles.viewSelectArea}}>
                  <TouchableOpacity
                    style={{...styles.viewSelectContainer}}
                    onPress={() => {
                      Keyboard.dismiss();
                      refBottomSheetModal.current.present();
                    }}>
                    <Text
                      style={{
                        fontSize: scale(15),
                        color: isEmpty(requestData.securitiesType.code_type_information) ? '#dddddd' : '#222222',
                      }}>
                      {isEmpty(requestData.securitiesType.code_type_information)
                        ? '이용중인 증권사를 선택해주세요.'
                        : requestData.securitiesType.code_type_information}
                    </Text>
                    <Icon name="ios-chevron-down" type="ionicon" color="#999999" size={scale(25)} />
                  </TouchableOpacity>
                </View>
                <Text style={{...styles.txtLabel}}>유료리딩 경험</Text>
                <View style={{...styles.viewSelectContainer, justifyContent: 'flex-start'}}>
                  <CheckBox
                    checked={requestData.isFirstLeading === true}
                    title="경험있음"
                    textStyle={{fontSize: scale(15), color: '#222222', fontWeight: 'normal'}}
                    iconType="ionicon"
                    uncheckedIcon="ios-checkmark-circle-outline"
                    uncheckedColor="#e4e4e4"
                    checkedIcon="ios-checkmark-circle"
                    checkedColor="black"
                    containerStyle={{...styles.viewCheckBoxArea, paddingVertical: scale(15)}}
                    size={scale(25)}
                    onPress={() => setRequestData({...requestData, isFirstLeading: true})}
                  />
                  <CheckBox
                    checked={requestData.isFirstLeading === false}
                    title="경험없음"
                    textStyle={{fontSize: scale(15), color: '#222222', fontWeight: 'normal'}}
                    iconType="ionicon"
                    uncheckedIcon="ios-checkmark-circle-outline"
                    uncheckedColor="#e4e4e4"
                    checkedIcon="ios-checkmark-circle"
                    checkedColor="black"
                    containerStyle={{...styles.viewCheckBoxArea, paddingVertical: scale(15)}}
                    size={scale(25)}
                    onPress={() => setRequestData({...requestData, isFirstLeading: false})}
                  />
                </View>
              </>
            )}
          </ScrollView>
        );
    }
  };

  // 뒤로가기 방지
  useEffect(
    () =>
      props.navigation.addListener('beforeRemove', e => {
        e.preventDefault();
        if (directExit) {
          props.navigation.dispatch(e.data.action);
          return null;
        }
        if (index === 0) {
          alert({
            type: 'info',
            title: '[주의]',
            body: '뒤로가시겠습니까?\n입력한 모든 정보가 사라집니다.',
            btnText: '나가기',
            btnPress: () => props.navigation.dispatch(e.data.action),
            renderLeftBtn: true,
            leftBtnText: '취소',
          });
        } else {
          setIndex(index - 1);
        }
      }),
    [index, props.navigation, directExit]
  );

  // 유저 타입 리스트 가져오기
  const _getInvestmentType = async () => {
    try {
      const apiResult = await apiObject.getCode({code_type_id: 'UIT'});
      setInvestmentTypeData(apiResult.items);
    } catch (error) {
      console.log('🚀 ~ _getInvestmentType ~ error', error.response.data.message);
      Toast.show(error.response.data.message, Toast.SHORT);
    }
  };

  // 증권사 리스트 가져오기
  const _getInvestmentCompany = async () => {
    try {
      const apiResult = await apiObject.getCode({code_type_id: 'FIC'});
      setInvestmentCompanyData(apiResult.items);
    } catch (error) {
      console.log('🚀 ~ _getInvestmentCompany ~ error', error.response.data.message);
      Toast.show(error.response.data.message, Toast.SHORT);
    }
  };

  // 증권사 모달 관련
  const snapPoints = useMemo(() => ['45%', '80%'], []);
  const refBottomSheetModal = useRef(null);
  const _renderInvestmentList = ({item}) => (
    <Button
      title={item.code_type_information}
      titleStyle={{color: requestData.securitiesType.code_id === item.code_id ? '#c01920' : '#999999'}}
      type="outline"
      containerStyle={{width: '49%', marginBottom: scale(10)}}
      buttonStyle={{borderColor: requestData.securitiesType.code_id === item.code_id ? '#c01920' : '#999999'}}
      onPress={() => {
        setRequestData({
          ...requestData,
          securitiesType: {code_id: item.code_id, code_type_information: item.code_type_information},
        });
        refBottomSheetModal.current.dismiss();
      }}
    />
  );

  useEffect(() => {
    _getInvestmentType();
    _getInvestmentCompany();
  }, []);

  return (
    <BottomSheetModalProvider>
      <KeyboardAvoidingView style={{...styles.container}} behavior={isIOS() ? 'padding' : null}>
        <Header
          backgroundColor="transparent"
          statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'dark-content', animated: true}}
          leftComponent={{
            icon: 'ios-chevron-back',
            type: 'ionicon',
            size: scale(25),
            onPress: () => props.navigation.goBack(null),
          }}
          containerStyle={{borderBottomWidth: 0}}
        />
        <SafeAreaView style={{...styles.contents}}>
          <View style={{...styles.viewInner}}>
            <Text style={{...styles.txtTitle}}>{_renderTitle()}</Text>
            <TabView
              swipeEnabled={false}
              renderTabBar={() => null}
              navigationState={{index, routes}}
              renderScene={_renderTabs}
              onIndexChange={setIndex}
            />
          </View>
          <BannerImage />
        </SafeAreaView>
        <Button
          disabled={!_disabledProcess()}
          title={index === 4 || requestData.userType === 'C' ? '가입완료' : '다음'}
          titleStyle={{fontSize: scale(17), fontWeight: 'bold', color: 'white'}}
          containerStyle={{borderRadius: 0}}
          buttonStyle={{
            borderRadius: 0,
            paddingBottom: isIphoneX() ? getBottomSpace() : scale(20),
            paddingTop: scale(20),
            backgroundColor: 'black',
          }}
          onPress={_onSignUpStepPress}
          loading={isLoading}
        />
        <BottomSheetModal
          ref={refBottomSheetModal}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={backdropProps => <BottomSheetBackdrop {...backdropProps} />}>
          <BottomSheetFlatList
            data={investmentCompanyData}
            keyExtractor={(item, flatListIndex) => `company_${flatListIndex}`}
            renderItem={_renderInvestmentList}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            contentContainerStyle={{padding: scale(15)}}
            numColumns={2}
          />
        </BottomSheetModal>
      </KeyboardAvoidingView>
    </BottomSheetModalProvider>
  );
};

export default SignUp;

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
    flex: 1,
  },
  txtTitle: {
    fontSize: scale(25),
    color: '#222222',
    fontWeight: 'bold',
    marginBottom: scale(25),
  },
  txtInputRight: {
    fontSize: scale(15),
    fontWeight: 'bold',
    color: '#c01920',
  },
  txtLabel: {
    fontSize: scale(12),
    color: '#222222',
    fontWeight: 'bold',
  },
  viewTypeArea: (type, myType) => ({
    marginBottom: scale(10),
    flexDirection: 'row',
    padding: scale(10),
    alignItems: 'center',
    borderWidth: scale(1),
    borderColor: type === myType ? '#c01920' : '#dddddd',
    justifyContent: 'space-between',
  }),
  txtTypeLabel: (type, myType) => ({
    fontSize: scale(13),
    fontWeight: type === myType ? 'bold' : 'normal',
    color: type === myType ? '#c01920' : '#999999',
    flex: 1,
  }),
  viewSelectArea: {
    borderBottomWidth: scale(1),
    borderBottomColor: '#999999',
    paddingVertical: scale(7),
    marginBottom: scale(15),
  },
  viewSelectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewCheckBoxArea: {
    backgroundColor: 'white',
    borderWidth: 0,
    padding: 0,
    marginLeft: 0,
    marginRight: 0,
    margin: 0,
  },
});
