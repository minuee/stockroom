import React, {useEffect, useMemo, useRef, useState} from 'react';
import {KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../common/Scale';
import {isEmpty, isIOS, addComma} from '../../common/Utils';
import useAlert from '../../Hooks/useAlert';
import useUserInfo from '../../Hooks/useUserInfo';
import {apiObject} from '../../common/API';

import {Button, CheckBox, Header, Icon, Input} from 'react-native-elements';
import {getBottomSpace, isIphoneX} from 'react-native-iphone-x-helper';
import Toast from 'react-native-simple-toast';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';

const ChangeUserType = props => {
  const alert = useAlert();

  const {setUserInfo, userNo} = useUserInfo();

  const [requestData, setRequestData] = useState({
    userType: {code_id: '', code_type_information: ''},
    investment: '',
    securitiesType: {code_id: '', code_type_information: ''},
    isFirstLeading: undefined,
  });

  const [userTypeData, setUserTypeData] = useState({}); // 유저 타입 정보
  const [investmentTypeData, setInvestmentTypeData] = useState([]); // 유저 타입 데이터
  const [investmentCompanyData, setInvestmentCompanyData] = useState([]); // 증권사 데이터

  const _getTypeAndCompanyData = async () => {
    console.log('# _getTypeAndCompnayData');
    try {
      const investmentTypeList = await apiObject.getCode({code_type_id: 'UIT'});

      const investmentCompanyList = await apiObject.getCode({code_type_id: 'FIC'});

      const apiResult = await apiObject.getUserTypeInfo({user_no: userNo});

      setRequestData({
        ...requestData,
        investment: apiResult.user_prediction_money,
        userType:
          investmentTypeList.items[
            investmentTypeList.items.findIndex(item => item.code_id === apiResult.user_inverst_type_code_id)
          ],
        securitiesType: isEmpty(apiResult.user_stock_company_code_id)
          ? {code_id: '', code_type_information: ''}
          : investmentCompanyList.items[
              investmentCompanyList.items.findIndex(item => item.code_id === apiResult.user_stock_company_code_id)
            ],
        isFirstLeading: apiResult.is_consult,
      });

      setInvestmentTypeData(investmentTypeList.items);
      setInvestmentCompanyData(investmentCompanyList.items);
      setUserTypeData(apiResult);

      //console.log('success! : ', apiResult);
    } catch (error) {
      console.log('🚀 ~ _getTypeAndCompanyData= ~ error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  // 증권사 모달 관련
  const typeSnapPoints = useMemo(() => ['30%'], []);
  const companySnapPoints = useMemo(() => ['45%', '80%'], []);
  const refTypeBottomSheetModal = useRef(null);
  const refCompanyBottomSheetModal = useRef(null);
  const _renderInvestmentTypeList = ({item}) => (
    <TouchableOpacity
      style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: scale(10)}}
      onPress={() => {
        setRequestData({
          ...requestData,
          userType: {code_id: item.code_id, code_type_information: item.code_type_information},
        });
        refTypeBottomSheetModal.current.dismiss();
      }}>
      <Text
        style={{
          color: requestData.userType.code_id === item.code_id ? '#c01920' : '#999999',
          fontSize: scale(15),
          fontWeight: requestData.userType.code_id === item.code_id ? 'bold' : 'normal',
        }}>
        {item.code_type_information}
      </Text>
      {requestData.userType.code_id === item.code_id && (
        <Icon name="ios-checkmark-sharp" type="ionicon" size={scale(20)} color="#c01920" />
      )}
    </TouchableOpacity>
  );
  const _renderInvestmentCompanyList = ({item}) => (
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
        refCompanyBottomSheetModal.current.dismiss();
      }}
    />
  );

  useEffect(() => {
    _getTypeAndCompanyData();
  }, []);

  const _onChangeUserTypePress = async () => {
    try {
      await apiObject.editUserTypeInfo({
        user_inverst_type_code_id: requestData.userType.code_id,
        user_prediction_money: requestData.investment ? requestData.investment : 0,
        user_stock_company_code_id: requestData.securitiesType.code_id,
        is_consult: requestData.isFirstLeading,
      });

      Toast.showWithGravity('투자정보가 변경되었습니다.', Toast.SHORT, Toast.CENTER);
      props.navigation.goBack(null);
    } catch (error) {
      console.log('🚀 ~ _onChangeUserTypePress= ~ error', error);
      Toast.show('네트워크 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', Toast.SHORT);
    }
  };

  return (
    <BottomSheetModalProvider>
      <KeyboardAvoidingView style={{...styles.container}} behavior={isIOS() ? 'padding' : null}>
        <Header
          backgroundColor="transparent"
          statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'dark-content', animated: true}}
          leftComponent={{
            icon: 'ios-chevron-back',
            type: 'ionicon',
            size: scale(35),
            color: 'black',
            onPress: () => props.navigation.goBack(null),
          }}
          centerComponent={{text: '투자정보 설정', style: {fontSize: scale(21), fontWeight: 'bold'}}}
          centerContainerStyle={{justifyContent: 'center'}}
          placement="left"
          containerStyle={{borderBottomWidth: 0}}
        />
        <SafeAreaView style={{...styles.contents}}>
          <View style={{...styles.viewInner}}>
            <Text style={{...styles.txtLabel, marginBottom: scale(10)}}>타입 선택</Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomColor: '#dddddd',
                borderBottomWidth: scale(1),
                paddingBottom: scale(10),
                marginBottom: scale(15),
              }}
              onPress={() => refTypeBottomSheetModal.current.present()}>
              <Text style={{fontSize: scale(15)}}>{requestData.userType.code_type_information}</Text>
              <Icon name="ios-chevron-down" type="ionicon" color="#999999" size={scale(25)} />
            </TouchableOpacity>
            <Input
              label="예상 투자자금"
              labelStyle={{...styles.txtLabel}}
              placeholder="투자자금을 입력해주세요."
              placeholderTextColor="#dddddd"
              style={{fontSize: scale(15)}}
              containerStyle={{paddingHorizontal: 0}}
              value={addComma(requestData.investment ? requestData.investment : 0)}
              onChangeText={text => setRequestData({...requestData, investment: text.replace(/,/gi, '')})}
              keyboardType="number-pad"
            />
            <Text style={{...styles.txtLabel, marginBottom: scale(10)}}>이용 증권사</Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomColor: '#dddddd',
                borderBottomWidth: scale(1),
                paddingBottom: scale(10),
                marginBottom: scale(15),
              }}
              onPress={() => refCompanyBottomSheetModal.current.present()}>
              <Text style={{fontSize: scale(15)}}>{requestData.securitiesType.code_type_information}</Text>
              <Icon name="ios-chevron-down" type="ionicon" color="#999999" size={scale(25)} />
            </TouchableOpacity>
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
          </View>
        </SafeAreaView>
        <Button
          disabled={
            !(
              userTypeData.is_consult !== requestData.isFirstLeading ||
              userTypeData.user_inverst_type_code_id !== requestData.userType.code_id ||
              userTypeData.user_prediction_money !== requestData.investment ||
              userTypeData.user_stock_company_code_id !== requestData.securitiesType.code_id
            )
          }
          title="변경완료"
          titleStyle={{fontSize: scale(17), fontWeight: 'bold', color: 'white'}}
          containerStyle={{borderRadius: 0}}
          buttonStyle={{
            borderRadius: 0,
            paddingBottom: isIphoneX() ? getBottomSpace() : scale(20),
            paddingTop: scale(20),
            backgroundColor: 'black',
          }}
          onPress={_onChangeUserTypePress}
        />
        <BottomSheetModal
          ref={refTypeBottomSheetModal}
          index={0}
          snapPoints={typeSnapPoints}
          backdropComponent={backdropProps => <BottomSheetBackdrop {...backdropProps} />}>
          <BottomSheetFlatList
            data={investmentTypeData}
            keyExtractor={(item, flatListIndex) => `type_${flatListIndex}`}
            renderItem={_renderInvestmentTypeList}
            contentContainerStyle={{padding: scale(15)}}
          />
        </BottomSheetModal>
        <BottomSheetModal
          ref={refCompanyBottomSheetModal}
          index={0}
          snapPoints={companySnapPoints}
          backdropComponent={backdropProps => <BottomSheetBackdrop {...backdropProps} />}>
          <BottomSheetFlatList
            data={investmentCompanyData}
            keyExtractor={(item, flatListIndex) => `company_${flatListIndex}`}
            renderItem={_renderInvestmentCompanyList}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            contentContainerStyle={{padding: scale(15)}}
            numColumns={2}
          />
        </BottomSheetModal>
      </KeyboardAvoidingView>
    </BottomSheetModalProvider>
  );
};

export default ChangeUserType;

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
