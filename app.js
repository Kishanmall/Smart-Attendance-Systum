const STORAGE = 'csc-aiml-smart-attendance-v1';
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
}
const rosterNames = [
  'Kinchal Sahu', 'Kishan Mal', 'Krishna Kushwaha', 'Krishna Shukla',
  'Krishnendra Srivastava', 'Lavpuj Yadav', 'Manish Kumar', 'Manya Kashyap',
  'Mayank Jaiswal', 'Mohit Sachit', 'Mohit Saeed', 'Rehan', 'Monika Pal',
  'Mukti Gupta', 'Naitik Shukla', 'Nikhil Kumar Singh', 'Om Mishra', 'Om Verma',
  'Palak Verma', 'Pranav Kumar', 'Pranjal Pathak', 'Pushpendra Kumar',
  'Rishu Agnihotri', 'Raj Katiyar', 'Rasi Yadav', 'Raunak Kumar Jahan',
  'Raunak Yadav', 'Riddhi Khurana', 'Ritika Rai', 'Roshan Yadav',
  'Rudra Pratap Singh', 'Shweta Kumari', 'Sachin Chauhan', 'Sakshi Gupta',
  'Samriddhi Malla', 'Satyam Kumar Gupta', 'Shalini', 'Soheb', 'Sobit Tiwari',
  'Shroshti Bajpai', 'Shreyans Tripathi', 'Subhanshit Kumar Kushwaha',
  'Sunny Yadav', 'Tanish Kumar Pandey', 'Tejas Verma', 'Ujjwal Tripathi',
  'Umang Mishra', 'Umang Vishwakarma', 'Utkarsh Pradhan', 'Vaishnavi Kashyap',
  'Vikas Sharma', 'Vikas Kumar', 'Vinay Shukla', 'Vishal Kamal',
  'Vishnu Dutt Pandey', 'Vivek Kumar Yadav', 'Yashi Shukla', 'Yasir Khan',
  'Yukti Gupta'
];
const sampleStudents = Array.from({length:65}, (_, index) => {
  const number = index + 60;
  return {
    roll: `250349153${String(number).padStart(4,'0')}`,
    name: rosterNames[index] || `Student ${String(number).padStart(3,'0')}`,
    section: 'CSC AI-ML'
  };
});
let data = JSON.parse(localStorage.getItem(STORAGE) || '{"students":[],"attendance":{}}');
if (!data.students) data = {students:[], attendance:{}};
if (!data.attendance) data.attendance = {};
const isPreviousDemoRoster = data.students.length > 0 && data.students.every(student => /^23CS00[1-6]$/.test(student.roll));
const isPreviousDefaultRoster = data.students.length === 124 && data.students.every((student, index) => {
  const number = index + 1;
  return student.roll === `250349153${String(number).padStart(4,'0')}` && student.name === `Student ${String(number).padStart(3,'0')}`;
});
const isPreviousSixtyFiveRoster = data.students.length === 65 && data.students.every((student, index) => {
  const number = index + 60;
  return student.roll === `250349153${String(number).padStart(4,'0')}` && student.name === `Student ${String(number).padStart(3,'0')}`;
});
if (!data.students.length || isPreviousDemoRoster || isPreviousDefaultRoster || isPreviousSixtyFiveRoster) {
  data.students = sampleStudents;
  if (isPreviousDemoRoster || isPreviousDefaultRoster || isPreviousSixtyFiveRoster) data.attendance = {};
  localStorage.setItem(STORAGE, JSON.stringify(data));
}
const $ = id => document.getElementById(id);
const today = new Date().toISOString().slice(0,10);
let toastTimer;

function save(){ localStorage.setItem(STORAGE, JSON.stringify(data)); $('save-status').textContent = '● Auto-saved'; }
function esc(value){ const el=document.createElement('span'); el.textContent=value || ''; return el.innerHTML; }
function showToast(message){ const t=$('toast'); t.textContent=message; t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2200); }
function dayMap(date){ return data.attendance[date] || {}; }
function statusFor(date,roll){ return dayMap(date)[roll] || ''; }
function formatDate(date){ return new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'long',year:'numeric'}).format(new Date(date+'T12:00:00')); }

