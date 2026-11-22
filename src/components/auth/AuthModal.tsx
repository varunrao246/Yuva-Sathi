'use client';

import React, { useState } from 'react';
import { X, UserCheck, Shield, GraduationCap, Sparkles, Lock, Mail, Building, User } from 'lucide-react';
import { UserProfile } from '@/types';
import { AppMode } from '@/lib/storage';
import { useToast } from '../ui/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  appMode: AppMode;
  onSaveProfile: (profile: Partial<UserProfile>) => void;
  onRegisterUser: (newProfile: Omit<UserProfile, 'id' | 'createdAt' | 'onboardingCompleted'>) => void;
  onSwitchMode: (mode: AppMode) => void;
  onLoginDemo: (name: string, email: string) => void;
  onLogout: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  appMode,
  onSaveProfile,
  onRegisterUser,
  onSwitchMode,
  onLoginDemo,
  onLogout,
}: AuthModalProps) {
  const [tab, setTab] = useState<'profile' | 'register' | 'switch-demo'>('profile');

  // Profile / Register fields
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState(currentUser.college || '');
  const [course, setCourse] = useState(currentUser.course || 'B.Tech Computer Science');
  const [studyYear, setStudyYear] = useState(currentUser.studyYear || '3rd Year');

  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }

    onSaveProfile({
      name: name.trim(),
      email: email.trim(),
      college: college.trim(),
      course: course.trim(),
      studyYear,
    });

    showToast('Profile updated successfully!', 'success');
    onClose();
  };

  const handleRegisterNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid college email address', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    onRegisterUser({
      name: name.trim(),
      email: email.trim(),
      college: college.trim() || 'Indian University / College',
      course: course.trim() || 'General Studies',
      studyYear,
    });

    showToast(`Welcome to Yuva Sathi, ${name.split(' ')[0]}! Starting financial onboarding.`, 'success');
    onClose();
  };

  const handleDemoPersonaSwitch = (demoName: string, demoEmail: string, demoCollege: string) => {
    onSwitchMode('demo');
    onLoginDemo(demoName, demoEmail);
    onSaveProfile({
      name: demoName,
      email: demoEmail,
      college: demoCollege,
      course: 'B.Tech Computer Science',
      studyYear: '3rd Year',
    });
    showToast(`Active persona: ${demoName} (${demoCollege.split(',')[0]})`, 'success');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E9E1D3]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#FAF7F0] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 id="auth-modal-title" className="font-bold text-forest-900 text-base">
                Student Account & Identity
              </h3>
              <p className="text-[11px] text-gray-500">
                Mode: <span className="font-bold text-forest-800">{appMode === 'demo' ? 'Demo Sandbox' : 'Personal Account'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-charcoal-800 p-1 rounded-lg"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-[#FAF7F0] p-1 mb-4 border border-[#E9E1D3]">
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-smooth ${
              tab === 'profile'
                ? 'bg-white text-forest-900 shadow-2xs'
                : 'text-charcoal-700 hover:text-forest-800'
            }`}
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-smooth ${
              tab === 'register'
                ? 'bg-white text-forest-900 shadow-2xs'
                : 'text-charcoal-700 hover:text-forest-800'
            }`}
          >
            Register Fresh
          </button>
          <button
            type="button"
            onClick={() => setTab('switch-demo')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-smooth ${
              tab === 'switch-demo'
                ? 'bg-white text-forest-900 shadow-2xs'
                : 'text-charcoal-700 hover:text-forest-800'
            }`}
          >
            Demo Personas
          </button>
        </div>

        {/* TAB 1: EDIT PROFILE */}
        {tab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-3.5">
            <div>
              <label htmlFor="edit-name" className="block text-xs font-semibold text-charcoal-800 mb-1">
                Full Name *
              </label>
              <input
                id="edit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs md:text-sm text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="edit-email" className="block text-xs font-semibold text-charcoal-800 mb-1">
                Email Address *
              </label>
              <input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs md:text-sm text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-college" className="block text-xs font-semibold text-charcoal-800 mb-1">
                  College / Campus
                </label>
                <input
                  id="edit-college"
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
                />
              </div>
              <div>
                <label htmlFor="edit-year" className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Study Year
                </label>
                <select
                  id="edit-year"
                  value={studyYear}
                  onChange={(e) => setStudyYear(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs font-medium text-charcoal-900 focus:outline-none focus:border-forest-600"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onLogout}
                className="text-xs text-red-600 hover:text-red-700 font-semibold"
              >
                Log Out
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-charcoal-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold text-xs rounded-xl shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER FRESH USER */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterNew} className="space-y-3">
            <p className="text-xs text-charcoal-700">
              Create a personalized financial ledger. Starts with a blank slate and guides you through onboarding.
            </p>

            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-charcoal-800 mb-1">
                Full Name *
              </label>
              <input
                id="reg-name"
                type="text"
                placeholder="e.g. Priyanshu Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-charcoal-800 mb-1">
                College Email *
              </label>
              <input
                id="reg-email"
                type="email"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-charcoal-800 mb-1">
                Password * (min. 6 characters)
              </label>
              <input
                id="reg-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="reg-college" className="block text-xs font-semibold text-charcoal-800 mb-1">
                  College / Institute
                </label>
                <input
                  id="reg-college"
                  type="text"
                  placeholder="e.g. BITS Pilani"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="reg-year" className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Year
                </label>
                <select
                  id="reg-year"
                  value={studyYear}
                  onChange={(e) => setStudyYear(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs font-medium text-charcoal-900 focus:outline-none focus:border-forest-600"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-charcoal-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold text-xs rounded-xl shadow-xs"
              >
                Register & Start Setup
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: DEMO PERSONA SWITCHER */}
        {tab === 'switch-demo' && (
          <div className="space-y-3">
            <p className="text-xs text-charcoal-700">
              Judges can preview realistic Indian campus data without entering manual expenses.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoPersonaSwitch('Rohan Sharma', 'rohan@pes.edu', 'PES University, Bangalore')}
                className="w-full p-3 text-left rounded-xl border border-[#E9E1D3] hover:border-forest-400 bg-[#FAF7F0] hover:bg-forest-50/50 transition-smooth"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-forest-900">Rohan Sharma (Bangalore)</span>
                  <span className="text-[10px] bg-forest-100 text-forest-800 font-semibold px-2 py-0.5 rounded-full">Active Default</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  PES University Bangalore • ₹12,000 pocket money + freelance • Hostel & Metro commitments
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoPersonaSwitch('Ananya Verma', 'ananya@du.ac.in', 'Delhi University')}
                className="w-full p-3 text-left rounded-xl border border-[#E9E1D3] hover:border-forest-400 bg-[#FAF7F0] hover:bg-forest-50/50 transition-smooth"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-forest-900">Ananya Verma (Delhi)</span>
                  <span className="text-[10px] bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded-full">North Campus</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  Delhi University • ₹10,000 allowance • PG rent & yellow line metro pass
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoPersonaSwitch('Aarav Nair', 'aarav@iitm.ac.in', 'IIT Madras')}
                className="w-full p-3 text-left rounded-xl border border-[#E9E1D3] hover:border-forest-400 bg-[#FAF7F0] hover:bg-forest-50/50 transition-smooth"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-forest-900">Aarav Nair (Chennai)</span>
                  <span className="text-[10px] bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded-full">Hostel Tech</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  IIT Madras • ₹14,000 stipend • Mess food, high-speed campus internet, robotics savings
                </p>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-charcoal-900"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
