/* app.js
   Calculadora de Distribuciones — SPA
   Autor: Generado para Luis David Rivera Villatoro
*/

/* ------------------ Utilidades matemáticas ------------------ */
function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}
function nPr(n, r) {
  if (r > n) return 0;
  return factorial(n) / factorial(n - r);
}
function nCr(n, r) {
  if (r > n) return 0;
  return factorial(n) / (factorial(r) * factorial(n - r));
}
function round(x, d=6){ return Math.round(x * Math.pow(10,d))/Math.pow(10,d); }

/* Poisson and binomial helpers */
function binomPMF(n,p,k){
  return nCr(n,k) * Math.pow(p,k) * Math.pow(1-p, n-k);
}
function binomCDF(n,p,k){
  let s = 0;
  for(let i=0;i<=k;i++) s += binomPMF(n,p,i);
  return s;
}

/* Negative binomial: P(X = k) where k = number of failures before r-th success */
function negBinPMF(r,p,k){
  // k >= 0
  return nCr(k + r - 1, k) * Math.pow(1-p, k) * Math.pow(p, r);
}

/* Poisson */
function poissonPMF(lambda,k){
  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
}
function poissonCDF(lambda,k){
  let s = 0;
  for(let i=0;i<=k;i++) s += poissonPMF(lambda, i);
  return s;
}

/* Exponencial */
function expCDF(lambda, x){
  if (x < 0) return 0;
  return 1 - Math.exp(-lambda * x);
}
function expPDF(lambda, x){
  return (x < 0) ? 0 : lambda * Math.exp(-lambda * x);
}

/* Normal distribution: use erf to compute CDF */
function erf(x) {
  // Approximation of erf (Abramowitz and Stegun 7.1.26)
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  const sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);
  const t = 1/(1 + p*x);
  const y = 1 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);
  return sign * y;
}
function normalCDF(x, mu=0, sigma=1){
  return 0.5 * (1 + erf((x - mu)/(Math.sqrt(2)*sigma)));
}
function normalPDF(x, mu=0, sigma=1){
  return (1/(sigma*Math.sqrt(2*Math.PI))) * Math.exp(-0.5*Math.pow((x-mu)/sigma,2));
}

/* ------------------ UI Handling: pages (SPA) ------------------ */
document.querySelectorAll('.sidebar button[data-target]').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    const target = btn.getAttribute('data-target');
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const el = document.getElementById(target);
    if (el) el.classList.remove('hidden');
    window.scrollTo({top:0, behavior:'smooth'});
  });
});

/* ------------------ Conteo events ------------------ */
document.getElementById('btn_perm').addEventListener('click', ()=>{
  const n = parseInt(document.getElementById('perm_n').value);
  const res = factorial(n);
  document.getElementById('perm_result').innerHTML = `P(${n}) = ${res}`;
});

document.getElementById('btn_npr').addEventListener('click', ()=>{
  const n = parseInt(document.getElementById('npr_n').value);
  const r = parseInt(document.getElementById('npr_r').value);
  const res = nPr(n,r);
  document.getElementById('npr_result').innerHTML = `P(${n},${r}) = ${res}`;
});

document.getElementById('btn_ncr').addEventListener('click', ()=>{
  const n = parseInt(document.getElementById('ncr_n').value);
  const r = parseInt(document.getElementById('ncr_r').value);
  const res = nCr(n,r);
  document.getElementById('ncr_result').innerHTML = `C(${n},${r}) = ${res}`;
});

/* ------------------ Probabilidad básica ------------------ */
document.getElementById('btn_pb').addEventListener('click', ()=>{
  const fav = parseFloat(document.getElementById('pb_fav').value);
  const pos = parseFloat(document.getElementById('pb_pos').value);
  if(pos <= 0){ document.getElementById('pb_result').innerText = 'Casos posibles debe ser > 0'; return; }
  const p = fav / pos;
  document.getElementById('pb_result').innerHTML = `P = ${round(p,6)} (${p})`;
});

document.getElementById('btn_comp').addEventListener('click', ()=>{
  const p = parseFloat(document.getElementById('comp_p').value);
  const c = 1 - p;
  document.getElementById('comp_result').innerText = `P(¬A) = ${round(c,6)}`;
});

