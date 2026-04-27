'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkillGapAnalysis } from '@shared/schemas/ai.schema';

interface ApplicantCardProps {
  applicant: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string;
  };
  matchScore: number;
  skillGap?: SkillGapAnalysis;
  isBlindMode?: boolean;
}

export const ApplicantCard = ({ applicant, matchScore, skillGap, isBlindMode }: ApplicantCardProps) => {
  const displayName = isBlindMode ? `Candidate ${applicant.id.substring(0, 8)}` : `${applicant.firstName} ${applicant.lastName}`;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            {!isBlindMode && applicant.avatarUrl ? (
              <img src={applicant.avatarUrl} alt={displayName} className="h-12 w-12 rounded-full" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                {displayName.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg">{displayName}</h3>
              {!isBlindMode && <p className="text-sm text-gray-500">{applicant.email}</p>}
              <div className="mt-2 flex gap-2">
                <Badge variant={matchScore > 75 ? 'success' : matchScore > 50 ? 'warning' : 'danger'}>
                  {matchScore}% AI Match
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {skillGap && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-sm">Skill Gap Analysis</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Matching Skills</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {skillGap.matching_skills.map(skill => (
                    <Badge key={skill} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Missing Skills</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {skillGap.missing_skills.map(skill => (
                    <Badge key={skill} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {skillGap.recommendations.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs font-bold text-blue-800">Learning Recommendations:</p>
                <ul className="text-xs text-blue-700 mt-1 list-disc list-inside">
                  {skillGap.recommendations.slice(0, 2).map((rec, i) => (
                    <li key={i}>{rec.recommendation} ({rec.platform})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
