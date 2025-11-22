import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastProps } from '@/components/ui/Toast';

interface ToastContextType {
    showToast: (message: string, type?: ToastProps['type'], duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toast, setToast] = useState<{
        message: string;
        type: ToastProps['type'];
        duration: number;
        visible: boolean;
    } | null>(null);

    const showToast = (
        message: string,
        type: ToastProps['type'] = 'info',
        duration: number = 4000
    ) => {
        setToast({ message, type, duration, visible: true });
    };

    const showSuccess = (message: string, duration: number = 4000) => {
        showToast(message, 'success', duration);
    };

    const showError = (message: string, duration: number = 4000) => {
        showToast(message, 'error', duration);
    };

    const showWarning = (message: string, duration: number = 4000) => {
        showToast(message, 'warning', duration);
    };

    const showInfo = (message: string, duration: number = 4000) => {
        showToast(message, 'info', duration);
    };

    const hideToast = () => {
        setToast(null);
    };

    return (
        <ToastContext.Provider
            value={{
                showToast,
                showSuccess,
                showError,
                showWarning,
                showInfo,
            }}
        >
            {children}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    visible={toast.visible}
                    onHide={hideToast}
                />
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
