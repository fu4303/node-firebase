import React, { useEffect, useState } from 'react';

import axios from 'axios';

import { navigate } from '../../history';
import { auth } from '../../config/firebase';
import { API_URL } from '../../constants';

import AuthContext from './context';

const AuthProvider = ({ children }) => {
  const [error, setError] = useState({
    message: '',
    isError: false,
    links: false
  });
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  const [userData, setUserData] = useState(null);
  const [authUser, setAuthUser] = useState(localStorage.getItem('user_id'));

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log({ user }, 'user-----');

      //   if (user) {
      //   } else {
      //   }
    });
    return () => unsubscribe();
  }, []);

  const setAuth = (token, user, email) => {
    setAuthToken(token);
    setAuthUser(user);
  };

  const removeAuth = () => {
    // setAuthToken(null);
    // setAuthUser(null);
  };

  const signIn = async values => {
    try {
      await auth.signInWithEmailAndPassword(values.email, values.password);

      await verifyToken();
    } catch (error) {
      handleErrorMessages(error);
    }
  };

  const signUp = async values => {
    try {
      const response = await auth.createUserWithEmailAndPassword(
        values.email,
        values.password
      );

      await axios.post(`${API_URL}/auth/signup`, {
        userId: response.user.uid,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName
      });

      await verifyToken();
    } catch (error) {
      handleErrorMessages(error);
    }
  };

  const signOut = async () => {
    try {
      await axios.post(`${API_URL}/auth/signout`);
      await auth.signOut();
      removeAuth();
    } catch (error) {
      handleErrorMessages(error);
    }
  };

  const handleErrorMessages = error => {
    console.log({ error });

    // setError({
    //   message:
    //     'Your session timed out. Please refresh the browser and try again.',
    //   isError: true,
    //   link: true
    // });
  };

  const verifyToken = async () => {
    try {
      const idToken = await getIdToken(true);

      return await axios.post(`${API_URL}/auth/session`, {
        idToken
      });
    } catch (error) {
      return error;
    }
  };

  const getIdToken = () => {
    try {
      return auth.currentUser.getIdToken();
    } catch (error) {
      return error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
