const sharp = require('sharp');
const Tesseract = require('tesseract.js');

class TimetableParser {
    constructor() {
        this.daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        this.dayVariants = {
            'monday': ['monday', 'mon', 'mo'],
            'tuesday': ['tuesday', 'tue', 'tu'], 
            'wednesday': ['wednesday', 'wed', 'we'],
            'thursday': ['thursday', 'thu', 'th'],
            'friday': ['friday', 'fri', 'fr'],
            'saturday': ['saturday', 'sat', 'sa'],
            'sunday': ['sunday', 'sun', 'su']
        };
    }

    async parseImage(imagePath) {
        try {
            console.log('Processing image:', imagePath);
            const processedImage = await this.preprocessImage(imagePath);
            console.log('Image preprocessed successfully');
            
            const { data: { text } } = await Tesseract.recognize(processedImage, 'eng', {
                logger: m => console.log('OCR:', m.status, m.progress)
            });
            console.log('OCR Text extracted:', text);
            
            const result = this.parseText(text);
            console.log('Text parsing completed');
            return result;
        } catch (error) {
            console.error('Parse image error:', error);
            console.error('Error stack:', error.stack);
            throw new Error(`Failed to parse timetable: ${error.message}`);
        }
    }

    async preprocessImage(imagePath) {
        try {
            return await sharp(imagePath)
                .resize(1200, null, { withoutEnlargement: true })
                .grayscale()
                .normalize()
                .sharpen()
                .toBuffer();
        } catch (error) {
            return imagePath;
        }
    }

    parseText(text) {
        try {
            if (!text || text.trim().length === 0) {
                console.log('No text to parse');
                return [];
            }
            
            const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            console.log('Processing', lines.length, 'lines');
            
            // Extract time slots from header
            const timeSlots = this.extractTimeSlots(lines);
            if (timeSlots.length === 0) {
                console.log('No time slots found in any line');
                return [];
            }
            
            console.log('Time slots found:', timeSlots.length);
            
            // Parse each day's schedule
            const schedule = [];
            for (const line of lines) {
                try {
                    const daySchedule = this.parseDaySchedule(line, timeSlots);
                    if (daySchedule) {
                        console.log('Found day schedule for:', daySchedule.day);
                        schedule.push(daySchedule);
                    }
                } catch (lineError) {
                    console.error('Error parsing line:', line, lineError.message);
                }
            }
            
            console.log('Final schedule has', schedule.length, 'days');
            return schedule;
        } catch (error) {
            console.error('Parse text error:', error);
            return [];
        }
    }

    extractTimeSlots(lines) {
        const timePattern = /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/g;
        
        for (const line of lines) {
            const matches = [...line.matchAll(timePattern)];
            if (matches.length >= 3) { // At least 3 time slots
                return matches.map(match => ({
                    startTime: { 
                        hour: parseInt(match[1]), 
                        minute: parseInt(match[2]) 
                    },
                    endTime: { 
                        hour: parseInt(match[3]), 
                        minute: parseInt(match[4]) 
                    }
                }));
            }
        }
        return [];
    }

    parseDaySchedule(line, timeSlots) {
        const dayName = this.extractDayName(line);
        if (!dayName) return null;
        
        console.log('Processing day:', dayName, 'from line:', line);
        
        // Remove day name and clean line
        let cleanLine = line;
        const lowerLine = line.toLowerCase();
        
        for (const [day, variants] of Object.entries(this.dayVariants)) {
            for (const variant of variants) {
                if (lowerLine.includes(variant)) {
                    const index = lowerLine.indexOf(variant);
                    cleanLine = line.substring(index + variant.length).trim();
                    break;
                }
            }
        }
        
        // Remove leading | if present
        if (cleanLine.startsWith('|')) {
            cleanLine = cleanLine.substring(1).trim();
        }
        
        // Split by | and extract subjects
        const parts = cleanLine.split('|').map(part => part.trim());
        console.log('Day parts:', parts);
        
        const slots = [];
        
        for (let i = 0; i < Math.min(parts.length, timeSlots.length); i++) {
            if (parts[i] && parts[i].length > 0) {
                const subject = this.extractSubject(parts[i]);
                if (subject) {
                    slots.push({
                        startTime: timeSlots[i].startTime,
                        endTime: timeSlots[i].endTime,
                        subject: subject,
                        originalText: parts[i]
                    });
                }
            }
        }
        
        return slots.length > 0 ? { day: dayName, slots } : null;
    }

