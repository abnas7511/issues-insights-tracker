import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateIssueForm from '../components/issues/CreateIssueForm';
import Button from '../components/ui/Button';

const CreateIssue: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => navigate('/issues')}
          variant="ghost"
          icon={ArrowLeft}
          size="sm"
          className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          Back to Issues
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Create New Issue
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Report a bug, request a feature, or ask a question
          </p>
        </div>
      </div>

      <CreateIssueForm />
    </div>
  );
};

export default CreateIssue;