document.getElementById('btn_ind').addEventListener('click', ()=>{
  const pa = parseFloat(document.getElementById('ind_pa').value);
  const pb = parseFloat(document.getElementById('ind_pb').value);
  const pab = parseFloat(document.getElementById('ind_pab').value);
  const expected = pa * pb;
  const independent = Math.abs(expected - pab) < 1e-8;
  document.getElementById('ind_result').innerHTML =
    `P(A)P(B) = ${round(expected,8)}. P(A∩B) = ${round(pab,8)} → Eventos ${(independent) ? '<strong>independientes</strong>' : '<strong>dependientes</strong>'}.`;
});

/* ------------------ Probabilidad condicional (directa & tabla) ------------------ */
document.getElementById('btn_pc').addEventListener('click', ()=>{
  const pab = parseFloat(document.getElementById('pc_pab').value);
  const pb = parseFloat(document.getElementById('pc_pb').value);
  if (pb === 0){ document.getElementById('pc_result').innerText = 'P(B) no puede ser 0'; return; }
  const res = pab / pb;
  document.getElementById('pc_result').innerHTML = `P(A|B) = ${round(res,6)}`;
});

document.getElementById('btn_tab').addEventListener('click', ()=>{
  const ab = Number(document.getElementById('tab_ab').value) || 0;
  const anb = Number(document.getElementById('tab_anb').value) || 0;
  const nab = Number(document.getElementById('tab_nab').value) || 0;
  const nanb = Number(document.getElementById('tab_nanb').value) || 0;
  const total = ab + anb + nab + nanb;
  if(total === 0){ document.getElementById('tab_result').innerText='Ingrese conteos válidos'; return; }
  const pA = (ab + anb)/total;
  const pB = (ab + nab)/total;
  const pAandB = ab/total;
  const pAgivenB = pAandB / pB;
  const html = `
    Total=${total}<br>
    P(A)=${round(pA,6)}, P(B)=${round(pB,6)}<br>
    P(A∩B)=${round(pAandB,6)}<br>
    P(A|B)=${round(pAgivenB,6)}
  `;
  document.getElementById('tab_result').innerHTML = html;
});

/* ------------------ Bayes ------------------ */
document.getElementById('btn_bayes').addEventListener('click', ()=>{
  const pa = parseFloat(document.getElementById('bayes_pa').value);
  const pbgivena = parseFloat(document.getElementById('bayes_ba').value);
  const pbgivennot = parseFloat(document.getElementById('bayes_bna').value);
  const pb = pbgivena * pa + pbgivennot * (1 - pa);
  if (pb === 0){ document.getElementById('bayes_result').innerText='Denominador P(B)=0 inválido'; return; }
  const posterior = (pbgivena * pa) / pb;
  document.getElementById('bayes_result').innerHTML = `
    P(B) = ${round(pb,8)}<br>
    P(A|B) = ${round(posterior,8)}<br>
    <div class="mt-2 text-sm text-gray-600">Interpretación: la probabilidad posterior de A dado B.</div>
  `;
});

/* ------------------ BINOMIAL ------------------ */
let binChart = null;
document.getElementById('btn_bin_pmf').addEventListener('click', ()=>{
  const n = parseInt(document.getElementById('bin_n').value);
  const p = parseFloat(document.getElementById('bin_p').value);
  const k = parseInt(document.getElementById('bin_k').value);
  const v = binomPMF(n,p,k);
  document.getElementById('bin_result').innerHTML = `P(X=${k}) = ${round(v,8)}`;
});
document.getElementById('btn_bin_cdf').addEventListener('click', ()=>{
  const n = parseInt(document.getElementById('bin_n').value);
  const p = parseFloat(document.getElementById('bin_p').value);
  const k = parseInt(document.getElementById('bin_k').value);
  const v = binomCDF(n,p,k);
  document.getElementById('bin_result').innerHTML = `P(X ≤ ${k}) = ${round(v,8)}`;
});
document.getElementById('btn_bin_tail').addEventListener('click', ()=>{
  const n = parseInt(document.getElementById('bin_n').value);
  const p = parseFloat(document.getElementById('bin_p').value);
  const k = parseInt(document.getElementById('bin_k').value);
  const cdf = binomCDF(n,p,k-1);
  const v = 1 - cdf;
  document.getElementById('bin_result').innerHTML = `P(X ≥ ${k}) = ${round(v,8)}`;
});
document.getElementById('btn_bin_plot').addEventListener('click', ()=>{
  const n = parseInt(document.getElementById('bin_n').value);
  const p = parseFloat(document.getElementById('bin_p').value);
  const labels = [];
  const data = [];
  for(let k=0;k<=n;k++){
    labels.push(k.toString());
    data.push(round(binomPMF(n,p,k),8));
  }
  if(binChart) binChart.destroy();
  const ctx = document.getElementById('bin_chart').getContext('2d');
  binChart = new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[{ label: `Binomial(n=${n}, p=${p})`, data }]},
    options:{ responsive:true, plugins:{ legend:{display:true} } }
  });
});

