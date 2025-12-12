import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { ShoppingBag } from 'lucide-react';
import axios from '../../api/axios';

const MyPurchases = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (user?.role !== 'student') {
        navigate('/unauthorized');
      } else {
        fetchPurchases();
      }
    }
  }, [loading, user, navigate]);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get('/api/payments/');
      setPurchases(response.data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoadingPurchases(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-transparent">
        {/* Header */}
        <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900">My Purchases</h1>
          </div>
          <p className="text-gray-900">View your course purchases and transactions</p>
        </div>

        {/* Purchases List */}
        <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
          {loadingPurchases ? (
            <div className="text-center py-12 text-gray-700">Loading purchases...</div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-50" />
              <p className="text-gray-700 text-lg">No purchases yet</p>
              <p className="text-gray-700 text-sm mt-2">Explore courses and make your first purchase</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Course</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-gray-200 hover:bg-white transition">
                      <td className="px-4 py-3 text-white">{purchase.course_name || 'Course'}</td>
                      <td className="px-4 py-3 text-gray-700">${parseFloat(purchase.amount).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(purchase.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          purchase.status === 'completed'
                            ? 'bg-green-50 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {purchase.status ? purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1) : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyPurchases;