    extractDayName(line) {
        const lowerLine = line.toLowerCase().trim();
        for (const [day, variants] of Object.entries(this.dayVariants)) {
            if (variants.some(variant => lowerLine.includes(variant))) {
                return day;
            }
        }
        return null;
    }

    extractSubject(text) {
        if (!text || text.trim().length < 1) return null;
        
        // Clean text
        let cleaned = text
            .replace(/[®©™]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        if (!cleaned || cleaned === '-' || cleaned === 'o' || cleaned.length < 2) return null;
        
        // Subject mappings
        const subjects = {
            'bpe': 'Business Process Engineering',
            'dbms': 'Database Management System',
            'cn': 'Computer Networks',
            'foec': 'Fundamentals of Electronics', 
            'abca': 'Advanced BCA',
            'pwp': 'Programming with Python',
            'mrt': 'Marketing Research',
            'mkg': 'Marketing',
            'aslc': 'Advanced System Level Concepts',
            'skl': 'Skill Development',
            'mgt': 'Management',
            'bp': 'Business Process',
            'ape': 'Applied Programming Environment',
            'te': 'Technical English',
            'tii': 'Technical Innovation',
            'mak': 'Marketing Analytics',
            'hvb': 'Human Values & Business',
            'aptk': 'Applied Technology',
            'pkr': 'Project Management',
            'on': 'Operations',
            'po': 'Project Operations',
            'ca': 'Computer Applications',
            'fo': 'Fundamentals',
            'pos': 'Position',
            'iid': 'Information Systems'
        };
        
        // Check for exact matches first
        const lowerCleaned = cleaned.toLowerCase();
        if (subjects[lowerCleaned]) {
            return subjects[lowerCleaned];
        }
        
        // Find subject by word matching
        const words = lowerCleaned.split(/[\s-]+/);
        for (const word of words) {
            if (subjects[word]) {
                return subjects[word];
            }
        }
        
        // Return cleaned text if no mapping found
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    convertToTasks(schedule, userId) {
        const tasks = [];
        
        schedule.forEach(daySchedule => {
            daySchedule.slots.forEach(slot => {
                tasks.push({
                    userId,
                    taskName: slot.subject,
                    description: `Class: ${slot.originalText}`,
                    category: 'Academics',
                    priority: 'Medium',
                    type: 'Recurring',
                    startTime: this.createDateTime(daySchedule.day, slot.startTime),
                    endTime: this.createDateTime(daySchedule.day, slot.endTime),
                    isRecurring: true,
                    recurrencePattern: {
                        type: 'weekly',
                        daysOfWeek: [daySchedule.day],
                        endDate: this.getEndDate()
                    },
                    status: 'Pending',
                    source: 'timetable_upload',
                    originalText: slot.originalText
                });
            });
        });

        return tasks;
    }

    createDateTime(dayName, time) {
        const now = new Date();
        const dayIndex = this.daysOfWeek.indexOf(dayName);
        const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
        
        let daysUntil = dayIndex - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        
        const date = new Date(now);
        date.setDate(now.getDate() + daysUntil);
        date.setHours(time.hour, time.minute, 0, 0);
        
        return date;
    }

    getEndDate() {
        const date = new Date();
        date.setMonth(date.getMonth() + 4);
        return date;
    }
}

module.exports = new TimetableParser();