import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Form, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Axios from 'axios';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ManageTimetable = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [schedule, setSchedule] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await Axios.get('/api/classes');
                setClasses(res.data);
            } catch (err) {
                console.error("Error fetching classes:", err);
            }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSchedule();
        }
    }, [selectedClass]);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const res = await Axios.get(`/api/schedule/${selectedClass}`);
            if (res.data && res.data.days) {
                const scheduleMap = {};
                res.data.days.forEach(d => {
                    scheduleMap[d.day] = d.periods;
                });
                setSchedule(scheduleMap);
            } else {
                setSchedule({});
            }
        } catch (err) {
            console.error("Error fetching schedule:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPeriod = (day) => {
        const currentPeriods = schedule[day] || [];
        setSchedule({
            ...schedule,
            [day]: [...currentPeriods, { time: '', subject: '' }]
        });
    };

    const handleUpdatePeriod = (day, index, field, value) => {
        const updatedPeriods = [...(schedule[day] || [])];
        updatedPeriods[index][field] = value;
        setSchedule({
            ...schedule,
            [day]: updatedPeriods
        });
    };

    const handleRemovePeriod = (day, index) => {
        const updatedPeriods = schedule[day].filter((_, i) => i !== index);
        setSchedule({
            ...schedule,
            [day]: updatedPeriods
        });
    };

    const handleSave = async () => {
        if (!selectedClass) return;
        setSaving(true);
        try {
            const formattedDays = Object.keys(schedule).map(day => ({
                day,
                periods: schedule[day]
            }));
            await Axios.post('/api/schedule', {
                classNo: selectedClass,
                days: formattedDays
            });
            alert("Timetable saved successfully!");
        } catch (err) {
            console.error("Error saving schedule:", err);
            alert("Failed to save timetable.");
        } finally {
            setSaving(false);
        }
    };

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
                            <h2 className="fw-bold mb-0 text-dark">Manage Timetable</h2>
                            <p className="text-muted small mb-0">Define weekly schedule for each class</p>
                        </div>
                    </div>
                    {selectedClass && (
                        <Button 
                            variant="primary" 
                            className="rounded-pill px-4 shadow-sm fw-bold" 
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? <Spinner size="sm" className="me-2" /> : <i className="bi bi-save me-2"></i>}
                            Save Schedule
                        </Button>
                    )}
                </div>

                <Card className="border-0 shadow-sm rounded-4 mb-4">
                    <Card.Body className="p-4">
                        <Form.Group>
                            <Form.Label className="fw-bold text-secondary mb-3">Select Class to Manage</Form.Label>
                            <Row>
                                <Col md={4}>
                                    <Form.Select 
                                        size="lg" 
                                        className="rounded-3 border-2" 
                                        value={selectedClass} 
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                    >
                                        <option value="">Choose a Class...</option>
                                        {classes.map(c => {
                                            const classLabel = `${c.name} - ${c.section}`;
                                            return <option key={c.id || c._id} value={classLabel}>{classLabel}</option>
                                        })}
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Form.Group>
                    </Card.Body>
                </Card>

                {selectedClass ? (
                    loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Loading timetable...</p>
                        </div>
                    ) : (
                        <Row>
                            {DAYS.map(day => (
                                <Col key={day} lg={6} className="mb-4">
                                    <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                                        <Card.Header className="bg-light border-0 py-3 d-flex justify-content-between align-items-center">
                                            <h6 className="fw-bold text-dark mb-0">{day}</h6>
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                className="rounded-pill px-3 py-1"
                                                onClick={() => handleAddPeriod(day)}
                                            >
                                                <i className="bi bi-plus-lg me-1"></i> Add Period
                                            </Button>
                                        </Card.Header>
                                        <Card.Body className="p-3">
                                            {schedule[day] && schedule[day].length > 0 ? (
                                                <Table borderless className="align-middle mb-0">
                                                    <thead>
                                                        <tr className="text-muted small">
                                                            <th style={{ width: '130px' }}>Time Range</th>
                                                            <th>Subject</th>
                                                            <th style={{ width: '40px' }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {schedule[day].map((p, idx) => (
                                                            <tr key={idx}>
                                                                <td>
                                                                    <Form.Control 
                                                                        size="sm" 
                                                                        placeholder="e.g. 08:00 - 08:45" 
                                                                        value={p.time}
                                                                        onChange={(e) => handleUpdatePeriod(day, idx, 'time', e.target.value)}
                                                                        className="rounded-2"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <Form.Control 
                                                                        size="sm" 
                                                                        placeholder="Subject" 
                                                                        value={p.subject}
                                                                        onChange={(e) => handleUpdatePeriod(day, idx, 'subject', e.target.value)}
                                                                        className="rounded-2"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <Button 
                                                                        variant="outline-danger" 
                                                                        size="sm" 
                                                                        className="rounded-circle border-0 p-1"
                                                                        onClick={() => handleRemovePeriod(day, idx)}
                                                                    >
                                                                        <i className="bi bi-trash-fill"></i>
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            ) : (
                                                <div className="text-center py-4 text-muted small italic">
                                                    No periods defined for {day}. Click "Add Period" to start.
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )
                ) : (
                    <Card className="border-0 shadow-sm rounded-4 text-center py-5 bg-light opacity-75">
                        <Card.Body>
                            <i className="bi bi-arrow-up-circle display-4 text-primary opacity-25 mb-3 d-block"></i>
                            <h5 className="text-muted">Please select a class above to manage its timetable</h5>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </Layout>
    );
};

export default ManageTimetable;