function renderAttendance(){
  const date = $('attendance-date').value, search = $('student-search').value.trim().toLowerCase();
  const rows = data.students.filter(s => `${s.roll} ${s.name} ${s.section}`.toLowerCase().includes(search));
  const marked = data.students.map(s=>statusFor(date,s.roll));
  $('total-count').textContent=data.students.length;
  $('present-count').textContent=marked.filter(x=>x==='P').length;
  $('absent-count').textContent=marked.filter(x=>x==='A').length;
  $('pending-count').textContent=marked.filter(x=>!x).length;
  $('attendance-body').innerHTML = rows.map((s,i)=>{
    const status=statusFor(date,s.roll);
    return `<tr><td>${i+1}</td><td class="roll">${esc(s.roll)}</td><td>${esc(s.name)}</td><td>${esc(s.section || '—')}</td><td><div class="status-pills"><button class="status present ${status==='P'?'active':''}" data-roll="${esc(s.roll)}" data-status="P">✓ Present</button><button class="status absent ${status==='A'?'active':''}" data-roll="${esc(s.roll)}" data-status="A">× Absent</button></div></td></tr>`;
  }).join('');
  $('attendance-empty').hidden=!!data.students.length;
  document.querySelector('.table-wrap').hidden=!data.students.length;
}
function renderStudents(){
  $('student-list-caption').textContent=`${data.students.length} registered students`;
  $('students-body').innerHTML=data.students.map((s,i)=>`<tr><td>${i+1}</td><td class="roll">${esc(s.roll)}</td><td>${esc(s.name)}</td><td>${esc(s.section || '—')}</td><td><button class="danger-text delete-student" data-roll="${esc(s.roll)}">Remove</button></td></tr>`).join('');
  $('students-empty').hidden=!!data.students.length;
  $('students-body').closest('.table-wrap').hidden=!data.students.length;
}
function getReport(){
  const from=$('from-date').value, to=$('to-date').value;
  return data.students.map(s=>{
    let p=0,a=0;
    Object.entries(data.attendance).forEach(([date,records])=>{ if(date>=from && date<=to){ if(records[s.roll]==='P')p++; if(records[s.roll]==='A')a++; }});
    const marked=p+a; return {...s,p,a,marked,percentage:marked ? (p*100/marked) : 0};
  });
}
function renderReport(){
  const report=getReport(), marked=report.reduce((sum,r)=>sum+r.marked,0), present=report.reduce((sum,r)=>sum+r.p,0);
  $('report-summary').innerHTML=`<div class="summary-box"><span>Total Students</span><strong>${report.length}</strong></div><div class="summary-box"><span>Total Marked Entries</span><strong>${marked}</strong></div><div class="summary-box"><span>Overall Attendance</span><strong>${marked ? (present*100/marked).toFixed(1) : 0}%</strong></div>`;
  $('report-body').innerHTML=report.filter(r=>r.marked).map(r=>`<tr><td class="roll">${esc(r.roll)}</td><td>${esc(r.name)}</td><td>${r.p}</td><td>${r.a}</td><td>${r.marked}</td><td class="percentage">${r.percentage.toFixed(1)}%</td></tr>`).join('');
  $('report-empty').hidden=report.some(r=>r.marked);
  $('report-body').closest('.table-wrap').hidden=!report.some(r=>r.marked);
}
function csvDownload(filename, rows){
  const csv=rows.map(row=>row.map(value=>`"${String(value ?? '').replaceAll('"','""')}"`).join(',')).join('\r\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})); a.download=filename; a.click(); URL.revokeObjectURL(a.href);
}
function setPage(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===`${page}-page`));
  document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  $('page-title').textContent={attendance:"Today's Attendance",students:'Student Management',reports:'Attendance Reports'}[page];
  if(page==='reports')renderReport();
}
function addStudents(students){
  const existing=new Set(data.students.map(s=>s.roll.toLowerCase())); let added=0;
  students.forEach(s=>{ const roll=(s.roll||'').trim(),name=(s.name||'').trim(); if(roll&&name&&!existing.has(roll.toLowerCase())){data.students.push({roll,name,section:(s.section||'').trim()});existing.add(roll.toLowerCase());added++;}});
  data.students.sort((a,b)=>a.roll.localeCompare(b.roll,undefined,{numeric:true})); save(); renderStudents(); renderAttendance(); return added;
}

