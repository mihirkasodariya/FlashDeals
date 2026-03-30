import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, Modal, useWindowDimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from './CustomText';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const CustomCalendar = ({ 
    visible, 
    onClose, 
    onSelectRange, 
    onSelectDate,
    initialDate,
    initialRange = { start: null, end: null },
    mode = 'single', // 'single' or 'range'
    minDate = null
}) => {
    const { colors } = useTheme();
    const { t, i18n } = useTranslation();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    
    // Navigation State
    const [currentMonth, setCurrentMonth] = useState(new Date(initialDate || new Date()));
    
    // Selection State
    const [selectedDate, setSelectedDate] = useState(initialDate || null);
    const [range, setRange] = useState(initialRange);
    
    // Sync internal state ONLY when the modal opens to avoid infinite update loops
    React.useEffect(() => {
        if (visible) {
            setRange(initialRange);
            if (initialRange && initialRange.start) {
                setCurrentMonth(new Date(initialRange.start));
            }
        }
    }, [visible]);
    
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const startDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const monthNames = useMemo(() => [
        t('months.january'), t('months.february'), t('months.march'), t('months.april'),
        t('months.may'), t('months.june'), t('months.july'), t('months.august'),
        t('months.september'), t('months.october'), t('months.november'), t('months.december')
    ], [t]);

    const weekDays = useMemo(() => [
        t('days.sun'), t('days.mon'), t('days.tue'), t('days.wed'), 
        t('days.thu'), t('days.fri'), t('days.sat')
    ], [t]);

    const calendarData = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = startDayOfMonth(year, month);
        
        const days = [];
        // Pad previous month days
        for (let i = 0; i < startDay; i++) {
            days.push({ day: null, month, year });
        }
        // Current month days
        for (let i = 1; i <= totalDays; i++) {
            days.push({ day: i, month, year });
        }
        return days;
    }, [currentMonth]);

    const isSelected = (day, month, year) => {
        if (!day) return false;
        if (mode === 'single') {
            return selectedDate && 
                   selectedDate.getDate() === day && 
                   selectedDate.getMonth() === month && 
                   selectedDate.getFullYear() === year;
        } else {
            const date = new Date(year, month, day);
            return (range.start && date.getTime() === range.start.getTime()) ||
                   (range.end && date.getTime() === range.end.getTime());
        }
    };

    const isInRange = (day, month, year) => {
        if (!day || mode !== 'range' || !range.start || !range.end) return false;
        const date = new Date(year, month, day);
        return date > range.start && date < range.end;
    };

    const isToday = (day, month, year) => {
        const today = new Date();
        return today.getDate() === day && 
               today.getMonth() === month && 
               today.getFullYear() === year;
    };

    const isDisabled = (day, month, year) => {
        if (!day || !minDate) return false;
        const date = new Date(year, month, day);
        // Normalize to midnight for comparison
        const normMin = new Date(minDate);
        normMin.setHours(0, 0, 0, 0);
        return date < normMin;
    };

    const handleDatePress = (day, month, year) => {
        if (!day || isDisabled(day, month, year)) return;
        
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);

        if (mode === 'single') {
            setSelectedDate(date);
            onSelectDate && onSelectDate(date);
            onClose();
        } else {
            if (!range.start || (range.start && range.end)) {
                setRange({ start: date, end: null });
            } else {
                if (date < range.start) {
                    setRange({ start: date, end: range.start });
                } else {
                    setRange({ ...range, end: date });
                }
            }
        }
    };

    const handleConfirm = () => {
        if (mode === 'range' && range.start && range.end) {
            onSelectRange && onSelectRange(range);
            onClose();
        }
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <TouchableOpacity 
                    activeOpacity={1} 
                    style={{ flex: 1 }} 
                    onPress={onClose} 
                />
                <View 
                    style={{ 
                        backgroundColor: colors.background, 
                        paddingBottom: Math.max(20, insets.bottom + 20) 
                    }} 
                    className="rounded-t-[40px] shadow-2xl"
                >
                    {/* Header */}
                    <View className="p-8 pb-4 flex-row justify-between items-center">
                        <View>
                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] uppercase opacity-60">
                                {mode === 'range' ? t('home.select_range') : t('store.select_date')}
                            </Text>
                            <Text style={{ color: colors.text }} className="text-2xl font-black">
                                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            onPress={onClose}
                            style={{ backgroundColor: colors.surface }}
                            className="w-10 h-10 rounded-full items-center justify-center"
                        >
                            <X size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Month Carousel Navigation */}
                    <View className="flex-row justify-between px-8 mb-4">
                        <TouchableOpacity onPress={prevMonth} className="p-2">
                            <ChevronLeft size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={nextMonth} className="p-2">
                            <ChevronRight size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Weekdays Header */}
                    <View className="flex-row px-6 mb-2">
                        {weekDays.map((day, idx) => (
                            <View key={idx} className="flex-1 items-center">
                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black opacity-40 uppercase">
                                    {day}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Calendar Grid */}
                    <View className="flex-row flex-wrap px-6">
                        {calendarData.map((item, idx) => {
                            const selected = isSelected(item.day, item.month, item.year);
                            const inRange = isInRange(item.day, item.month, item.year);
                            const today = isToday(item.day, item.month, item.year);
                            const disabled = isDisabled(item.day, item.month, item.year);

                            return (
                                <TouchableOpacity
                                    key={idx}
                                    disabled={!item.day || disabled}
                                    onPress={() => handleDatePress(item.day, item.month, item.year)}
                                    style={{
                                        width: `${100 / 7}%`,
                                        aspectRatio: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 4
                                    }}
                                >
                                    <View
                                        style={[
                                            {
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: 16,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            },
                                            selected && { backgroundColor: colors.primary },
                                            inRange && { backgroundColor: colors.primary + '20' },
                                            today && !selected && { borderWidth: 1, borderColor: colors.primary + '40' }
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                { fontWeight: '800', fontSize: 14 },
                                                selected ? { color: '#FFF' } : { color: colors.text },
                                                disabled && { opacity: 0.2 },
                                                !item.day && { color: 'transparent' }
                                            ]}
                                        >
                                            {item.day}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Footer / Confirm Button for Range */}
                    {mode === 'range' && (
                        <View className="px-8 mt-6 flex-row gap-3">
                            {(range.start || range.end) && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setRange({ start: null, end: null });
                                        onSelectRange && onSelectRange({ start: null, end: null });
                                    }}
                                    style={{ 
                                        backgroundColor: colors.surface,
                                        height: 56,
                                        flex: 1,
                                        borderRadius: 16,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: colors.border
                                    }}
                                >
                                    <View className="flex-row items-center">
                                        <X size={16} color={colors.textSecondary} className="mr-2" />
                                        <Text style={{ color: colors.textSecondary }} className="font-black text-sm uppercase">
                                            {t('common.clear')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={handleConfirm}
                                disabled={!range.start || !range.end}
                                style={{ 
                                    backgroundColor: (!range.start || !range.end) ? colors.border : colors.primary,
                                    height: 56,
                                    flex: 2,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Text style={{ color: '#FFF' }} className="font-black text-lg">
                                    {t('common.confirm')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default CustomCalendar;
