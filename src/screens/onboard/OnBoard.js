import React, {useRef, useState} from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';

import scale from '../../common/Scale';

import {Button} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import {TabView} from 'react-native-tab-view';

import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECTION_DATA = [
  {
    title: 'RSBC는 효율적인 매매가 가능해요!',
    content:
      'RSBC 검색식은 매매스타일에 따른 로직이 구분되어 있어\n투자자 맞춤형 로직 구성을 통해 효율적인 매매가 가능합니다.',
  },
  {
    title: '체험방을 통해 전문가 추천을 확인하세요!',
    content: '체험방 무료 체험 서비스를 제공하여,\n전문가가 실시간으로 추천하는 종목들을 확인할 수 있습니다.',
  },
  {
    title: '안전한 수익을 위해 지켜주세요!',
    content:
      '성급한 투자는 반드시 실패하기 마련입니다. 포착된 종목들은 동일한\n비율로 매수하여 리스크 관리를 해야 안전한 수익이 지속됩니다.',
  },
];

const OnBoard = props => {
  const refONE = useRef(null);
  const refTWO = useRef(null);
  const refTHREE = useRef(null);

  const [tabIndex, setTabIndex] = useState(0);
  const [tabRoutes] = useState([
    {key: 'one', title: 'ONE'},
    {key: 'two', title: 'TWO'},
    {key: 'three', title: 'THREE'},
  ]);

  const _renderTabs = ({route}) => {
    switch (route.key) {
      case 'one':
        return (
          <FastImage
            source={require('../../../assets/images/drawable-xxxhdpi/onboarding_phone_1.png')}
            style={{flex: 1, backgroundColor: '#262626'}}>
            <View style={{flex: 1}} />
            <Animatable.View ref={refONE} style={{flex: 1.5}} useNativeDriver={true}>
              <FastImage
                source={require('../../../assets/images/drawable-xxxhdpi/onboarding_1.png')}
                style={{flex: 1}}
                resizeMode={FastImage.resizeMode.contain}
              />
            </Animatable.View>
          </FastImage>
        );

      case 'two':
        return (
          <FastImage
            source={require('../../../assets/images/drawable-xxxhdpi/onboarding_phone_2.png')}
            style={{flex: 1, backgroundColor: '#262626'}}>
            <View style={{flex: 1}} />
            <Animatable.View ref={refTWO} style={{flex: 1.5}} useNativeDriver={true}>
              <FastImage
                source={require('../../../assets/images/drawable-xxxhdpi/onboarding_2.png')}
                style={{flex: 1}}
                resizeMode={FastImage.resizeMode.cover}
              />
            </Animatable.View>
          </FastImage>
        );

      case 'three':
        return (
          <FastImage
            source={require('../../../assets/images/drawable-xxxhdpi/onboarding_phone_3.png')}
            style={{flex: 1, backgroundColor: '#262626'}}>
            <View style={{flex: 1}} />
            <Animatable.View ref={refTHREE} style={{flex: 1.5}} useNativeDriver={true}>
              <FastImage
                source={require('../../../assets/images/drawable-xxxhdpi/onboarding_3.png')}
                style={{flex: 1}}
                resizeMode={FastImage.resizeMode.cover}
              />
            </Animatable.View>
          </FastImage>
        );
    }
  };

  const _onBackPress = () => {
    setTabIndex(tabIndex - 1);
    refONE.current.zoomIn(1000);
    refTWO.current.zoomIn(1000);
  };

  const _onNextPress = async () => {
    if (tabIndex === SECTION_DATA.length - 1) {
      await AsyncStorage.setItem('@stockRoom_WelcomeInvite', 'DONE');

      props.navigation.reset({routes: [{name: 'AuthMain'}]});
    } else {
      setTabIndex(tabIndex + 1);
      refTWO.current.zoomIn(1000);
      refTHREE.current.zoomIn(1000);
    }
  };

  return (
    <View style={{...styles.container}}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <TabView
        swipeEnabled={false}
        renderTabBar={() => null}
        navigationState={{index: tabIndex, routes: tabRoutes}}
        renderScene={_renderTabs}
        onIndexChange={setTabIndex}
      />
      <View style={{backgroundColor: 'white', padding: scale(15), marginBottom: getBottomSpace()}}>
        <Text style={{...styles.txtTitle}}>{SECTION_DATA[tabIndex].title}</Text>
        <Text style={{...styles.txtContent}}>{SECTION_DATA[tabIndex].content}</Text>
        <View style={{...styles.viewBtnArea}}>
          {tabIndex > 0 ? (
            <Button
              title="이전"
              titleStyle={{fontSize: scale(16), color: '#c01920', fontWeight: 'bold'}}
              type="clear"
              onPress={_onBackPress}
            />
          ) : (
            <View />
          )}
          <Button
            title={tabIndex === SECTION_DATA.length - 1 ? '서비스 시작하기' : '다음'}
            titleStyle={{fontSize: scale(16), color: '#c01920', fontWeight: 'bold'}}
            type="clear"
            onPress={_onNextPress}
          />
        </View>
      </View>
    </View>
  );
};

export default OnBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  txtTitle: {
    fontSize: scale(19),
    fontWeight: 'bold',
  },
  txtContent: {
    fontSize: scale(11),
    color: '#555555',
    marginVertical: scale(15),
  },
  viewBtnArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
