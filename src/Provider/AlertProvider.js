import React, {useState} from 'react';
import AlertContext from '../Context/AlertContext';
import Alert from '../screens/common/Alert';

const initialState = {
  isVisible: false,
  type: 'none',
  title: 'TITLE',
  body: 'BODY',
  subBody: '',
  renderLeftBtn: false,
  leftBtnPress: () => {},
  leftBtnText: 'leftBtnText',
  btnPress: () => {},
  btnText: 'BtnText',
};

const AlertProvider = ({children}) => {
  const [alertState, setAlertState] = useState(initialState);

  const alert = ({type, title, body, subBody, renderLeftBtn, leftBtnPress, leftBtnText, btnPress, btnText}) => {
    setAlertState({
      isVisible: true,
      type,
      title,
      body,
      subBody,
      renderLeftBtn,
      leftBtnPress,
      leftBtnText,
      btnPress,
      btnText,
    });
  };

  const alertClose = () => {
    setAlertState(initialState);
  };

  return (
    <>
      <AlertContext.Provider value={alert}>{children}</AlertContext.Provider>
      <Alert {...alertState} alertClose={alertClose} />
    </>
  );
};

export default AlertProvider;
