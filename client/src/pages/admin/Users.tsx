import AdminSidebar from '@/components/AdminSidebar';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from '@/components/Spinner';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8080/auth/users/role')
      .then((response) => {
        setUsers(response.data.users);
        setSearchUsers(response.data.users);
        setLoading(false);
      })
      .catch((error) => {
        window.location.reload();
      });
  }, []);

  const deleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete user ${userName}?`)) {
      // Make an API call to delete the user by userId
      axios.delete(`http://localhost:8080/auth/users/${userId}`)
        .then(() => {
          setUsers(users.filter((user) => user._id !== userId));
        })
        .catch((error) => {
          window.location.reload();
        });
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchTerm(text);

    if (text.trim() === '') {
      setSearchUsers(users);
    } else {
      const results = users.filter((user) => {
        const fullName = `${user.name} ${user.email} ${user.phone}`.toLowerCase();
        return fullName.includes(text.toLowerCase());
      });
      setSearchUsers(results);
    }
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-4 ml-64">
            <h1 className="text-3xl font-semibold mb-4">Users</h1>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name, email, or phone"
                className="px-4 py-2 w-72 rounded-lg border border-gray-300 focus:outline-none"
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
            </div>
            {searchUsers.length > 0 ? (
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Phone</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-100">
                      <td className="px-4 py-2 text-center">{user.name}</td>
                      <td className="px-4 py-2 text-center">{user.email}</td>
                      <td className="px-4 py-2 text-center">{user.phone}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => deleteUser(user._id, user.name)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No users found.</p>
            )}
          </main>
        </div>
      )}
    </>
  );
};

export default Users;