$('attendance-date').value=today; $('from-date').value=today.slice(0,8)+'01'; $('to-date').value=today;
$('header-date').textContent=formatDate(today); renderAttendance(); renderStudents();
$('login-form').addEventListener('submit', event=>{
  event.preventDefault();
  $('login-screen').classList.add('hidden');
  showToast(`Welcome, ${$('login-id').value.trim()}!`);
});
$('logout-button').addEventListener('click', ()=>{
  $('login-password').value='';
  $('login-screen').classList.remove('hidden');
  $('login-id').focus();
});
document.querySelectorAll('.nav-link').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.page)));
document.querySelectorAll('.go-students').forEach(b=>b.addEventListener('click',()=>setPage('students')));
$('attendance-date').addEventListener('change',()=>{ $('header-date').textContent=formatDate($('attendance-date').value); renderAttendance(); });
$('student-search').addEventListener('input',renderAttendance);
$('attendance-body').addEventListener('click',event=>{
  const button=event.target.closest('.status'); if(!button)return;
  const date=$('attendance-date').value, roll=button.dataset.roll, status=button.dataset.status;
  if(!data.attendance[date])data.attendance[date]={};
  data.attendance[date][roll]=data.attendance[date][roll]===status ? '' : status;
  if(!data.attendance[date][roll])delete data.attendance[date][roll]; save(); renderAttendance();
});
$('mark-all-present').addEventListener('click',()=>{ if(!data.students.length)return showToast('Add students first.'); const date=$('attendance-date').value; data.attendance[date]=Object.fromEntries(data.students.map(s=>[s.roll,'P'])); save(); renderAttendance(); showToast('All students have been marked Present.'); });
$('download-day').addEventListener('click',()=>{ const date=$('attendance-date').value; csvDownload(`attendance-${date}.csv`,[['Date','Roll No','Name','Section','Status'],...data.students.map(s=>[date,s.roll,s.name,s.section,statusFor(date,s.roll)||'Not Marked'])]); });
$('add-student-form').addEventListener('submit',event=>{event.preventDefault(); const added=addStudents([{roll:$('roll-number').value,name:$('student-name').value,section:$('section').value}]); if(!added)return showToast('This roll number already exists.'); event.target.reset(); $('section').value='AI-ML A'; showToast('Student added.');});
$('students-body').addEventListener('click',event=>{ const b=event.target.closest('.delete-student'); if(!b)return; if(!confirm(`Remove ${b.dataset.roll}?`))return; data.students=data.students.filter(s=>s.roll!==b.dataset.roll); Object.values(data.attendance).forEach(d=>delete d[b.dataset.roll]); save();renderStudents();renderAttendance();showToast('Student removed.');});
$('clear-all').addEventListener('click',()=>{if(!data.students.length)return;if(!confirm('This clears the full student list and all attendance records. Continue?'))return;data={students:[],attendance:{}};save();renderStudents();renderAttendance();renderReport();showToast('All data has been cleared.');});
$('load-sample').addEventListener('click',()=>{const n=addStudents(sampleStudents);showToast(n?`${n} MIPS batch students added.`:'All MIPS batch students are already in the list.');});
$('csv-file').addEventListener('change',event=>{const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{const lines=String(reader.result).split(/\r?\n/).filter(Boolean);const parsed=lines.map((line,i)=>{const c=line.split(',').map(x=>x.trim().replace(/^"|"$/g,''));return {roll:c[0],name:c[1],section:c[2]||''};}).filter((x,i)=>!(i===0&&/roll/i.test(x.roll)&&/name/i.test(x.name)));const n=addStudents(parsed);$('import-message').textContent=`${n} new students added.`;event.target.value='';};reader.readAsText(file);});
$('make-report').addEventListener('click',renderReport);
$('download-report').addEventListener('click',()=>{const r=getReport();csvDownload(`attendance-report-${$('from-date').value}-to-${$('to-date').value}.csv`,[['Roll No','Name','Section','Present Days','Absent Days','Marked Days','Percentage'],...r.map(x=>[x.roll,x.name,x.section,x.p,x.a,x.marked,`${x.percentage.toFixed(1)}%`])]);});
