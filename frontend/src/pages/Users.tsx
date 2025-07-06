import React, { useEffect, useState } from 'react';
import { User as UserIcon, Shield, Users as UsersIcon, FileText } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import Card from '../components/ui/Card';
import { getUsers } from '../utils/apiExtra';

const roleColors: Record<string, string> = {
  ADMIN: 'bg-gradient-to-r from-purple-500 to-pink-500',
  MAINTAINER: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  REPORTER: 'bg-gradient-to-r from-green-500 to-emerald-500',
};

const roleIcons: Record<string, React.ReactNode> = {
  ADMIN: <Shield className="h-6 w-6 text-white" />,
  MAINTAINER: <UsersIcon className="h-6 w-6 text-white" />,
  REPORTER: <FileText className="h-6 w-6 text-white" />,
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUsers();
        // Map backend fields to frontend
        setUsers(data.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatar: u.avatar_url || undefined,
          createdAt: u.created_at,
          isActive: u.is_active,
        })));
      } catch (e) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="text-center py-16 text-lg text-gray-500">Loading users...</div>;
  if (error) return <div className="text-center py-16 text-lg text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent flex items-center justify-center">
          Platform Users
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          All users registered on the platform
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map((user) => (
          <Card key={user.id} className="transition-all duration-300 hover:scale-105 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${roleColors[user.role]}`}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover border-2 border-white" />
                ) : (
                  <span className="text-2xl text-white font-bold">{user.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
                  {user.name}
                  <span className="ml-2">{roleIcons[user.role]}</span>
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{user.email}</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-600/10 text-purple-700 dark:bg-purple-600/20 dark:text-purple-300">
                  {user.role}
                </span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
              Joined: {typeof user.createdAt === 'string' ? new Date(user.createdAt).toLocaleDateString() : user.createdAt.toLocaleDateString()}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