/* ------------------ BINOMIAL NEGATIVA ------------------ */
let nbChart = null;
document.getElementById('btn_nb_pmf').addEventListener('click', ()=>{
  const r = parseInt(document.getElementById('nb_r').value);
  const p = parseFloat(document.getElementById('nb_p').value);
  const k = parseInt(document.getElementById('nb_k').value);
  const v = negBinPMF(r,p,k);
  document.getElementById('nb_result').innerHTML = `P(X=${k}) = ${round(v,8)}`;
});
document.getElementById('btn_nb_plot').addEventListener('click', ()=>{
  const r = parseInt(document.getElementById('nb_r').value);
  const p = parseFloat(document.getElementById('nb_p').value);
  const labels = [];
  const data = [];
  const maxK = Math.max(10, r+10);
  for(let k=0;k<=maxK;k++){
    labels.push(k.toString());
    data.push(round(negBinPMF(r,p,k),8));
  }
  if(nbChart) nbChart.destroy();
  const ctx = document.getElementById('nb_chart').getContext('2d');
  nbChart = new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[{ label:`NegBin(r=${r}, p=${p})`, data }]},
    options:{ responsive:true, plugins:{ legend:{display:true} } }
  });
});

/* ------------------ POISSON ------------------ */
let poiChart = null;
document.getElementById('btn_poi_pmf').addEventListener('click', ()=>{
  const lambda = parseFloat(document.getElementById('poi_lambda').value);
  const k = parseInt(document.getElementById('poi_k').value);
  const v = poissonPMF(lambda,k);
  document.getElementById('poi_result').innerHTML = `P(X=${k}) = ${round(v,8)}`;
});
document.getElementById('btn_poi_cdf').addEventListener('click', ()=>{
  const lambda = parseFloat(document.getElementById('poi_lambda').value);
  const k = parseInt(document.getElementById('poi_k').value);
  const v = poissonCDF(lambda,k);
  document.getElementById('poi_result').innerHTML = `P(X ≤ ${k}) = ${round(v,8)}`;
});
document.getElementById('btn_poi_plot').addEventListener('click', ()=>{
  const lambda = parseFloat(document.getElementById('poi_lambda').value);
  const maxK = Math.max(10, Math.ceil(lambda + 4*Math.sqrt(lambda)));
  const labels=[]; const data=[];
  for(let k=0;k<=maxK;k++){ labels.push(k.toString()); data.push(round(poissonPMF(lambda,k),8)); }
  if(poiChart) poiChart.destroy();
  const ctx = document.getElementById('poi_chart').getContext('2d');
  poiChart = new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[{ label:`Poisson(λ=${lambda})`, data }]},
    options:{ responsive:true }
  });
});

