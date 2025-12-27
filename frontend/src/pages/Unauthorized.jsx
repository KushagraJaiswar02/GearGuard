import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold text-red-600">403 - Unauthorized</h1>
            <p className="mt-4 text-lg">You do not have permission to access this page.</p>
            <Link to="/dashboard" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Go to Dashboard</Link>
        </div>
    );
};

export default Unauthorized;
