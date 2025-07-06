import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File } from 'lucide-react';
import { CreateIssueData, IssueSeverity } from '../../types';
import { useIssuesStore } from '../../store/issues';
import { useAuthStore } from '../../store/auth';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import toast from 'react-hot-toast';
import { createIssue } from '../../utils/apiExtra';

const CreateIssueForm: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const { loading } = useIssuesStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { control, handleSubmit, register, formState: { errors }, reset, setValue, watch } = useForm<CreateIssueData>({
    defaultValues: {
      title: '',
      description: '',
      severity: 'LOW' as IssueSeverity,
      tags: [],
      files: []
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    },
    multiple: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.log'],
    },
  });

  const handleAddTag = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    e?.preventDefault();
    
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const onSubmit = async (data: CreateIssueData) => {
    if (!user) return;
    try {
      // Prepare payload for backend (snake_case)
      const payload = {
        title: data.title,
        description: data.description,
        severity: data.severity,
        tags,
      };
      // Create issue
      const created = await createIssue(payload);
      // Upload files if any
      for (const file of files) {
        await import('../../utils/apiExtra').then(({ uploadFile }) => uploadFile(created.id, file));
      }
      toast.success('Issue created successfully!');
      reset();
      setTags([]);
      setFiles([]);
      navigate('/issues');
    } catch (error) {
      toast.error('Failed to create issue');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card gradient hover className="border-purple-200/30 dark:border-purple-700/30">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              label="Title *"
              value={watch('title')}
              onChange={e => setValue('title', e.target.value, { shouldValidate: true })}
              error={errors.title?.message}
              fullWidth
              placeholder="Enter issue title..."
              className='pl-4 py-2'
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Severity *
              </label>
              <Controller
                name="severity"
                control={control}
                rules={{ required: 'Severity is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white transition-all duration-300 pl-4 py-2"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                )}
              />
              {errors.severity && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">
                  {errors.severity.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' }
              })}
              rows={6}
              className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white transition-all duration-300 pl-4 py-2"
              placeholder="Describe the issue in detail. You can use Markdown formatting..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleAddTag}
                className="flex-1 rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-white transition-all duration-300 pl-4 py-2"
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" onClick={() => handleAddTag()} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              File Attachments
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 hover:border-purple-400 dark:border-gray-600 dark:hover:border-purple-500'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {isDragActive
                  ? 'Drop the files here...'
                  : 'Drag & drop files here, or click to select files'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Supports: Images, PDFs, Text files (Max 10MB each)
              </p>
            </div>
            
            {files.length > 0 && (
              <div className="mt-4 space-y-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-3">
                      <File className="h-6 w-6 text-purple-500" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/issues')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="neon-glow"
            >
              Create Issue
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateIssueForm;