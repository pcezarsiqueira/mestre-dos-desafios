
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.error('Navegador não suporta notificações');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendChallengeReminder = (day: number, title: string) => {
  if (Notification.permission === 'granted') {
    new Notification('Mestre dos Desafios 🏆', {
      body: `Dia ${day} liberado: "${title}". Sua evolução não pode parar!`,
      icon: 'https://ui-avatars.com/api/?name=M&background=fe7501&color=fff',
    });
  }
};
