import React, { useState } from 'react';
import { 
  Calendar, 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Flame, 
  Plus, 
  Pill, 
  Utensils 
} from 'lucide-react';
import { MedicationSchedule, IntakeLog, Profile } from '../types/pharmacy.ts';
import { pharmacyStore } from '../services/store.ts';

interface ScheduleTrackerProps {
  schedules: MedicationSchedule[];
  currentUser: Profile | null;
}

export const ScheduleTracker: React.FC<ScheduleTrackerProps> = ({ schedules, currentUser }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const logs = pharmacyStore.getIntakeLogs(currentUser?.id, todayStr);
  const [showAddModal, setShowAddModal] = useState(false);

  // New schedule form
  const medications = pharmacyStore.getMedications();
  const [selectedMedId, setSelectedMedId] = useState(medications[0]?.id || '');
  const [dosageText, setDosageText] = useState('1 tablet with water');
  const [timeSlot, setTimeSlot] = useState('08:00');
  const [withFood, setWithFood] = useState(true);

  const handleLog = (scheduleId: string, time: string, status: 'taken' | 'skipped') => {
    pharmacyStore.logIntake(scheduleId, time, status);
  };

  const getLogStatus = (scheduleId: string, time: string): IntakeLog | undefined => {
    return logs.find((l) => l.schedule_id === scheduleId && l.scheduled_time === time);
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const med = medications.find((m) => m.id === selectedMedId);
    if (!med || !currentUser) return;

    pharmacyStore.addSchedule({
      patient_id: currentUser.id,
      medication_id: med.id,
      medication_name: med.name,
      strength: med.strength,
      dosage_instructions: dosageText,
      time_slots: [timeSlot],
      with_food: withFood,
      start_date: todayStr,
      is_active: true
    });

    setShowAddModal(false);
  };

  // Calculate adherence
  const allScheduledDosesCount = schedules.reduce((acc, s) => acc + s.time_slots.length, 0);
  const takenCount = logs.filter((l) => l.status === 'taken').length;
  const adherencePercent = allScheduledDosesCount > 0 
    ? Math.min(100, Math.round((takenCount / allScheduledDosesCount) * 100))
    : 100;

  return (
    <div className="space-y-6">
      {/* Top Adherence Widget & Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Adherence Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Today's Adherence
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-teal-700">{adherencePercent}%</span>
              <span className="text-xs text-slate-500 font-medium">({takenCount} of {allScheduledDosesCount} doses)</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-teal-50 border-4 border-teal-500 flex items-center justify-center font-bold text-teal-800 text-xs">
            {adherencePercent}%
          </div>
        </div>

        {/* Current Adherence Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Compliance Streak
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-600">7 Days</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Active Habit
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
        </div>

        {/* Action Button */}
        <div className="bg-gradient-to-r from-teal-700 to-cyan-800 p-5 rounded-2xl text-white shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Add Dosage Reminder</h4>
            <p className="text-xs text-teal-100">Set daily reminders with food instructions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2.5 bg-white text-teal-900 hover:bg-teal-50 rounded-xl transition-colors shadow-sm font-bold text-xs shrink-0 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Daily Dosage Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">
              Today's Schedule & Dose Tracker ({todayStr})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Auto-synced with intake logs</span>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-10 text-slate-400 space-y-2">
            <Clock className="w-10 h-10 mx-auto stroke-1" />
            <p className="text-sm font-semibold text-slate-600">No dosage reminders scheduled</p>
            <p className="text-xs">Prescriptions automatically configure reminders, or you can add one manually.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((sch) => (
              <div
                key={sch.id}
                className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white hover:border-teal-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-teal-600" />
                        {sch.medication_name}
                      </h4>
                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                        {sch.strength}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{sch.dosage_instructions}</p>
                    {sch.with_food && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                        <Utensils className="w-3 h-3 text-amber-600" />
                        Take with meals or food
                      </span>
                    )}
                  </div>

                  {/* Dose Time Slots with Taken / Skip Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0">
                    {sch.time_slots.map((time) => {
                      const log = getLogStatus(sch.id, time);

                      return (
                        <div
                          key={time}
                          className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs"
                        >
                          <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {time}
                          </div>

                          {log ? (
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                log.status === 'taken'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {log.status === 'taken' ? (
                                <>
                                  <Check className="w-3 h-3" /> Taken
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3" /> Skipped
                                </>
                              )}
                            </span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleLog(sch.id, time, 'taken')}
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1"
                                title="Mark dose taken"
                              >
                                <Check className="w-3 h-3" />
                                Taken
                              </button>
                              <button
                                onClick={() => handleLog(sch.id, time, 'skipped')}
                                className="px-1.5 py-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-[11px] font-medium transition-colors"
                                title="Skip dose"
                              >
                                Skip
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add Medication Schedule Reminder</h3>
              <button onClick={() => setShowAddModal(false)} className="text-teal-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Medication</label>
                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {medications.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.strength})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dosage Instructions</label>
                <input
                  type="text"
                  value={dosageText}
                  onChange={(e) => setDosageText(e.target.value)}
                  placeholder="e.g. 1 tablet with full glass of water"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time of Day</label>
                  <input
                    type="time"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="withFood"
                    checked={withFood}
                    onChange={(e) => setWithFood(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <label htmlFor="withFood" className="font-semibold text-slate-700 cursor-pointer">
                    Take with meals
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Set Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
