
const i18n = {
  en:{
    subtitle:'Online noise remover',
    dropMessage:'Drag & drop or choose file',
    dropFormats:'WAV, MP3, M4A up to 50 MB',
    btnClean:'Clean noise',
    done:'Done.',
    btnDownload:'Download',
    btnNew:'New file'
  },
  ru:{
    subtitle:'Онлайн очистка шума',
    dropMessage:'Перетащите файл сюда или выберите',
    dropFormats:'WAV, MP3, M4A до 50 МБ',
    btnClean:'Очистить шум',
    done:'Готово.',
    btnDownload:'Скачать',
    btnNew:'Новый файл'
  }
};
const lang = navigator.language.startsWith('ru')?'ru':'en';

/* ===== UI refs ===== */
const dz = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const cleanBtn = document.getElementById('cleanBtn');
const progressWrap = document.getElementById('progressWrap');
const progressBar  = document.getElementById('progressBar');
const result = document.getElementById('result');
const downloadBtn = document.getElementById('downloadBtn');
const newBtn = document.getElementById('newBtn');

/* ===== state ===== */
let selectedFile = null;

/* ===== helpers ===== */
function t(key){return i18n[lang][key]||key;}
function setTexts(){
  [...document.querySelectorAll('[data-i18n]')]
  .forEach(el=>el.textContent=t(el.dataset.i18n));
}

/* ===== dropzone ===== */
function handleFiles(list){
  if(!list||!list[0])return;
  const f=list[0];
  if(f.size>50*1024*1024){alert('>50 MB');return;}
  if(!/\.(wav|mp3|m4a)$/i.test(f.name)){alert('bad type');return;}

  selectedFile=f;
  fileInfo.textContent=f.name;
  cleanBtn.disabled=false;
}
dz.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',e=>handleFiles(e.target.files));

['dragenter','dragover'].forEach(ev=>
  dz.addEventListener(ev,e=>{
    e.preventDefault();
    dz.classList.add('hover');
    e.dataTransfer.dropEffect='copy';
  })
);
['dragleave','dragend','drop'].forEach(ev=>
  dz.addEventListener(ev,()=>dz.classList.remove('hover'))
);
dz.addEventListener('drop',e=>{
  e.preventDefault();
  handleFiles(e.dataTransfer.files);
});

/* глобальный preventDefault, чтобы DataTransfer не очищался */
['dragover','drop'].forEach(ev=>
  document.addEventListener(ev,e=>{
    if(e.target!==dz) e.preventDefault();
  })
);

/* ===== clean noise (mock) ===== */
cleanBtn.addEventListener('click',async()=>{
  if(!selectedFile)return;
  cleanBtn.disabled=true;
  progressWrap.hidden=false;
  let prog=0;
  const tick=setInterval(async()=>{
    const res=await fetch(`/api/clean?prog=${prog}`);
    const json=await res.json();
    prog=json.progress;
    progressBar.style.width=Math.round(prog*100)+'%';
    if(prog===1){
      clearInterval(tick);
      finish();
    }
  },600);
});
function finish(){
  progressWrap.hidden=true;
  result.hidden=false;
}
downloadBtn.addEventListener('click',()=>{
  const ext=selectedFile.name.split('.').pop();
  const base=selectedFile.name.replace(/\.[^/.]+$/,'');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(selectedFile);
  a.download=`${base}.cleaned.${ext}`;
  a.click();
  URL.revokeObjectURL(a.href);
});
newBtn.addEventListener('click',()=>{
  selectedFile=null;
  fileInfo.textContent='';
  cleanBtn.disabled=true;
  result.hidden=true;
});

/* ===== init ===== */
setTexts();

/* ===== PWA SW ===== */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js');
}
