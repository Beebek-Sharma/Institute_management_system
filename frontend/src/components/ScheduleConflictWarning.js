import React from 'react';
import { AlertCircle, XCircle, Clock, MapPin } from 'lucide-react';

const ScheduleConflictWarning = ({ conflicts, checkingMode }) => {
    if (!conflicts || conflicts.length === 0) {
        return null;
    }

    const isStrict = checkingMode === 'strict';
    const bgColor = isStrict ? 'bg-red-50' : 'bg-yellow-50';
    const borderColor = isStrict ? 'border-red-200' : 'border-yellow-200';
    const textColor = isStrict ? 'text-red-800' : 'text-yellow-800';
    const iconColor = isStrict ? 'text-red-600' : 'text-yellow-600';
    const Icon = isStrict ? XCircle : AlertCircle;

    return (
        <div className={`${bgColor} border ${borderColor} rounded-lg p-4 mb-4`}>
            <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                    <h4 className={`font-semibold ${textColor} mb-2`}>
                        {isStrict ? 'Schedule Conflict - Cannot Enroll' : 'Schedule Conflict Warning'}
                    </h4>
                    <p className={`text-sm ${textColor} mb-3`}>
                        {isStrict
                            ? `Found ${conflicts.length} schedule conflict(s). You cannot enroll in this batch.`
                            : `Found ${conflicts.length} schedule conflict(s). Enrollment is allowed but not recommended.`}
                    </p>

                    <div className="space-y-3">
                        {conflicts.map((conflict, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="font-medium text-gray-900 mb-2">
                                    {conflict.conflict_description}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    {/* Current Enrollment */}
                                    <div className="bg-blue-50 p-2 rounded">
                                        <p className="font-semibold text-blue-900 mb-1">
                                            Current: {conflict.existing_course_code}
                                        </p>
                                        <p className="text-blue-800">{conflict.existing_course}</p>
                                        <div className="flex items-center gap-2 mt-1 text-blue-700">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                {conflict.existing_schedule.day}{' '}
                                                {conflict.existing_schedule.start_time}-{conflict.existing_schedule.end_time}
                                            </span>
                                        </div>
                                        {conflict.existing_schedule.room && (
                                            <div className="flex items-center gap-2 mt-1 text-blue-700">
                                                <MapPin className="w-3 h-3" />
                                                <span>
                                                    {conflict.existing_schedule.room}
                                                    {conflict.existing_schedule.building && `, ${conflict.existing_schedule.building}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* New Batch */}
                                    <div className="bg-orange-50 p-2 rounded">
                                        <p className="font-semibold text-orange-900 mb-1">
                                            New: {conflict.new_course_code}
                                        </p>
                                        <p className="text-orange-800">{conflict.new_course}</p>
                                        <div className="flex items-center gap-2 mt-1 text-orange-700">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                {conflict.new_schedule.day}{' '}
                                                {conflict.new_schedule.start_time}-{conflict.new_schedule.end_time}
                                            </span>
                                        </div>
                                        {conflict.new_schedule.room && (
                                            <div className="flex items-center gap-2 mt-1 text-orange-700">
                                                <MapPin className="w-3 h-3" />
                                                <span>
                                                    {conflict.new_schedule.room}
                                                    {conflict.new_schedule.building && `, ${conflict.new_schedule.building}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isStrict && (
                        <p className={`text-xs ${textColor} mt-3 italic`}>
                            ⚠️ Proceeding with conflicting schedules may affect your ability to attend all classes.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduleConflictWarning;
