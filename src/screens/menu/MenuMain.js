import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import scale from '../../common/Scale';

import useAlert from '../../Hooks/useAlert';
import useUserInfo from '../../Hooks/useUserInfo';

import {Button, Divider, Header, Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import {getBottomSpace, isIphoneX} from 'react-native-iphone-x-helper';
import {TabView} from 'react-native-tab-view';

import {Auth, AuthType} from '@psyrenpark/auth';
import {apiObject} from '../../common/API';
import {isEmptyArr} from '../../common/Utils';
import HiddenButton from '../common/HiddenButton';

const MenuMain = props => {
  const alert = useAlert();
  const {resetUserInfo, userName} = useUserInfo();

  const [dataList, setDataList] = useState({tap0: [], tap1: []});
  const [tabIndex, setTabIndex] = useState(0);
  const [routes] = useState([
    {key: 'one', title: 'ONE'},
    {key: 'two', title: 'TWO'},
  ]);

  const _onSignOutPress = useCallback(() => {
    alert({
      type: 'info',
      title: '정말 로그아웃 할까요?',
      body: '로그아웃을 하면 서비스 이용과\n푸시알림 이용이 불가합니다.',
      btnText: '로그아웃',
      renderLeftBtn: true,
      leftBtnText: '취소',
      btnPress: () => _signOut(),
    });
  }, []);

  const _signOut = async () => {
    Auth.signOutProcess(
      {
        authType: AuthType.EMAIL,
      },
      async success => {
        resetUserInfo();
      },
      error => {
        console.log('_signOut -> error', error);
      }
    );
  };

  const _getMenuMainBannerInfo = async () => {
    try {
      const apiResult = await apiObject.getMenuMainBannerInfo();

      setDataList(apiResult);
    } catch (error) {
      console.log('🚀 ~ _getMenuMainBannerInfo= ~ error', error);
      setDataList({tap0: [], tap1: []});
    }
  };

  const _renderTabs = ({route}) => {
    switch (route.key) {
      case 'one':
        return (
          <View style={{flex: 1, justifyContent: 'space-evenly', alignItems: 'center'}}>
            <Text style={{...styles.txt_0_0}}>{dataList.tap0[0]}</Text>
            <Text style={{...styles.txt_0_1}}>{dataList.tap0[1]}</Text>
            <Text style={{...styles.txt_0_2, textAlign: 'center'}}>{dataList.tap0[2]}</Text>
            <Text style={{...styles.txt_0_3}}>{dataList.tap0[3]}</Text>
          </View>
        );

      case 'two':
        return (
          <View style={{flex: 1, justifyContent: 'space-evenly', alignItems: 'center'}}>
            <Text style={{...styles.txt_0_0}}>{dataList.tap1[0]}</Text>
            <Text style={{...styles.txt_1_1_0}}>
              {dataList.tap1[1][0]}
              <Text style={{...styles.txt_1_1_1}}>{dataList.tap1[1][1]}</Text>
            </Text>
            <Text style={{...styles.txt_1_1_0}}>
              {dataList.tap1[2][0]}
              <Text style={{...styles.txt_1_1_1}}>{dataList.tap1[2][1]}</Text>
            </Text>
            <Text style={{...styles.txt_1_1_0}}>
              {dataList.tap1[3][0]}
              <Text style={{...styles.txt_1_1_1}}>{dataList.tap1[3][1]}</Text>
            </Text>
          </View>
        );
    }
  };

  useEffect(() => {
    _getMenuMainBannerInfo();
  }, []);

  return (
    <View style={{...styles.container}}>
      <Header
        backgroundColor="transparent"
        statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'dark-content', animated: true}}
        centerComponent={
          <FastImage
            source={require('../../../assets/images/drawable-xxxhdpi/rhc_logo.png')}
            style={{width: scale(75), height: scale(33)}}
          />
        }
        placement="left"
        rightComponent={{
          icon: 'ios-close-outline',
          type: 'ionicon',
          size: scale(40),
          color: 'black',
          onPress: () => props.navigation.goBack(null),
        }}
        containerStyle={{borderBottomWidth: 0}}
      />
      <SafeAreaView style={{...styles.contents}}>
        <View style={{...styles.viewInner}}>
          <TouchableOpacity onPress={() => props.navigation.navigate('MyPage')}>
            <Text style={{...styles.txtUserName}}>
              <Text style={{fontWeight: 'bold'}}>{userName}</Text>
              {'님 >'}
            </Text>
          </TouchableOpacity>
          {!isEmptyArr(dataList.tap0) && !isEmptyArr(dataList.tap1) && (
            <View style={{marginTop: scale(15), height: scale(145)}}>
              <FastImage
                source={require('../../../assets/images/drawable-xxxhdpi/menu_benner_background.png')}
                style={{flex: 1, paddingHorizontal: scale(10)}}
                resizeMode={FastImage.resizeMode.contain}>
                <TabView
                  swipeEnabled={true}
                  navigationState={{index: tabIndex, routes}}
                  renderScene={_renderTabs}
                  renderTabBar={() => null}
                  onIndexChange={setTabIndex}
                />
              </FastImage>
            </View>
          )}
          <Divider style={{marginVertical: scale(15)}} />
          <View style={{...styles.viewMenuLabel}}>
            <Icon name="ios-grid-sharp" type="ionicon" size={scale(13)} style={{marginRight: scale(5)}} />
            <Text style={{fontSize: scale(14), color: '#555555', fontWeight: 'bold'}}>MENU</Text>
          </View>
          <View style={{...styles.viewMenuArea}}>
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity onPress={() => props.navigation.goBack(null)}>
                <FastImage
                  source={require('../../../assets/images/drawable-xxxhdpi/home_icon.png')}
                  style={{...styles.imgMenu}}
                />
              </TouchableOpacity>
              <Text style={{...styles.txtMenu}}>HOME</Text>
            </View>
            {/* <View style={{alignItems: 'center'}}>
              <TouchableOpacity>
                <FastImage
                  source={require('../../../assets/images/drawable-xxxhdpi/guide_icon.png')}
                  style={{...styles.imgMenu}}
                />
              </TouchableOpacity>
              <Text style={{...styles.txtMenu}}>가이드북</Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity>
                <FastImage
                  source={require('../../../assets/images/drawable-xxxhdpi/rhc_tv_icon.png')}
                  style={{...styles.imgMenu}}
                />
              </TouchableOpacity>
              <Text style={{...styles.txtMenu}}>RHC TV</Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity>
                <FastImage
                  source={require('../../../assets/images/drawable-xxxhdpi/stock_icon.png')}
                  style={{...styles.imgMenu}}
                />
              </TouchableOpacity>
              <Text style={{...styles.txtMenu}}>수익인증</Text>
            </View> */}
          </View>
          <Divider style={{marginVertical: scale(15)}} />
          <View style={{...styles.viewMenuLabel}}>
            <Icon name="ios-headset" type="ionicon" size={scale(13)} style={{marginRight: scale(5)}} />
            <Text style={{fontSize: scale(14), color: '#555555', fontWeight: 'bold'}}>상담문의</Text>
          </View>
          <TouchableOpacity onPress={() => props.navigation.navigate('Inquire')}>
            <Text style={{textDecorationLine: 'underline', color: '#c01920', fontSize: scale(15), fontWeight: 'bold'}}>
              문의하기 ⇀
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <View style={{...styles.viewAround}}>
        <Button
          title="공지사항"
          titleStyle={{fontSize: scale(15), color: '#eeeeee'}}
          type="clear"
          buttonStyle={{paddingVertical: scale(20)}}
          containerStyle={{width: '25%'}}
          onPress={() => props.navigation.navigate('Notice')}
        />
        <Button
          title="로그아웃"
          titleStyle={{fontSize: scale(15), color: '#eeeeee'}}
          type="clear"
          buttonStyle={{paddingVertical: scale(20)}}
          containerStyle={{width: '25%'}}
          onPress={_onSignOutPress}
        />
        <HiddenButton
          titleStyle={{fontSize: scale(15), color: '#eeeeee'}}
          type="clear"
          buttonStyle={{paddingVertical: scale(20)}}
          containerStyle={{width: '25%'}}
        />
      </View>
    </View>
  );
};

export default MenuMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewInner: {
    paddingHorizontal: scale(15),
  },
  txtUserName: {
    fontSize: scale(28),
  },
  viewMenuLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  viewMenuArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imgMenu: {
    width: scale(60),
    height: scale(60),
  },
  txtMenu: {
    fontSize: scale(13),
  },
  viewAround: {
    backgroundColor: '#c01920',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    ...(isIphoneX() && {paddingBottom: getBottomSpace()}),
  },
  txt_0_0: {
    backgroundColor: 'black',
    borderRadius: scale(11.5),
    fontSize: scale(11),
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: scale(5),
  },
  txt_0_1: {
    fontSize: scale(11),
    color: '#555555',
  },
  txt_0_2: {
    fontSize: scale(12),
    fontWeight: 'bold',
    color: 'black',
  },
  txt_0_3: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#c01920',
  },
  txt_1_1_0: {
    fontSize: scale(15),
    color: 'black',
  },
  txt_1_1_1: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#c01920',
  },
});
