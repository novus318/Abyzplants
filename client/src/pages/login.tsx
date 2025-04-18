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
import Layout from '@/components/Layout';

const AuthPage = () => {
  const { auth, setAuth } = useAuth();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsSubmitting(true);
      setError(null);

      try {
        let res;
        if (isSignup) {
          res = await axios.post(`${apiUrl}/api/auth/signup`, {
            name: values.name,
            email: values.email,
            phone: values.phone,
            password: values.password,
          });
        } else {
          res = await axios.post(`${apiUrl}/api/auth/login`, {
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

          toast.success(isSignup ? 'Account created successfully!' : 'Logged in successfully!');

          if (redirectPath) {
            router.push(redirectPath);
          } else if (res.data.user.role === 1) {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
        } else {
          setError(res.data.message || 'An error occurred. Please try again.');
          toast.error(res.data.message || 'An error occurred. Please try again.');
        }
      } catch (e) {
        if (axios.isAxiosError(e)) {
          setError(e.response?.data?.message || 'An error occurred. Please try again.');
          toast.error(e.response?.data?.message || 'An error occurred. Please try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
          toast.error('An unexpected error occurred. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Layout
      title="Abyzplants - Join us"
      description="Abyz Plants, the definitive online destination for exceptional indoor and outdoor plants in the UAE, with quick delivery options. Our online plant store guarantees the quality of every plant, making it effortless to purchase for your home, office. With the widest variety of options available, and a delightful selection of home accessories. Whether it is for offices, malls, hotels, or any setting, count on us for the freshest, healthiest plants. Explore our (Gift a Plant) option and revel in our swift and reliable delivery service."
      keywords="Abyzplants, Abyzplants UAE, abyzplants uae, Abyzplants dubai, abyzplants dubai, abyzplants, Buy indoor plants online, Buy outdoor plants online, where to buy indoor plants, where to buy outdoor plants, buy indoor plants in Dubai, buy indoor plants in Abu Dhabi, plant stores near me, what are the best indoor plants to buy, indoor plants for my home, flowering indoor plants for home, flowering indoor plants for my office, where can I buy indoor plants for my home, nearest online plant store in Dubai, indoor plant stores near me, online indoor plants, which are the best indoor plants to buy in winter, which are the best indoor plants to buy in summer, outdoor plants in Dubai, where to buy outdoor plants in Dubai, where to buy outdoor plants online, buy outdoor plants online, buy seeds online, buy soil & fertilizers online, buy indoor fertilizers online, buy potting soil online, buy soil for my home, buy plant insecticides, buy plant pesticides, where to buy plant food, where to buy indoor plant pots, where to buy plant pots, where to buy airplants, where to buy large indoor plants, how to water my plants, where to by plant care accessories, indoor plants online, outdoor plants online, flowering plants online, plants gifts online, plant pots online, buy plant pots in Dubai, buy tall indoor plants online, buy tall tree online, buy fertilizers online"
      author="Muhammed Nizamudheen M"
      canonicalUrl="https://abyzplants.com/login"
    >
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="fixed top-2 left-2 md:top-5 md:left-2 lg:top-8 lg:left-5 bg-primary text-white px-2 py-2 rounded-full shadow-md hover:bg-secondary-foreground transition-colors duration-300"
        >
          <FaArrowLeft size={20} />
        </Link>
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-primbg-primary">
              {isSignup ? 'Create your Space' : 'Log in to your Account'}
            </h2>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}
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
                      formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-secbg-secondary-foreground'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-secbg-secondary-foreground focus:border-secbg-secondary-foreground focus:z-10 sm:text-sm`}
                    placeholder="Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
                  )}
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
                  formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-secbg-secondary-foreground'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-secbg-secondary-foreground focus:border-secbg-secondary-foreground focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
              )}
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
                    formik.touched.phone && formik.errors.phone ? 'border-red-500' : 'border-secbg-secondary-foreground'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-secbg-secondary-foreground focus:border-secbg-secondary-foreground focus:z-10 sm:text-sm`}
                  placeholder="Phone Number"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.phone}</p>
                )}
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
                  formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-secbg-secondary-foreground'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-secbg-secondary-foreground focus:border-secbg-secondary-foreground focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
              )}
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
                      : 'border-secbg-secondary-foreground'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-secbg-secondary-foreground focus:border-secbg-secondary-foreground focus:z-10 sm:text-sm`}
                  placeholder="Verify Password"
                  value={formik.values.verifyPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.verifyPassword && formik.errors.verifyPassword && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.verifyPassword}</p>
                )}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-secondary-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secbg-secondary-foreground disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : isSignup ? 'Create Account' : 'Log In'}
            </button>
          </form>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                className="font-medium text-primbg-primary hover:text-secbg-secondary-foreground cursor-pointer"
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? 'Log in here' : 'Sign up here'}
              </button>
            </p>
            {!isSignup && (
              <p className="text-sm mt-3 text-gray-600">
                <Link
                  href="mailto:info@abyzplants.com"
                  target="_blank"
                  className="font-medium text-red-500 hover:text-secbg-secondary-foreground cursor-pointer"
                >
                  Forgot Password? Contact support
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default checkUser(AuthPage);