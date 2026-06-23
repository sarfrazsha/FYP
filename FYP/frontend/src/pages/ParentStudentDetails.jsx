// import React from 'react';
// import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
// import { useLocation, useNavigate, Navigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import Axios from 'axios';

// const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'%3E%3Ccircle cx='45' cy='45' r='45' fill='%23374151'/%3E%3Ccircle cx='45' cy='34' r='18' fill='%236B7280'/%3E%3Cellipse cx='45' cy='80' rx='28' ry='22' fill='%236B7280'/%3E%3C/svg%3E";

// const ParentStudentDetails = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const [currentHousehold, setCurrentHousehold] = React.useState(location.state?.household);
//     const parentImageRef = React.useRef(null);
//     const studentImageRef = React.useRef(null);

//     if (!currentHousehold) {
//         return <Navigate to="/parent-hub" replace />;
//     }

//     const { 
//         parentName, parentEmail, parentPhone, parentAddress, parentImage,
//         studentName, studentRollNo, studentAge, studentGender, studentImage, classNo 
//     } = currentHousehold;

//     const handleUpdatePic = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         const imageUrl = URL.createObjectURL(file);
//         setCurrentHousehold({ ...currentHousehold, parentImage: imageUrl });
//     };

//     const handleDeletePic = () => {
//         if (!window.confirm("Remove this guardian photo?")) return;
//         setCurrentHousehold({ ...currentHousehold, parentImage: '' });
//     };

//     const handleStudentPicChange = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         const imageUrl = URL.createObjectURL(file);
//         setCurrentHousehold({ ...currentHousehold, studentImage: imageUrl });
//     };

//     const handleRemoveStudentPic = () => {
//         if (!window.confirm("Remove this student photo?")) return;
//         setCurrentHousehold({ ...currentHousehold, studentImage: '' });
//     };

//     const parentImgSrc = parentImage ? (parentImage.startsWith('/') ? parentImage : `/uploads/images/${parentImage}`) : DEFAULT_AVATAR;
//     const studentImgSrc = studentImage ? (studentImage.startsWith('/') ? studentImage : `/uploads/images/${studentImage}`) : DEFAULT_AVATAR;

//     return (
//         <Layout>
//             <Container fluid className="py-4">
//                 {/* Header */}
//                 <div className="mb-4 d-flex align-items-center gap-3">
//                     <Button 
//                         variant="light" 
//                         className="rounded-circle shadow-sm border p-2 d-flex align-items-center justify-content-center" 
//                         style={{ width: '40px', height: '40px' }} 
//                         onClick={() => navigate(-1)}
//                     >
//                         <i className="bi bi-arrow-left fs-5"></i>
//                     </Button>
//                     <div>
//                         <h2 className="fw-bold text-dark mb-0">Linked Profile Details</h2>
//                         <p className="text-muted mb-0">Detailed view of guardian and child.</p>
//                     </div>
//                 </div>

//                 <Row className="g-4">
                   
//                     <Col lg={6}>
//                         <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden d-flex flex-column">
//                             <div className="bg-primary bg-opacity-10 text-center border-bottom" style={{ height: '320px', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
//                                 <div className="position-relative d-inline-block">
//                                     <div 
//                                         className="position-relative" 
//                                         style={{ cursor: 'pointer' }}
//                                         onClick={() => parentImageRef.current?.click()}
//                                         title="Click to update photo"
//                                     >
//                                         <img 
//                                             src={parentImgSrc} 
//                                             alt="Guardian" 
//                                             className="rounded-circle border border-4 border-white shadow-lg"
//                                             style={{ width: '130px', height: '130px', objectFit: 'cover' }}
//                                         />
//                                         {parentImage && (
//                                             <Button 
//                                                 variant="danger" 
//                                                 size="sm" 
//                                                 className="position-absolute rounded-circle p-0 d-flex align-items-center justify-content-center shadow"
//                                                 style={{ width: '28px', height: '28px', border: '2px solid #fff', top: '8px', right: '8px' }}
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     handleDeletePic();
//                                                 }}
//                                                 title="Delete current photo"
//                                             >
//                                                 <i className="bi bi-trash-fill small"></i>
//                                             </Button>
//                                         )}
//                                     </div>
//                                     <input 
//                                         type="file" 
//                                         ref={parentImageRef} 
//                                         style={{ display: 'none' }} 
//                                         accept="image/*"
//                                         onChange={handleUpdatePic}
//                                     />
//                                     <Badge bg="primary" className="position-absolute bottom-0 start-50 translate-middle-x rounded-pill px-3 py-1 border border-2 border-white" style={{ marginBottom: '-10px' }}>
//                                         Guardian
//                                     </Badge>
//                                 </div>
//                                 <h3 className="fw-bold mt-4 mb-1">{parentName}</h3>
//                                 <p className="text-primary small fw-bold mb-0 text-uppercase tracking-wider">Guardian Account</p>
//                             </div>
//                             <Card.Body className="p-4 flex-grow-1 d-flex flex-column justify-content-between">
//                                 <div className="d-flex flex-column h-100 justify-content-between">
//                                     <div>
//                                         <h5 className="fw-bold mb-4 text-secondary text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Contact Information</h5>
                                        
