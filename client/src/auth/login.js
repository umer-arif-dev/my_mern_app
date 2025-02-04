import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { loginUser } from '../services/authService';  // Import login API call
import { useNavigate } from 'react-router-dom';  // Import to navigate to dashboard

const Login = () => {
  const navigate = useNavigate(); // useNavigate hook to redirect to dashboard
  const [error, setError] = useState(null); // For capturing errors

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().matches('(com|net)$',"invalid email format").email('Invalid email format').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    }),
    onSubmit: async (values) => {
      try {
        // Call login API with email and password
        const response = await loginUser(values.email, values.password);

        if (response.token) {
          console.log('JWT Token:', response.token);  // Log the token
          localStorage.setItem('token', response.token);  // Store JWT token in localStorage
          // Redirect to dashboard after successful login
          navigate('/dashboard');
        } else {
          setError('Invalid login credentials');  // Handle case where no token is returned
        }
      } 
      catch (error) {
   
       if (error.message === 'Invalid password') {
      //Set error for password only
      formik.setFieldError('password', 'Invalid password');}
     else   {
      formik.setFieldError('email', 'Email not exist');
      }
      }
     }
    
});

  return (
    <form onSubmit={formik.handleSubmit} className="form-container">
      <h2>Login</h2>

      {/* Email Input */}
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={formik.handleChange}
        value={formik.values.email}
        onBlur={formik.handleBlur}
        className={formik.touched.email && formik.errors.email ? 'input-error' : ''}
      />
      {formik.touched.email && formik.errors.email && <div className="error-message">{formik.errors.email}</div>}

      {/* Password Input */}
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={formik.handleChange}
        value={formik.values.password}
        onBlur={formik.handleBlur}
        className={formik.touched.password && formik.errors.password ? 'input-error' : ''}
      />
      {formik.touched.password && formik.errors.password && <div className="error-message">{formik.errors.password}</div>}

      {/* Submit Button */}
      <button type="submit">Login</button>

      <button
       type ="button"
      className="forgot-password-button"
      onClick={() => navigate('/forget-Password')}
      >
        Forgotpassword?
      </button>

     
    </form>
  );
};

export default Login;
//{error && <div className="error-popup">{error}</div>}