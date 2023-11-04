import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import Spinner from '@/components/Spinner';
import { useRouter } from 'next/router';
import profile from '@/images/user.webp';
import { useAuth } from '@/store/authContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactInputMask from 'react-input-mask';

const Profile = () => {
  const router = useRouter();
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(true);
  const { auth, setAuth } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [landmark, setLandmark] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const checkUserExistence = async () => {
      try {
        const userDataString = localStorage.getItem('user');

        if (userDataString !== null) {
          const userData = JSON.parse(userDataString);

          if (userData && userData.user) {
            const { name, city, zip, landmark, address, phone } = userData.user;
            setName(name);
            setCity(city);
            setZip(zip);
            setLandmark(landmark);
            setAddress(address);
            setPhone(phone);
            setLoading(false);
          }
        } else {
          const currentRoute = router.asPath;
          router.push(`/login?redirect=${encodeURIComponent(currentRoute)}`);
        }
      } catch (error) {
        router.push('/login');
      }
    };

    checkUserExistence();
  }, [router]);


  const handleEditClick = () => {
    setIsEditable(true);
  };

  const handleUpdateClick = () => {
    setIsEditable(false);
    setLoading(true);
    const updatedProfile = {
      ...auth.user,
      name,
      city,
      zip,
      landmark,
      address,
      phone,
    };

    axios
      .put(`${apiUrl}/api/auth/profile/${auth.user._id}`, updatedProfile)
      .then((response) => {
        if (response.data.success) {
          setAuth({
            ...auth,
            user: response.data.updatedUser,
          });

          const ls = JSON.parse(localStorage.getItem('user') || '{}');

          ls.user = response.data.updatedUser;
          localStorage.setItem('user', JSON.stringify(ls));

          toast.success("Profile Updated successfully");
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error('Error updating profile');
      })
      .finally(() => {
        setLoading(false);
      });
  };


  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Header />
          <div className="bg-gray-100 min-h-screen pt-36 pb-10 px-7">
            <div className="max-w-screen-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-extrabold text-[#5f9231] mb-6 text-center">
                User Profile
              </h2>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full overflow-hidden">
                  <img
                    src={profile.src}
                    alt="User Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-lg font-semibold">{auth.user?.name}</div>
              </div>
              <form className="rounded-md space-y-4 mb-4">
                <div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md ${isEditable
                        ? 'focus:outline-none focus:ring-[#a14e3a] focus:border-[#a14e3a] focus:z-10'
                        : ''
                      }`}
                    placeholder="Full Name"
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={auth.user?.email}
                    className='appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md'
                    placeholder="Email"
                    disabled
                  />
                </div>
                <div>
                  <ReactInputMask
                    id="phone"
                    name="phone"
                    mask="+971 99 999 9999"
                    maskChar="_"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md ${isEditable
                        ? 'focus:outline-none focus:ring-[#a14e3a] focus:border-[#a14e3a] focus:z-10'
                        : ''
                      }`}
                    placeholder="Phone Number (+971 5XX XXX XXXX)"
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md ${isEditable
                        ? 'focus:outline-none focus:ring-[#a14e3a] focus:border-[#a14e3a] focus:z-10'
                        : ''
                      }`}
                    placeholder="City"
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <input
                    id="zip"
                    name="zip"
                    type="text"
                    autoComplete="postal-code"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className={`appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md ${isEditable
                        ? 'focus:outline-none focus:ring-[#a14e3a] focus:border-[#a14e3a] focus:z-10'
                        : ''
                      }`}
                    placeholder="ZIP Code"
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <input
                    id="landmark"
                    name="landmark"
                    type="text"
                    required
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className={`appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md ${isEditable
                        ? 'focus:outline-none focus:ring-[#a14e3a] focus:border-[#a14e3a] focus:z-10'
                        : ''
                      }`}
                    placeholder="Landmark"
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <textarea
                    id="address"
                    name="address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md ${isEditable
                        ? 'focus:outline-none focus:ring-[#a14e3a] focus:border-[#a14e3a] focus:z-10'
                        : ''
                      }`}
                    placeholder="Address"
                    disabled={!isEditable}
                  />
                </div>
              </form>
              {isEditable ? (
                <button
                  onClick={handleUpdateClick}
                  className="w-full py-2 px-4 bg-[#5f9231] text-white font-semibold rounded-md hover:bg-[#a14e3a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a14e3a]"
                >
                  Update Profile
                </button>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="w-full py-2 px-4 bg-[#5f9231] text-white font-semibold rounded-md hover-bg-[#a14e3a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a14e3a]"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          <Footer />
        </>
      )}
    </>
  );
};

export default Profile;
