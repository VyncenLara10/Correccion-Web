import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Plus, Trash2, Check, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export function Settings() {
  const [payments, setPayments] = useState([
    { id: '1', alias: 'Mi Visa', masked: '****-****-****-4242', amount: 500 },
  ]);

  const [deposits, setDeposits] = useState([
    { id: '1', amount: 1000, status: 'completed', ref: 'DEP-ABC123' },
  ]);

  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);

  const [showAdd, setShowAdd] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [newAlias, setNewAlias] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  // Inicializar desde localStorage
  useEffect(() => {
    const savedBalance = localStorage.getItem('userBalance');
    const savedPending = localStorage.getItem('userPendingBalance');
    const savedPayments = localStorage.getItem('userPayments');
    const savedDeposits = localStorage.getItem('userDeposits');

    if (savedBalance) setAvailableBalance(parseFloat(savedBalance));
    if (savedPending) setPendingBalance(parseFloat(savedPending));
    if (savedPayments) setPayments(JSON.parse(savedPayments));
    if (savedDeposits) setDeposits(JSON.parse(savedDeposits));
  }, []);

  // Guardar balance en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem('userBalance', availableBalance.toString());
  }, [availableBalance]);

  useEffect(() => {
    localStorage.setItem('userPendingBalance', pendingBalance.toString());
  }, [pendingBalance]);

  useEffect(() => {
    localStorage.setItem('userPayments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('userDeposits', JSON.stringify(deposits));
  }, [deposits]);

  const addPayment = () => {
    if (!newAlias || !newNumber || !newAmount) return;
    const amount = parseFloat(newAmount);
    setPayments([...payments, {
      id: Date.now().toString(),
      alias: newAlias,
      masked: `****-****-****-${newNumber.slice(-4)}`,
      amount: amount
    }]);
    setAvailableBalance(availableBalance + amount);
    setShowAdd(false);
    setNewAlias('');
    setNewNumber('');
    setNewAmount('');
  };

  const deletePayment = (id: string) => {
    setPayments(payments.filter((p: any) => p.id !== id));
  };

  const addDeposit = () => {
    if (!depositAmount) return;
    const amount = parseFloat(depositAmount);
    const deposit = {
      id: Date.now().toString(),
      amount: amount,
      status: 'pending',
      ref: `DEP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    };
    setDeposits([deposit, ...deposits]);
    setPendingBalance(pendingBalance + amount);
    setDepositAmount('');
    setShowDeposit(false);
    
    setTimeout(() => {
      setDeposits((prev: any) => prev.map((d: any) =>
        d.id === deposit.id ? { ...d, status: 'completed' } : d
      ));
      setPendingBalance(pendingBalance - amount);
      setAvailableBalance(availableBalance + amount);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-neutral-900">Configuración</h2>
        <p className="text-muted-foreground mt-1">Administra tu cuenta y métodos de pago</p>
      </div>

      <Tabs defaultValue="balance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balance"><DollarSign className="h-4 w-4 mr-2" /></TabsTrigger>
          <TabsTrigger value="payment"><CreditCard className="h-4 w-4 mr-2" /></TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border bg-gradient-to-br from-brand-primary/10">
              <CardHeader>
                <CardTitle className="text-brand-primary">Balance Disponible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">${availableBalance.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2">USD</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-warning/10">
              <CardHeader>
                <CardTitle className="text-warning">Pendiente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">${pendingBalance.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2">En procesamiento</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Historial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deposits.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${d.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'}`}>
                      {d.status === 'completed' ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Clock className="h-4 w-4 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">${d.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{d.ref}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${d.status === 'completed' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                    {d.status === 'completed' ? 'Completado' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Dialog open={showDeposit} onOpenChange={setShowDeposit}>
            <DialogTrigger asChild>
              <Button className="w-full bg-brand-primary">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Dinero
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Depositar Dinero</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Monto (USD)</Label>
                  <Input type="number" placeholder="1000.00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="bg-input-background" />
                </div>
                <Button onClick={addDeposit} className="w-full bg-brand-primary">Confirmar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payments.map((p: any) => (
                <div key={p.id} className="rounded-lg border border-border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neutral-100">
                      <CreditCard className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{p.alias}</p>
                      <p className="text-sm text-muted-foreground">{p.masked}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deletePayment(p.id)} className="text-danger">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-brand-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Método
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Método de Pago</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nombre</Label>
                      <Input placeholder="Mi Visa" value={newAlias} onChange={(e) => setNewAlias(e.target.value)} className="bg-input-background" />
                    </div>
                    <div>
                      <Label>Número</Label>
                      <Input placeholder="4532015112830366" value={newNumber} onChange={(e) => setNewNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} className="bg-input-background font-mono" />
                    </div>
                    <div>
                      <Label>Cantidad (USD)</Label>
                      <Input type="number" placeholder="500.00" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="bg-input-background" />
                    </div>
                    <Button onClick={addPayment} className="w-full bg-brand-primary">Agregar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
