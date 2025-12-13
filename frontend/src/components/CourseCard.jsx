import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Star, Check, Clock, BarChart } from 'lucide-react';

const CourseCard = ({ course, actionSlot }) => {
    const navigate = useNavigate();

    // Mock data/logic for display similar to the screenshot if fields are missing
    const badgeText = course.badge || "Free Trial"; // "Free Trial"
    const isAiSkill = course.is_ai || true; // Mocking "AI skills" badge presence
    const orgName = course.organization || "Institute"; // e.g. "Google", "IBM"
    // For the logo, we'll use a placeholder or initials if no logo provided
    const logoUrl = course.org_logo || null;
    const rating = course.rating || 4.8;
    const reviewCount = course.review_count || "12k";

    // Handle inconsistent API fields (HomePage vs StudentCourses)
    const title = course.title || course.name;

    // Construct full image URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const imageUrl = course.image
        ? (course.image.startsWith('http') ? course.image : `${backendUrl}${course.image}`)
        : null;

    return (
        <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
                <div
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="group relative w-[300px] flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-[340px]"
                >
                    {/* Image Section */}
                    <div className="relative h-40 w-full overflow-hidden bg-white">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-6xl">
                                🎓
                            </div>
                        )}

                        {/* Absolute Badges */}
                        <div className="absolute top-3 right-3">
                            <Badge className="bg-white text-slate-800 hover:bg-white border border-slate-200 shadow-sm font-semibold text-[10px] px-2 py-0.5 pointer-events-none">
                                {badgeText}
                            </Badge>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex flex-col flex-grow relative">
                        {/* Logo / Org Name */}
                        <div className="flex items-center gap-2 mb-2">
                            {logoUrl ? (
                                <img src={logoUrl} alt={orgName} className="w-5 h-5 object-contain" />
                            ) : (
                                <div className="w-5 h-5 bg-slate-100 rounded-sm flex items-center justify-center text-slate-900 text-[10px] font-bold border border-slate-200">
                                    {orgName.charAt(0)}
                                </div>
                            )}
                            <span className="text-xs text-slate-600 font-medium">{orgName}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {title}
                        </h3>

                        {/* Rating on Card Face */}
                        <div className="flex items-center gap-1 mb-2">
                            <span className="font-bold text-amber-500 text-sm">{rating}</span>
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-amber-500 text-amber-500' : 'fill-gray-200 text-gray-200'}`} />
                                ))}
                            </div>
                            <span className="text-xs text-slate-500">({reviewCount})</span>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Course</p>
                            <span className="text-xs font-bold text-blue-600">Beginner</span>
                        </div>
                    </div>
                </div>
            </HoverCardTrigger>

            {/* Hover Popup Content */}
            <HoverCardContent side="right" align="start" className="w-[320px] p-0 overflow-hidden shadow-xl border-slate-200" sideOffset={10}>
                <div className="p-5 flex flex-col gap-4">
                    <div>
                        <h4 className="font-bold text-lg text-slate-900 mb-1 leading-tight">
                            {title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs mt-1">
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                                Updated {new Date().getFullYear()}
                            </Badge>
                            <div className="flex items-center gap-1 text-slate-600">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-slate-900">{rating}</span>
                                <span>({reviewCount} reviews)</span>
                            </div>
                        </div>
                    </div>

                    {course.description && (
                        <p className="text-sm text-slate-600 line-clamp-3">
                            {course.description}
                        </p>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Specifics</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-400">⚡</span>
                                <span>Beginner level</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{course.duration_weeks ? `${course.duration_weeks} weeks` : 'Flexible'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        {actionSlot ? (
                            actionSlot
                        ) : (
                            <Button
                                onClick={() => navigate(`/courses/${course.id}`)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            >
                                Enroll for Free
                            </Button>
                        )}
                        <p className="text-[10px] text-center text-slate-500">
                            Financial aid available
                        </p>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export default CourseCard;
