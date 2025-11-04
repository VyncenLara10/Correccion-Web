import { useState } from 'react';
import { 
  Users, 
  Search, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  registeredDate: string;
  lastActivity: string;
  portfolioValue: number;
  transactionsCount: number;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Anderson Aguirre',
    email: 'andersonaguirre793@gmail.com',
    role: 'user',
    status: 'active',
    registeredDate: '2024-01-15',
    lastActivity: '2024-11-03',
    portfolioValue: 25430.50,
    transactionsCount: 45
  },
  {
    id: '2',
    name: 'Alex Herrera',
    email: 'aherreraa5@miumg.edu.gt',
    role: 'admin',
    status: 'active',
    registeredDate: '2024-01-10',
    lastActivity: '2024-11-03',
    portfolioValue: 0,
    transactionsCount: 0
  },
  {
    id: '3',
    name: 'María García',
    email: 'maria.garcia@email.com',
    role: 'user',
    status: 'active',
    registeredDate: '2024-02-20',
    lastActivity: '2024-11-02',
    portfolioValue: 15680.75,
    transactionsCount: 28
  },
  {
    id: '4',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    role: 'user',
    status: 'suspended',
    registeredDate: '2024-03-05',
    lastActivity: '2024-10-15',
    portfolioValue: 8450.25,
    transactionsCount: 12
  },
  {
    id: '5',
    name: 'Ana López',
    email: 'ana.lopez@email.com',
    role: 'user',
    status: 'pending',
    registeredDate: '2024-11-01',
    lastActivity: '2024-11-01',
    portfolioValue: 0,
    transactionsCount: 0
  },
  {
    id: '6',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    role: 'user',
    status: 'active',
    registeredDate: '2024-01-25',
    lastActivity: '2024-11-03',
    portfolioValue: 42150.80,
    transactionsCount: 67
  }
];

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.status === 'active').length,
    suspended: mockUsers.filter(u => u.status === 'suspended').length,
    pending: mockUsers.filter(u => u.status === 'pending').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success text-white">Activo</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspendido</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-warning-light text-warning">Pendiente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' 
      ? <Badge variant="default" className="bg-brand-primary">Admin</Badge>
      : <Badge variant="outline">Usuario</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
          <p className="text-neutral-500">
            Administra todos los usuarios de la plataforma
          </p>
        </div>
        <Button className="bg-brand-primary">
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Total Usuarios</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-primary-light flex items-center justify-center">
                <Users className="h-6 w-6 text-brand-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Activos</p>
                <p className="text-2xl font-bold text-success">{stats.active}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Suspendidos</p>
                <p className="text-2xl font-bold text-danger">{stats.suspended}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center">
                <Ban className="h-6 w-6 text-danger" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning-light flex items-center justify-center">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="user">Usuarios</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="suspended">Suspendidos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead className="text-right">Portafolio</TableHead>
                <TableHead className="text-right">Transacciones</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-neutral-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-primary-light flex items-center justify-center">
                        <span className="text-brand-primary font-semibold">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-neutral-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-neutral-400" />
                      {new Date(user.registeredDate).toLocaleDateString('es-GT')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.lastActivity).toLocaleDateString('es-GT')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${user.portfolioValue.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.transactionsCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Shield className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar Email
                        </DropdownMenuItem>
                        {user.status === 'active' ? (
                          <DropdownMenuItem className="text-danger">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspender Usuario
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-success">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activar Usuario
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
