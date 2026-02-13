"use client";

import { useState, useRef } from 'react';
import { Modal, ModalFooter } from './modal';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api-client';

interface ContactSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactSalesModal({ isOpen, onClose }: ContactSalesModalProps) {
  const { user } = useAuth();
  const [subject, setSubject] = useState('Aurora Ops Enterprise Inquiry');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Use number for browser setTimeout
  const timeoutRef = useRef<number | null>(null);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please provide both subject and message');
      return;
    }

    setIsSubmitting(true);
    let didTimeout = false;
    timeoutRef.current = window.setTimeout(() => {
      didTimeout = true;
      setIsSubmitting(false);
      toast.error('Request timed out. Please try again later.');
    }, 10000); // 10 seconds
    try {
      await apiClient.request('POST', '/api/contact/sales', {
        subject,
        message,
        company,
      });
      if (!didTimeout) {
        toast.success('Your message has been sent. Our team will reach out soon.');
        onClose();
        setMessage('');
      }
    } catch (error: any) {
      if (!didTimeout) {
        toast.error(error?.response?.data?.message || 'Failed to send message');
      }
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (!didTimeout) setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Sales" description="Tell us about your needs and we'll tailor a plan for you" size="md">
      <>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="text-sm font-medium text-gray-700">Your Name</label>
              <Input id="contact-name" name="name" value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()} disabled />
            </div>
            <div>
              <label htmlFor="contact-email" className="text-sm font-medium text-gray-700">Email</label>
              <Input id="contact-email" name="email" value={user?.email || ''} disabled />
            </div>
          </div>
          <div>
            <label htmlFor="contact-company" className="text-sm font-medium text-gray-700">Company (optional)</label>
            <Input id="contact-company" name="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your company" />
          </div>
          <div>
            <label htmlFor="contact-subject" className="text-sm font-medium text-gray-700">Subject</label>
            <Input id="contact-subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          </div>
          <div>
            <label htmlFor="contact-message" className="text-sm font-medium text-gray-700">Message</label>
            <Textarea id="contact-message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us about your requirements" rows={5} />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center gap-2">
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            )}
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </ModalFooter>
      </>
    </Modal>
  );
}
