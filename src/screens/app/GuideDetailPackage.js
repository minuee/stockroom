import React from 'react';
import {SafeAreaView, ScrollView, TouchableWithoutFeedback, View, Dimensions} from 'react-native';
import FastImage from 'react-native-fast-image';

const GuideDetailPackage = props => {
  const imgWidth = Dimensions.get('window').width;
  const imgHeight = imgWidth * 5.9;
  return (
    <ScrollView bounces={false}>
      <SafeAreaView
        style={{
          backgroundColor: '#f9f9f9',
        }}>
        <FastImage
          // source={require('../../../assets/images/drawable-xxxhdpi/guideDetailPackage.png')}
          source={require('../../../assets/images/drawable-xxxhdpi/guideDetailPackageV2.png')}
          style={{width: imgWidth, height: imgHeight}}
          resizeMode="contain"
        />
        <TouchableWithoutFeedback onPress={() => props.navigation.goBack()}>
          <View
            style={{
              width: 100,
              height: 200,
              position: 'absolute',
            }}
          />
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </ScrollView>
  );
};

export default GuideDetailPackage;
