import React from 'react';
import {View} from 'react-native-animatable';

import FastImage from 'react-native-fast-image';
import scale from '../../common/Scale';
import {useKeyboardStatus} from '../../Hooks/useKeyboardStatus';

const BannerImage = () => {
  const isOpen = useKeyboardStatus();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        padding: 30,
      }}>
      {!isOpen && (
        <FastImage
          source={require('../../../assets/images/drawable-xxxhdpi/er-banner2.png')}
          style={{
            width: scale(320),
            height: scale(107),
          }}
        />
      )}
    </View>
  );
};

export default BannerImage;
