'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader } from '@/components/ui/card2';
import { Button } from '@/components/ui/button2';
import { Input } from '@/components/ui/input';
import { User, Mail, Save, Edit2, X, Phone, MapPin, Globe } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    country: user?.country || 'Guatemala',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // CONECTA CON: PUT /api/profile
      // await api.put('/profile', formData);
      
      // AHORITA SOLO LOCAL
      
      updateUser({
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        country: formData.country,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      country: user?.country || 'Guatemala',
    });
    setIsEditing(false);
  };

  if (!user) return null;

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
                className="border-white/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {user.full_name || user.name}
              </h3>
              <p className="text-gray-400">{user.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                user.role === 'admin' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
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
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                placeholder="Ingresa tu nombre completo"
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
              />
              <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
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
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                placeholder="+502 1234-5678"
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
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                placeholder="Guatemala"
              />
            </div>

            <div className="md:col-span-2">
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
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                placeholder="Ingresa tu dirección completa"
              />
            </div>
          </div>

          {/* Account Info */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Información de la Cuenta</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">ID de Usuario</p>
                <p className="text-white font-mono text-sm">{user.id}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Rol</p>
                <p className="text-white capitalize">{user.role}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Saldo</p>
                <p className="text-white font-semibold">
                  ${user.balance?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Seguridad</h3>
            <div className="flex gap-4">
              <Button
                onClick={() => {/* Redirigir a cambiar contraseña */}}
                variant="outline"
                className="border-white/10"
              >
                Cambiar Contraseña
              </Button>
              <Button
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Habilitar 2FA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}