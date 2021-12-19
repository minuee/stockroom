import React, {useContext} from 'react';
import LoadingContext from '../Context/LoadingContext';

const useLoading = () => {
  const loading = useContext(LoadingContext);

  return loading;
};
export default useLoading;
