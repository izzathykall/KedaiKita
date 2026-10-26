/* Cloud integration for Kedai Kita. Optional CDN Firebase SDK; local game works without config. */
const FIREBASE_VERSION = '13.0.0';
const GUEST_KEY = 'kedai-kita-v1';
const ACCOUNT_KEY = uid => `kedai-kita-user-${uid}-v1`;
const byId = id => document.getElementById(id);
const trim = value => String(value ?? '').trim();
const configValid = config => !!(config?.apiKey && config?.projectId && config?.appId && /^https:\/\//.test(config?.databaseURL || '') && !Object.values(config).some(v => String(v).includes('PASTE_')));
const clone = data => JSON.parse(JSON.stringify(data));
const BOOT_TIMEOUT_MS = 15000;
const DATA_TIMEOUT_MS = 18000;
import {chooseSave,withTimeout} from './sync-policy.mjs';

const errorMalay = error => {
  const codes = {
    'auth/email-already-in-use': 'E-mel ini sudah didaftarkan. Sila log masuk.',
    'auth/invalid-email': 'Alamat e-mel tidak sah.',
    'auth/invalid-credential': 'E-mel atau kata laluan tidak tepat.',
    'auth/wrong-password': 'Kata laluan tidak tepat.',
    'auth/user-not-found': 'Akaun tidak dijumpai.',
    'auth/weak-password': 'Kata laluan terlalu pendek. Gunakan sekurang-kurangnya 6 aksara.',
    'auth/too-many-requests': 'Terlalu banyak percubaan. Cuba lagi kemudian.',
    'auth/network-request-failed': 'Tiada sambungan rangkaian. Periksa internet.',
    'auth/operation-not-allowed': 'Sistem daftar masuk belum diaktifkan. Hubungi pengendali permainan.',
    'auth/unauthorized-domain': 'Log masuk belum dibenarkan untuk laman ini. Hubungi pengendali permainan.',
    'PERMISSION_DENIED': 'Akses simpanan ditolak. Pastikan Rules telah dipublish di Realtime Database.',
    'permission-denied': 'Akses simpanan ditolak. Pastikan Rules telah dipublish di Realtime Database.',
    'database/permission-denied': 'Akses simpanan ditolak. Pastikan Rules telah dipublish di Realtime Database.',
    'database/permission_denied': 'Akses simpanan ditolak. Pastikan Rules telah dipublish di Realtime Database.',
    'unavailable': 'Simpanan dalam talian tidak dapat dihubungi. Cuba lagi apabila talian pulih.',
    'database/unavailable': 'Pangkalan data tidak dapat dihubungi. Semak sambungan.',
    'database/network-error': 'Masalah rangkaian semasa membaca simpanan.',
    'database/offline': 'Sambungan pangkalan data terputus. Sambung internet dahulu.',
    'KEDAI_TIMEOUT': 'Sambungan mengambil masa terlalu lama. Cuba sambung semula apabila internet stabil.'
  };
  return codes[error?.code] || 'Terdapat masalah dengan akaun atau sambungan. Cuba lagi sebentar.';
};
const errorCode = error => String(error?.code || error?.name || 'UNKNOWN').replace(/[^a-zA-Z0-9/_:-]/g,'').slice(0,80);
const errorDetails = (error,stage) => {
  const details = [errorCode(error),String(stage||'sambungan')];
  const reason=String(error?.message||'').replace(/[\r\n<>]/g,' ').trim();
  if(reason) details.push(reason.slice(0,135));
  return details.join(' · ');
};
const diagnostic = (stage,err) => {try {console.error('[KedaiKita Cloud]', stage,err)}catch{}};

const readLocal = key => {try {return JSON.parse(localStorage.getItem(key)||'null')} catch {return null}};
const writeLocal = (key, state) => {try {localStorage.setItem(key, JSON.stringify(state));return true} catch {return false}};
const isMeaningful = data => !!(data && (data?.progress?.day > 1 || data?.progress?.served > 0 || data?.progress?.wallet > 0 || data?.session || data?.practiceRun?.session));

export function createCloudSync({capture, hydrate, pauseForAccount, report, onDeveloperChanged=()=>{}}) {
  const overlay = byId('accountOverlay');
  const ui = {
    title: byId('accountTitle'), hint: byId('accountHint'), message: byId('accountMessage'),
    form: byId('accountForm'), email: byId('accountEmail'), password: byId('accountPassword'),
    submit: byId('accountSubmit'), login: byId('accountLoginTab'), register: byId('accountRegisterTab'),
    reset: byId('accountReset'), guest: byId('accountGuest'), close: byId('accountClose'),
    logout: byId('accountLogout'), current: byId('accountCurrent'), import: byId('accountImport'),
    fresh: byId('accountFresh'), retry: byId('accountRetry'),
    authFields: byId('accountAuthFields'), choice: byId('accountChoice'),
    overview: byId('accountOverview'), controls: byId('accountControls')
  };
  let api = null, auth = null, db = null, user = null, ready = false;
  let guestMode = false, busy = false, mode = 'login', currentKey = GUEST_KEY;
  let timer = null, queued = null, writing = false, writesPending = null, epoch = 0;
  let syncError = null, configEnabled = false, started = false;
  let activeSessionToken = null, watchSessionStop = null, newCredentialLogin = false;
  let kickedForOtherDevice = false, kickingOut = false;
  let developerSandbox=false, baseStamp=null, localSaveFailed=false;
  const DEV_KEY=uid=>`kedai-kita-dev-sandbox-${uid}-v1`;
  const authorizedDeveloper=uid=>!!uid&&Array.isArray(window.KEDAI_DEVELOPER_UIDS)&&window.KEDAI_DEVELOPER_UIDS.some(x=>typeof x==='string'&&x.trim().length>12&&x.trim()===uid);
  let bootWatchdog = null, bootSettled = false, bootStalled = false;
  const sessionPath = uid => api.ref(db, `activeSessions/${uid}`);
  const browserSessionKey = uid => `kk-active-session-${uid}`;
  const makeSessionToken = () => {
    if(globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    const bytes=new Uint8Array(32);globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  };
  const detachSessionWatch=()=>{if(watchSessionStop){watchSessionStop();watchSessionStop=null}};
  const clearSessionLocal=uid=>{try{sessionStorage.removeItem(browserSessionKey(uid))}catch{}};
  const saveSessionLocal=(uid,token)=>{try{sessionStorage.setItem(browserSessionKey(uid),token)}catch{}};
  const getSessionLocal=uid=>{try{return sessionStorage.getItem(browserSessionKey(uid))}catch{return null}};

  const setStatus = value => {report(value);const el=byId('accountSyncLabel');if(el)el.textContent=value;};
  const message = (value='', isError=false) => {ui.message.textContent=value;ui.message.classList.toggle('error', isError)};
  const show = () => {
    if(overlay.open)overlay.close();
    overlay.showModal();document.body.classList.add('account-locked');
  };
  const hide = () => {if(overlay.open)overlay.close();overlay.classList.remove('account-compact');document.body.classList.remove('account-locked')};
  const showRegion = region => {
    overlay.dataset.region=region;
    ui.authFields.hidden=region!=='auth'; ui.overview.hidden=region!=='overview'; ui.choice.hidden=region!=='choice';
    ui.controls.hidden=region==='loading'; ui.guest.hidden=region==='overview'||region==='choice'||(region==='error'&&!!user);
    ui.close.hidden=region!=='overview'; ui.logout.hidden=region!=='overview'&&region!=='error';
    ui.retry.hidden=region!=='error';
  };
  const showLogin = (hint='Log masuk untuk simpan dan sambung permainan pada peranti lain.') => {
    show();showRegion('auth');ui.title.textContent='Selamat kembali!';ui.hint.textContent=hint;
    ui.guest.hidden=false;message('');setMode('login');
  };
  const showLoading = hint => {show();showRegion('loading');ui.title.textContent='Menyediakan kedai anda';ui.hint.textContent=hint;message('')};
  function showStartupError(step, err) {
    if(bootStalled)return;
    diagnostic(step,err);
    bootStalled=true;bootSettled=true;
    clearTimeout(bootWatchdog);bootWatchdog=null;
    ready=false;syncError=err;
    show();showRegion('error');
    ui.title.textContent='Sambungan akaun terganggu';
    ui.hint.textContent='Permainan tidak akan menimpa progres akaun ketika sambungan bermasalah.';
    message(`${errorMalay(err)} (Butiran: ${errorDetails(err,step)})`,true);
    ui.retry.onclick=()=>window.location.reload();
    ui.retry.textContent='Cuba semula';
    // Guest mode is explicit and uses a separate local save only.
    ui.guest.hidden=false;
    ui.guest.disabled=false;
    ui.guest.textContent='Main sebagai tetamu (offline)';
    ui.guest.onclick=()=>{
      guestMode=true;user=null;ready=true;currentKey=GUEST_KEY;
      hydrate(readLocal(GUEST_KEY));hide();
      setStatus('Disimpan pada peranti · mod tetamu');
    };
    ui.logout.hidden=true;
  }
  const showOverview = () => {
    show();showRegion('overview');ui.title.textContent='Akaun Kedai Kita';ui.hint.textContent='Progres kerjaya disimpan mengikut akaun ini.';
    ui.current.textContent=user?.email||'Akaun pemain';message(syncError?errorMalay(syncError):'Data akaun anda telah dimuatkan.');
    const approved=byId('developerAccessEnabled');
    if(approved)approved.hidden=!developerSandbox;
  };
  const setMode = selected => {
    mode=selected; ui.title.textContent=selected==='register'?'Mulakan cerita kedai anda':'Selamat kembali!'; ui.login.classList.toggle('active',selected==='login');
    ui.register.classList.toggle('active',selected==='register');
    ui.submit.textContent=selected==='register'?'Daftar akaun':'Log masuk';
    ui.password.autocomplete=selected==='register'?'new-password':'current-password';
    ui.reset.hidden=selected==='register';
  };
  const setBusy = flag => {
    busy=flag;for(const e of [ui.submit,ui.login,ui.register,ui.reset,ui.guest,ui.logout,ui.import,ui.fresh,ui.retry])e.disabled=flag;
    ui.submit.textContent=flag?'Sila tunggu…':mode==='register'?'Daftar akaun':'Log masuk';
  };
  const localAccount = uid => readLocal(ACCOUNT_KEY(uid));
  const snapshotRef = uid => api.ref(db,`users/${uid}/games/kedai-kita`);
  // Developer wallet and testing progress use a distinct Firebase branch under
  // the same account-owned game path, never the regular career `state`.
  const developerSnapshotRef = uid => api.ref(db,`users/${uid}/games/kedai-kita/developerSandbox`);
  const legacyDeveloperSnapshotRef = uid => api.ref(db,`users/${uid}/games/developerSandbox`);
  const currentSnapshotRef = uid => snapshotRef(uid);
  const cloudPayload = (value, token) => developerSandbox
    ? {developerSandbox:{version:1,state:value,sessionToken:token,updatedAt:api.serverTimestamp()},sessionToken:token,updatedAt:api.serverTimestamp()}
    : {version:1,state:value,sessionToken:token,updatedAt:api.serverTimestamp()};
  async function sessionReplaced(uid){
    if(kickingOut||!user||user.uid!==uid)return;
    kickingOut=true;kickedForOtherDevice=true;ready=false;queued=null;syncError=null;
    clearTimeout(timer);timer=null;detachSessionWatch();activeSessionToken=null;clearSessionLocal(uid);
    // Keep an unsynced local account snapshot intact for safe recovery
    // if the player logs in again. Never overwrite it during sign-out.
    setStatus('Sesi akaun tamat');
    try{await api.signOut(auth)}catch{}
    showLogin('Akaun ini telah log masuk pada peranti lain.');
    ui.guest.hidden=true;
    message('Sesi pada peranti ini telah ditamatkan. Masukkan e-mel dan kata laluan semula untuk log masuk.',true);
    kickingOut=false;
  }
  async function claimSession(uid,replaceExisting){
    detachSessionWatch();activeSessionToken=null;
    let token;
    if(replaceExisting){
      token=makeSessionToken();
      // A confirmed server write becomes this account's active session.
      // The other device is signed out by its realtime session watcher.
      await withTimeout(api.set(sessionPath(uid),{token,startedAt:api.serverTimestamp()}),DATA_TIMEOUT_MS,'menulis sesi aktif');
      const confirm=await withTimeout(api.get(sessionPath(uid)),DATA_TIMEOUT_MS,'mengesahkan sesi aktif');
      if(confirm.val()?.token!==token){await sessionReplaced(uid);return false}
      saveSessionLocal(uid,token);
    }else{
      token=getSessionLocal(uid);
      if(!token){await sessionReplaced(uid);return false}
      const result=await withTimeout(api.get(sessionPath(uid)),DATA_TIMEOUT_MS,'membaca sesi aktif');
      if(!result.exists()||result.val()?.token!==token){await sessionReplaced(uid);return false}
    }
    activeSessionToken=token;
    watchSessionStop=api.onValue(sessionPath(uid),snapshot=>{
      if(user?.uid===uid && activeSessionToken===token && snapshot.val()?.token!==token){
        sessionReplaced(uid);
      }
    },err=>{if(user?.uid===uid)setStatus('Sesi tidak dapat disemak · semak sambungan')});
    return true;
  }
  async function releaseSession(uid,token){
    if(!token)return;
    try{await withTimeout(api.runTransaction(sessionPath(uid),current=>current?.token===token?null:undefined,{applyLocally:false}),DATA_TIMEOUT_MS,'menutup sesi')}catch{}
  }

  const setIdentity = next => {
    user=next;ready=false;baseStamp=null;localSaveFailed=false;
    developerSandbox=authorizedDeveloper(next?.uid);
    currentKey=next?(developerSandbox?DEV_KEY(next.uid):ACCOUNT_KEY(next.uid)):GUEST_KEY;
    const e=byId('accountBtnText');if(e)e.textContent=developerSandbox?'Dev ✓':next?'Akaun ✓':'Akaun';
    onDeveloperChanged(developerSandbox);
  };
  const stage = state => {
    queued=clone(state);delete queued._cloudPending;
    setStatus('Menyimpan progres…');if(!timer)timer=setTimeout(()=>flush().catch(()=>{}),3000);
  };
  window.addEventListener('online',()=>{if(queued&&!writing&&ready&&user&&activeSessionToken){syncError=null;flush().catch(()=>{})}});
  async function flush() {
    try { return await withTimeout(drainSaves(),DATA_TIMEOUT_MS,'menyimpan progres'); }
    catch(err) {
      if(err?.code==='KEDAI_TIMEOUT')setStatus(localSaveFailed
        ?'Simpanan belum berjaya · jangan tutup permainan'
        :'Menunggu internet · progres disimpan pada peranti');
      throw err;
    }
  }
  async function drainSaves() {
    if(timer){clearTimeout(timer);timer=null}
    if(writing){if(writesPending)await writesPending;return queued?drainSaves():true;}
    if(!ready||!user||!queued||!api||!activeSessionToken)return !queued;
    const uid=user.uid, value=queued, key=currentKey, sessionToken=activeSessionToken, writeEpoch=epoch;
    queued=null;writing=true;
    try {
      if(!activeSessionToken){throw new Error('Sesi akaun tidak aktif')}
      writesPending=api.update(currentSnapshotRef(uid),cloudPayload(value,sessionToken));
      await writesPending;
      if(user?.uid===uid&&epoch===writeEpoch&&activeSessionToken===sessionToken){
        baseStamp=value._clientStamp||null;
        if(queued)queued._cloudBaseStamp=baseStamp;
        const local=readLocal(key);
        if(local){
          local._cloudBaseStamp=baseStamp;
          if(local._clientStamp===value._clientStamp)local._cloudPending=false;
          localSaveFailed=!writeLocal(key,local);
        }
        syncError=null;setStatus(queued?'Menyimpan progres…':'✓ Progres disimpan');
      }
    } catch(err) {
      if(user?.uid===uid&&epoch===writeEpoch&&activeSessionToken===sessionToken){syncError=err;queued=queued||value;setStatus(localSaveFailed?'Simpanan belum berjaya · jangan tutup permainan':'Simpanan belum disegerakkan · progres selamat di peranti');diagnostic('menyimpan progres',err)}
      throw err;
    } finally {
      writing=false;writesPending=null;
      if(queued&&ready&&user&&activeSessionToken&&!syncError)timer=setTimeout(()=>{flush().catch(()=>{})},3000);
    }
    return queued&&ready&&user&&activeSessionToken?drainSaves():!queued;
  }
  async function resetProgress(state) {
    // A reset must never accidentally upload an old debounced snapshot later.
    // Existing in-flight writes complete before the new clean save.
    if(!ready)throw new Error('Simpanan akaun belum sedia. Cuba lagi sebentar.');
    const fresh=clone(state);
    if(user){
      fresh._clientStamp=makeSessionToken();fresh._cloudBaseStamp=baseStamp;
      if(!api||!activeSessionToken)throw new Error('Sesi akaun telah tamat. Log masuk semula.');
      // Never leave the developer reset spinner hanging on an old network write.
      // Do not mutate local game data until the authoritative reset completes.
      if(writesPending){try{await withTimeout(writesPending,DATA_TIMEOUT_MS,'menunggu simpanan terdahulu')}catch(err){if(writing)throw err}}
      if(writing){
        await withTimeout(new Promise(resolve=>{const check=()=>writing?setTimeout(check,40):resolve();check()}),DATA_TIMEOUT_MS,'menyelesaikan simpanan terdahulu');
      }
      if(timer){clearTimeout(timer);timer=null}
      const pendingBefore=queued;queued=null;
      try{
        const uid=user.uid, token=activeSessionToken;
        await withTimeout(api.update(currentSnapshotRef(uid),cloudPayload(fresh,token)),DATA_TIMEOUT_MS,'reset progres akaun');
        if(user?.uid!==uid||activeSessionToken!==token)throw new Error('Sesi akaun telah berubah semasa reset.');
        baseStamp=fresh._clientStamp;
        localSaveFailed=!writeLocal(currentKey,fresh);
        syncError=null;setStatus(developerSandbox?'🧪 Data ujian direset dan disimpan dalam Firebase':'✓ Progres direset dan disimpan');
      }catch(err){queued=pendingBefore;throw err}
    }else{
      if(!writeLocal(currentKey,fresh))throw new Error('Tidak dapat menyimpan reset pada peranti ini.');
      queued=null;syncError=null;setStatus('✓ Progres tetamu direset');
    }
    return true;
  }
  function queueSave(state) {
    // Rendering/login callbacks must not overwrite a save awaiting conflict resolution.
    if(!ready)return;
    const data=clone(state);
    if(user){data._cloudPending=true;data._clientStamp=makeSessionToken();data._cloudBaseStamp=baseStamp}
    localSaveFailed=!writeLocal(currentKey,data);
    if(user&&activeSessionToken)stage(data);
    else if(!user)setStatus(localSaveFailed?'Simpanan peranti gagal · jangan tutup permainan':'Disimpan pada peranti · mod tetamu');
    if(localSaveFailed&&user)setStatus('Simpanan peranti gagal · menunggu simpanan awan');
  }
  async function finishAccount(state) {
    // Hydrate before closing the login overlay so a UI error can be
    // diagnosed separately from database read failures. No remote data
    // is overwritten when rendering a saved game fails.
    try { hydrate(state); }
    catch (error) {
      error.cloudStage='memaparkan progres permainan';
      throw error;
    }
    ready=true;
    localSaveFailed=!writeLocal(currentKey,state||capture());
    setStatus('✓ Progres akaun dimuatkan');
    hide();
  }
  async function loadAccountSave(remote,local,token) {
    baseStamp=remote?._clientStamp||null;
    const choice=chooseSave(local,remote);
    if(choice==='conflict'){
      // Preserve both candidates until the player decides. No automatic upload.
      show();showRegion('choice');ui.title.textContent='Pilih progres untuk disambung';
      const summary=s=>`Hari ${Number(s.progress.day)||1} · RM ${((Number(s.progress.wallet)||0)/100).toFixed(2)}`;
      ui.hint.textContent='Ada dua simpanan berbeza. Pilih dengan teliti; pilihan anda akan digunakan untuk akaun ini.';
      ui.choice.querySelector('.account-choice-label').textContent='Simpanan peranti dan awan tidak sepadan';
      ui.import.textContent='Guna peranti · '+summary(local);
      ui.fresh.textContent='Guna awan · '+summary(remote);
      const choose=async(useLocal)=>{
        if(busy||token!==epoch||!user)return;
        setBusy(true);
        try{
          if(!writeLocal(currentKey+'-conflict-backup',{local,remote,savedAt:Date.now()}))
            throw new Error('Tidak dapat menyimpan salinan pemulihan. Kosongkan ruang peranti dan cuba lagi.');
          await finishAccount(useLocal?local:remote);
          if(useLocal)queueSave(capture());
        }catch(err){message(errorDetails(err,'memilih simpanan'),true)}
        finally{setBusy(false)}
      };
      ui.import.onclick=()=>choose(true);ui.fresh.onclick=()=>choose(false);
      return true;
    }
    if(choice==='empty')return false;
    await finishAccount(choice==='local'?local:remote);
    if(choice==='local')queueSave(capture());
    return true;
  }
  async function onSignedIn(next, token, retryNewSession=false) {
    setIdentity(next);guestMode=false;showLoading('Menyemak sesi dan progres akaun…');
    let loadStep='membuka sesi akaun';
    try {
      const valid=await claimSession(next.uid,newCredentialLogin||retryNewSession);
      newCredentialLogin=false;
      if(!valid||token!==epoch||user?.uid!==next.uid)return;
      loadStep=developerSandbox?'membaca sandbox Developer':'membaca progres permainan';
      const result=await withTimeout(api.get(currentSnapshotRef(next.uid)),DATA_TIMEOUT_MS,'membaca progres');
      if(token!==epoch||user?.uid!==next.uid)return;
      if(developerSandbox){
        let remote=result.exists()?result.val()?.developerSandbox?.state:null;
        if(!remote){try{const oldDev=await withTimeout(api.get(legacyDeveloperSnapshotRef(next.uid)),DATA_TIMEOUT_MS,'migrasi sandbox lama');remote=oldDev.val()?.state||null}catch(err){diagnostic('sandbox lama tidak dapat dibaca',err)}}
        if(token!==epoch||user?.uid!==next.uid)return;
        const local=readLocal(DEV_KEY(next.uid));
        if(!await loadAccountSave(remote,local,token)){await finishAccount(null);queueSave(capture())}
        return;
      }
      const remote=result.exists()?result.val()?.state:null;
      const saved=localAccount(next.uid);
      if(await loadAccountSave(remote,saved,token))return;
      const old=readLocal(GUEST_KEY);
      if(isMeaningful(old)) {
        ui.choice.querySelector('.account-choice-label').textContent='Progres lama ditemui pada peranti ini';
        ui.import.textContent='Import progres lama ke akaun';ui.fresh.textContent='Mula permainan baharu';
        show();showRegion('choice');ui.title.textContent='Pilih simpanan pertama';
        ui.hint.textContent='Ada progres lama pada peranti ini. Pilih untuk pindahkan ke akaun, atau mula baharu.';
        message('Data lama kekal pada peranti sehingga anda pilih untuk mengimportnya.');
        ui.import.onclick=()=>{if(!user||busy)return;finishAccount(old).then(()=>queueSave(capture()))};
        ui.fresh.onclick=()=>{if(!user||busy)return;finishAccount(null).then(()=>queueSave(capture()))};
        return;
      }
      await finishAccount(null);queueSave(capture());
    } catch(err) {
      if(token!==epoch)return;
      newCredentialLogin=false;
      syncError=err;setStatus('Simpanan tidak dapat diakses');show();showRegion('error');
      ui.title.textContent='Tidak dapat muat simpanan';ui.hint.textContent='Progres anda tidak dipadam. Semak ralat di bawah atau cuba sambung semula.';
      loadStep=err?.cloudStage||loadStep;
      diagnostic(loadStep,err);
      message(`${errorMalay(err)} (Butiran: ${errorDetails(err,loadStep)})`,true);
      ui.retry.onclick=()=>{
        if(!user){showLogin('Sila log masuk semula.');return}
        syncError=null;
        // If creating a new session failed, retry the claim; never
        // incorrectly treat an empty sessionStorage token as a second device.
        const needsNewSession=!getSessionLocal(user.uid);
        onSignedIn(user,epoch,needsNewSession);
      };
    }
  }
  async function onAuthChange(next) {
    const token=++epoch;
    queued=null;if(timer){clearTimeout(timer);timer=null}
    if(next){await onSignedIn(next,token);return}
    detachSessionWatch();activeSessionToken=null;
    const wasSignedIn=!!user;
    setIdentity(null);syncError=null;ready=true;
    // The game already starts with its local guest state. Rehydrating it again
    // during Firebase's initial null-auth callback was unnecessary, and could
    // throw on legacy saves in Safari before the login form was even shown.
    if(wasSignedIn){
      try {hydrate(readLocal(GUEST_KEY));}
      catch(err){
        diagnostic('memulihkan mod tetamu',err);
        ready=false;showStartupError('memulihkan simpanan tempatan',err);return;
      }
    }
    setStatus('Disimpan pada peranti · mod tetamu');
    if(kickedForOtherDevice){
      showLogin('Akaun ini telah digunakan pada peranti lain.');ui.guest.hidden=true;
      message('Sesi lama tamat. Masukkan e-mel dan kata laluan semula untuk log masuk.',true);
    }
    else if(guestMode)hide();else showLogin();
  }
  function openAccount() {
    overlay.classList.add('account-compact');
    pauseForAccount();
    if(user&&ready)showOverview();
    else if(configEnabled)showLogin();
    else {showLogin('Sistem akaun belum tersedia. Sila cuba kemudian.');ui.submit.disabled=true;ui.register.disabled=true;ui.login.disabled=true;ui.reset.disabled=true;}
  }
  async function logOut() {
    if(!auth||!user)return;
    setBusy(true);message('Menyimpan progres sebelum log keluar…');
    try{
      // Capture the newest purchase/state before releasing the account session.
      queueSave(capture());
      if(!activeSessionToken)throw new Error('Sesi Firebase tidak aktif.');
      if(queued||writing)await withTimeout(flush(),DATA_TIMEOUT_MS,'menyimpan sebelum log keluar');
      if(queued||syncError)throw new Error('Progres belum disimpan dalam Firebase.');
    }catch(err){
      setBusy(false);message('Log keluar dibatalkan. Progres belum berjaya disimpan ke Firebase. Semak internet / Database Rules dan cuba lagi. '+errorDetails(err,'simpan'),true);
      setStatus('⚠ Progres belum disegerakkan · jangan log keluar');return;
    }
    ready=false;guestMode=false;
    const uid=user.uid,token=activeSessionToken;
    try{
      await withTimeout(api.signOut(auth),DATA_TIMEOUT_MS,'log keluar');
      clearSessionLocal(uid);
      // Release after local sign-out, without holding the dialog on a network write.
      // Auth may already be gone: failure is harmless; next login claims a new token.
      releaseSession(uid,token);
    }catch(err){
      if(user?.uid===uid){ready=true;showOverview();message(errorMalay(err),true)}
    }finally{setBusy(false)}
  }

  function initControls() {
    ui.login.onclick=()=>{setMode('login');message('')};ui.register.onclick=()=>{setMode('register');message('')};
    ui.close.onclick=hide;const compactClose=byId('accountCompactClose');if(compactClose)compactClose.onclick=()=>{if(ready)hide()};overlay.addEventListener('cancel',e=>{if(overlay.classList.contains('account-compact')&&ready){e.preventDefault();hide()}else e.preventDefault()});
    ui.guest.onclick=()=>{if(user)return;guestMode=true;ready=true;hide();setStatus('Disimpan pada peranti · mod tetamu')};
    ui.logout.onclick=logOut;
    const copyDevUid=byId('copyDeveloperUid');
    if(copyDevUid)copyDevUid.onclick=async()=>{
      const uid=user?.uid,field=byId('developerUid');if(!uid||!field)return;
      let copied=false;
      try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(uid);copied=true}}catch{}
      if(!copied){try{field.focus();field.select();copied=document.execCommand('copy')}catch{}}
      copyDevUid.textContent=copied?'✓ UID disalin':'Pilih UID dan salin';
      if(!copied)field.select();
    };
    ui.form.onsubmit=async e=>{
      e.preventDefault();if(!auth||busy)return;
      const email=trim(ui.email.value),password=ui.password.value;
      if(!email||password.length<6){message('Masukkan e-mel sah dan kata laluan sekurang-kurangnya 6 aksara.',true);return}
      setBusy(true);message('Sedang '+(mode==='register'?'mendaftar':'log masuk')+'…');
      try {
        kickedForOtherDevice=false;newCredentialLogin=true;
        if(mode==='register')await api.createUserWithEmailAndPassword(auth,email,password);
        else await api.signInWithEmailAndPassword(auth,email,password);
        ui.password.value='';message('Berjaya. Menyediakan data permainan…');
      } catch(err){newCredentialLogin=false;message(errorMalay(err),true)}finally{setBusy(false)}
    };
    ui.reset.onclick=async()=>{
      const email=trim(ui.email.value);if(!email){message('Isi e-mel anda dahulu untuk tetapkan semula kata laluan.',true);return}
      setBusy(true);try{await api.sendPasswordResetEmail(auth,email);message('Jika e-mel ini didaftarkan, arahan set semula kata laluan akan dihantar.')}catch(err){message(errorMalay(err),true)}finally{setBusy(false)}
    };
    byId('accountBtn').onclick=openAccount;
  }
  async function start() {
    if(started)return;started=true;initControls();
    window.addEventListener('online',()=>{
      if(!user||!ready)return;
      const pending=readLocal(currentKey);
      if(pending?._cloudPending){syncError=null;stage(pending)}
    });
    showLoading('Menyemak sambungan akaun…');
    const config=window.KEDAI_FIREBASE_CONFIG;
    configEnabled=configValid(config);
    if(!configEnabled){
      ready=true;setStatus('Akaun belum tersedia · mod tetamu');
      showStartupError('konfigurasi',Object.assign(new Error('Konfigurasi akaun belum tersedia.'),{code:'KEDAI_CONFIG'}));
      return;
    }
    // Prevent a permanent loading screen when iOS Safari cannot restore auth state.
    bootWatchdog=setTimeout(()=>{
      if(bootSettled)return;
      showStartupError('memulakan akaun',Object.assign(new Error('Auth initialization timeout'),{code:'KEDAI_TIMEOUT'}));
    },BOOT_TIMEOUT_MS);
    try {
      const path=`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/`;
      const [appModule,authModule,databaseModule]=await withTimeout(Promise.all([
        import(path+'firebase-app.js'),import(path+'firebase-auth.js'),import(path+'firebase-database.js')
      ]),BOOT_TIMEOUT_MS,'memuatkan komponen akaun');
      if(bootStalled)return;
      const app=appModule.initializeApp(config);
      api={...authModule,...databaseModule};
      // Email/password login does not require IndexedDB or popup redirects.
      // Using localStorage persistence avoids known Safari IndexedDB auth stalls.
      // getAuth is the stable SDK default and can migrate persisted sessions.
      // If restoration fails on a particular browser, try explicitly setting
      // storage persistence; neither route alters Realtime Database progress.
      try {auth=authModule.getAuth(app)}
      catch(authErr){
        diagnostic('getAuth',authErr);
        auth=authModule.initializeAuth(app,{persistence:authModule.browserLocalPersistence});
      }
      db=databaseModule.getDatabase(app);
      if(bootStalled)return;
      authModule.onAuthStateChanged(auth,next=>{
        if(bootStalled)return;
        bootSettled=true;clearTimeout(bootWatchdog);bootWatchdog=null;
        onAuthChange(next).catch(err=>{
          if(!bootStalled){syncError=err;showStartupError('memproses log masuk',err)}
        });
      },err=>showStartupError('membaca status log masuk',err));
    } catch(err) {
      if(!bootStalled)showStartupError('memulakan sistem akaun',err);
    }
  }

  async function verifyFirebase(){
    if(!user||!ready||!activeSessionToken)throw new Error('Log masuk akaun Firebase dahulu.');
    if(queued||writing)await withTimeout(flush(),DATA_TIMEOUT_MS,'menyegerakkan data ujian');
    if(queued||writing||syncError)throw new Error('Masih ada data belum berjaya disimpan dalam Firebase.');
    const result=await withTimeout(api.get(snapshotRef(user.uid)),DATA_TIMEOUT_MS,'mengesahkan simpanan Firebase');
    const saved=developerSandbox?result.val()?.developerSandbox?.state:result.val()?.state;
    if(!saved?.progress)throw new Error('Firebase tidak memulangkan data progres.');
    const local=readLocal(currentKey);
    if(local?._clientStamp&&saved._clientStamp!==local._clientStamp)throw new Error('Versi Firebase belum sama dengan versi semasa.');
    return {day:saved.progress.day,wallet:saved.progress.wallet,items:Object.keys(saved.progress.inventory||{}).length,categories:saved.progress.unlocked?.length||0,upgrades:Object.keys(saved.progress.upgrades||{}).length,delivery:saved.progress.delivery?.orders?.length||0,developer:developerSandbox};
  }
  return {start, queueSave, flush, resetProgress, verifyFirebase, openAccount, getStorageKey:()=>currentKey, getUser:()=>user, isDeveloper:()=>developerSandbox, isSavedLocally:()=>ready&&!localSaveFailed, isSavedRemotely:()=>!!user&&ready&&!queued&&!writing&&!syncError&&!!activeSessionToken};
}