//                                         <div className="d-flex align-items-center mb-4">
//                                             <div className="bg-light rounded-3 p-2 me-3 text-primary">
//                                                 <i className="bi bi-envelope-fill fs-5"></i>
//                                             </div>
//                                             <div>
//                                                 <div className="text-muted small">Email Address</div>
//                                                 <div className="fw-bold">{parentEmail}</div>
//                                             </div>
//                                         </div>

//                                         <div className="d-flex align-items-center mb-4">
//                                             <div className="bg-light rounded-3 p-2 me-3 text-success">
//                                                 <i className="bi bi-telephone-fill fs-5"></i>
//                                             </div>
//                                             <div>
//                                                 <div className="text-muted small">Phone Number</div>
//                                                 <div className="fw-bold">{parentPhone}</div>
//                                             </div>
//                                         </div>

//                                         <div className="d-flex align-items-start mb-0">
//                                             <div className="bg-light rounded-3 p-2 me-3 text-warning">
//                                                 <i className="bi bi-geo-alt-fill fs-5"></i>
//                                             </div>
//                                             <div>
//                                                 <div className="text-muted small">Residential Address</div>
//                                                 <div className="fw-bold">{parentAddress}</div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </Card.Body>
//                         </Card>
//                     </Col>

                   
//                     <Col lg={6}>
//                         <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden d-flex flex-column">
//                             <div className="bg-info bg-opacity-10 text-center border-bottom" style={{ height: '320px', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
//                                 <div className="position-relative d-inline-block">
//                                     <img 
//                                         src={studentImgSrc} 
//                                         alt="Student" 
//                                         className="rounded-circle border border-4 border-white shadow-sm"
//                                         style={{ width: '130px', height: '130px', objectFit: 'cover' }}
//                                     />
                                  
//                                 </div>
//                                 <h3 className="fw-bold mt-4 mb-1">{studentName}</h3>
//                                 <p className="text-info small fw-bold mb-0 text-uppercase tracking-wider">Student</p>
//                             </div>
//                             <Card.Body className="p-4 flex-grow-1 d-flex flex-column justify-content-between">
//                                 <div className="d-flex flex-column h-100 justify-content-between">
//                                     <div>
//                                         <h5 className="fw-bold mb-4 text-secondary text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Academic & Personal Information</h5>
                                        
//                                         <Row className="g-4">
//                                             <Col sm={6}>
//                                                 <div className="d-flex align-items-center">
//                                                     <div className="bg-light rounded-3 p-2 me-3 text-dark">
//                                                         <i className="bi bi-hash fs-5"></i>
//                                                     </div>
//                                                     <div>
//                                                         <div className="text-muted small">Roll Number</div>
//                                                         <div className="fw-bold">{studentRollNo}</div>
//                                                     </div>
//                                                 </div>
//                                             </Col>
//                                             <Col sm={6}>
//                                                 <div className="d-flex align-items-center">
//                                                     <div className="bg-light rounded-3 p-2 me-3 text-indigo">
//                                                         <i className="bi bi-building fs-5" style={{ color: '#6610f2' }}></i>
//                                                     </div>
//                                                     <div>
//                                                         <div className="text-muted small">Class</div>
//                                                         <div className="fw-bold">Grade {classNo}</div>
//                                                     </div>
//                                                 </div>
//                                             </Col>
//                                             <Col sm={6}>
//                                                 <div className="d-flex align-items-center">
//                                                     <div className="bg-light rounded-3 p-2 me-3 text-danger">
//                                                         <i className="bi bi-calendar3-event fs-5"></i>
//                                                     </div>
//                                                     <div>
//                                                         <div className="text-muted small">Age</div>
//                                                         <div className="fw-bold">{studentAge} Years</div>
//                                                     </div>
//                                                 </div>
//                                             </Col>
//                                             <Col sm={6}>
//                                                 <div className="d-flex align-items-center">
//                                                     <div className="bg-light rounded-3 p-2 me-3 text-primary">
//                                                         <i className="bi bi-gender-ambiguous fs-5"></i>
//                                                     </div>
//                                                     <div>
//                                                         <div className="text-muted small">Gender</div>
//                                                         <div className="fw-bold text-capitalize">{studentGender}</div>
//                                                     </div>
//                                                 </div>
//                                             </Col>
//                                         </Row>
//                                     </div>
//                                 </div>
//                             </Card.Body>
//                         </Card>
//                     </Col>
//                 </Row>
//             </Container>
//         </Layout>
//     );
// };

