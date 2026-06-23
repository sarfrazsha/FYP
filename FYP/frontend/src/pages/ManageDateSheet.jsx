import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Form, Button, Row, Col, Badge, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Axios from 'axios';

const ManageDateSheet = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');

    const [teacherData, setTeacherData] = useState(null);
    const [datesheet, setDatesheet] = useState({
        classNo: '',
        examType: '',
        exams: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        const initializeData = async () => {
            if (userRole === 'teacher') {
                try {
                    console.log(`[ManageDateSheet] Forcing fresh fetch for teacher: ${userEmail}`);
                    const stats = await Axios.get(`/api/teacher/stats/${userEmail?.trim()}`);
                    const fetchedClass = stats.data.className;
                    console.log(`[ManageDateSheet] Fetched class: ${fetchedClass}`);

                    if (fetchedClass && fetchedClass !== 'Not Assigned' && fetchedClass !== 'null' && fetchedClass !== 'undefined') {
                        localStorage.setItem('teacherClass', fetchedClass);
                        setDatesheet(prev => ({ ...prev, classNo: fetchedClass }));
                        await fetchTeacherInfo(fetchedClass);
                    } else {
                        console.warn(`[ManageDateSheet] Invalid class returned: ${fetchedClass}`);
                        setDatesheet(prev => ({ ...prev, classNo: '' })); // Force empty so badge says "No Class Selected"
                        setLoading(false);
                    }
                } catch (err) {
                    console.error("[ManageDateSheet] Error fetching teacher class:", err);
                    setLoading(false);
                }
            } else if (userRole === 'admin') {
                await fetchClasses();
                setLoading(false);
            } else {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await Axios.get('/api/classes');
            setClasses(res.data);
        } catch (err) {
            console.error("Error fetching classes:", err);
        }
    };

    const fetchTeacherInfo = async (className) => {
        try {
            const dsRes = await Axios.get(`/api/datesheet/${className}`);
            if (dsRes.data && dsRes.data.length > 0) {
                const latest = dsRes.data[0];
                setDatesheet({
                    classNo: latest.classNo,
                    examType: latest.examType,
                    exams: latest.exams.map(ex => ({
                        ...ex,
                        date: ex.date ? ex.date.split('T')[0] : ''
                    }))
                });
            }
        } catch (err) {
            console.error("Error fetching existing datesheet:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExam = () => {
        setDatesheet({
            ...datesheet,
            exams: [...datesheet.exams, { subject: '', date: '', startTime: '', endTime: '', room: '' }]
        });
    };

    const handleUpdateExam = (index, field, value) => {
        const updatedExams = [...datesheet.exams];
        updatedExams[index][field] = value;
        setDatesheet({
            ...datesheet,
            exams: updatedExams
        });
    };

    const handleRemoveExam = (index) => {
        const updatedExams = datesheet.exams.filter((_, i) => i !== index);
        setDatesheet({
            ...datesheet,
            exams: updatedExams
        });
    };

    const handleSave = async () => {
        if (!datesheet.examType || datesheet.exams.length === 0) {
            alert("Please provide an exam type and at least one subject schedule.");
            return;
        }

        let classNo = datesheet.classNo;

        // If it's empty, try one last desperation fetch
        if (!classNo || classNo === 'Not Assigned' || classNo === 'null' || classNo === 'undefined') {
            try {
                const stats = await Axios.get(`/api/teacher/stats/${userEmail?.trim()}`);
                classNo = stats.data.className;
            } catch (err) {
                console.error("Final fetch failed", err);
            }
        }

        if (!classNo || classNo === 'Not Assigned' || classNo === 'null' || classNo === 'undefined') {
            alert("No valid class assigned to You. Please ensure the Admin has assigned a class to you.");
            return;
        }

        const payload = { ...datesheet, classNo };
        console.log("Publishing datesheet with payload:", payload);

        setSaving(true);
        try {
            await Axios.post('/api/datesheet', payload);
            alert("Examination datesheet published successfully!");
        } catch (err) {
            console.error("Error saving datesheet:", err);
            alert("Failed to publish datesheet.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Layout><div className="text-center py-5"><Spinner animation="border" variant="primary" /></div></Layout>;

    return (
        <Layout>
            <Container fluid className="py-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <Button
                            variant="light"
                            className="rounded-circle shadow-sm border p-0 d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                            onClick={() => navigate(-1)}
                        >
                            <i className="bi bi-arrow-left fs-5"></i>
                        </Button>
                        <div>
                            <h2 className="fw-bold text-dark mb-0">Manage Datesheets</h2>
                            <p className="text-muted mb-0">Publish and manage exam schedules for
                                <Badge bg="primary" className="ms-2">{datesheet.classNo || ""}</Badge>
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="success"
                        className="rounded-pill px-4 shadow-sm fw-bold"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <Spinner size="sm" className="me-2" /> : <i className="bi bi-cloud-arrow-up me-2"></i>}
                        Publish Datesheet
                    </Button>
                </div>

                <Row>
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm rounded-4 mb-4">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-3">Exam Details</h5>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">Exam Type</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. Mid-Term, Monthly Test"
                                        value={datesheet.examType}
                                        onChange={(e) => setDatesheet({ ...datesheet, examType: e.target.value })}
                                        className="rounded-3"
                                    />
                                    <Form.Text className="text-muted">Enter the name of the exam term.</Form.Text>
                                </Form.Group>
                                <Form.Group>
                                    {userRole === 'admin' && (
                                        <>
                                            <Form.Label className="small fw-bold text-muted">Target Class</Form.Label>
                                            <Form.Select
                                                value={datesheet.classNo}
                                                onChange={(e) => {
                                                    const cls = e.target.value;
                                                    setDatesheet({ ...datesheet, classNo: cls });
                                                    if (cls) fetchTeacherInfo(cls);
                                                }}
                                                className="rounded-3"
                                            >
                                                <option value="">Select a Class...</option>
                                                {classes.map(c => {
                                                    const label = `${c.name} - ${c.section}`;
                                                    return <option key={c.id || c._id} value={label}>{label}</option>
                                                })}
                                            </Form.Select>
                                            <Form.Text className="text-muted">Select the class for this datesheet.</Form.Text>
                                        </>
                                    )}
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={8}>
                        <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                            <Card.Header className="bg-primary bg-opacity-10 border-0 py-3 d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold text-primary mb-0">Subject Schedule</h6>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="rounded-pill px-3 py-1"
                                    onClick={handleAddExam}
                                >
                                    <i className="bi bi-plus-lg me-1"></i> Add Subject
                                </Button>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table responsive hover className="mb-0 align-middle">
                                    <thead className="bg-light small text-uppercase text-secondary">
                                        <tr>
                                            <th className="ps-4">Subject</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Room / Location</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datesheet.exams.map((ex, idx) => (
                                            <tr key={idx}>
                                                <td className="ps-4">
                                                    <Form.Control
                                                        size="sm"
                                                        placeholder="e.g. Mathematics"
                                                        value={ex.subject}
                                                        onChange={(e) => handleUpdateExam(idx, 'subject', e.target.value)}
                                                        className="rounded-2"
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="date"
                                                        size="sm"
                                                        value={ex.date}
                                                        onChange={(e) => handleUpdateExam(idx, 'date', e.target.value)}
                                                        className="rounded-2"
                                                    />
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Form.Control
                                                            size="sm"
                                                            placeholder="Start"
                                                            value={ex.startTime}
                                                            onChange={(e) => handleUpdateExam(idx, 'startTime', e.target.value)}
                                                            className="rounded-2"
                                                        />
                                                        <Form.Control
                                                            size="sm"
                                                            placeholder="End"
                                                            value={ex.endTime}
                                                            onChange={(e) => handleUpdateExam(idx, 'endTime', e.target.value)}
                                                            className="rounded-2"
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        size="sm"
                                                        placeholder="e.g. Room 102"
                                                        value={ex.room}
                                                        onChange={(e) => handleUpdateExam(idx, 'room', e.target.value)}
                                                        className="rounded-2"
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="rounded-circle border-0 p-1"
                                                        onClick={() => handleRemoveExam(idx)}
                                                    >
                                                        <i className="bi bi-trash-fill"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {datesheet.exams.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted">
                                                    No subjects added yet. Click "Add Subject" to begin.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
};

export default ManageDateSheet;
