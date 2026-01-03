import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';
import { getBookings, updateBookingStatus, getTimeSlots, updateTimeSlot, type Booking as ApiBooking, type TimeSlot as ApiTimeSlot } from '@/lib/api';

interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('tutorAuth');
    if (!isAuth) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [navigate]);

  useEffect(() => {
    if (date) {
      loadBookingsForDate();
    }
  }, [date]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [slotsData] = await Promise.all([
        getTimeSlots()
      ]);
      setTimeSlots(slotsData.map(s => ({ time: s.time, available: s.available })));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookingsForDate = async () => {
    if (!date) return;
    try {
      const dateStr = date.toISOString().split('T')[0];
      const bookingsData = await getBookings(dateStr);
      setBookings(bookingsData.map(b => ({
        id: b.id!,
        name: b.name,
        email: b.email,
        phone: b.phone,
        date: new Date(b.date),
        time: b.time,
        status: b.status || 'pending'
      })));
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tutorAuth');
    toast({ title: 'Выход выполнен', description: 'До встречи!' });
    navigate('/');
  };

  const handleUpdateBookingStatus = async (id: number, status: 'confirmed' | 'cancelled') => {
    try {
      await updateBookingStatus(id, status);
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      toast({ 
        title: 'Статус обновлен', 
        description: status === 'confirmed' ? 'Запись подтверждена' : 'Запись отменена'
      });
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };

  const toggleTimeSlot = async (time: string) => {
    const slot = timeSlots.find(s => s.time === time);
    if (!slot) return;

    try {
      await updateTimeSlot(time, !slot.available);
      setTimeSlots(timeSlots.map(s => 
        s.time === time ? { ...s, available: !s.available } : s
      ));
      toast({ title: 'Расписание обновлено' });
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось обновить расписание',
        variant: 'destructive'
      });
    }
  };

  const filteredBookings = bookings.filter(b => 
    date && b.date.toDateString() === date.toDateString()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтверждено';
      case 'cancelled': return 'Отменено';
      default: return 'Ожидает';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Icon name="GraduationCap" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Панель репетитора
                </h1>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Icon name="Home" className="mr-2" size={18} />
                Главная
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <Icon name="LogOut" className="mr-2" size={18} />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Users" className="text-primary" size={20} />
                </div>
                <div>
                  <CardTitle className="text-lg">Всего записей</CardTitle>
                  <CardDescription className="text-2xl font-bold text-foreground">
                    {bookings.length}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Icon name="CheckCircle" className="text-green-500" size={20} />
                </div>
                <div>
                  <CardTitle className="text-lg">Подтверждено</CardTitle>
                  <CardDescription className="text-2xl font-bold text-foreground">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Icon name="Clock" className="text-yellow-500" size={20} />
                </div>
                <div>
                  <CardTitle className="text-lg">Ожидает</CardTitle>
                  <CardDescription className="text-2xl font-bold text-foreground">
                    {bookings.filter(b => b.status === 'pending').length}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Icon name="Calendar" className="text-primary" />
                Календарь и расписание
              </CardTitle>
              <CardDescription>Управляйте доступным временем для записи</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-xl border-2 shadow-sm w-full"
              />

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Clock" size={20} />
                  Временные слоты на {date?.toLocaleDateString()}
                </h3>
                <div className="space-y-2">
                  {timeSlots.map((slot) => (
                    <div 
                      key={slot.time} 
                      className="flex items-center justify-between p-3 rounded-lg border-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name="Clock" size={18} className="text-muted-foreground" />
                        <span className="font-medium">{slot.time}</span>
                        <Badge variant={slot.available ? 'default' : 'secondary'}>
                          {slot.available ? 'Доступно' : 'Закрыто'}
                        </Badge>
                      </div>
                      <Switch
                        checked={slot.available}
                        onCheckedChange={() => toggleTimeSlot(slot.time)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Icon name="ListChecks" className="text-secondary" />
                Записи на {date?.toLocaleDateString()}
              </CardTitle>
              <CardDescription>
                {filteredBookings.length > 0 
                  ? `${filteredBookings.length} ${filteredBookings.length === 1 ? 'запись' : 'записи'}`
                  : 'Нет записей на эту дату'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="CalendarOff" size={48} className="mx-auto mb-3 opacity-50" />
                    <p>На выбранную дату записей нет</p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <Card key={booking.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                              {booking.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{booking.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Icon name="Clock" size={14} />
                                {booking.time}
                              </div>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(booking.status)} text-white border-0`}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Icon name="Mail" size={16} className="text-muted-foreground" />
                            <a href={`mailto:${booking.email}`} className="text-primary hover:underline">
                              {booking.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Icon name="Phone" size={16} className="text-muted-foreground" />
                            <a href={`tel:${booking.phone}`} className="text-primary hover:underline">
                              {booking.phone}
                            </a>
                          </div>
                        </div>

                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-500 hover:bg-green-600"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                            >
                              <Icon name="Check" className="mr-1" size={16} />
                              Подтвердить
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="flex-1"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            >
                              <Icon name="X" className="mr-1" size={16} />
                              Отменить
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;