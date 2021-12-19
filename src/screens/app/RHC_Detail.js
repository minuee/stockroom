import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';

import scale from '../../common/Scale';

import {Divider, Header} from 'react-native-elements';
import YoutubePlayer from 'react-native-youtube-iframe';

const RHC_Detail = props => {
  const RHC_DATA = props.route.params.RHC_DATA;
  console.log('*** RHC_DATA : ', props.route.params.RHC_DATA);
  const _renderContent = () => {
    // switch (RHC_DATA.rhc_tv_code_id) {
    //   case 'YOUTUBE':
    //     return <YoutubePlayer height={scale(250)} videoId={RHC_DATA.rhc_tv_url_youtube_id} />;

    //   case 'IMAGE':
    //     return (
    //       <FastImage
    //         source={{uri: RHC_DATA.rhc_tv_url_thumbnail}}
    //         style={{width: '100%', height: scale(300)}}
    //         resizeMode={FastImage.resizeMode.contain}
    //       />
    //     );

    //   default:
    //     return null;
    // }
    return <YoutubePlayer height={scale(250)} videoId={RHC_DATA.rhc_tv_url_youtube_id} />;
  };

  return (
    <View style={{...styles.container}}>
      <View>
        <Header
          backgroundColor="transparent"
          statusBarProps={{
            translucent: true,
            backgroundColor: 'transparent',
            barStyle: 'dark-content',
            animated: true,
          }}
          leftComponent={{
            icon: 'ios-chevron-back',
            type: 'ionicon',
            size: scale(40),
            color: 'black',
            onPress: () => props.navigation.goBack(null),
          }}
          centerComponent={<Text style={{fontSize: scale(18)}}>{RHC_DATA.rhc_tv_title}</Text>}
          centerContainerStyle={{justifyContent: 'center'}}
          containerStyle={{borderBottomWidth: 0}}
          placement="left"
        />
        <SafeAreaView style={{...styles.contents}}>
          <ScrollView>
            <View style={{...styles.viewInner}}>
              <Text style={{fontSize: scale(12), color: '#999999'}}>
                {RHC_DATA.update_at.slice(0, 10).split('-').join('.')} • 조회 {Number(RHC_DATA.rhc_tv_view_count) + 1}회
              </Text>

              <Divider style={{marginVertical: scale(10)}} />
              {_renderContent()}
              <Text style={{fontSize: scale(14), color: '#555555'}}>{RHC_DATA.rhc_tv_content}</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
};

export default RHC_Detail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contents: {},
  viewInner: {
    padding: scale(15),
    paddingTop: 0,
  },
});
