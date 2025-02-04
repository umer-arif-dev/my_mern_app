import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL; // Access the base URL from the .env file

export const isLoggedIn = () => {
  return !!localStorage.getItem('token'); // Return true if token exists
};

// API call for user signup
export const signupUser = async (name, email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
      name,
      email,
      password,
    });
    if (response.data.token) {
      // Store JWT token in localStorage if signup is successful
      localStorage.setItem('token', response.data.token);
    }
    return response.data; // Return response data for further handling
  } catch (error) {
    console.error("Signup Error:", error);
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage); // Use backend message if available
  }
};

// API call for user login
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    if (response.data.token) {
      // Store JWT token in localStorage if login is successful
      localStorage.setItem('token', response.data.token);
    }
    return response.data; // Return response data for further handling
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage); // Handle errors
  }
};

// API call for user logout
export const logoutUser = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      // Clear token from localStorage
      localStorage.removeItem('token');
      return { success: true };
    }
    throw new Error('Logout failed');
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// API call to send reset email
export const sendResetEmail = async (email) => {
  const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return response.json();
};

// API call to reset password
export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};