// export default ParentStudentDetails;

import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Axios from 'axios';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'%3E%3Ccircle cx='45' cy='45' r='45' fill='%23374151'/%3E%3Ccircle cx='45' cy='34' r='18' fill='%236B7280'/%3E%3Cellipse cx='45' cy='80' rx='28' ry='22' fill='%236B7280'/%3E%3C/svg%3E";

const ParentStudentDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentHousehold, setCurrentHousehold] = React.useState(location.state?.household);
    const parentImageRef = React.useRef(null);
    const studentImageRef = React.useRef(null);

    if (!currentHousehold) {
        return <Navigate to="/parent-hub" replace />;
    }

    const { 
        parentName, parentEmail, parentPhone, parentAddress, parentImage,
        studentName, studentRollNo, studentAge, studentGender, studentImage, classNo 
    } = currentHousehold;

    const handleUpdatePic = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            alert('System supports only up to 10 MB for uploads.');
            e.target.value = '';
            return;
        }

        const imageUrl = URL.createObjectURL(file);
        setCurrentHousehold({ ...currentHousehold, parentImage: imageUrl });
    };

    const handleDeletePic = () => {
        if (!window.confirm("Remove this guardian photo?")) return;
        setCurrentHousehold({ ...currentHousehold, parentImage: '' });
    };

    const handleStudentPicChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            alert('System supports only up to 10 MB for uploads.');
            e.target.value = '';
            return;
        }

        const imageUrl = URL.createObjectURL(file);
        setCurrentHousehold({ ...currentHousehold, studentImage: imageUrl });
    };

    const handleRemoveStudentPic = () => {
        if (!window.confirm("Remove this student photo?")) return;
        setCurrentHousehold({ ...currentHousehold, studentImage: '' });
    };

    const parentImgSrc = parentImage ? (parentImage.startsWith('/') ? parentImage : `/uploads/images/${parentImage}`) : DEFAULT_AVATAR;
    const studentImgSrc = studentImage ? (studentImage.startsWith('/') ? studentImage : `/uploads/images/${studentImage}`) : DEFAULT_AVATAR;

    return (
        <Layout>
            <Container fluid className="py-4">
                {/* Header */}
                <div className="mb-4 d-flex align-items-center gap-3">
                    <Button 
                        variant="light" 
                        className="rounded-circle shadow-sm border p-2 d-flex align-items-center justify-content-center" 
                        style={{ width: '40px', height: '40px' }} 
                        onClick={() => navigate(-1)}
                    >
                        <i className="bi bi-arrow-left fs-5"></i>
                    </Button>
                    <div>
                        <h2 className="fw-bold text-dark mb-0">Linked Profile Details</h2>
                        <p className="text-muted mb-0">Detailed view of guardian and child.</p>
                    </div>
                </div>

                <Row className="g-4">
                   
                    <Col lg={6}>
                        <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden d-flex flex-column">
                            <div className="bg-primary bg-opacity-10 text-center border-bottom" style={{ height: '320px', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div className="position-relative d-inline-block">
                                    <div 
                                        className="position-relative" 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => parentImageRef.current?.click()}
                                        title="Click to update photo"
                                    >
                                        <img 
                                            src={parentImgSrc} 
                                            alt="Guardian" 
                                            className="rounded-circle border border-4 border-white shadow-lg"
                                            style={{ width: '130px', height: '130px', objectFit: 'cover' }}
                                        />
                                        {parentImage && (
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                className="position-absolute rounded-circle p-0 d-flex align-items-center justify-content-center shadow"
                                                style={{ width: '28px', height: '28px', border: '2px solid #fff', top: '8px', right: '8px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeletePic();
                                                }}
                                                title="Delete current photo"
                                            >
                                                <i className="bi bi-trash-fill small"></i>
                                            </Button>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={parentImageRef} 
                                        style={{ display: 'none' }} 
                                        accept="image/*"
                                        onChange={handleUpdatePic}
                                    />
                                    <Badge bg="primary" className="position-absolute bottom-0 start-50 translate-middle-x rounded-pill px-3 py-1 border border-2 border-white" style={{ marginBottom: '-10px' }}>
                                        Guardian
                                    </Badge>
                                </div>
                                <h3 className="fw-bold mt-4 mb-1">{parentName}</h3>
                                <p className="text-primary small fw-bold mb-0 text-uppercase tracking-wider">Guardian Account</p>
                            </div>
                            <Card.Body className="p-4 flex-grow-1 d-flex flex-column justify-content-between">
                                <div className="d-flex flex-column h-100 justify-content-between">
                                    <div>
                                        <h5 className="fw-bold mb-4 text-secondary text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Contact Information</h5>
                                        
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="bg-light rounded-3 p-2 me-3 text-primary">
                                                <i className="bi bi-envelope-fill fs-5"></i>
                                            </div>
                                            <div>
                                                <div className="text-muted small">Email Address</div>
                                                <div className="fw-bold">{parentEmail}</div>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center mb-4">
                                            <div className="bg-light rounded-3 p-2 me-3 text-success">
                                                <i className="bi bi-telephone-fill fs-5"></i>
                                            </div>
                                            <div>
                                                <div className="text-muted small">Phone Number</div>
                                                <div className="fw-bold">{parentPhone}</div>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-start mb-0">
                                            <div className="bg-light rounded-3 p-2 me-3 text-warning">
                                                <i className="bi bi-geo-alt-fill fs-5"></i>
                                            </div>
                                            <div>
                                                <div className="text-muted small">Residential Address</div>
                                                <div className="fw-bold">{parentAddress}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                   
                    <Col lg={6}>
                        <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden d-flex flex-column">
                            <div className="bg-info bg-opacity-10 text-center border-bottom" style={{ height: '320px', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div className="position-relative d-inline-block">
                                    <div 
                                        className="position-relative" 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => studentImageRef.current?.click()}
                                        title="Click to update photo"
                                    >
                                        <img 
                                            src={studentImgSrc} 
                                            alt="Student" 
                                            className="rounded-circle border border-4 border-white shadow-lg"
                                            style={{ width: '130px', height: '130px', objectFit: 'cover' }}
                                        />
                                        {studentImage && (
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                className="position-absolute rounded-circle p-0 d-flex align-items-center justify-content-center shadow"
                                                style={{ width: '28px', height: '28px', border: '2px solid #fff', top: '8px', right: '8px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveStudentPic();
                                                }}
                                                title="Delete current photo"
                                            >
                                                <i className="bi bi-trash-fill small"></i>
                                            </Button>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={studentImageRef} 
                                        style={{ display: 'none' }} 
                                        accept="image/*"
                                        onChange={handleStudentPicChange}
                                    />
                                    <Badge bg="info" className="position-absolute bottom-0 start-50 translate-middle-x rounded-pill px-3 py-1 border border-2 border-white" style={{ marginBottom: '-10px' }}>
                                        Student
                                    </Badge>
                                </div>
                                <h3 className="fw-bold mt-4 mb-1">{studentName}</h3>
                                <p className="text-info small fw-bold mb-0 text-uppercase tracking-wider">Student</p>
                            </div>
                            <Card.Body className="p-4 flex-grow-1 d-flex flex-column justify-content-between">
                                <div className="d-flex flex-column h-100 justify-content-between">
                                    <div>
                                        <h5 className="fw-bold mb-4 text-secondary text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Academic & Personal Information</h5>
                                        
                                        <Row className="g-4">
                                            <Col sm={6}>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light rounded-3 p-2 me-3 text-dark">
                                                        <i className="bi bi-hash fs-5"></i>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted small">Roll Number</div>
                                                        <div className="fw-bold">{studentRollNo}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col sm={6}>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light rounded-3 p-2 me-3 text-indigo">
                                                        <i className="bi bi-building fs-5" style={{ color: '#6610f2' }}></i>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted small">Class</div>
                                                        <div className="fw-bold">Grade {classNo}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col sm={6}>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light rounded-3 p-2 me-3 text-danger">
                                                        <i className="bi bi-calendar3-event fs-5"></i>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted small">Age</div>
                                                        <div className="fw-bold">{studentAge} Years</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col sm={6}>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light rounded-3 p-2 me-3 text-primary">
                                                        <i className="bi bi-gender-ambiguous fs-5"></i>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted small">Gender</div>
                                                        <div className="fw-bold text-capitalize">{studentGender}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
};

export default ParentStudentDetails;