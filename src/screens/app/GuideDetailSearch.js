import React from 'react';
import {SafeAreaView, ScrollView, TouchableWithoutFeedback, View, Dimensions} from 'react-native';
import FastImage from 'react-native-fast-image';

const GuideDetailSearch = props => {
  const imgWidth = Dimensions.get('window').width;
  const imgHeight = imgWidth * 6.23;
  return (
    <ScrollView bounces={false}>
      <SafeAreaView>
        <FastImage
          // source={require('../../../assets/images/drawable-xxxhdpi/guideDetailSearch.png')}
          source={require('../../../assets/images/drawable-xxxhdpi/guideDetailSearchV2.png')}
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

export default GuideDetailSearch;
