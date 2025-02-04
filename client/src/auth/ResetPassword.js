import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { sendResetEmail } from '../services/authService'; // Import the API call
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for Toastify

const ResetPassword = () => {
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required')
        .matches('(com|net)$', 'Invalid email format'),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        const response = await sendResetEmail(values.email); // API call
        setStatus({ success: response.message });

        // Trigger success toast notification
        toast.success('Reset email sent successfully!', {
          position: 'top-right',
          autoClose: 4000,
          style: { backgroundColor: 'white', color: 'green' }, // White text with green
        });
      } catch (error) {
        setStatus({ error: 'Error sending reset email. Please try again.' });

        // Trigger error toast notification
        toast.error('Error sending reset email. Please try again.', {
          position: 'top-right',
          autoClose: 4000,
          style: { backgroundColor: 'white', color: 'red' }, // White text with red
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="form-container">
      <h2>Reset Password</h2>
      <form onSubmit={formik.handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={formik.touched.email && formik.errors.email ? 'error' : ''}
        />
        {formik.touched.email && formik.errors.email ? (
          <div className="error-message">{formik.errors.email}</div>
        ) : null}
        <button type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? 'Sending...' : 'Send Reset Email'}
        </button>
      </form>
      {formik.status?.success && <p className="success-message">{formik.status.success}</p>}
      {formik.status?.error && <p className="error-message">{formik.status.error}</p>}

      {/* ToastContainer to render the toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default ResetPassword;
