const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const CATEGORIES = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio', 'Personalizados'];
const STORAGE_KEY = 'mi-rutina-v1';

// Nombre, categoría, equipo/posición para la ilustración.
const EXERCISES = [
  ['Press de banca con barra','Pecho','bench'],['Press de banca con mancuernas','Pecho','bench'],['Press inclinado con barra','Pecho','bench'],['Press inclinado con mancuernas','Pecho','bench'],['Aperturas con mancuernas','Pecho','bench'],['Cruce de poleas','Pecho','cable'],['Press de pecho en máquina','Pecho','machine'],['Flexiones de brazos','Pecho','floor'],['Fondos en paralelas','Pecho','bars'],
  ['Dominadas','Espalda','bar'],['Dominadas asistidas','Espalda','machine'],['Jalón al pecho','Espalda','cable'],['Remo con barra','Espalda','barbell'],['Remo con mancuerna','Espalda','dumbbell'],['Remo sentado en polea','Espalda','cable'],['Remo en máquina','Espalda','machine'],['Peso muerto convencional','Espalda','barbell'],['Peso muerto rumano','Espalda','barbell'],['Pullover en polea','Espalda','cable'],['Hiperextensiones lumbares','Espalda','floor'],
  ['Sentadilla con barra','Piernas','barbell'],['Sentadilla goblet','Piernas','dumbbell'],['Sentadilla búlgara','Piernas','dumbbell'],['Prensa de piernas','Piernas','machine'],['Extensión de cuádriceps','Piernas','machine'],['Curl femoral acostado','Piernas','machine'],['Curl femoral sentado','Piernas','machine'],['Hip thrust','Piernas','bench'],['Zancadas con mancuernas','Piernas','dumbbell'],['Step up','Piernas','bench'],['Elevación de gemelos','Piernas','machine'],['Abducción de cadera en máquina','Piernas','machine'],['Aducción de cadera en máquina','Piernas','machine'],['Puente de glúteos','Piernas','floor'],
  ['Press militar con barra','Hombros','barbell'],['Press militar con mancuernas','Hombros','dumbbell'],['Elevaciones laterales','Hombros','dumbbell'],['Elevaciones frontales','Hombros','dumbbell'],['Pájaros con mancuernas','Hombros','dumbbell'],['Face pull','Hombros','cable'],['Press de hombros en máquina','Hombros','machine'],['Encogimientos de trapecio','Hombros','dumbbell'],
  ['Curl de bíceps con barra','Brazos','barbell'],['Curl de bíceps con mancuernas','Brazos','dumbbell'],['Curl martillo','Brazos','dumbbell'],['Curl predicador','Brazos','bench'],['Curl en polea','Brazos','cable'],['Extensión de tríceps en polea','Brazos','cable'],['Press francés','Brazos','barbell'],['Patada de tríceps','Brazos','dumbbell'],['Fondos en banco','Brazos','bench'],['Extensión de tríceps sobre cabeza','Brazos','dumbbell'],
  ['Plancha','Core','floor'],['Plancha lateral','Core','floor'],['Crunch abdominal','Core','floor'],['Elevación de piernas','Core','floor'],['Elevación de rodillas colgado','Core','bar'],['Rueda abdominal','Core','floor'],['Giros rusos','Core','floor'],['Crunch en polea','Core','cable'],
  ['Cinta de correr','Cardio','cardio'],['Bicicleta fija','Cardio','cardio'],['Elíptica','Cardio','cardio'],['Remo ergómetro','Cardio','cardio'],['Soga para saltar','Cardio','cardio'],['Burpees','Cardio','floor']
].map(([name,category,art],index)=>({id:`ex-${index+1}`,name,category,art}));

const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const weekday = (new Date().getDay()+6)%7;
let selectedDay = weekday;
let routines = loadRoutines();
let draft = null;
let editingId = null;
let catalogCategory = 'Todos';
let deleteId = null;
let toastTimer;

