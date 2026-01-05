import React from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Smartphone, Globe, CreditCard, User as UserIcon } from 'lucide-react';
import { UserData } from '../types/user';

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, user }) => {
    if (!user) return null;

    // Helper to format date
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleString();
        } catch {
            return dateStr;
        }
    };

    // Helper to safely get nested value or fallback
    const getVal = (val: any) => val || <span className="text-gray-600 italic">Not set</span>;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-[#0F0F0F] border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <Dialog.Title as="h3" className="text-xl font-bold text-white flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            {user.profile?.photoURL ? (
                                                <img src={user.profile.photoURL} alt="User" className="w-full h-full rounded-full" />
                                            ) : (
                                                <span className="text-lg font-bold">{user.email?.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {user.email}
                                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-gray-400 border border-white/5">
                                                    v{user.meta?.schemaVersion ?? 1}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-400 font-mono">{user.id}</div>
                                        </div>
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Column 1 */}
                                    <div className="space-y-6">
                                        {/* Profile */}
                                        <section className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <h4 className="flex items-center gap-2 text-[#FACC15] font-semibold mb-3">
                                                <UserIcon className="w-4 h-4" /> Profile & Onboarding
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Persona:</span>
                                                    <span className="text-white">{getVal(user.preferences?.onboarding?.userPersona)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Role:</span>
                                                    <span className="text-white">{getVal(user.preferences?.onboarding?.userRole)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Experience:</span>
                                                    <span className="text-white">{getVal(user.preferences?.onboarding?.userExperience)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Referral:</span>
                                                    <span className="text-white">{getVal(user.preferences?.onboarding?.userReferral)}</span>
                                                </div>
                                                <hr className="border-white/10 my-2" />
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Locale:</span>
                                                    <span className="text-white font-mono">{getVal(user.profile?.locale)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Created:</span>
                                                    <span className="text-white">{formatDate(user.profile?.createdAt || user.createdAt)}</span>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Tailor Preferences */}
                                        <section className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <h4 className="flex items-center gap-2 text-purple-400 font-semibold mb-3">
                                                <Globe className="w-4 h-4" /> Tailor Preferences
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <div className="text-xs text-gray-500 mb-0.5">Output Language</div>
                                                        <div className="text-white">{getVal(user.preferences?.tailor?.outputLanguage)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 mb-0.5">Programming Lang</div>
                                                        <div className="text-white">{getVal(user.preferences?.tailor?.programmingLanguage)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 mb-0.5">Audio Language</div>
                                                        <div className="text-white">{getVal(user.preferences?.tailor?.audioLanguage)}</div>
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="text-xs text-gray-500 mb-1">Custom Prompt</div>
                                                    <div className="bg-black/30 p-2 rounded text-gray-300 text-xs italic border border-white/5">
                                                        {user.preferences?.tailor?.customPrompt || 'No custom prompt set.'}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Column 2 */}
                                    <div className="space-y-6">
                                        {/* Access & Usage */}
                                        <section className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <h4 className="flex items-center gap-2 text-green-400 font-semibold mb-3">
                                                <CreditCard className="w-4 h-4" /> Access & Usage
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-white/5 p-3 rounded-lg text-center">
                                                    <div className="text-xs text-gray-500">Plan</div>
                                                    <div className="text-lg font-bold text-white capitalize">
                                                        {user.access?.planId || user.plan || 'Free'}
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-lg text-center">
                                                    <div className="text-xs text-gray-500">Status</div>
                                                    <div
                                                        className={`text-lg font-bold capitalize ${user.access?.accessStatus === 'active' || user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}
                                                    >
                                                        {user.access?.accessStatus || user.status || 'Active'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Quota Used:</span>
                                                    <span className="text-white">
                                                        {Math.round((user.usage?.quotaSecondsUsed || user.quotaSecondsUsed || 0) / 60)} mins
                                                        <span className="text-gray-600 text-xs">
                                                            {' '}
                                                            / {Math.round((user.usage?.quotaSecondsMonth || user.quotaSecondsMonth || 3600) / 60)}
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
                                                    <div
                                                        className="bg-green-500 h-1.5 rounded-full"
                                                        style={{
                                                            width: `${Math.min(100, ((user.usage?.quotaSecondsUsed || user.quotaSecondsUsed || 0) / (user.usage?.quotaSecondsMonth || user.quotaSecondsMonth || 3600)) * 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        {/* Devices & Security */}
                                        <section className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <h4 className="flex items-center gap-2 text-blue-400 font-semibold mb-3">
                                                <Smartphone className="w-4 h-4" /> Devices & Security
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Device Count:</span>
                                                    <span className="text-white">{user.devicesSummary?.deviceCount || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Last Platform:</span>
                                                    <span className="text-white">{getVal(user.devicesSummary?.lastPlatform)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Last IP:</span>
                                                    <span className="text-white font-mono text-xs">
                                                        {getVal(user.security?.lastLoginIp || user.id /* fallback for now */)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Last Seen:</span>
                                                    <span className="text-white">
                                                        {formatDate(user.devicesSummary?.lastSeenAt || user.profile?.lastLoginAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Raw Data Toggle (Optional) */}
                                        <details className="text-xs text-gray-500 cursor-pointer">
                                            <summary className="hover:text-gray-300">View Raw JSON</summary>
                                            <pre className="mt-2 p-2 bg-black rounded border border-white/10 overflow-x-auto text-[10px] text-gray-400">
                                                {JSON.stringify(user, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default UserDetailsModal;
