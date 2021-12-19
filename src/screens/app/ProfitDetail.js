import React, {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';

import scale from '../../common/Scale';
import {apiObject} from '../../common/API';
import {changeTime} from '../../common/Utils';

import {Divider, Header} from 'react-native-elements';
import YoutubePlayer from 'react-native-youtube-iframe';
import FastImage from 'react-native-fast-image';
import ImageModal from 'react-native-image-modal';

const ProfitDetail = props => {
  const PROFIT_DATA = props.route.params.PROFIT_DATA;

  const _getProfitDetail = async () => {
    try {
      await apiObject.getProfitDetail({no: PROFIT_DATA.profit_cert_no});
    } catch (error) {
      console.log('🚀 ~ _getProfitDetail= ~ error', error);
    }
  };

  useEffect(() => {
    _getProfitDetail();
  }, []);

  const _renderContent = () => {
    switch (PROFIT_DATA.profit_cert_code_id) {
      case 'YOUTUBE':
        return <YoutubePlayer height={scale(250)} videoId={PROFIT_DATA.profit_cert_url_youtube_id} />;

      case 'IMAGE':
        return (
          <FastImage
            source={{uri: PROFIT_DATA.profit_cert_image.image_full_file_path}}
            style={{width: '100%', height: scale(300)}}
            resizeMode={FastImage.resizeMode.contain}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={{...styles.container}}>
      <Header
        backgroundColor="transparent"
        statusBarProps={{translucent: true, backgroundColor: 'transparent', barStyle: 'dark-content', animated: true}}
        leftComponent={{
          icon: 'ios-chevron-back',
          type: 'ionicon',
          size: scale(40),
          color: 'black',
          onPress: () => props.navigation.goBack(null),
        }}
        centerComponent={<Text style={{fontSize: scale(18)}}>{PROFIT_DATA.profit_cert_title}</Text>}
        centerContainerStyle={{justifyContent: 'center'}}
        containerStyle={{borderBottomWidth: 0}}
        placement="left"
      />
      <SafeAreaView style={{...styles.contents}}>
        <ScrollView>
          <View style={{...styles.viewInner}}>
            <Text style={{fontSize: scale(12), color: '#999999'}}>
              {changeTime(+new Date(PROFIT_DATA.create_at) / 1000)} • 조회{' '}
              {Number(PROFIT_DATA.profit_cert_view_count) + 1}회
            </Text>
            <Divider style={{marginVertical: scale(10)}} />
            {_renderContent()}
            <Text style={{fontSize: scale(14), color: '#555555'}}>{PROFIT_DATA.profit_cert_content}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ProfitDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {
    flex: 1,
  },
  viewInner: {
    padding: scale(15),
    paddingTop: 0,
  },
});
