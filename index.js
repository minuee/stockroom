import 'react-native-gesture-handler';

import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import AlertProvider from './src/Provider/AlertProvider';
import LoadingProvider from './src/Provider/LoadingProvider';
import UserInfoProvider from './src/Provider/UserInfoProvider';

import {Auth} from '@psyrenpark/auth';
import {Api} from '@psyrenpark/api';
import {Storage} from '@psyrenpark/storage';
import awsmobile from './aws-exports-user';

Auth.setConfigure(awsmobile);
Api.setConfigure(awsmobile);
Storage.setConfigure(awsmobile);

const index = () => {
  return (
    <LoadingProvider>
      <AlertProvider>
        <UserInfoProvider>
          <App />
        </UserInfoProvider>
      </AlertProvider>
    </LoadingProvider>
  );
};

AppRegistry.registerComponent(appName, () => index);
