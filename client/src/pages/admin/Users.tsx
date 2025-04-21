import AdminSidebar from '@/components/AdminSidebar';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import { withAuth } from '@/components/withAuth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

const Users = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [users, setUsers] = useState<User[]>([]);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${apiUrl}/api/auth/users/role`)
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
    // Make an API call to delete the user by userId
    axios.delete(`${apiUrl}/api/auth/users/${userId}`)
      .then(() => {
        setUsers(users.filter((user) => user._id !== userId));
        window.location.reload();
      })
      .catch((error) => {
        window.location.reload();
      });
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
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/50">
          <AdminSidebar />
          <ScrollArea className="flex-1 h-screen">
            <main className="p-6 md:ml-64">
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Users</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your website users</p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all registered users</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Input
                        type="text"
                        placeholder="Search by name, email, or phone"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        className="max-w-sm"
                      />
                    </div>

                    {searchUsers.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchUsers.map((user) => (
                            <TableRow key={user._id}>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.phone}</TableCell>
                              <TableCell className="text-right">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete user {user.name}. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteUser(user._id, user.name)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No users found.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </ScrollArea>
        </div>
      )}
    </>
  );
};

export default withAuth(Users);
