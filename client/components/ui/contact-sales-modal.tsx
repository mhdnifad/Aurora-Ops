"use client";

import { useState } from 'react';
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

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please provide both subject and message');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.request('POST', '/api/contact/sales', {
        subject,
        message,
        company,
      });
      toast.success('Your message has been sent. Our team will reach out soon.');
      onClose();
      setMessage('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
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
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </ModalFooter>
      </>
    </Modal>
  );
}
