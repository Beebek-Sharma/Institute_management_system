import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { enrollmentsAPI } from '../../api/enrollments';
import DashboardLayout from '../../components/DashboardLayout';
import { Award, Download, Printer, Calendar, Search, Filter, User, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import Loader from '../../components/Loader';

const AdminCertificates = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [filteredCertificates, setFilteredCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, verified, pending
    const certificateRef = useRef();

    useEffect(() => {
        fetchCertificates();
    }, []);

    useEffect(() => {
        filterCertificates();
    }, [searchTerm, filterStatus, certificates]);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            // Admin can see all enrollments
            const enrollmentsData = await enrollmentsAPI.getEnrollments();
            const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData?.results || []);

            // Filter for completed enrollments and map to certificate format
            const certs = enrollments
                .filter(enrollment => enrollment.status === 'completed')
                .map(enrollment => ({
                    id: enrollment.id,
                    courseName: enrollment.course_name || 'Unknown Course',
                    courseCode: enrollment.course_code || 'COURSE',
                    studentName: enrollment.student_name || 'Student',
                    studentId: enrollment.student,
                    completionDate: enrollment.enrollment_date,
                    instructor: enrollment.instructor_name || 'Senior Instructor',
                    batchInfo: enrollment.batch_info || 'N/A',
                    grade: enrollment.grade || 'N/A',
                    logo: '/logo.png'
                }));

            setCertificates(certs);
        } catch (error) {
            console.error("Error fetching certificates:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterCertificates = () => {
        let filtered = certificates;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(cert =>
                cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cert.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCertificates(filtered);
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
                        width: 1123px;
                        height: 794px;
                        padding: 40px;
                        background-color: white !important;
                        color: black !important;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        border: 15px double #115e59;
                        outline: 2px solid #0f766e;
                        outline-offset: -20px;
                        box-sizing: border-box;
                        overflow: hidden; 
                        transform: scale(0.9);
                        transform-origin: center;
                        box-shadow: none !important;
                      }
                      .text-teal-900 { color: #134e4a !important; }
                      .text-teal-800 { color: #115e59 !important; }
                      .text-teal-700 { color: #0f766e !important; }
                      .text-teal-600 { color: #0d9488 !important; }
                      .text-gray-900 { color: #111827 !important; }
                      .text-gray-800 { color: #1f2937 !important; }
                      .text-gray-600 { color: #4b5563 !important; }
                      .text-gray-500 { color: #6b7280 !important; }
                      
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Certificates</h1>
                    <p className="text-gray-600">View, filter, and download all student certificates</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search by student name, course name, or code..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="px-4 py-2">
                            Total: {filteredCertificates.length}
                        </Badge>
                    </div>
                </div>

                {loading ? (
                    <Loader />
                ) : filteredCertificates.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
                        <Award className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">
                            {searchTerm ? 'No Certificates Found' : 'No Certificates Yet'}
                        </h3>
                        <p className="text-gray-500 mt-1">
                            {searchTerm ? 'Try adjusting your search terms' : 'No students have completed courses yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCertificates.map((cert) => (
                            <Card
                                key={cert.id}
                                className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-slate-200"
                                onClick={() => setSelectedCertificate(cert)}
                            >
                                <div className="h-48 bg-gradient-to-br from-teal-50 to-blue-50 relative p-4 flex items-center justify-center overflow-hidden border-b border-slate-100">
                                    <div className="absolute inset-0 opacity-10 pattern-grid-lg text-teal-900" />
                                    <Award className="h-20 w-20 text-teal-600 drop-shadow-sm" />
                                    <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">
                                        Verified
                                    </Badge>
                                </div>
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-2 mb-2">
                                        <User className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-gray-900 truncate">{cert.studentName}</h3>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 mb-3">
                                        <BookOpen className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-700 font-medium truncate">{cert.courseName}</p>
                                            <p className="text-xs text-gray-500">{cert.courseCode}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                        <Calendar className="w-3 h-3" />
                                        <span>Completed: {new Date(cert.completionDate).toLocaleDateString()}</span>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 text-teal-700 border-teal-200 hover:bg-teal-50"
                                    >
                                        <Download className="w-4 h-4" />
                                        View & Download
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
                                <div>
                                    <h3 className="font-bold text-xl text-gray-800">Certificate Preview</h3>
                                    <p className="text-sm text-gray-500">Student: {selectedCertificate.studentName}</p>
                                </div>
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
                                <div className="relative">
                                    <div
                                        ref={certificateRef}
                                        className="bg-white w-[1000px] h-[750px] p-16 relative flex flex-col items-center text-center mx-auto"
                                        style={{ fontFamily: "'Playfair Display', serif" }}
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

export default AdminCertificates;
