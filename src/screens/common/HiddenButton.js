import React, {useCallback, useEffect, useState} from 'react';
import {Button, Divider, Header, Icon} from 'react-native-elements';
import {TouchableWithoutFeedback} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const HiddenButton = props => {
  const [isOnPressCount, setIsOnPressCount] = useState(0);
  const navigation = useNavigation();

  return (
    <Button
      {...props}
      activeOpacity={0}
      title=""
      onPress={() => {
        setIsOnPressCount(n => n + 1);
      }}
      onLongPress={() => {
        if (isOnPressCount > 3) {
          navigation.navigate('Check');
        }

        setIsOnPressCount(0);
      }}
      TouchableComponent={TouchableWithoutFeedback}
    />
  );
};

export default HiddenButton;
