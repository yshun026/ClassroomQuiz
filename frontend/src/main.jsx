import React from 'react';
import {createRoot} from 'react-dom/client';
import TeacherPage from './pages/TeacherPage.jsx';
import StudentPage from './pages/StudentPage.jsx';
import './style.css';
function App(){const teacher=new URLSearchParams(location.search).get('role')==='teacher';return <main><header><p className="eyebrow">CLASSROOM QUIZ</p><h1>ClassroomQuiz</h1><p>課堂搶答與 Guided Notes</p><nav><a href="/?role=teacher">老師端</a><a href="/?role=student">學生端</a></nav></header>{teacher?<TeacherPage/>:<StudentPage/>}</main>;}
createRoot(document.getElementById('root')).render(<App/>);
