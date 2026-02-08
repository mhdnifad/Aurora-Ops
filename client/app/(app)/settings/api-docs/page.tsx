'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ApiDocsPage() {
  const router = useRouter();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setShowSupportModal(false);
    setSupportForm({ subject: '', email: '', message: '' });
    toast.success('Support request sent! We\'ll get back to you soon.');
  };

  const handleJoinCommunity = () => {
    // Open Discord/Slack community link
    window.open('https://discord.gg/aurora-ops', '_blank');
    toast.success('Opening community in new tab!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 border-gray-200/70 dark:border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">API Documentation</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Complete guide to Aurora Ops REST API</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Live API status
        </span>
      </div>

      {/* Getting Started */}
      <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Getting Started</h3>
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            The Aurora Ops API is organized around REST. Our API has predictable resource-oriented URLs,
            accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP
            response codes, authentication, and verbs.
          </p>
          <div>
            <h4 className="font-medium mb-2">Base URL</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg flex items-center justify-between">
              <code>https://api.aurora-ops.com/v1</code>
              <button
                onClick={() => copyCode('https://api.aurora-ops.com/v1')}
                className="text-blue-400 hover:text-blue-300"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Authentication */}
      <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Authentication</h3>
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Authenticate your API requests by including your API key in the Authorization header. All API
            requests must be made over HTTPS.
          </p>
          <div>
            <h4 className="font-medium mb-2">Header Format</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
              <code className="block">Authorization: Bearer YOUR_API_KEY</code>
            </div>
          </div>
          <div className="bg-yellow-50/80 border border-yellow-200/60 dark:border-yellow-500/20 p-4 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Security:</strong> Keep your API keys secure. Do not share them in publicly accessible
              areas such as GitHub, client-side code, or screenshots.
            </p>
          </div>
        </div>
      </Card>

      {/* Projects API */}
      <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Projects API</h3>
        
        {/* List Projects */}
        <div className="mb-6">
          <h4 className="font-medium text-lg mb-2">List All Projects</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">GET</span>
              <code>/projects</code>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-600">Query Parameters:</p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li><code>page</code> - Page number (default: 1)</li>
              <li><code>limit</code> - Items per page (default: 20)</li>
              <li><code>status</code> - Filter by status (active, archived)</li>
            </ul>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Example Request:</p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
              <button
                onClick={() => copyCode(`curl -X GET "https://api.aurora-ops.com/v1/projects?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`)}
                className="absolute top-2 right-2 text-blue-400 hover:text-blue-300"
              >
                <Copy className="w-4 h-4" />
              </button>
              <pre className="text-sm overflow-x-auto">
{`curl -X GET "https://api.aurora-ops.com/v1/projects?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              </pre>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Example Response:</p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
              <button
                onClick={() => copyCode(`{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj_123456",
        "name": "Website Redesign",
        "description": "Q1 2024 website redesign project",
        "status": "active",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-20T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1
    }
  }
}`)}
                className="absolute top-2 right-2 text-blue-400 hover:text-blue-300"
              >
                <Copy className="w-4 h-4" />
              </button>
              <pre className="text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj_123456",
        "name": "Website Redesign",
        "description": "Q1 2024 website redesign project",
        "status": "active",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-20T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Create Project */}
        <div className="mb-6">
          <h4 className="font-medium text-lg mb-2">Create a Project</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">POST</span>
              <code>/projects</code>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Request Body:</p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
              <button
                onClick={() => copyCode(`{
  "name": "New Project",
  "description": "Project description",
  "icon": "folder",
  "color": "#3b82f6"
}`)}
                className="absolute top-2 right-2 text-blue-400 hover:text-blue-300"
              >
                <Copy className="w-4 h-4" />
              </button>
              <pre className="text-sm overflow-x-auto">
{`{
  "name": "New Project",
  "description": "Project description",
  "icon": "folder",
  "color": "#3b82f6"
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Get Project */}
        <div className="mb-6">
          <h4 className="font-medium text-lg mb-2">Get Project Details</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">GET</span>
              <code>/projects/:id</code>
            </div>
          </div>
        </div>

        {/* Update Project */}
        <div className="mb-6">
          <h4 className="font-medium text-lg mb-2">Update a Project</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-semibold">PUT</span>
              <code>/projects/:id</code>
            </div>
          </div>
        </div>

        {/* Delete Project */}
        <div>
          <h4 className="font-medium text-lg mb-2">Delete a Project</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">DELETE</span>
              <code>/projects/:id</code>
            </div>
          </div>
        </div>
      </Card>

      {/* Tasks API */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Tasks API</h3>
        
        {/* List Tasks */}
        <div className="mb-6">
          <h4 className="font-medium text-lg mb-2">List All Tasks</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">GET</span>
              <code>/tasks</code>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-600">Query Parameters:</p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li><code>projectId</code> - Filter by project</li>
              <li><code>status</code> - Filter by status (todo, in_progress, done)</li>
              <li><code>assigneeId</code> - Filter by assignee</li>
              <li><code>priority</code> - Filter by priority (low, medium, high)</li>
            </ul>
          </div>
        </div>

        {/* Create Task */}
        <div className="mb-6">
          <h4 className="font-medium text-lg mb-2">Create a Task</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">POST</span>
              <code>/tasks</code>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Request Body:</p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
              <button
                onClick={() => copyCode(`{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication",
  "projectId": "proj_123456",
  "assigneeId": "user_789",
  "priority": "high",
  "dueDate": "2024-02-15T00:00:00Z"
}`)}
                className="absolute top-2 right-2 text-blue-400 hover:text-blue-300"
              >
                <Copy className="w-4 h-4" />
              </button>
              <pre className="text-sm overflow-x-auto">
{`{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication",
  "projectId": "proj_123456",
  "assigneeId": "user_789",
  "priority": "high",
  "dueDate": "2024-02-15T00:00:00Z"
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Update Task */}
        <div className="mb-6">
          <h4 className="font-medium text-lg mb-2">Update a Task</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-semibold">PUT</span>
              <code>/tasks/:id</code>
            </div>
          </div>
        </div>

        {/* Delete Task */}
        <div>
          <h4 className="font-medium text-lg mb-2">Delete a Task</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">DELETE</span>
              <code>/tasks/:id</code>
            </div>
          </div>
        </div>
      </Card>

      {/* Error Codes */}
      <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Error Codes</h3>
        <div className="space-y-3">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Aurora Ops uses conventional HTTP response codes to indicate the success or failure of an API request.
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 px-2 py-1 rounded text-sm font-medium">200</span>
              <div>
                <p className="font-medium">OK</p>
                <p className="text-sm text-gray-600">Everything worked as expected</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 px-2 py-1 rounded text-sm font-medium">201</span>
              <div>
                <p className="font-medium">Created</p>
                <p className="text-sm text-gray-600">Resource created successfully</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 px-2 py-1 rounded text-sm font-medium">400</span>
              <div>
                <p className="font-medium">Bad Request</p>
                <p className="text-sm text-gray-600">The request was invalid or cannot be served</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 px-2 py-1 rounded text-sm font-medium">401</span>
              <div>
                <p className="font-medium">Unauthorized</p>
                <p className="text-sm text-gray-600">Authentication credentials are invalid</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 px-2 py-1 rounded text-sm font-medium">403</span>
              <div>
                <p className="font-medium">Forbidden</p>
                <p className="text-sm text-gray-600">You don't have permission to access this resource</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 px-2 py-1 rounded text-sm font-medium">404</span>
              <div>
                <p className="font-medium">Not Found</p>
                <p className="text-sm text-gray-600">The requested resource doesn't exist</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300 px-2 py-1 rounded text-sm font-medium">429</span>
              <div>
                <p className="font-medium">Too Many Requests</p>
                <p className="text-sm text-gray-600">You've hit the rate limit</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 px-2 py-1 rounded text-sm font-medium">500</span>
              <div>
                <p className="font-medium">Internal Server Error</p>
                <p className="text-sm text-gray-600">Something went wrong on our end</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Rate Limiting */}
      <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Rate Limiting</h3>
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            The API is rate limited to prevent abuse. The default rate limit is 100 requests per minute per API key.
          </p>
          <div>
            <h4 className="font-medium mb-2">Rate Limit Headers</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
              <pre className="text-sm">
{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000`}
              </pre>
            </div>
          </div>
          <div className="bg-blue-50/80 border border-blue-200/60 dark:border-blue-500/20 p-4 rounded-lg">
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              <strong>Tip:</strong> If you need higher rate limits, please contact our support team to discuss your use case.
            </p>
          </div>
        </div>
      </Card>

      {/* Support */}
      <Card className="p-6 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/60 dark:border-blue-800/60 backdrop-blur-xl shadow-md">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Need Help?</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          If you have questions or need assistance integrating with our API, we're here to help!
        </p>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="bg-white/90 dark:bg-white/5 hover:bg-blue-50/80 dark:hover:bg-blue-900/30"
            onClick={() => setShowSupportModal(true)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
          <Button 
            variant="outline" 
            className="bg-white/90 dark:bg-white/5 hover:bg-purple-50/80 dark:hover:bg-purple-900/30"
            onClick={handleJoinCommunity}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Join Community
          </Button>
        </div>
      </Card>

      {/* Contact Support Modal */}
      <Modal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        title="Contact Support"
      >
        <form onSubmit={handleSupportSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject *
            </label>
            <Input
              type="text"
              required
              value={supportForm.subject}
              onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
              placeholder="API Integration Issue"
              className="bg-white/90 dark:bg-white/5 border-gray-200/70 dark:border-white/10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <Input
              type="email"
              required
              value={supportForm.email}
              onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
              placeholder="your@email.com"
              className="bg-white/90 dark:bg-white/5 border-gray-200/70 dark:border-white/10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message *
            </label>
            <Textarea
              required
              value={supportForm.message}
              onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
              placeholder="Describe your issue or question..."
              rows={5}
              className="bg-white/90 dark:bg-white/5 border-gray-200/70 dark:border-white/10"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSupportModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
