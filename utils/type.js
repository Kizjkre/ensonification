export const isAudio = file => file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg') || file.endsWith('.aac') || file.endsWith('.m4a') || file.endsWith('.m4b') || file.endsWith('.mp4') || file.endsWith('.wma') || file.endsWith('.webm');

export const isCSV = file => file.endsWith('.csv');
