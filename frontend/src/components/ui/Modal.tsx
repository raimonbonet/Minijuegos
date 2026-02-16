import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-[var(--bg-panel)] border border-[var(--text-main)]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4 border-b border-[var(--text-main)]/10 pb-2">
                    <h3 className="text-xl font-black uppercase italic text-[var(--text-main)]">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-[var(--text-main)]/60 hover:text-[var(--text-main)] transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="text-[var(--text-main)]">
                    {children}
                </div>
            </div>
        </div>
    );
};
