import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (credentials.email === 'admin@paideia.ru' && credentials.password === 'admin123') {
        localStorage.setItem('tutorAuth', 'true');
        toast({ title: 'Вход выполнен', description: 'Добро пожаловать!' });
        navigate('/admin');
      } else {
        toast({ 
          title: 'Ошибка входа', 
          description: 'Неверный email или пароль',
          variant: 'destructive'
        });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-2 animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Icon name="GraduationCap" size={40} className="text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Вход для репетитора
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Войдите в систему управления
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Icon name="Mail" className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@paideia.ru"
                  className="pl-10"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Icon name="Lock" className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 mt-6"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                  Вход...
                </>
              ) : (
                <>
                  <Icon name="LogIn" className="mr-2" size={20} />
                  Войти
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-muted-foreground"
            >
              <Icon name="ArrowLeft" className="mr-2" size={16} />
              Вернуться на главную
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p className="font-semibold mb-1">Демо-доступ:</p>
            <p>Email: admin@paideia.ru</p>
            <p>Пароль: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;