import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Keyboard} from 'react-native';

import scale from '../../common/Scale';
import {isEmpty} from '../../common/Utils';

import PropTypes from 'prop-types';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';

const Alert = ({
  isVisible,
  type,
  title,
  body,
  subBody,
  renderLeftBtn,
  leftBtnPress,
  leftBtnText,
  btnPress,
  btnText,
  alertClose,
}) => {
  return (
    <Modal
      isVisible={isVisible}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      style={{...styles.container}}
      statusBarTranslucent={true}>
      <View style={{...styles.viewAlertArea}}>
        {type === 'info' && (
          <FastImage
            source={require('../../../assets/images/drawable-xxxhdpi/alert_information_mark.png')}
            style={{...styles.imgType}}
          />
        )}
        {type === 'check' && (
          <FastImage
            source={require('../../../assets/images/drawable-xxxhdpi/alert_check_mark.png')}
            style={{...styles.imgType}}
          />
        )}
        <Text style={{...styles.txtTitle}} numberOfLines={1}>
          {title}
        </Text>
        <Text style={{...styles.txtBody}}>{body}</Text>
        {!isEmpty(subBody) && <Text style={{...styles.txtSubBody}}>{subBody}</Text>}
        <View style={{...styles.viewButtonArea, justifyContent: renderLeftBtn ? 'space-between' : 'center'}}>
          {renderLeftBtn && (
            <TouchableOpacity
              style={{...styles.viewButton, backgroundColor: '#555555'}}
              onPress={() => {
                leftBtnPress();
                alertClose();
              }}>
              <Text style={{...styles.tchTitle}}>{leftBtnText}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{...styles.viewButton}}
            onPress={() => {
              btnPress();
              alertClose();
            }}>
            <Text style={{...styles.tchTitle}}>{btnText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default Alert;

Alert.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  type: PropTypes.string,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  subBody: PropTypes.string,
  renderLeftBtn: PropTypes.bool,
  leftBtnPress: PropTypes.func,
  leftBtnText: PropTypes.string,
  btnPress: PropTypes.func.isRequired,
  btnText: PropTypes.string.isRequired,
};

Alert.defaultProps = {
  isVisible: false,
  type: 'none',
  title: 'TITLE',
  body: 'BODY',
  renderLeftBtn: false,
  leftBtnPress: () => console.log('Left Button Press'),
  leftBtnText: 'leftBtnText',
  btnPress: () => console.log('Button Press'),
  btnText: 'BtnText',
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  viewAlertArea: {
    backgroundColor: 'white',
    width: '95%',
    paddingVertical: scale(25),
    paddingHorizontal: scale(15),
    borderRadius: scale(5),
    minHeight: scale(200),
    justifyContent: 'center',
  },
  txtTitle: {
    textAlign: 'center',
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#222222',
    marginVertical: scale(10),
  },
  txtBody: {
    textAlign: 'center',
    fontSize: scale(14),
    color: '#222222',
    marginBottom: scale(15),
  },
  txtSubBody: {
    textAlign: 'center',
    fontSize: scale(10),
    color: '#999999',
    marginTop: scale(8),
  },
  viewButtonArea: {
    flexDirection: 'row',
  },
  viewButton: {
    width: '48%',
    backgroundColor: '#c01920',
    borderRadius: scale(5),
    alignItems: 'center',
    paddingVertical: scale(13),
  },
  tchTitle: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: 'white',
  },
  imgType: {
    width: scale(25),
    height: scale(25),
    alignSelf: 'center',
  },
});
