
const KEY='hgr_dev_crm_v1';
let db=JSON.parse(localStorage.getItem(KEY)||'null')||structuredClone(SEED_DATA);
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const money=n=>'Rs. '+Number(n).toLocaleString('en-PK');
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2200)}
function nav(page){$$('.page').forEach(x=>x.classList.remove('active'));$('#page-'+page)?.classList.add('active');$$('.nav-link').forEach(x=>x.classList.toggle('active',x.dataset.page===page));$('#pageTitle').textContent=page[0].toUpperCase()+page.slice(1);render(page);history.replaceState({},'',`#${page}`)}
function render(page){
 if(page==='dashboard')dashboard(); if(page==='projects')projects(); if(page==='clients')clients(); if(page==='tasks')tasks(); if(page==='leads')leads(); if(page==='reviews')reviews(); if(page==='portfolio')portfolio();
}
function dashboard(){
 $('#statProjects').textContent=db.projects.length;$('#statClients').textContent=db.clients.length;$('#statTasks').textContent=db.tasks.filter(x=>x.status!=='Done').length;
 $('#statRevenue').textContent=money(db.projects.reduce((s,x)=>s+x.budget,0));
 $('#dashProjects').innerHTML=db.projects.slice(0,5).map(projectRow).join('');
 $('#dashReviews').innerHTML=db.reviews.slice(0,3).map(reviewCard).join('');
 const completed=db.projects.filter(x=>x.status==='Completed').length;
 $('#completionBar').style.width=(db.projects.length?completed/db.projects.length*100:0)+'%';
 $('#completionText').textContent=`${completed} of ${db.projects.length} projects completed`;
}
function projectRow(p){return `<tr><td><b>${p.name}</b><div class="muted">${p.client}</div></td><td>${p.tech}</td><td><span class="badge ${p.status==='Completed'?'b-green':p.status==='In Progress'?'b-purple':'b-orange'}">${p.status}</span></td><td>${money(p.budget)}</td><td>${p.progress}%</td></tr>`}
function projectCard(p){return `<div class="card project-card"><div class="project-cover">${p.icon}</div><div class="project-body"><span class="badge ${p.status==='Completed'?'b-green':p.status==='In Progress'?'b-purple':'b-orange'}">${p.status}</span><h3>${p.name}</h3><div class="muted">${p.client}</div><p class="muted">${p.tech}</p><div class="progress"><i style="width:${p.progress}%"></i></div><div class="project-meta"><span>${p.progress}% complete</span><b>${money(p.budget)}</b></div><div style="display:flex;gap:7px;margin-top:15px"><button class="btn btn-light" onclick="editProject(${p.id})">Edit</button><button class="btn btn-danger" onclick="delProject(${p.id})">Delete</button></div></div></div>`}
function projects(){
 const q=($('#projectSearch')?.value||'').toLowerCase();
 $('#projectGrid').innerHTML=db.projects.filter(p=>`${p.name} ${p.client} ${p.tech}`.toLowerCase().includes(q)).map(projectCard).join('')||'<div class="card empty">No projects found.</div>';
}
function clients(){
 const q=($('#clientSearch')?.value||'').toLowerCase();
 $('#clientRows').innerHTML=db.clients.filter(c=>`${c.name} ${c.email} ${c.company}`.toLowerCase().includes(q)).map(c=>`<tr><td><b>${c.name}</b></td><td>${c.company}</td><td>${c.email}</td><td>${c.phone}</td><td><span class="badge ${c.status==='Active'?'b-green':'b-orange'}">${c.status}</span></td><td><button class="btn btn-danger" onclick="delClient(${c.id})">Delete</button></td></tr>`).join('');
}
function tasks(){
 $('#taskRows').innerHTML=db.tasks.map(t=>`<tr><td><b>${t.title}</b><div class="muted">${t.project}</div></td><td><span class="badge ${t.priority==='High'?'b-red':t.priority==='Medium'?'b-orange':'b-green'}">${t.priority}</span></td><td>${t.due}</td><td><span class="badge ${t.status==='Done'?'b-green':t.status==='In Progress'?'b-purple':'b-orange'}">${t.status}</span></td><td><button class="btn btn-light" onclick="toggleTask(${t.id})">Toggle</button></td></tr>`).join('');
}
function leads(){
 $('#leadRows').innerHTML=db.leads.map(l=>`<tr><td><b>${l.name}</b><div class="muted">${l.email}</div></td><td>${l.source}</td><td>${money(l.value)}</td><td><select class="form-select" onchange="leadStatus(${l.id},this.value)"><option ${l.status==='New'?'selected':''}>New</option><option ${l.status==='Contacted'?'selected':''}>Contacted</option><option ${l.status==='Proposal'?'selected':''}>Proposal</option><option ${l.status==='Won'?'selected':''}>Won</option><option ${l.status==='Lost'?'selected':''}>Lost</option></select></td></tr>`).join('');
}
function reviewCard(r){return `<div class="card review"><div class="review-head"><div class="review-avatar">${r.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><b>${r.name}</b><div class="muted">${r.role}</div></div></div><div class="stars mt-3">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div><p class="mt-2 mb-0">“${r.text}”</p></div>`}
function reviews(){
 $('#reviewGrid').innerHTML=db.reviews.map(reviewCard).join('');
 const avg=db.reviews.length?db.reviews.reduce((s,r)=>s+r.rating,0)/db.reviews.length:0;
 $('#avgRating').textContent=avg.toFixed(1);$('#reviewCount').textContent=db.reviews.length;
}
function portfolio(){ $('#portfolioGrid').innerHTML=db.projects.map(p=>`<div class="card project-card"><div class="project-cover">${p.icon}</div><div class="project-body"><div class="badge b-purple">${p.tech.split(',')[0]}</div><h3>${p.name}</h3><p class="muted">${p.client} • ${p.status}</p><button class="btn btn-primary" onclick="nav('projects')">Manage Project</button></div></div>`).join('')}
function openModal(type,id=null){
 const m=$('#modal');m.classList.add('show');
 if(type==='project'){const p=id?db.projects.find(x=>x.id===id):{};$('#modalTitle').textContent=id?'Edit Project':'Add Project';$('#modalBody').innerHTML=`<form id="projectForm"><div class="form-row"><div class="form-group"><label>Project Name</label><input class="form-control" name="name" required value="${p.name||''}"></div><div class="form-group"><label>Client</label><input class="form-control" name="client" required value="${p.client||''}"></div></div><div class="form-row"><div class="form-group"><label>Budget</label><input class="form-control" name="budget" type="number" required value="${p.budget||''}"></div><div class="form-group"><label>Progress %</label><input class="form-control" name="progress" type="number" min="0" max="100" value="${p.progress??0}"></div></div><div class="form-row"><div class="form-group"><label>Status</label><select class="form-select" name="status"><option>Planning</option><option>In Progress</option><option>Completed</option></select></div><div class="form-group"><label>Technology</label><input class="form-control" name="tech" value="${p.tech||'HTML, CSS, JavaScript'}"></div></div><div class="form-group"><label>Icon</label><input class="form-control" name="icon" value="${p.icon||'💻'}"></div><button class="btn btn-primary">Save Project</button></form>`;if(id)$('#projectForm [name=status]').value=p.status;$('#projectForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const obj={id:id||Date.now(),name:f.get('name'),client:f.get('client'),budget:+f.get('budget'),progress:+f.get('progress'),status:f.get('status'),tech:f.get('tech'),icon:f.get('icon')};if(id)db.projects=db.projects.map(x=>x.id===id?obj:x);else db.projects.push(obj);save();closeModal();projects();dashboard();toast('Project saved successfully')}}
 if(type==='client'){$('#modalTitle').textContent='Add Client';$('#modalBody').innerHTML=`<form id="clientForm"><div class="form-row"><div class="form-group"><label>Name</label><input required class="form-control" name="name"></div><div class="form-group"><label>Company</label><input required class="form-control" name="company"></div></div><div class="form-row"><div class="form-group"><label>Email</label><input required type="email" class="form-control" name="email"></div><div class="form-group"><label>Phone</label><input class="form-control" name="phone"></div></div><div class="form-group"><label>Status</label><select class="form-select" name="status"><option>Active</option><option>Lead</option></select></div><button class="btn btn-primary">Add Client</button></form>`;$('#clientForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);db.clients.push({id:Date.now(),name:f.get('name'),company:f.get('company'),email:f.get('email'),phone:f.get('phone'),status:f.get('status')});save();closeModal();clients();dashboard();toast('Client added')}}
}
function closeModal(){$('#modal').classList.remove('show')}
function editProject(id){openModal('project',id)}
function delProject(id){if(confirm('Delete this project?')){db.projects=db.projects.filter(x=>x.id!==id);save();projects();dashboard();toast('Project deleted')}}
function delClient(id){if(confirm('Delete this client?')){db.clients=db.clients.filter(x=>x.id!==id);save();clients();dashboard();toast('Client deleted')}}
function toggleTask(id){db.tasks=db.tasks.map(x=>x.id===id?{...x,status:x.status==='Done'?'Pending':'Done'}:x);save();tasks();dashboard()}
function leadStatus(id,status){db.leads=db.leads.map(x=>x.id===id?{...x,status}:x);save();toast('Lead updated')}
function resetData(){if(confirm('Reset all demo CRM data?')){db=structuredClone(SEED_DATA);save();location.reload()}}
document.addEventListener('DOMContentLoaded',()=>{
 $$('[data-page]').forEach(a=>a.onclick=e=>{e.preventDefault();nav(a.dataset.page)});
 $('#mobileMenu').onclick=()=>$('#sidebar').classList.toggle('open');
 $('#addProject').onclick=()=>openModal('project');$('#addClient').onclick=()=>openModal('client');$('#closeModal').onclick=closeModal;
 $('#projectSearch').oninput=projects;$('#clientSearch').oninput=clients;
 $('#globalSearch').oninput=e=>{const q=e.target.value.toLowerCase();if(q){nav('projects');$('#projectSearch').value=q;projects()}};
 $('#resetData').onclick=resetData;
 const start=location.hash.replace('#','')||'dashboard';nav(start);
});
