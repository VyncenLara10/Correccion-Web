import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Activity, Eye, Edit, Trash2 } from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const API_BASE_URL = 'http://localhost:8000/api';

interface DashboardStats {
  total_users: number;
  total_volume: number;
  transactions_today: number;
  active_users: number;
  new_users_this_month: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  trades: number;
  status: string;
}

interface Activity {
  user: string;
  action: string;
  amount: string;
  time: string;
}

interface ChartData {
  month: string;
  volume?: number;
  users?: number;
}

export function Admin() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userData, setUserData] = useState<User[]>([]);
  const [tradingVolumeData, setTradingVolumeData] = useState<ChartData[]>([]);
  const [newUsersData, setNewUsersData] = useState<ChartData[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // Fetch stats
        const statsResponse = await fetch(`${API_BASE_URL}/admin/dashboard_stats/`, { headers });
        if (statsResponse.ok) {
          setStats(await statsResponse.json());
        }

        // Fetch users
        const usersResponse = await fetch(`${API_BASE_URL}/admin/users_list/`, { headers });
        if (usersResponse.ok) {
          setUserData(await usersResponse.json());
        }

        // Fetch trading volume data
        const volumeResponse = await fetch(`${API_BASE_URL}/admin/trading_volume_data/`, { headers });
        if (volumeResponse.ok) {
          setTradingVolumeData(await volumeResponse.json());
        }

        // Fetch new users data
        const newUsersResponse = await fetch(`${API_BASE_URL}/admin/new_users_data/`, { headers });
        if (newUsersResponse.ok) {
          setNewUsersData(await newUsersResponse.json());
        }

        // Fetch recent activity
        const activityResponse = await fetch(`${API_BASE_URL}/admin/recent_activity/`, { headers });
        if (activityResponse.ok) {
          setRecentActivity(await activityResponse.json());
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="space-y-6">
      {loading && <div className="text-center py-10">Cargando datos...</div>}
      {error && <div className="text-center py-10 text-red-500">{error}</div>}
      
      {!loading && stats && (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Usuarios"
              value={stats.total_users.toString()}
              change={`+${stats.new_users_this_month} este mes`}
              changeType="positive"
              icon={Users}
              iconColor="text-brand-primary"
            />
            <StatCard
              title="Volumen Total"
              value={`$${(stats.total_volume / 1000000).toFixed(1)}M`}
              change={`+${stats.total_volume > 0 ? '$' : ''}${(stats.total_volume / 1000).toFixed(0)}K`}
              changeType="positive"
              icon={DollarSign}
              iconColor="text-success"
            />
            <StatCard
              title="Transacciones Hoy"
              value={stats.transactions_today.toString()}
              change="+5% vs ayer"
              changeType="positive"
              icon={TrendingUp}
              iconColor="text-info"
            />
            <StatCard
              title="Usuarios Activos"
              value={stats.active_users.toString()}
              change={`${Math.round((stats.active_users / stats.total_users) * 100)}% del total`}
              changeType="neutral"
              icon={Activity}
              iconColor="text-warning"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Volumen de Trading</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={tradingVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      formatter={(value: number) => `$${(value / 1000).toFixed(0)}K`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px' 
                      }}
                    />
                    <Bar dataKey="volume" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Nuevos Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={newUsersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px' 
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Actividad del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                    <div>
                      <p className="text-neutral-900">{activity.user}</p>
                      <p className="text-sm text-muted-foreground mt-1">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-900">{activity.amount}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(activity.time).toLocaleString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
