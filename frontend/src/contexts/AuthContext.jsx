import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Socket.io connection lifecycle based on authentication status
  useEffect(() => {
    let activeSocket = null;
    
    if (token && user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      activeSocket = io(socketUrl, {
        transports: ['websocket'],
        withCredentials: true
      });

      activeSocket.on('connect', () => {
        console.log('[Socket] Connected to real-time notification server');
        // Join private channel for direct notifications
        activeSocket.emit('join_user_notifications', user.id);
      });

      setSocket(activeSocket);
    } else {
      setSocket(null);
    }

    // Clean up socket on logout or token changes
    return () => {
      if (activeSocket) {
        activeSocket.disconnect();
        console.log('[Socket] Connection terminated');
      }
    };
  }, [token, user]);

  // Restore session from localStorage on startup
  useEffect(() => {
    const restoreSession = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  /**
   * Log in user using email and password.
   */
  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      
      if (res.data.success) {
        const { token: jwtToken, user: userData } = res.data;
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(jwtToken);
        setUser(userData);
        setLoading(false);
        return userData;
      }
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message || 'Login failed. Please check credentials.';
    }
  };

  /**
   * Register a new user (patient or doctor).
   */
  const registerUser = async (registerData) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', registerData);
      
      if (res.data.success) {
        setLoading(false);
        return res.data.user;
      }
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.errors || error.response?.data?.message || 'Registration failed.';
    }
  };

  /**
   * Log out active user.
   */
  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  /**
   * Utility to update user session profile parameters in state and localStorage.
   */
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      socket,
      loading,
      login: loginUser,
      register: registerUser,
      logout: logoutUser,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
