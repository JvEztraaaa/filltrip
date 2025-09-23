import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

export default function AccountSettingsModal({ open, onClose }) {
  const { currentUser, updateProfile, updateAvatar, updatePassword } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ fullName: '', username: '', email: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTab('profile');
      setForm({ fullName: currentUser?.fullName || '', username: currentUser?.username || '', email: currentUser?.email || '' });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setNotice('');
      setError('');
      setTimeout(() => dialogRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSaving(true);
    try {
      await updateAvatar(f);
      showNotice('Profile photo updated');
      // reset file input so selecting the same file again triggers change
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      showError((err && err.message) || 'Upload failed');
    } finally { setSaving(false); }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await updateProfile({ fullName: form.fullName, username: form.username, email: form.email });
      const u = res?.user || null;
      if (u) setForm({ fullName: u.fullName || '', username: u.username || '', email: u.email || '' });
      showNotice('Account details updated');
    } catch (err) {
      showError((err && err.message) || 'Update failed');
    } finally { setSaving(false); }
  };

  const savePassword = async () => {
    if (!pw.newPassword || pw.newPassword !== pw.confirm) return;
    setSaving(true);
    try {
      await updatePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      showNotice('Password updated');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      showError((err && err.message) || 'Password update failed');
    } finally { setSaving(false); }
  };

  const showNotice = (msg) => {
    setNotice(msg);
    setError('');
    setTimeout(() => { setNotice(''); }, 3000);
  };
  const showError = (msg) => {
    setError(msg);
    setNotice('');
    setTimeout(() => { setError(''); }, 3000);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
    <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true"
        className="bg-[#0f1724] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.45)] w-full max-w-2xl max-h-[88vh] overflow-y-auto text-gray-100 border border-white/5">
      <div className="bg-gradient-to-r from-teal-500/20 via-teal-500/10 to-indigo-500/10 px-6 py-4 border-b border-white/5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Account settings</h3>
              <p className="text-sm text-gray-400">Manage your profile and security</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors cursor-pointer">
            <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex gap-2 mb-4">
            <button className={`px-3 py-1.5 rounded-md text-sm cursor-pointer ${tab==='profile'?'bg-gray-700 text-white':'text-gray-300 hover:bg-gray-700/70'}`} onClick={()=>setTab('profile')}>Profile</button>
            <button className={`px-3 py-1.5 rounded-md text-sm cursor-pointer ${tab==='security'?'bg-gray-700 text-white':'text-gray-300 hover:bg-gray-700/70'}`} onClick={()=>setTab('security')}>Security</button>
          </div>
          {(notice || error) && (
            <div className={`mb-3 text-sm rounded-md border px-3 py-2 ${notice ? 'border-teal-600/50 bg-teal-900/30 text-teal-200' : 'border-rose-600/50 bg-rose-900/30 text-rose-200'}`}>
              {notice || error}
            </div>
          )}
        </div>

        {tab==='profile' && (
          <div className="px-6 pb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden ring-1 ring-gray-700 bg-gray-800 flex items-center justify-center">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-7 h-7 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zM3.172 20.828A4 4 0 017 19h10a4 4 0 013.828 1.828A1 1 0 0119.999 23H4.001a1 1 0 01-.829-1.672z"/></svg>
                )}
              </div>
              <div>
                <button onClick={()=>fileRef.current?.click()} className="px-3 py-1.5 text-sm rounded-md bg-teal-500 hover:bg-teal-400 text-white cursor-pointer shadow-sm">Upload new</button>
                <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleFile} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Full name</label>
      <input className="w-full rounded-lg bg-gray-900/60 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 placeholder:text-gray-500"
                       value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Username</label>
      <input className="w-full rounded-lg bg-gray-900/60 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 placeholder:text-gray-500"
                       value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Email</label>
      <input type="email" className="w-full rounded-lg bg-gray-900/60 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 placeholder:text-gray-500"
                       value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-gray-700/80 cursor-pointer">Close</button>
              <button disabled={saving} onClick={saveProfile} className="px-3 py-1.5 text-sm rounded-md bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white disabled:opacity-60 cursor-pointer">{saving? 'Saving...' : 'Save changes'}</button>
            </div>
          </div>
        )}

        {tab==='security' && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Current password</label>
                <input type="password" className="w-full rounded-lg bg-gray-900/60 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 placeholder:text-gray-500"
                       value={pw.currentPassword} onChange={e=>setPw({...pw, currentPassword:e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">New password</label>
                <input type="password" className="w-full rounded-lg bg-gray-900/60 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 placeholder:text-gray-500"
                       value={pw.newPassword} onChange={e=>setPw({...pw, newPassword:e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Confirm new password</label>
                <input type="password" className="w-full rounded-lg bg-gray-900/60 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 placeholder:text-gray-500"
                       value={pw.confirm} onChange={e=>setPw({...pw, confirm:e.target.value})} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-gray-700/80 cursor-pointer">Close</button>
              <button disabled={saving || !pw.newPassword || pw.newPassword!==pw.confirm} onClick={savePassword} className="px-3 py-1.5 text-sm rounded-md bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white disabled:opacity-60 cursor-pointer">{saving? 'Saving...' : 'Update password'}</button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
