import React from 'react';
import {createStackNavigator, CardStyleInterpolators, TransitionPresets} from '@react-navigation/stack';

import AuthMain from './auth/AuthMain';
import Consent from './auth/Consent';
import ResetPass from './auth/ResetPass';
import SignUp from './auth/SignUp';
import SignUpDone from './auth/SignUpDone';

import PP from './menu/PP';
import TOS from './menu/TOS';

import OnBoard from './onboard/OnBoard';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="AuthMain" screenOptions={{headerShown: false}}>
      <Stack.Screen name="AuthMain" component={AuthMain} />
      <Stack.Screen
        name="Consent"
        component={Consent}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
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
        name="ResetPass"
        component={ResetPass}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="SignUpDone"
        component={SignUpDone}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
      <Stack.Screen
        name="OnBoard"
        component={OnBoard}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid, // 페이지 전환 효과
          // ...TransitionPresets.ModalPresentationIOS, // 모달 전환 효과
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
