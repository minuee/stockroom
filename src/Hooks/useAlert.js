import React, {useContext} from 'react';
import AlertContext from '../Context/AlertContext';

const useAlert = () => {
  const alert = useContext(AlertContext);

  return alert;
};
export default useAlert;
