import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter } from 'next/router';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/store/authContext';
import { checkUser } from '@/components/checkUser';
import toast from 'react-hot-toast';
import InputMask from 'react-input-mask';


const AuthPage = () => {
  const { auth, setAuth } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const query = router.query.redirect as string;
    if (query) {
      setRedirectPath(decodeURIComponent(query));
    }
  }, [router.query.redirect]);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      verifyPassword: '',
    },
    validationSchema: Yup.object().shape({
      name: isSignup ? Yup.string().required('Name is required') : Yup.string(),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: isSignup ? Yup.string().required('Phone number is required') : Yup.string(),
      password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
      verifyPassword: isSignup
        ? Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Confirm Password')
        : Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        let res;
        if (isSignup) {
          res = await axios.post('http://localhost:8080/auth/signup', {
            name: values.name,
            email: values.email,
            phone: values.phone,
            password: values.password,
          });
        } else {
          res = await axios.post('http://localhost:8080/auth/login', {
            email: values.email,
            password: values.password,
          });
        }

        if (res && res.data.success) {
          setAuth({
            ...auth,
            user: res.data.user,
            token: res.data.token,
          });
          localStorage.setItem('user', JSON.stringify(res.data));

          if (redirectPath) {
            router.push(redirectPath);
          } else if (res.data.user.role === 1) {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
        } else {
          setError(res.data.message);
        }
      } catch (e) {
        toast.error('Something went wrong...')
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="fixed top-2 left-2 md:top-5 md:left-2 lg:top-8 lg:left-5 bg-[#5f9231] text-white px-2 py-2 rounded-full shadow-md hover:bg-[#a14e3a] transition-colors duration-300"
      >
        <FaArrowLeft size={20} />
      </Link>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#5f9231]">
            {isSignup ? 'Create your Space' : 'Log in to your Account'}
          </h2>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          {isSignup && (
            <div>
              <div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`appearance-none relative block w-full px-3 py-3 border ${
                    formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-[#a14e3a]'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#a14e3a] focus:border-[#a14e3a] focus:z-10 sm:text-sm`}
                  placeholder="Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name ? (
                  <p className="text-red-500 text-sm">{formik.errors.name}</p>
                ) : null}
              </div>
            </div>
          )}
          <div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`appearance-none relative block w-full px-3 py-3 border ${
                formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-[#a14e3a]'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#a14e3a] focus:border-[#a14e3a] focus:z-10 sm:text-sm`}
              placeholder="Email address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email ? (
              <p className="text-red-500 text-sm">{formik.errors.email}</p>
            ) : null}
          </div>
          {isSignup && (
            <div>
            <InputMask
              id="phone"
              name="phone"
              mask="+971 99 999 9999"
              maskChar="_"
              autoComplete="tel"
              required
              className={`appearance-none relative block w-full px-3 py-3 border ${
                formik.touched.phone && formik.errors.phone ? 'border-red-500' : 'border-[#a14e3a]'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#a14e3a] focus:border-[#a14e3a] focus:z-10 sm:text-sm`}
              placeholder="Phone Number (+971 5XX XXX XXXX)"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.phone && formik.errors.phone ? (
              <p className="text-red-500 text-sm">{formik.errors.phone}</p>
            ) : null}
          </div>
          
          )}
          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={`appearance-none relative block w-full px-3 py-3 border ${
                formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-[#a14e3a]'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#a14e3a] focus:border-[#a14e3a] focus:z-10 sm:text-sm`}
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password ? (
              <p className="text-red-500 text-sm">{formik.errors.password}</p>
            ) : null}
          </div>
          {isSignup && (
            <div>
              <input
                id="verifyPassword"
                name="verifyPassword"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  formik.touched.verifyPassword && formik.errors.verifyPassword
                    ? 'border-red-500'
                    : 'border-[#a14e3a]'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#a14e3a] focus:border-[#a14e3a] focus:z-10 sm:text-sm`}
                placeholder="Verify Password"
                value={formik.values.verifyPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.verifyPassword && formik.errors.verifyPassword ? (
                <p className="text-red-500 text-sm">{formik.errors.verifyPassword}</p>
              ) : null}
            </div>
          )}
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-base font-medium rounded-md text-white bg-[#5f9231] hover:bg-[#a14e3a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a14e3a]"
          >
            {isSignup ? 'Create Account' : 'Log In'}
          </button>
        </form>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              className="font-medium text-[#5f9231] hover:text-[#a14e3a] cursor-pointer"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? 'Log in here' : 'Sign up here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default checkUser(AuthPage);
