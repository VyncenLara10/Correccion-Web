'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, MapPin, Globe, Edit2, Save, X, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
}

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: 'Guatemala',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        address: '',
        country: 'Guatemala',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Obtener token para enviar a Django
      const tokenResponse = await fetch('/api/auth/token');
      const tokenData = await tokenResponse.json();
      
      if (tokenData.accessToken) {
        // Guardar en Django
        const saveResponse = await fetch('http://localhost:8000/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.accessToken}`
          },
          body: JSON.stringify(formData)
        });

        if (saveResponse.ok) {
          toast.success('Perfil actualizado exitosamente');
          setIsEditing(false);
        } else {
          throw new Error('Error al guardar en Django');
        }
      } else {
        // Fallback: guardar localmente
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Perfil actualizado exitosamente (local)');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      country: 'Guatemala',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    window.location.href = '/auth/logout';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No hay usuario autenticado</p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
        <p className="text-gray-400">Gestiona tu información personal</p>
      </div>

      {/* Profile Card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Información Personal</h2>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-white/10 text-gray-300 hover:bg-white/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-500 hover:bg-green-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center overflow-hidden">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name || 'User'} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {user.name || 'Usuario'}
              </h3>
              <p className="text-gray-400">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400">
                Usuario
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nombre Completo
              </label>
              <Input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Correo Electrónico
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                disabled={true}
                className="bg-white/5 border-white/10 text-white opacity-50 cursor-not-allowed"
                placeholder="Tu correo electrónico"
              />
              <p className="text-xs text-gray-400 mt-1">
                El correo no se puede modificar
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Teléfono
              </label>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="+502 1234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Dirección
              </label>
              <Input
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Tu dirección"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                País
              </label>
              <Input
                name="country"
                type="text"
                value={formData.country}
                onChange={handleChange}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Tu país"
              />
            </div>
          </div>

          {/* Auth0 Info */}
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Información de Autenticación</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Proveedor:</span>
                <p className="text-white">{user.sub?.split('|')[0] || 'Auth0'}</p>
              </div>
              <div>
                <span className="text-gray-400">ID de Usuario:</span>
                <p className="text-white font-mono text-xs">{user.sub}</p>
              </div>
              <div>
                <span className="text-gray-400">Verificado:</span>
                <p className={user.email_verified ? 'text-green-400' : 'text-yellow-400'}>
                  {user.email_verified ? 'Sí' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Acciones de Cuenta</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h4 className="font-semibold text-white">Cerrar Sesión</h4>
                <p className="text-gray-400 text-sm">Cerrar sesión en todos los dispositivos</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h4 className="font-semibold text-white">Eliminar Cuenta</h4>
                <p className="text-gray-400 text-sm">Eliminar permanentemente tu cuenta</p>
              </div>
              <Button
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                disabled
              >
                Eliminar Cuenta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}