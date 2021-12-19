import React, {useCallback, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, StatusBar} from 'react-native';
import scale from '../../common/Scale';

import {Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import {TabView, TabBar} from 'react-native-tab-view';
import Animated from 'react-native-reanimated';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';

import {apiObject} from '../../common/API';
import useLoading from '../../Hooks/useLoading';

import HomeTab from './HomeTab';
import ConfirmProfitTab from './ConfirmProfitTab';
import RHC_TV_Tab from './RHC_TV_Tab';
import GuideBookTab from './GuideBookTab';
import ReferenceTab from './ReferenceTab';
import useUserInfo from '../../Hooks/useUserInfo';

const routesFree = [
  {key: 'one', title: 'HOME'},
  {key: 'two', title: '가이드북'},
  {key: 'three', title: 'RHC TV'},
  {key: 'four', title: '수익인증'},
];

const routesPayed = [
  {key: 'one', title: 'HOME'},
  {key: 'two', title: '가이드북'},
  {key: 'three', title: 'RHC TV'},
  {key: 'four', title: '수익인증'},
  {key: 'five', title: '자료실'},
];

const AppMain = props => {
  const {isLoading, setIsLoading} = useLoading();

  // TabView 관련
  const [tabIndex, setTabIndex] = useState(0);
  const {userType} = useUserInfo();
  const [routes, setRoutes] = useState(userType === '유료회원' ? routesPayed : routesFree);
  // const [routes, setRoutes] = useState(routesPayed);

  // 애니메이션 Header 관련
  const [headerHeight, setHeaderHeight] = useState(60);
  const [isDeadLine, setIsDeadLine] = useState(false);

  const [profitsList, setProfitsList] = useState({items: [], current_page: 0, next_token: undefined});

  const scrollY = useRef(new Animated.Value(0)).current;
  const diffClampScrollY = Animated.diffClamp(scrollY, 0, headerHeight + getStatusBarHeight());
  const translateY = Animated.interpolate(diffClampScrollY, {
    inputRange: [0, headerHeight + getStatusBarHeight()],
    outputRange: [0, -(headerHeight + getStatusBarHeight())],
  });
  const paddingTopY = Animated.interpolate(diffClampScrollY, {
    inputRange: [0, headerHeight + getStatusBarHeight()],
    outputRange: [headerHeight + getStatusBarHeight(), getStatusBarHeight()],
  });

  const _headerOnLayout = useCallback(event => {
    const {height} = event.nativeEvent.layout;
    setHeaderHeight(height);
  }, []);

  // TabView 랜더링
  const _renderTabs = ({route}) => {
    switch (route.key) {
      case 'one':
        return <HomeTab navigation={props.navigation} tabIndex={tabIndex} />;
      case 'two':
        return <GuideBookTab navigation={props.navigation} tabIndex={tabIndex} />;
      case 'three':
        return <RHC_TV_Tab navigation={props.navigation} tabIndex={tabIndex} />;
      case 'four':
        return <ConfirmProfitTab navigation={props.navigation} profitsList={profitsList} tabIndex={tabIndex} />;
      case 'five':
        return <ReferenceTab navigation={props.navigation} profitsList={profitsList} tabIndex={tabIndex} />;
      default:
        return;
    }
  };

  // useEffect(() => {

  // }, []);

  return (
    <View style={{...styles.container}}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <Animated.View style={{...styles.viewCustomHeader(translateY)}} onLayout={_headerOnLayout}>
        <TouchableOpacity style={{padding: 10}} onPress={() => props.navigation.navigate('MenuMain')}>
          <Icon name="ios-menu" type="ionicon" size={scale(30)} />
        </TouchableOpacity>
        <View style={{flex: 1, padding: 10}}>
          <FastImage
            source={require('../../../assets/images/drawable-xxxhdpi/rhc_logo.png')}
            style={{width: scale(70.5), height: scale(31)}}
          />
        </View>
        <TouchableOpacity style={{padding: 10}} onPress={() => props.navigation.navigate('Inquire')}>
          <FastImage
            source={
              isDeadLine
                ? require('../../../assets/images/drawable-xxxhdpi/alarm_icon.png')
                : require('../../../assets/images/drawable-xxxhdpi/help_icon.png')
            }
            style={{width: scale(40), height: scale(40)}}
          />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={{flex: 1, paddingTop: paddingTopY, backgroundColor: 'white'}}>
        <TabView
          swipeEnabled={false}
          navigationState={{index: tabIndex, routes}}
          renderScene={_renderTabs}
          renderTabBar={tabProps => (
            <TabBar
              {...tabProps}
              style={{backgroundColor: 'white', elevation: 0}}
              tabStyle={{paddingVertical: scale(10), paddingHorizontal: 0, width: scale(92)}}
              scrollEnabled={true}
              renderLabel={({route, focused}) => (
                <Text
                  style={{
                    fontSize: scale(16),
                    color: focused ? 'black' : '#888888',
                    fontWeight: 'bold',
                  }}>
                  {route.title}
                </Text>
              )}
              indicatorStyle={{backgroundColor: '#c01920', height: scale(3)}}
            />
          )}
          onIndexChange={setTabIndex}
        />
      </Animated.View>
    </View>
  );
};

export default AppMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  viewCustomHeader: translateY => ({
    position: 'absolute',
    zIndex: 999,
    backgroundColor: 'white',
    transform: [{translateY: translateY}],
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getStatusBarHeight(),
  }),
});
