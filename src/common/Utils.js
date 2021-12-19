import {Dimensions, Platform} from 'react-native';

export const screenWidth = Math.round(Dimensions.get('window').width);

export const screenHeight = Math.round(Dimensions.get('window').height);

export const isIOS = () => {
  return Platform.OS === 'ios';
};

export const addComma = num => {
  let regexp = /\B(?=(\d{3})+(?!\d))/g;

  let parts = num.toString().split('.');

  return parts[0].replace(regexp, ',') + (parts[1] ? '.' + parts[1] : '');
};

export const getWeekCnt = (startDate, endDate) => {
  const day = 1000 * 60 * 60 * 24;
  const week = day * 7;
  return parseInt((endDate - startDate) / week, 10);
};

// '', null, undefinded, 빈객체{} 체크
export const isEmpty = str => {
  return (
    str === null ||
    str === undefined ||
    str === '' ||
    (typeof str === 'object' && Array.isArray(str) === false && Object.keys(str).length === 0)
  );
};

export const isEmptyArr = arr => {
  return Array.isArray(arr) && arr.length === 0;
};

export const changeTime = timestamp => {
  const tmpTime = new Date(timestamp * 1000);
  const timeNow = new Date();

  let hour =
    tmpTime.getHours() > 12
      ? `오후 ${tmpTime.getHours() - 12}`
      : tmpTime.getHours() === 0
      ? '오전 12'
      : `오전 ${tmpTime.getHours()}`;
  let minute = tmpTime.getMinutes().toString().length === 1 ? `0${tmpTime.getMinutes()}` : tmpTime.getMinutes();

  if (
    tmpTime.getFullYear() === timeNow.getFullYear() &&
    tmpTime.getMonth() + 1 === timeNow.getMonth() + 1 &&
    tmpTime.getDate() === timeNow.getDate()
  ) {
    return `${hour}:${minute}`;
  } else if (tmpTime.getFullYear() === timeNow.getFullYear() && tmpTime.getMonth() + 1 === timeNow.getMonth() + 1) {
    return `${tmpTime.getMonth() + 1}월 ${tmpTime.getDate()}일`;
  } else {
    return `${tmpTime.getFullYear()}. ${tmpTime.getMonth() + 1}. ${tmpTime.getDate()}`;
  }
};

export const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
  const paddingToBottom = 10;
  return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
};

export const timeForToday = value => {
  const today = new Date();
  const timeValue = new Date(value * 1000);

  const betweenTime = Math.floor((today.getTime() - timeValue.getTime()) / 1000 / 60);
  if (betweenTime < 1) {
    return '방금 전';
  }
  if (betweenTime < 60) {
    return `${betweenTime}분 전`;
  }

  const betweenTimeHour = Math.floor(betweenTime / 60);
  if (betweenTimeHour < 24) {
    return `${betweenTimeHour}시간 전`;
  }

  const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
  if (betweenTimeDay < 365) {
    return `${betweenTimeDay}일 전`;
  }
  // if (betweenTimeDay === 1) {
  //   return '어저께';
  // }
  // if (betweenTimeDay === 2) {
  //   return '그저께';
  // }

  return `${Math.floor(betweenTimeDay / 365)}년 전`;
  // return `${timeValue.getFullYear()}. ${timeValue.getMonth() + 1}. ${timeValue.getDate()}`;
};

export const YYYYMMDDHHMM = timestamp => {
  const timeValue = new Date(timestamp * 1000);

  return `${timeValue.getFullYear()}. ${timeValue.getMonth() + 1}. ${timeValue.getDate()} ${twoLength(
    timeValue.getHours()
  )}:${twoLength(timeValue.getMinutes())}`;
};

export const YYYYMMDD = timestamp => {
  const timeValue = new Date(timestamp * 1000);

  return `${timeValue.getFullYear()}. ${timeValue.getMonth() + 1}. ${timeValue.getDate()}`;
};

export const twoLength = num => {
  return (num < 10 ? '0' : '') + num;
};

export const getAge = birthDay => {
  const today = new Date();
  const birthDate = new Date(birthDay * 1000);

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const _chkEmail = text => {
  if (/^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/.test(text) && text !== '') {
    return true;
  } else {
    return false;
  }
};

export const _chkPwd = text => {
  if (
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()_+|<>?:{}`~=.,^/])[A-Za-z\d~!@#$%^&*()_+|<>?:{}`~=.,^/]{8,16}$/.test(
      text
    ) &&
    text !== ''
  ) {
    return true;
  } else {
    return false;
  }
};

export const _chkPhone = text => {
  if (/(01[016789])([1-9]{1}[0-9]{2,3})([0-9]{4})$/.test(text) && text !== '') {
    return true;
  } else {
    return false;
  }
};
