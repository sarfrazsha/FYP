import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Button, Badge, Spinner, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Axios from 'axios';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Schedule = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const cNo = localStorage.getItem('classNo');
    const selectedChildClass = localStorage.getItem('selectedChildClass');
    const userClass = (userRole?.toLowerCase() === 'parent' && selectedChildClass) ? selectedChildClass : (cNo || localStorage.getItem('userClass'));
    
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

    useEffect(() => {
        if (!DAYS.includes(activeDay)) setActiveDay('Monday');
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        let targetClass = userClass;
        
        // Try to get class from localStorage first for immediate results
        if (userRole === 'teacher') {
            targetClass = localStorage.getItem('teacherClass');
            if (!targetClass) {
                try {
                    const stats = await Axios.get(`/api/teacher/stats/${userEmail}`);
                    targetClass = stats.data.className;
                    if (targetClass) localStorage.setItem('teacherClass', targetClass);
                } catch (err) {
                    console.error("Error fetching teacher class:", err);
                }
            }
        }

        if (targetClass) {
            try {
                const res = await Axios.get(`/api/schedule/${targetClass}`);
                setSchedule(res.data);
            } catch (err) {
                console.error("Error fetching schedule:", err);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const getSubjectClass = (subject) => {
        const s = subject?.toLowerCase() || '';
        if (s.includes('math')) return 'subject-math';
        if (s.includes('english')) return 'subject-english';
        if (s.includes('science')) return 'subject-science';
        if (s.includes('urdu')) return 'subject-urdu';
        if (s.includes('islami')) return 'subject-islami';
        if (s.includes('social')) return 'subject-social';
        if (s.includes('art')) return 'subject-art';
        if (s.includes('break')) return 'subject-break';
        if (s.includes('p.e.')) return 'subject-pe';
        if (s.includes('lib')) return 'subject-library';
        return 'subject-default';
    };

    const currentDaySchedule = schedule?.days?.find(d => d.day === activeDay);

    return (
        <Layout>
            <Container fluid className="py-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <Button 
                        variant="light" 
                        className="rounded-circle shadow-sm border p-0 d-flex align-items-center justify-content-center" 
                        style={{ width: '40px', height: '40px' }} 
                        onClick={() => navigate(-1)}
                    >
                        <i className="bi bi-arrow-left fs-5"></i>
                    </Button>
                    <div>
                        <h2 className="fw-bold mb-0 text-dark">Class Timetable</h2>
                        <p className="text-muted small mb-0">{userClass || schedule?.classNo || 'Primary'} Schedule</p>
                    </div>
                </div>

                <Nav variant="pills" className="mb-4 bg-white p-2 rounded-4 shadow-sm overflow-auto flex-nowrap">
                    {DAYS.map(day => (
                        <Nav.Item key={day}>
                            <Nav.Link 
                                active={activeDay === day} 
                                onClick={() => setActiveDay(day)}
                                className="rounded-pill px-4 fw-bold"
                            >
                                {day}
                            </Nav.Link>
                        </Nav.Item>
                    ))}
                </Nav>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : schedule ? (
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0 align-middle">
                                <thead className="bg-light small text-uppercase">
                                    <tr>
                                        <th className="ps-4 py-3" style={{ width: '200px' }}>Time</th>
                                        <th className="py-3">Subject</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentDaySchedule?.periods?.map((period, index) => (
                                        <tr key={index}>
                                            <td className="ps-4 py-3 fw-bold text-secondary">
                                                <i className="bi bi-clock me-2 text-primary opacity-50"></i>
                                                {period.time}
                                            </td>
                                            <td>
                                                <div className={`subject-badge ${getSubjectClass(period.subject)}`}>
                                                    {period.subject}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!currentDaySchedule || currentDaySchedule.periods.length === 0) && (
                                        <tr>
                                            <td colSpan="2" className="text-center py-5 text-muted">
                                                No classes scheduled for {activeDay}.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                ) : (
                    <Card className="border-0 shadow-sm rounded-4 text-center py-5 bg-white">
                        <Card.Body>
                            <i className="bi bi-calendar-x display-1 text-warning mb-4 d-block"></i>
                            <h3 className="fw-bold text-dark">Schedule Not Available</h3>
                            <p className="text-muted mx-auto mb-0" style={{ maxWidth: '400px' }}>
                                The timetable for your class has not been published by the administration yet.
                            </p>
                        </Card.Body>
                    </Card>
                )}
            </Container>

            <style>{`
                .nav-pills .nav-link.active { background-color: #0d6efd; box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25); }
                .nav-pills .nav-link { color: #6c757d; }
                .subject-badge {
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: inline-block;
                    min-width: 120px;
                    text-align: center;
                }
                .subject-math { background-color: #eef2ff; color: #4338ca; }
                .subject-english { background-color: #ecfdf5; color: #047857; }
                .subject-science { background-color: #f0f9ff; color: #0369a1; }
                .subject-urdu { background-color: #fffbeb; color: #b45309; }
                .subject-islami { background-color: #f5f3ff; color: #7c3aed; }
                .subject-social { background-color: #fff7ed; color: #c2410c; }
                .subject-art { background-color: #fdf2f8; color: #be185d; }
                .subject-pe { background-color: #f8fafc; color: #334155; }
                .subject-break { background-color: #fff1f2; color: #e11d48; font-weight: 700; }
                .subject-library { background-color: #f0fdfa; color: #0f766e; }
                .subject-default { background-color: #f9fafb; color: #6b7280; }
            `}</style>
        </Layout>
    );
};

export default Schedule;
