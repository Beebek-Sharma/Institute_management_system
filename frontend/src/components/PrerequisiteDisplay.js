import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const PrerequisiteDisplay = ({ prerequisites, studentId }) => {
    if (!prerequisites || prerequisites.length === 0) {
        return (
            <div className="text-sm text-gray-700">
                <p>No prerequisites required for this course.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Prerequisites Required:</h4>
            <div className="space-y-2">
                {prerequisites.map((prereq) => (
                    <div
                        key={prereq.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                        {prereq.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">
                                {prereq.code} - {prereq.name}
                            </p>
                            {prereq.completed ? (
                                <p className="text-xs text-green-600">
                                    ✓ Completed {prereq.grade ? `(Grade: ${prereq.grade})` : ''}
                                </p>
                            ) : (
                                <p className="text-xs text-red-600">
                                    Not completed
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const PrerequisiteWarning = ({ missingPrerequisites, enforcement }) => {
    if (!missingPrerequisites || missingPrerequisites.length === 0) {
        return null;
    }

    const isStrict = enforcement === 'strict';
    const Icon = isStrict ? XCircle : AlertCircle;
    const bgColor = isStrict ? 'bg-red-50' : 'bg-yellow-50';
    const borderColor = isStrict ? 'border-red-200' : 'border-yellow-200';
    const textColor = isStrict ? 'text-red-800' : 'text-yellow-800';
    const iconColor = isStrict ? 'text-red-600' : 'text-yellow-600';

    return (
        <div className={`${bgColor} border ${borderColor} rounded-lg p-4 mb-4`}>
            <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                    <h4 className={`font-semibold ${textColor} mb-2`}>
                        {isStrict ? 'Prerequisites Not Met' : 'Prerequisite Warning'}
                    </h4>
                    <p className={`text-sm ${textColor} mb-2`}>
                        {isStrict
                            ? 'You must complete the following courses before enrolling:'
                            : 'It is recommended to complete the following courses first:'}
                    </p>
                    <ul className={`text-sm ${textColor} list-disc list-inside space-y-1`}>
                        {missingPrerequisites.map((prereq) => (
                            <li key={prereq.id}>
                                {prereq.code} - {prereq.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PrerequisiteDisplay;
