import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Shield, Users, FileText, Sparkles, CheckCircle } from 'lucide-react';
import { UserRole } from '../../types';
import { useAuthStore } from '../../store/auth';
import Button from '../ui/Button';
import Card from '../ui/Card';
import toast from 'react-hot-toast';
import { register as apiRegister, login as apiLogin, setToken, getCurrentUser } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

interface RoleSelectionProps {
  clerkUser: any;
  onRoleSelected: () => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ clerkUser, onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(false);
  const navigate = useNavigate();
  const { user: clerkUserHook } = useUser();

  const roles = [
    {
      value: 'REPORTER' as UserRole,
      title: 'Reporter',
      description: 'Create and track your own issues',
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      permissions: [
        'Create new issues',
        'View your own issues',
        'Add comments and attachments',
        'Track issue progress'
      ]
    },
    {
      value: 'MAINTAINER' as UserRole,
      title: 'Maintainer',
      description: 'Manage and triage issues across projects',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      permissions: [
        'View all issues',
        'Assign issues to team members',
        'Change issue status and priority',
        'Access analytics dashboard'
      ]
    },
    {
      value: 'ADMIN' as UserRole,
      title: 'Administrator',
      description: 'Full access to all features and user management',
      icon: Shield,
      color: 'from-purple-500 to-pink-500',
      permissions: [
        'Complete system access',
        'Manage users and permissions',
        'Delete issues and data',
        'System configuration'
      ]
    }
  ];

  const handleRoleSelection = async () => {
    if (!selectedRole || !clerkUserHook) {
      console.error('selectedRole or clerkUserHook missing:', { selectedRole, clerkUserHook });
      return;
    }

    setLoading(true);
    setShowLoginButton(false);
    try {
      // Update Clerk user metadata with selected role using unsafeMetadata
      await clerkUserHook.update({
        unsafeMetadata: {
          ...clerkUserHook.unsafeMetadata,
          role: selectedRole
        }
      });

      // Register user in backend if not exists
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      const name = clerkUser.fullName || clerkUser.firstName || 'User';
      const password = clerkUser.id + '_google'; // deterministic password for social login
      const role = selectedRole;
      try {
        await apiRegister(email, password, name, role);
      } catch (err: any) {
        // If already registered, show login button
        if (err.response && err.response.status === 409) {
          setShowLoginButton(true);
          setLoading(false);
          return;
        } else {
          throw err;
        }
      }
      // Login user in backend
      const data = await apiLogin(email, password);
      setToken(data.access_token);
      // Use getCurrentUser instead of getUser(data.user.id)
      const backendUser = await getCurrentUser();
      useAuthStore.setState({ 
        user: backendUser, 
        isAuthenticated: true 
      });
      toast.success(`Welcome! You've been assigned the ${selectedRole.toLowerCase()} role.`);
      onRoleSelected();
    } catch (error) {
      toast.error('Failed to set role or register. Please try again.');
      console.error('Role selection error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-cyan-500 p-4 rounded-full">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Choose Your Role
          </h2>
          <p className="mt-2 text-lg text-gray-400">
            Welcome, {clerkUser.firstName}! Select your role to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card
              key={role.value}
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedRole === role.value
                  ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-500/20 to-cyan-500/20'
                  : 'hover:bg-purple-500/10 hover:to-cyan-500/10 bg-gradient-to-br from-gray-800 to-gray-900'
                  
              }`}
              onClick={() => setSelectedRole(role.value)}
            >
              <div className="text-center space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${role.color} flex items-center justify-center`}>
                  <role.icon className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {role.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {role.description}
                  </p>
                </div>

                <div className="space-y-2">
                  {role.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                      {permission}
                    </div>
                  ))}
                </div>

                {selectedRole === role.value && (
                  <div className="mt-4 p-2 bg-purple-500/20 rounded-lg">
                    <span className="text-purple-300 text-sm font-medium">Selected</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={handleRoleSelection}
            disabled={!selectedRole}
            loading={loading}
            size="lg"
            className="neon-glow px-8 py-3"
          >
            Continue with {selectedRole?.toLowerCase()} role
          </Button>
          {showLoginButton && (
            <div className="mt-4">
              <Button
                onClick={() => {
                  useAuthStore.setState({ user: null, isAuthenticated: false });
                  navigate('/login', { replace: true });
                }}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                Go to Login Page
              </Button>
              <p className="mt-2 text-red-400">Email already exists. Please login instead.</p>
            </div>
          )}
          <p className="mt-4 text-sm text-gray-400">
            You can always contact an administrator to change your role later
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;