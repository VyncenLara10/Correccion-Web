'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Gift, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user, refreshUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    country: user?.country || 'Guatemala',
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.updateProfile(formData);
      await refreshUser();
      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Información Personal</CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Editar Perfil
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Cancelar
                </Button>
                <Button onClick={handleSave} isLoading={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nombre Completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-white">{user.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <p className="text-white">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">No se puede cambiar</p>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Teléfono
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-white">{user.phone || 'No especificado'}</p>
              )}
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                País
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-white">{user.country}</p>
              )}
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Dirección
              </label>
              {isEditing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-white">{user.address || 'No especificada'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Usuario</label>
              <p className="text-white">{user.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Rol</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user.role === 'admin' ? 'bg-primary-500/10 text-primary-500' : 'bg-gray-700 text-gray-300'
              }`}>
                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user.status === 'active' ? 'bg-success-DEFAULT/10 text-success-DEFAULT' : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {user.status === 'active' ? 'Activa' : 'Pendiente'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Miembro desde</label>
              <p className="text-white">{user.created_at ? formatDate(user.created_at) : 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Card */}
      <Card className="bg-gradient-to-br from-primary-500/10 to-primary-600/10 border-primary-500/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="w-5 h-5 mr-2" />
            Programa de Referidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">
            Comparte tu código de referido y gana $5 por cada amigo que se registre
          </p>
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div>
              <p className="text-sm text-gray-400 mb-1">Tu código de referido</p>
              <p className="text-2xl font-bold text-white">{user.referral_code}</p>
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(user.referral_code);
                toast.success('Código copiado al portapapeles');
              }}
              variant="outline"
            >
              Copiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Balance de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Balance Disponible</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(user.balance)}</p>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Valor del Portafolio</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(user.portfolio_value || 0)}</p>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Ganancia/Pérdida Total</p>
              <p className={`text-2xl font-bold ${
                (user.total_profit_loss || 0) >= 0 ? 'text-success-DEFAULT' : 'text-danger-DEFAULT'
              }`}>
                {formatCurrency(user.total_profit_loss || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}