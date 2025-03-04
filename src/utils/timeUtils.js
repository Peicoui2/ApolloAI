export const timeUtils = {
  getCurrentTime() {
    const now = new Date();
    return this.formatTime(now);
  },

  addHours(hours) {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return this.formatTime(date);
  },

  formatTime(date) {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  },

  getNoon() {
    const noon = new Date();
    noon.setHours(12, 0, 0);
    return this.formatTime(noon);
  },

  getMidnight() {
    const midnight = new Date();
    midnight.setHours(0, 0, 0);
    return this.formatTime(midnight);
  }
};