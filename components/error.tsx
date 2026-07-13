'use client'
import { ErrorMessageProps, ErrorProps } from '../types';

const ErrorContent = ({ message }: Pick<ErrorProps, 'message'>) => (
    <>
        <h3 className="text-xl font-semibold text-red-600 mb-3">
            Failed to load
        </h3>

        <p className="text-gray-700">
            {message}
        </p>
    </>
);

const ErrorMessage = ({
    error,
    renderPanel = true,
}: ErrorMessageProps) => {
    if (renderPanel) {
        return (
            <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
                <ErrorContent message={error?.message ?? ''} />
            </div>
        );
    }

    return <ErrorContent message={error?.message ?? ''} />;
};

export default ErrorMessage;