import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { createBooking, getTimeSlots } from '@/lib/api';

const Index = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = async () => {
    try {
      const slots = await getTimeSlots();
      const availableSlots = slots.filter(s => s.available).map(s => s.time);
      setTimeSlots(availableSlots);
    } catch (error) {
      console.error('Error loading time slots:', error);
      setTimeSlots(['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !selectedTime) {
      toast({ title: 'Ошибка', description: 'Выберите дату и время', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await createBooking({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: date.toISOString().split('T')[0],
        time: selectedTime
      });
      
      toast({ 
        title: 'Урок забронирован!', 
        description: `${formData.name}, ждём вас ${date.toLocaleDateString()} в ${selectedTime}` 
      });
      setBookingOpen(false);
      setFormData({ name: '', email: '', phone: '' });
      setSelectedTime('');
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось создать бронирование. Попробуйте позже.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Paideia
          </div>
          <div className="flex gap-6 items-center">
            <a href="#tariffs" className="font-medium hover:text-primary transition-colors">Тарифы</a>
            <a href="#booking" className="font-medium hover:text-primary transition-colors">Запись</a>
            <a href="#contacts" className="font-medium hover:text-primary transition-colors">Контакты</a>
          </div>
        </nav>
      </header>

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <Badge className="mb-4 bg-gradient-to-r from-primary to-secondary text-white border-0 px-4 py-1 text-sm">
            Первый урок бесплатно!
          </Badge>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            Обучение с лучшими репетиторами
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Индивидуальные занятия для достижения ваших целей. Попробуйте первый урок бесплатно и убедитесь в качестве нашего подхода.
          </p>
          <div className="flex gap-4 justify-center">
            <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                  <Icon name="Calendar" className="mr-2" size={20} />
                  Записаться на урок
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Бронирование урока</DialogTitle>
                  <DialogDescription>Выберите удобную дату и время для занятия</DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold mb-3 block">Выберите дату</Label>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-xl border shadow-sm"
                          disabled={(date) => date < new Date()}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold mb-3 block">Выберите время</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={selectedTime === time ? 'default' : 'outline'}
                              onClick={() => setSelectedTime(time)}
                              className="h-12"
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-4">
                        <div>
                          <Label htmlFor="name">Имя</Label>
                          <Input
                            id="name"
                            placeholder="Ваше имя"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Телефон</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+7 (999) 123-45-67"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                        Бронирование...
                      </>
                    ) : (
                      <>
                        <Icon name="Check" className="mr-2" size={20} />
                        Подтвердить бронирование
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:border-primary">
              <Icon name="PlayCircle" className="mr-2" size={20} />
              О нас
            </Button>
          </div>
        </div>
      </section>

      <section id="tariffs" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Тарифы
          </h2>
          <p className="text-xl text-muted-foreground">Прозрачные цены без скрытых платежей</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
            <CardHeader>
              <div className="mb-2">
                <Icon name="Gift" size={48} className="text-primary" />
              </div>
              <CardTitle className="text-2xl">Пробный урок</CardTitle>
              <CardDescription className="text-base">Первое знакомство</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Бесплатно
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span>60 минут занятия</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span>Оценка уровня знаний</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span>Персональный план обучения</span>
                </li>
              </ul>
              <div className="flex gap-2 mt-6">
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-secondary" 
                  size="lg"
                  onClick={() => window.open('https://t.me/lovylewq', '_blank')}
                >
                  <Icon name="Send" className="mr-2" size={18} />
                  Telegram
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-secondary to-accent" 
                  size="lg"
                  onClick={() => window.location.href = 'tel:+79274049162'}
                >
                  <Icon name="Phone" className="mr-2" size={18} />
                  Позвонить
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-primary shadow-lg">
            <Badge className="absolute top-4 right-4 bg-gradient-to-r from-accent to-orange-500 border-0">
              Популярный
            </Badge>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/20 to-transparent rounded-bl-full" />
            <CardHeader>
              <div className="mb-2">
                <Icon name="Sparkles" size={48} className="text-secondary" />
              </div>
              <CardTitle className="text-2xl">Месячный</CardTitle>
              <CardDescription className="text-base">4 занятия в месяц</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  700₽
                </div>
                <div className="text-muted-foreground">в месяц</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span>4 урока по 60 минут</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span>Домашние задания</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span>Поддержка в чате 24/7</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span>Материалы для обучения</span>
                </li>
              </ul>
              <div className="flex gap-2 mt-6">
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-secondary" 
                  size="lg"
                  onClick={() => window.open('https://t.me/lovylewq', '_blank')}
                >
                  <Icon name="Send" className="mr-2" size={18} />
                  Telegram
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-secondary to-accent" 
                  size="lg"
                  onClick={() => window.location.href = 'tel:+79274049162'}
                >
                  <Icon name="Phone" className="mr-2" size={18} />
                  Позвонить
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-transparent rounded-bl-full" />
            <CardHeader>
              <div className="mb-2">
                <Icon name="Zap" size={48} className="text-accent" />
              </div>
              <CardTitle className="text-2xl">Индивидуальный</CardTitle>
              <CardDescription className="text-base">Персональная программа</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                  По запросу
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span>Гибкий график занятий</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span>Интенсивная программа</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span>Подготовка к экзаменам</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span>Приоритетная поддержка</span>
                </li>
              </ul>
              <div className="flex gap-2 mt-6">
                <Button 
                  className="flex-1 bg-gradient-to-r from-accent to-orange-500" 
                  size="lg"
                  onClick={() => window.open('https://t.me/lovylewq', '_blank')}
                >
                  <Icon name="Send" className="mr-2" size={18} />
                  Telegram
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500" 
                  size="lg"
                  onClick={() => window.location.href = 'tel:+79274049162'}
                >
                  <Icon name="Phone" className="mr-2" size={18} />
                  Позвонить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="booking" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Забронируйте урок
            </h2>
            <p className="text-xl text-muted-foreground">Выберите удобное время для занятия</p>
          </div>

          <Card className="shadow-2xl border-2">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Icon name="Calendar" className="text-primary" />
                      Выберите дату
                    </h3>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-xl border-2 shadow-sm w-full"
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Icon name="Clock" className="text-secondary" />
                      Доступное время
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          onClick={() => setSelectedTime(time)}
                          className="h-14 text-lg font-semibold"
                        >
                          <Icon name="Clock" className="mr-2" size={18} />
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="lg" 
                          className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-lg py-6"
                          disabled={!date || !selectedTime}
                        >
                          <Icon name="Check" className="mr-2" size={20} />
                          Забронировать {date && selectedTime && `на ${date.toLocaleDateString()} в ${selectedTime}`}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Заполните контактные данные</DialogTitle>
                          <DialogDescription>
                            Мы свяжемся с вами для подтверждения записи
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleBooking} className="space-y-4">
                          <div>
                            <Label htmlFor="name2">Имя</Label>
                            <Input
                              id="name2"
                              placeholder="Ваше имя"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email2">Email</Label>
                            <Input
                              id="email2"
                              type="email"
                              placeholder="your@email.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone2">Телефон</Label>
                            <Input
                              id="phone2"
                              type="tel"
                              placeholder="+7 (999) 123-45-67"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary" size="lg">
                            Подтвердить запись
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="contacts" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Контакты
            </h2>
            <p className="text-xl text-muted-foreground">Свяжитесь с нами удобным способом</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-xl transition-all hover:scale-105 border-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Icon name="Mail" size={32} className="text-white" />
                </div>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <a href="mailto:idelia0814@icloud.com" className="text-primary hover:underline text-lg">
                  idelia0814@icloud.com
                </a>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all hover:scale-105 border-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                  <Icon name="Phone" size={32} className="text-white" />
                </div>
                <CardTitle>Телефон</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <a href="tel:+79274049162" className="text-primary hover:underline text-lg">
                  +7 (927) 404-91-62
                </a>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all hover:scale-105 border-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center">
                  <Icon name="MessageCircle" size={32} className="text-white" />
                </div>
                <CardTitle>Telegram</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <a href="https://t.me/lovylewq" className="text-primary hover:underline text-lg">
                  @lovylewq
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-primary via-secondary to-accent text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="text-3xl font-bold mb-4">Paideia</div>
          <p className="text-white/80 mb-4">Ваш путь к знаниям начинается здесь</p>
          <div className="flex justify-center gap-6 mb-6">
            <a href="#" className="hover:text-white/80 transition-colors">
              <Icon name="Instagram" size={24} />
            </a>
            <a href="#" className="hover:text-white/80 transition-colors">
              <Icon name="Facebook" size={24} />
            </a>
            <a href="#" className="hover:text-white/80 transition-colors">
              <Icon name="Youtube" size={24} />
            </a>
          </div>
          <p className="text-white/60 text-sm">© 2026 Paideia. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;