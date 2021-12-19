import React from 'react';
import {createStackNavigator, CardStyleInterpolators, TransitionPresets} from '@react-navigation/stack';

import AppMain from './app/AppMain';
import LinkingDetail from './app/LinkingDetail';
import ProfitDetail from './app/ProfitDetail';
import RHC_Detail from './app/RHC_Detail';
import ReferenceDetail from './app/ReferenceDetail';

import GuideDetailSearch from './app/GuideDetailSearch';
import GuideDetailPackage from './app/GuideDetailPackage';
import GuideDetailCaution from './app/GuideDetailCaution';

import MenuMain from './menu/MenuMain';
import Notice from './menu/Notice';
import Notification from './menu/Notification';
import BlockList from './menu/BlockList';
import MyPage from './menu/MyPage';
import ChangeNickName from './menu/ChangeNickName';
import ChangePass from './menu/ChangePass';
import ChangePhone from './menu/ChangePhone';
import ChangeUserType from './menu/ChangeUserType';
import Inquire from './menu/Inquire';
import PP from './menu/PP';
import TOS from './menu/TOS';

import ChatMain from './chat/ChatMain';

import ChartMain from './chart/ChartMain';
import Check from './test/check';

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator initialRouteName="AppMain" screenOptions={{headerShown: false}}>
      <Stack.Screen name="AppMain" component={AppMain} />
      <Stack.Screen
        name="MenuMain"
        component={MenuMain}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="Notice"
        component={Notice}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="Notification"
        component={Notification}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="BlockList"
        component={BlockList}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="MyPage"
        component={MyPage}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="LinkingDetail"
        component={LinkingDetail}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="ProfitDetail"
        component={ProfitDetail}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="RHC_Detail"
        component={RHC_Detail}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="ReferenceDetail"
        component={ReferenceDetail}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />

      <Stack.Screen
        name="GuideDetailSearch"
        component={GuideDetailSearch}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="GuideDetailPackage"
        component={GuideDetailPackage}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="GuideDetailCaution"
        component={GuideDetailCaution}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />

      <Stack.Screen
        name="ChangeNickName"
        component={ChangeNickName}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="ChangePass"
        component={ChangePass}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="ChangePhone"
        component={ChangePhone}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="ChangeUserType"
        component={ChangeUserType}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="Inquire"
        component={Inquire}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="PP"
        component={PP}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="TOS"
        component={TOS}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="ChatMain"
        component={ChatMain}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="ChartMain"
        component={ChartMain}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="Check"
        component={Check}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
