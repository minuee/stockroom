import {createContext} from 'react';

const AlertContext = createContext({
  isVisible: false,
  title: 'TITLE',
  body: 'BODY',
  subBody: '',
  renderLeftBtn: false,
  leftBtnPress: () => {},
  leftBtnText: 'leftBtnText',
  btnPress: () => {},
  btnText: 'BtnText',
});

export default AlertContext;
