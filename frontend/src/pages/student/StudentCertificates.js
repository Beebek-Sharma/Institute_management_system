import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { enrollmentsAPI } from '../../api/enrollments';
import { coursesAPI } from '../../api/courses';
import DashboardLayout from '../../components/DashboardLayout';
import { Award, Download, Printer, Calendar, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import Loader from '../../components/Loader';

const StudentCertificates = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const certificateRef = useRef();

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const enrollmentsData = await enrollmentsAPI.getEnrollments();
            const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData?.results || []);

            // Filter for completed enrollments
            const certs = enrollments
                .filter(enrollment => enrollment.status === 'completed')
                .map(enrollment => ({
                    id: enrollment.id,
                    courseName: enrollment.course_name || 'Unknown Course',
                    courseCode: enrollment.course_code || 'COURSE',
                    studentName: enrollment.student_name || (user ? `${user.first_name} ${user.last_name}` : 'Student'),
                    completionDate: enrollment.enrollment_date, // Using enrollment date or we could add completion_date to backend
                    instructor: enrollment.instructor_name || 'Senior Instructor',
                    logo: '/logo.png'
                }));

            setCertificates(certs);
        } catch (error) {
            console.error("Error fetching certificates:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const printContent = certificateRef.current;
        const windowUrl = 'about:blank';
        const uniqueName = new Date();
        const windowName = 'Print' + uniqueName.getTime();
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        if (printWindow) {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Certificate - ${selectedCertificate?.courseName}</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                    <style>
                      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
                      
                      @page { 
                        size: landscape; 
                        margin: 0;
                      }
                      body { 
                        margin: 0; 
                        padding: 0; 
                        background-color: white !important;
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                        width: 100vw;
                        height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                      }
                      .certificate-frame {
                        position: relative;
                        width: 1123px; /* A4 width at 96dpi approx */
                        height: 794px; /* A4 height at 96dpi approx */
                        padding: 40px;
                        background-color: white !important;
                        color: black !important;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        border: 15px double #115e59; /* teal-800 */
                        outline: 2px solid #0f766e; /* teal-700 */
                        outline-offset: -20px;
                        box-sizing: border-box;
                        overflow: hidden; 
                        transform: scale(0.9); /* Safe scale to avoid printer clipping */
                        transform-origin: center;
                        box-shadow: none !important;
                      }
                      /* Force text colors for print */
                      .text-teal-900 { color: #134e4a !important; }
                      .text-teal-800 { color: #115e59 !important; }
                      .text-teal-700 { color: #0f766e !important; }
                      .text-teal-600 { color: #0d9488 !important; }
                      .text-gray-900 { color: #111827 !important; }
                      .text-gray-800 { color: #1f2937 !important; }
                      .text-gray-600 { color: #4b5563 !important; }
                      .text-gray-500 { color: #6b7280 !important; }

                      
                      /* Ensure watermark is subtle in print */
                      .watermark {
                        position: absolute;
                        inset: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0.05 !important;
                        pointer-events: none;
                        z-index: 0;
                      }
                      
                      /* Ensure text is on top */
                      .content-layer {
                        position: relative;
                        z-index: 10;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="certificate-frame">
                      ${printContent.innerHTML}
                    </div>
                  </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            // Wait for resources
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 1000);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 min-h-screen p-4 sm:p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
                    <p className="text-gray-600">View and download your earned certificates</p>
                </div>

                {loading ? (
                    <Loader />
                ) : certificates.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
                        <Award className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Certificates Yet</h3>
                        <p className="text-gray-500 mt-1">Complete a course to earn your first certificate</p>
                        <Button
                            className="mt-6"
                            onClick={() => window.location.href = '/student/courses'}
                        >
                            Browse Courses
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((cert) => (
                            <Card
                                key={cert.id}
                                className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-slate-200"
                                onClick={() => setSelectedCertificate(cert)}
                            >
                                <div className="h-48 bg-slate-100 relative p-4 flex items-center justify-center overflow-hidden border-b border-slate-100">
                                    <div className="absolute inset-0 opacity-10 pattern-grid-lg text-teal-900" />
                                    <Award className="h-20 w-20 text-teal-600 drop-shadow-sm" />
                                    <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">
                                        Verified
                                    </Badge>
                                </div>
                                <CardContent className="p-5">
                                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">{cert.courseName}</h3>
                                    <p className="text-sm text-gray-500 mb-4">Completed on {new Date(cert.completionDate).toLocaleDateString()}</p>

                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 text-teal-700 border-teal-200 hover:bg-teal-50"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View Certificate
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Certificate Modal */}
                {selectedCertificate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="font-bold text-xl text-gray-800">Certificate Preview</h3>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setSelectedCertificate(null)}>
                                        Close
                                    </Button>
                                    <Button onClick={handlePrint} className="gap-2 bg-teal-600 hover:bg-teal-700">
                                        <Printer className="w-4 h-4" />
                                        Print / Save PDF
                                    </Button>
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50 flex justify-center overflow-auto">
                                {/* Printable Certificate Area - Hidden from direct view but used for ref */}
                                <div className="relative">
                                    <div
                                        ref={certificateRef}
                                        className="bg-white w-[1000px] h-[750px] p-16 relative flex flex-col items-center text-center mx-auto"
                                        style={{
                                            // The border will be applied in the print view wrapper
                                            fontFamily: "'Playfair Display', serif"
                                        }}
                                    >
                                        {/* Watermark */}
                                        <div className="watermark absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
                                            <img src="/logo.png" className="w-[500px]" alt="" />
                                        </div>

                                        {/* Corner Decorations */}
                                        <div className="absolute top-10 left-10 w-24 h-24 border-t-[3px] border-l-[3px] border-teal-700" />
                                        <div className="absolute bottom-10 right-10 w-24 h-24 border-b-[3px] border-r-[3px] border-teal-700" />
                                        <div className="absolute top-10 right-10 w-24 h-24 border-t-[3px] border-r-[3px] border-teal-700" />
                                        <div className="absolute bottom-10 left-10 w-24 h-24 border-b-[3px] border-l-[3px] border-teal-700" />

                                        {/* Header */}
                                        <div className="content-layer mt-8 mb-6 z-10 w-full">
                                            <div className="flex justify-center mb-6">
                                                <div className="h-20 w-20 rounded-full bg-teal-50 flex items-center justify-center border-2 border-teal-100">
                                                    <img src="/logo.png" alt="Logo" className="h-12 object-contain" />
                                                </div>
                                            </div>
                                            <h1 className="text-6xl text-teal-900 uppercase tracking-widest font-black" style={{ fontFamily: "'Cinzel', serif" }}>Certificate</h1>
                                            <h2 className="text-2xl text-teal-600 uppercase tracking-[0.2em] mt-2 font-medium">of Completion</h2>
                                        </div>

                                        {/* Content */}
                                        <div className="content-layer flex-1 flex flex-col justify-center w-full max-w-3xl z-10 my-8">
                                            <p className="text-gray-500 italic text-xl mb-4 font-serif">This certifies that</p>

                                            <div className="mb-8">
                                                <h3 className="text-5xl font-bold text-gray-900 mb-2 font-serif capitalize" style={{ fontFamily: "'Great Vibes', cursive" }}>
                                                    {selectedCertificate.studentName}
                                                </h3>
                                                <div className="h-[1px] w-2/3 bg-gray-300 mx-auto mt-4"></div>
                                            </div>

                                            <p className="text-gray-500 italic text-xl mb-4 font-serif">has successfully completed the course</p>

                                            <div className="mb-10">
                                                <h4 className="text-3xl font-bold text-teal-800 uppercase tracking-wider mb-2 font-serif">
                                                    {selectedCertificate.courseName}
                                                </h4>
                                                <p className="text-sm text-gray-400 uppercase tracking-widest">{selectedCertificate.courseCode}</p>
                                            </div>

                                            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed font-serif italic">
                                                "Demonstrating exceptional dedication, practical proficiency, and academic excellence in the subject matter as required by the institution."
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className="content-layer w-full flex justify-between items-end mt-auto px-16 pb-8 z-10">
                                            <div className="text-center w-48">
                                                <div className="border-b-2 border-gray-400 mb-3 pb-1">
                                                    <p className="text-lg font-bold text-gray-800 font-serif">
                                                        {new Date(selectedCertificate.completionDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-teal-700 uppercase tracking-widest font-bold">Date of Completion</p>
                                            </div>

                                            <div className="text-center">
                                                <div className="relative inline-block">
                                                    <Award className="w-20 h-20 text-teal-600" />
                                                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-yellow-500 text-yellow-900">
                                                        VERIFIED
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center w-48">
                                                <div className="border-b-2 border-gray-400 mb-3 pb-1">
                                                    <p className="text-lg font-bold text-gray-800 font-serif" style={{ fontFamily: "'Great Vibes', cursive" }}>
                                                        {selectedCertificate.instructor}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-teal-700 uppercase tracking-widest font-bold">Instructor Signature</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentCertificates;
