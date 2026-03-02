import { useState } from 'react';
import { api } from '@/services/api';

export default function DomainValidator({ domain }: { domain: string }) {
    const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
    const [message, setMessage] = useState('');

    const checkAvailability = async () => {
        setStatus('checking');
        try {
            const result = await api.validateDomain(domain);
            setStatus(result.available ? 'available' : 'unavailable');
            setMessage(result.available ? 'Available!' : 'Not available');
        } catch (error) {
            console.error("Domain check failed:", error);
            setStatus('idle');
            setMessage('Error checking domain');
        }
    };

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-meta-4 rounded-lg border border-stroke">
            <span className="font-medium text-black dark:text-white">{domain}</span>
            <div className="flex items-center gap-3">
                {status !== 'idle' && (
                    <span className={`text-sm ${status === 'available' ? 'text-green-500' : status === 'unavailable' ? 'text-red-500' : 'text-gray-500'
                        }`}>
                        {status === 'checking' ? 'Checking...' : message}
                    </span>
                )}
                <button
                    onClick={checkAvailability}
                    disabled={status === 'checking'}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${status === 'available'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-primary text-white hover:bg-opacity-90'
                        } disabled:opacity-50`}
                >
                    {status === 'available' ? 'Buy Now' : 'Check Availability'}
                </button>
            </div>
        </div>
    );
}