/* ------------------ EXPONENCIAL ------------------ */
let expChart = null;
document.getElementById('btn_exp_lt').addEventListener('click', ()=>{
  const lambda = parseFloat(document.getElementById('exp_lambda').value);
  const x = parseFloat(document.getElementById('exp_x').value);
  const v = expCDF(lambda,x);
  document.getElementById('exp_result').innerHTML = `P(X < ${x}) = ${round(v,8)}`;
});
document.getElementById('btn_exp_gt').addEventListener('click', ()=>{
  const lambda = parseFloat(document.getElementById('exp_lambda').value);
  const x = parseFloat(document.getElementById('exp_x').value);
  const v = 1 - expCDF(lambda,x);
  document.getElementById('exp_result').innerHTML = `P(X > ${x}) = ${round(v,8)}`;
});
document.getElementById('btn_exp_between').addEventListener('click', ()=>{
  const lambda = parseFloat(document.getElementById('exp_lambda').value);
  const a = parseFloat(document.getElementById('exp_a').value);
  const b = parseFloat(document.getElementById('exp_b').value);
  if(b < a){ document.getElementById('exp_result').innerText = 'b debe ser >= a'; return; }
  const v = expCDF(lambda,b) - expCDF(lambda,a);
  document.getElementById('exp_result').innerHTML = `P(${a} < X < ${b}) = ${round(v,8)}`;
});
document.getElementById('exp_lambda').addEventListener('input', plotExp);
document.getElementById('btn_exp_plot')?.addEventListener('click', plotExp);
function plotExp(){
  const lambda = parseFloat(document.getElementById('exp_lambda').value);
  const labels=[]; const data=[];
  const maxX = Math.max(5, 6/Math.max(0.01, lambda));
  const steps = 50;
  for(let i=0;i<=steps;i++){
    const x = (i/steps)*maxX;
    labels.push(round(x,3));
    data.push(round(expPDF(lambda, x),6));
  }
  if(expChart) expChart.destroy();
  const ctx = document.getElementById('exp_chart').getContext('2d');
  expChart = new Chart(ctx, {
    type:'line',
    data:{ labels, datasets:[{ label:`Exponencial(λ=${lambda}) (PDF)`, data, fill:false, tension:0.2 }]},
    options:{ responsive:true, plugins:{ legend:{display:true} } }
  });
}

/* ------------------ NORMAL ------------------ */
let normChart = null;
document.getElementById('btn_norm_cdf').addEventListener('click', ()=>{
  const mu = parseFloat(document.getElementById('norm_mu').value);
  const sigma = parseFloat(document.getElementById('norm_sigma').value);
  const x = parseFloat(document.getElementById('norm_x').value);
  const v = normalCDF(x, mu, sigma);
  document.getElementById('norm_result').innerHTML = `P(X < ${x}) = ${round(v,8)}`;
});
document.getElementById('btn_norm_tail').addEventListener('click', ()=>{
  const mu = parseFloat(document.getElementById('norm_mu').value);
  const sigma = parseFloat(document.getElementById('norm_sigma').value);
  const x = parseFloat(document.getElementById('norm_x').value);
  const v = 1 - normalCDF(x, mu, sigma);
  document.getElementById('norm_result').innerHTML = `P(X > ${x}) = ${round(v,8)}`;
});
document.getElementById('btn_norm_between').addEventListener('click', ()=>{
  const mu = parseFloat(document.getElementById('norm_mu').value);
  const sigma = parseFloat(document.getElementById('norm_sigma').value);
  const a = parseFloat(document.getElementById('norm_a').value);
  const b = parseFloat(document.getElementById('norm_b').value);
  const v = normalCDF(b,mu,sigma) - normalCDF(a,mu,sigma);
  document.getElementById('norm_result').innerHTML = `P(${a} < X < ${b}) = ${round(v,8)}`;
});
document.getElementById('btn_norm_plot').addEventListener('click', ()=>{
  const mu = parseFloat(document.getElementById('norm_mu').value);
  const sigma = parseFloat(document.getElementById('norm_sigma').value);
  const labels=[]; const data=[];
  const minX = mu - 4*sigma;
  const maxX = mu + 4*sigma;
  const steps = 70;
  for(let i=0;i<=steps;i++){
    const x = minX + (i/steps)*(maxX - minX);
    labels.push(round(x,3));
    data.push(round(normalPDF(x,mu,sigma),8));
  }
  if(normChart) normChart.destroy();
  const ctx = document.getElementById('norm_chart').getContext('2d');
  normChart = new Chart(ctx, {
    type:'line',
    data:{ labels, datasets:[{ label:`Normal(μ=${mu}, σ=${sigma})`, data, fill:true, tension:0.2 }]},
    options:{ responsive:true, plugins:{ legend:{display:true} } }
  });
});

/* Inicializar páginas y formulas MathJax */
window.addEventListener('load', () => {
  // mostrar home por defecto
  document.getElementById('home').classList.remove('hidden');
  if (window.MathJax) window.MathJax.typesetPromise();
});


