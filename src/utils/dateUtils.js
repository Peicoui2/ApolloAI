export const dateUtils = {
  getCurrentDate() {
    return new Date();
  },

  getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  },

  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  },

  getDayOfWeek(dayName) {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const targetDay = days.indexOf(dayName.toLowerCase());
    
    if (targetDay === -1) return null;
    
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7; // Move to next week if day has passed
    
    const targetDate = new Date();
    targetDate.setDate(currentDate.getDate() + daysToAdd);
    return targetDate;
  }
};