function loadRoutines(){
  try { const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); return Array.isArray(data)?data.filter(validRoutine):[]; }
  catch { return []; }
}
function validRoutine(r){return r&&typeof r==='object'&&typeof r.id==='string'&&typeof r.name==='string'&&Number.isInteger(r.day)&&r.day>=0&&r.day<7&&Array.isArray(r.exercises);}
function saveRoutines(){
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(routines)); return true; }
  catch { showToast('No se pudo guardar. Revisá el espacio del navegador.'); return false; }
}
function showToast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3500);}
function artSvg(exercise){
  const palette={Pecho:['#e9f1df','#7aa461'],Espalda:['#e3eee9','#57917b'],Piernas:['#eff0e0','#9a9b61'],Hombros:['#e8ebf1','#778da9'],Brazos:['#f0e9e2','#b48c69'],Core:['#e9e9ef','#8b86aa'],Cardio:['#e7eff0','#6d9e9c']};
  const [,accent]=palette[exercise.category]||palette.Pecho;
  const bg='#fff';
  const equipment={bench:'<path d="M14 53h52M23 43h35M28 43v12M54 43v12"/>',machine:'<path d="M14 57V13h10M66 57V13H56M14 17h12M54 17h12M19 43h13M50 43h13"/>',cable:'<path d="M15 59V12h14M65 59V12H51M19 17h10M51 17h10M20 17v23M60 17v23"/>',floor:'<path d="M9 59h62"/>',bars:'<path d="M16 59V33h18M64 59V33H46"/>',bar:'<path d="M12 15h56M18 15v7M62 15v7"/>',barbell:'<path d="M10 23h60M14 17v12M19 18v10M61 18v10M66 17v12"/>',dumbbell:'<path d="M12 27h18M12 21v12M18 22v10M62 27h8M62 21v12M68 22v10"/>',cardio:'<path d="M12 59h58M24 53l10-17h20l10 17M27 30h27M33 30l-5-11h23"/>'}[exercise.art]||'';
  const person=exercise.art==='floor'?'<circle cx="35" cy="41" r="5"/><path d="M40 43l15 4 10-6M49 46l-6 11M55 47l11 10"/>':exercise.art==='bench'?'<circle cx="29" cy="34" r="5"/><path d="M34 35l19 4M43 37l-3-12M48 38l8-12M52 39l8 13"/>':'<circle cx="40" cy="25" r="5"/><path d="M40 30v17M40 34l-12-9M40 34l12-9M40 47l-10 13M40 47l10 13"/>';
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 70"><rect width="80" height="70" rx="12" fill="${bg}"/><circle cx="67" cy="11" r="13" fill="${accent}" opacity=".13"/><g fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${equipment}</g><g fill="none" stroke="#294137" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${person}</g></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
const customArtIds = new Set(['ex-61','ex-62','ex-63','ex-65']);
function exerciseImage(exercise){return customArtIds.has(exercise.id)?artSvg(exercise):`./assets/exercises/${exercise.id}.png`;}
function exerciseById(exerciseId){return EXERCISES.find(e=>e.id===exerciseId);}
function exerciseForItem(item){
  const listed=exerciseById(item.exerciseId);
  if(listed)return listed;
  if(typeof item.customName==='string')return {name:item.customName.trim()||'Ejercicio personalizado',category:'Personalizado',custom:true};
  return null;
}
function validExerciseItem(item){return item&&(exerciseById(item.exerciseId)||typeof item.customName==='string'&&item.customName.trim());}
function customExerciseNames(){
  const names=new Map();
  for(const routine of [...routines,...(draft?[draft]:[])])for(const item of routine.exercises){
    if(exerciseById(item.exerciseId))continue;
    const name=typeof item.customName==='string'?item.customName.trim():'';
    if(name)names.set(name.toLocaleLowerCase('es'),name);
  }
  return [...names.values()].sort((a,b)=>a.localeCompare(b,'es'));
}
function addCustomExercise(name){
  draft.exercises.push({exerciseId:null,customName:name.trim().slice(0,60),weight:'',reps:'',note:''});
  renderEditor();
  $('#exercise-dialog').close();
}
function renderDays(){
  const count=d=>routines.filter(r=>r.day===d).length;
  $('#day-nav').innerHTML=DAYS.map((day,i)=>`<button class="day-link ${selectedDay===i?'active':''}" data-day="${i}" type="button" aria-current="${selectedDay===i?'page':'false'}"><span>${day}</span><span class="day-count">${count(i)||''}</span></button>`).join('');
  $('#mobile-days').innerHTML=DAYS.map((day,i)=>`<button class="mobile-day ${selectedDay===i?'active':''}" data-day="${i}" type="button" aria-current="${selectedDay===i?'page':'false'}">${day}</button>`).join('');
}
function renderExerciseRow(item){
  const ex=exerciseForItem(item);
  if(!ex)return '';
  return `<div class="exercise-row ${ex.custom?'custom-row':''}">${ex.custom?'':`<img class="exercise-art" src="${exerciseImage(ex)}" alt="Ilustración de ${escapeHtml(ex.name)}">`}<div class="exercise-info"><p class="exercise-name">${escapeHtml(ex.name)}</p>${item.note?`<p class="exercise-note">${escapeHtml(item.note)}</p>`:''}</div><div class="exercise-stats"><span class="stat"><strong>${escapeHtml(item.weight||'—')}</strong> ${item.weight?'kg':'peso'}</span><span class="stat"><strong>${escapeHtml(item.reps||'—')}</strong> reps</span></div></div>`;
}
function renderRoutines(){
  const list=routines.filter(r=>r.day===selectedDay);
  $('#day-heading').textContent=DAYS[selectedDay];
  $('#routine-count').textContent=`${list.length} ${list.length===1?'rutina':'rutinas'}`;
  $('#page-title').textContent=list.length?`${DAYS[selectedDay]} en movimiento.`:'Tu semana, a tu ritmo.';
  $('#page-subtitle').textContent=list.length?'Todo lo que necesitás para entrenar, en un solo lugar.':'Organizá lo que te toca hacer y tené todo a mano cuando entrenás.';
  $('#routines').innerHTML=list.length?list.map((routine,index)=>`<article class="routine-card"><div class="routine-head"><div><p class="routine-index">RUTINA ${String(index+1).padStart(2,'0')}</p><h3>${escapeHtml(routine.name)}</h3><p class="routine-meta">${routine.exercises.length} ${routine.exercises.length===1?'ejercicio':'ejercicios'}</p></div><div class="routine-actions"><button class="small-button" data-edit="${escapeHtml(routine.id)}" type="button">Editar</button><button class="small-button delete" data-delete="${escapeHtml(routine.id)}" type="button">Eliminar</button></div></div>${routine.exercises.length?`<div class="exercise-list">${routine.exercises.map(renderExerciseRow).join('')}</div>`:''}</article>`).join(''):`<div class="empty-state"><div class="empty-icon" aria-hidden="true">↗</div><h3>Todavía no hay rutinas para ${DAYS[selectedDay].toLowerCase()}</h3><p>Creá la primera y armá tu entrenamiento a tu manera.</p><button class="primary-button" type="button" data-new>＋ Crear rutina</button></div>`;
  renderDays();
}
function openRoutine(routine=null){
  editingId=routine?.id||null;
  draft=routine?structuredClone(routine):{id:id(),name:'',day:selectedDay,exercises:[]};
  $('#routine-dialog-title').textContent=routine?'Editar rutina':'Nueva rutina';
  $('#routine-name').value=draft.name;
  $('#routine-day').value=String(draft.day);
  $('#form-error').hidden=true;
  renderEditor();
  $('#routine-dialog').showModal();
  $('#routine-name').focus();
}
function renderEditor(){
  $('#editor-exercises').innerHTML=draft.exercises.length?draft.exercises.map((item,index)=>{
    const ex=exerciseForItem(item);if(!ex)return '';
    return `<div class="editor-card" data-index="${index}"><div class="editor-card-top">${ex.custom?'':`<img class="exercise-art" src="${exerciseImage(ex)}" alt="">`}<div class="editor-card-title">${escapeHtml(ex.name)}<small>${escapeHtml(ex.category)}</small></div><button class="icon-button remove-exercise" data-remove="${index}" type="button" aria-label="Quitar ${escapeHtml(ex.name)}">×</button></div>${ex.custom?`<label class="custom-name-field">Nombre del ejercicio<input data-field="customName" maxlength="60" value="${escapeHtml(item.customName)}" required></label>`:''}<div class="editor-fields"><label>Peso (kg)<input data-field="weight" type="number" inputmode="decimal" min="0" max="9999" step="0.5" placeholder="Ej. 40" value="${escapeHtml(item.weight)}"></label><label>Repeticiones<input data-field="reps" type="number" inputmode="numeric" min="0" max="9999" step="1" placeholder="Ej. 12" value="${escapeHtml(item.reps)}"></label><label>Nota opcional<input data-field="note" maxlength="180" placeholder="Ej. 3 series, agarre cerrado..." value="${escapeHtml(item.note)}"></label></div></div>`;
  }).join(''):'<div class="editor-empty">Todavía no agregaste ejercicios a esta rutina.</div>';
}
function renderCatalog(){
  const term=$('#exercise-search').value.trim().toLocaleLowerCase('es');
  $('#category-filters').innerHTML=CATEGORIES.map(cat=>`<button class="filter-chip ${catalogCategory===cat?'active':''}" data-category="${cat}" type="button">${cat}</button>`).join('');
  const matches=EXERCISES.filter(ex=>(catalogCategory==='Todos'||ex.category===catalogCategory)&&`${ex.name} ${ex.category}`.toLocaleLowerCase('es').includes(term));
  const customMatches=(catalogCategory==='Todos'||catalogCategory==='Personalizados')?customExerciseNames().filter(name=>name.toLocaleLowerCase('es').includes(term)):[];
  const entries=[
    ...customMatches.map(name=>`<button class="catalog-item custom-item" type="button" data-custom-name="${escapeHtml(name)}"><span class="custom-catalog-icon" aria-hidden="true">＋</span><span><span class="catalog-item-name">${escapeHtml(name)}</span><span class="catalog-item-cat">Personalizado · sin foto</span></span></button>`),
    ...matches.map(ex=>`<button class="catalog-item" type="button" data-exercise="${ex.id}"><img class="exercise-art" src="${exerciseImage(ex)}" alt=""><span><span class="catalog-item-name">${escapeHtml(ex.name)}</span><span class="catalog-item-cat">${escapeHtml(ex.category)}</span></span></button>`),
  ];
  $('#catalog-list').innerHTML=entries.length?entries.join(''):'<p class="catalog-empty">No encontramos ejercicios con esa búsqueda. Podés agregarlo desde “Otro ejercicio”.</p>';
}
function closeRoutine(){$('#routine-dialog').close();draft=null;editingId=null;}
function exportData(){
  const blob=new Blob([JSON.stringify({app:'mi-rutina',version:1,exportedAt:new Date().toISOString(),routines},null,2)],{type:'application/json'});
  const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`mi-rutina-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);showToast('Copia descargada.');
}
async function importData(file){
  if(!file)return;
  try{
    if(file.size>2_000_000)throw Error('El archivo es demasiado grande.');
    const data=JSON.parse(await file.text());
    if(data.app!=='mi-rutina'||data.version!==1||!Array.isArray(data.routines)||!data.routines.every(validRoutine))throw Error('El archivo no es una copia válida de Mi Rutina.');
    const imported=data.routines.map(r=>({id:r.id,name:r.name.slice(0,60),day:r.day,exercises:r.exercises.filter(validExerciseItem).map(item=>({exerciseId:exerciseById(item.exerciseId)?item.exerciseId:null,...(exerciseById(item.exerciseId)?{}:{customName:item.customName.trim().slice(0,60)}),weight:String(item.weight??'').slice(0,20),reps:String(item.reps??'').slice(0,20),note:String(item.note??'').slice(0,180)}))}));
    if(!confirm(`¿Reemplazar tus ${routines.length} rutinas actuales por las ${imported.length} de esta copia?`))return;
    const previous=routines;routines=imported;if(!saveRoutines()){routines=previous;return;}renderRoutines();showToast('Copia importada correctamente.');
  }catch(error){showToast(error.message||'No se pudo importar el archivo.');}
  finally{$('#import-file').value='';}
}

$('#routine-day').innerHTML=DAYS.map((day,i)=>`<option value="${i}">${day}</option>`).join('');
renderRoutines();
document.addEventListener('click',event=>{
  const day=event.target.closest('[data-day]');if(day){selectedDay=Number(day.dataset.day);renderRoutines();return;}
  if(event.target.closest('#new-routine-btn,[data-new]')){openRoutine();return;}
  const edit=event.target.closest('[data-edit]');if(edit){const routine=routines.find(r=>r.id===edit.dataset.edit);if(routine)openRoutine(routine);return;}
  const del=event.target.closest('[data-delete]');if(del){deleteId=del.dataset.delete;const routine=routines.find(r=>r.id===deleteId);$('#confirm-message').textContent=`¿Querés eliminar “${routine?.name||'esta rutina'}”? Esta acción no se puede deshacer.`;$('#confirm-dialog').showModal();return;}
  if(event.target.closest('.close-dialog')){closeRoutine();return;}
  if(event.target.closest('#add-exercise-btn')){catalogCategory='Todos';$('#exercise-search').value='';$('#custom-exercise-form').hidden=true;$('#other-exercise-btn').setAttribute('aria-expanded','false');$('#custom-exercise-name').value='';renderCatalog();$('#exercise-dialog').showModal();$('#exercise-search').focus();return;}
  if(event.target.closest('.close-exercise-dialog')){$('#exercise-dialog').close();return;}
  if(event.target.closest('#other-exercise-btn')){const form=$('#custom-exercise-form');form.hidden=!form.hidden;$('#other-exercise-btn').setAttribute('aria-expanded',String(!form.hidden));if(!form.hidden){$('#custom-exercise-name').value=$('#exercise-search').value.trim().slice(0,60);$('#custom-exercise-name').focus();}return;}
  const category=event.target.closest('[data-category]');if(category){catalogCategory=category.dataset.category;renderCatalog();return;}
  const custom=event.target.closest('[data-custom-name]');if(custom){addCustomExercise(custom.dataset.customName);return;}
  const exercise=event.target.closest('[data-exercise]');if(exercise){draft.exercises.push({exerciseId:exercise.dataset.exercise,weight:'',reps:'',note:''});renderEditor();$('#exercise-dialog').close();return;}
  const remove=event.target.closest('[data-remove]');if(remove){draft.exercises.splice(Number(remove.dataset.remove),1);renderEditor();return;}
});
$('#editor-exercises').addEventListener('input',event=>{const input=event.target.closest('[data-field]');if(!input)return;const card=input.closest('[data-index]');const index=Number(card.dataset.index);draft.exercises[index][input.dataset.field]=input.value;if(input.dataset.field==='customName')card.querySelector('.editor-card-title').firstChild.textContent=input.value.trim()||'Ejercicio personalizado';});
$('#exercise-search').addEventListener('input',renderCatalog);
$('#custom-exercise-form').addEventListener('submit',event=>{event.preventDefault();const name=$('#custom-exercise-name').value.trim();if(!name){showToast('Escribí un nombre para el ejercicio.');$('#custom-exercise-name').focus();return;}addCustomExercise(name);});
$('#routine-form').addEventListener('submit',event=>{
  event.preventDefault();const name=$('#routine-name').value.trim();
  if(!name){$('#form-error').textContent='Poné un nombre para la rutina.';$('#form-error').hidden=false;$('#routine-name').focus();return;}
  const invalidCustom=draft.exercises.findIndex(item=>typeof item.customName==='string'&&!item.customName.trim());
  if(invalidCustom>=0){$('#form-error').textContent='Poné un nombre para el ejercicio personalizado.';$('#form-error').hidden=false;$('#editor-exercises').querySelector(`[data-index="${invalidCustom}"] [data-field="customName"]`).focus();return;}
  draft.exercises.forEach(item=>{if(typeof item.customName==='string')item.customName=item.customName.trim();});
  draft.name=name;draft.day=Number($('#routine-day').value);
  if(editingId){const index=routines.findIndex(r=>r.id===editingId);if(index>=0)routines[index]=draft;}else routines.push(draft);
  if(!saveRoutines()){routines=loadRoutines();return;}
  selectedDay=draft.day;closeRoutine();renderRoutines();showToast('Rutina guardada.');
});
$('#routine-dialog').addEventListener('close',()=>{draft=null;editingId=null;});
$('#export-btn').addEventListener('click',exportData);
$('#import-btn').addEventListener('click',()=>$('#import-file').click());
document.querySelector('[data-export]').addEventListener('click',exportData);
document.querySelector('[data-import]').addEventListener('click',()=>$('#import-file').click());
$('#import-file').addEventListener('change',event=>importData(event.target.files[0]));
$('#cancel-delete').addEventListener('click',()=>$('#confirm-dialog').close());
$('#cancel-delete-x').addEventListener('click',()=>$('#confirm-dialog').close());
$('#confirm-delete').addEventListener('click',()=>{routines=routines.filter(r=>r.id!==deleteId);if(saveRoutines()){renderRoutines();showToast('Rutina eliminada.');}else routines=loadRoutines();$('#confirm-dialog').close();deleteId=null;});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
