(() => {
  const form = document.getElementById('cceForm');
  const preview = document.getElementById('preview');
  const rows = document.getElementById('correctionRows');
  const missingList = document.getElementById('missingList');
  const progressFill = document.getElementById('progressFill');
  const requiredSummary = document.getElementById('requiredSummary');
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadStatus = document.getElementById('downloadStatus');
  let previewType = 'cover';
  let correctionId = 0;
  const initialCorrections = [
    {description:"Mother's first name",from:"PACITA",to:"LAPACENCIA"},
    {description:"Parents' date of marriage",from:"MAY 16, 1968",to:"MAY 11, 1967"}
  ];
  const get = name => (form.elements[name]?.value || '').trim();
  const nameFields = new Set(['petitioner','owner','registrar','recipient','motherName','fatherName']);
  const normalizeName = value => String(value || '').trim().replace(/\s+/g, ' ').toLocaleUpperCase('en-US');
  const getName = name => normalizeName(get(name));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const corrections = () => [...rows.querySelectorAll('.correction-row')].map(row => ({
    description: row.querySelector('[data-key="description"]').value.trim(),
    from: row.querySelector('[data-key="from"]').value.trim(),
    to: row.querySelector('[data-key="to"]').value.trim()
  }));
  function addCorrection(data={description:'',from:'',to:''}) {
    const id = ++correctionId;
    const row = document.createElement('div');
    row.className = 'correction-row';
    row.innerHTML = '<input aria-label="Correction description" data-key="description" placeholder="Description"><input aria-label="Current entry" data-key="from" placeholder="From"><input aria-label="Correct entry" data-key="to" placeholder="To"><button class="icon-btn" type="button" aria-label="Remove correction" title="Remove row">×</button>';
    row.querySelector('[data-key="description"]').value = data.description || '';
    row.querySelector('[data-key="from"]').value = data.from || '';
    row.querySelector('[data-key="to"]').value = data.to || '';
    row.querySelector('button').addEventListener('click', () => { row.remove(); update(); });
    row.querySelectorAll('input').forEach(input => input.addEventListener('input', update));
    rows.appendChild(row);
    return id;
  }
  initialCorrections.forEach(addCorrection);
  const supportRows = document.getElementById('supportRows');
  const initialSupportDocs = ['Birth Certificate sought to be corrected','My Baptismal Certificate','Marriage Certificate of my parents, siblings, and I','Birth Certificate of my other sibling','Affidavit of Discrepancy and my IDs','Death Certificate of my mother and filing fee receipt'];
  function addSupportDocument(value='') {
    const row=document.createElement('div'); row.className='support-row';
    row.innerHTML='<input data-key="support" aria-label="Supporting document" placeholder="Supporting document"><button type="button" class="icon-btn" aria-label="Remove supporting document">×</button>';
    row.querySelector('input').value=value;
    row.querySelector('input').addEventListener('input',update);
    row.querySelector('button').addEventListener('click',()=>{row.remove();update();});
    supportRows.appendChild(row);
  }
  initialSupportDocs.forEach(addSupportDocument);
  document.getElementById('addSupport').addEventListener('click',()=>{addSupportDocument();update();});
  // Names are stored/displayed in uppercase, matching civil-registry document conventions.
  form.querySelectorAll('input[name="petitioner"],input[name="owner"],input[name="registrar"],input[name="recipient"],input[name="motherName"],input[name="fatherName"]').forEach(input => {
    input.style.textTransform = 'uppercase';
    input.addEventListener('input', () => { const start=input.selectionStart,end=input.selectionEnd; const upper=input.value.toLocaleUpperCase('en-US'); if(input.value!==upper){input.value=upper;try{input.setSelectionRange(start,end)}catch(_){}} });
  });
  function baseOffice() {
    return '<div class="office">Republic of the Philippines<br>Province of '+esc(get('province'))+'<br>Municipality of '+esc(get('municipality'))+'<br>Office of the Municipal Civil Registrar</div>';
  }
  function signature() { return '<div class="signature">'+esc(getName('registrar'))+'<br><span style="font-weight:normal">Municipal Civil Registrar</span></div>'; }
  function renderPreview() {
    const p = esc(getName('petitioner')), o = esc(getName('owner')), no = esc(get('caseNo')), doc = esc(get('documentType')), reg = esc(get('registryNo')), ra = 'RA No. ' + (get('law') || '9048');
    const recipientAddress = get('recipientAddress') || 'Philippine Statistics Authority Complex\n4th Floor TAM Building\nEast Avenue, Quezon City';
    const ownerPronoun = get('ownerPronouns') || 'she';
    const ownerSubject = ({I:'I',he:'he',she:'she',they:'they'})[ownerPronoun] || 'they';
    const ownerSubjectCap = ownerSubject.charAt(0).toUpperCase() + ownerSubject.slice(1);
    const cs = corrections();
    const supportDocs = [...document.querySelectorAll('.support-row input')].map(i => i.value.trim()).filter(Boolean);
    const supportList = '<h3>1. I submit the following documents to support this petition:</h3><p><em>(Use additional sheets, if necessary.)</em></p><ol type="a">' + supportDocs.map(d => '<li>' + esc(d) + '</li>').join('') + '</ol>';
    if (previewType === 'petition') {
      const correctionTable = '<table><thead><tr><th>Item No.</th><th>Description</th><th>From</th><th>To</th></tr></thead><tbody>' + cs.map((c,i) => '<tr><td>'+(i+1)+'</td><td>'+esc(c.description)+'</td><td>'+esc(c.from)+'</td><td>'+esc(c.to)+'</td></tr>').join('') + '</tbody></table>';
      const recordChoice = get('recordOwnerType') === 'petitioner'
        ? '<p><b>☒</b> my '+doc+'<br><b>☐</b> the '+doc+' of '+o
        : '<p><b>☐</b> my '+doc+'<br><b>☒</b> the '+doc+' of '+o;
      const relationshipLine = '<br><span style="display:inline-block;margin-left:35px"> (relationship of the owner to the petitioner: '+esc(get('relationship'))+')</span></p>';
      const ownerPronounText = ({I:'I',he:'He',she:'She',they:'They'})[ownerPronoun] || 'They';
      const pageOne = '<div class="petition-page"><p class="center"><b>RA No. '+esc(get('law') || '9048')+' Form No. 1.1 (LCRO)</b></p>' + baseOffice() + '<p class="right">Petition No. '+no+'</p><h3>PETITION FOR CORRECTION OF CLERICAL ERROR<br>IN THE '+doc.toUpperCase()+'</h3><p>I, <b>'+p+'</b>, '+esc(get('ageStatement'))+', '+esc(get('nationality'))+', a resident of <b>'+esc(get('petitionerAddress'))+'</b>, after having been duly sworn to in accordance with law, hereby declare that:</p><p><b>1.</b> I am the petitioner seeking correction of the clerical error in:</p>'+recordChoice+relationshipLine+'<p><b>2.</b> '+(get('recordOwnerType') === 'petitioner' ? 'I was' : ownerPronounText+' was')+' born on '+esc(get('dob'))+' at '+esc(get('birthplace'))+'.<br><span style="display:inline-block;margin-left:35px">(date of birth) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (city/municipality, province, country)</span></p><p><b>3.</b> The birth was recorded under registry number: '+reg+'</p><p><b>4.</b> The clerical error/s to be corrected is/are:</p>'+correctionTable+'<p><b>5.</b> The facts/reasons for filing this petition are the following:<br><em>(Use additional sheets, if necessary.)</em></p><p>'+esc(get('reasons'))+'</p><p><b>6.</b> I submit the following documents to support this petition:<br><em>(Use additional sheets, if necessary.)</em></p><ol type="a" class="support-list">'+supportDocs.map(d=>'<li>'+esc(d)+'</li>').join('')+'</ol></div>';
      const pageTwo = '<div class="petition-page petition-page-break"><p class="center"><b>RA No. '+esc(get('law') || '9048')+' Form No. 1.1 (LCRO)</b></p><p><b>7.</b> I have not filed any similar petition and, to the best of my knowledge, no similar petition is pending with any Local Civil Registry Office, court, or Philippine Consulate.</p><p><b>8.</b> I have no pending criminal, civil, or administrative case in any court or quasi-judicial body.</p><p><b>9.</b> I am filing this petition at the Local Civil Registry Office of '+esc(get('municipality'))+', '+esc(get('province'))+', in accordance with Republic Act No. '+esc(get('law') || '9048')+' and its implementing rules and regulations.</p><p class="signature"><b>'+p+'</b><br><span>Petitioner</span></p><h3>VERIFICATION</h3><p>I, <b>'+p+'</b>, the petitioner, hereby certify that the allegations herein are true and correct to the best of my knowledge and belief.</p><p class="signature"><b>'+p+'</b><br><span>Petitioner</span></p><p>SUBSCRIBED AND SWORN TO before me this '+esc(get('swornDate'))+' in the Municipality of '+esc(get('municipality'))+', '+esc(get('province'))+', the petitioner exhibiting '+esc(get('idType'))+' with no. '+esc(get('idNumber'))+'.</p><p class="signature"><b>'+esc(getName('registrar'))+'</b><br><span>Municipal Civil Registrar</span></p><div class="notarial-details"><p>Doc. No. __________</p><p>Page No. __________</p><p>Book No. __________</p><p>Series of _________</p></div></div>';
      preview.innerHTML = pageOne + pageTwo;
      return;
    }
    let html = '';
    if (previewType === 'cover') {
      html = baseOffice()+'<p class="right">'+esc(get('coverDate'))+'</p><p><b>'+esc(getName('recipient'))+'</b><br>'+esc(get('recipientTitle'))+'<br>Legal Services Division<br>Office of the Director<br>'+esc(recipientAddress).replace(/\n/g,'<br>')+'</p><p><b>Subject: '+ra+'</b></p><p>Sir:</p><p style="text-indent:28px">Submitted herewith is the petition for the correction of a clerical error in the '+doc+' of <b>'+o+'</b>, under Petition Case No. <b>'+no+'</b>, filed by <b>'+p+'</b>.</p><p style="text-indent:28px">Thank you in anticipation of favorable action regarding this matter.</p><p style="margin-top:32px;text-align:right">Very truly yours,</p>'+signature();
    } else if (previewType === 'notice') {
      html = '<p class="center">'+ra+' Form 8.1</p>'+baseOffice()+'<h3>NOTICE FOR POSTING</h3><p>The public is hereby notified that <b>'+p+'</b> (complete name of petitioner) has filed in this Office a petition for Correction of Clerical Error in the '+doc+' of <b>'+o+'</b> (complete name of document owner).</p><p>Any person claiming interest or may be adversely affected by said petition may, within ten (10) days, file his/her written opposition with this Office.</p><p>Date: '+esc(get('noticeDate'))+'</p>'+signature();
    } else if (previewType === 'certificate') {
      html = '<p class="center">'+ra+' Form 9.1</p>'+baseOffice()+'<h3>CERTIFICATE OF POSTING</h3><p>This is to certify that Petition No. <b>'+no+'</b> dated '+esc(get('petitionDate'))+' filed by <b>'+p+'</b> for the Correction of Clerical Error in the '+doc+' of <b>'+o+'</b> under Civil Registry No. '+reg+' has been posted for ten (10) consecutive days from '+esc(get('postingStart'))+' to '+esc(get('postingEnd'))+' at the Municipal Hall Bulletin Board in accordance with '+ra+'.</p><p>Issued at the Local Civil Registry Office, '+esc(get('municipality'))+', '+esc(get('province'))+' this '+esc(get('certificateDate'))+'.</p>'+signature();
    } else {
      const correctionTable = '<table><thead><tr><th>Item No.</th><th>Description</th><th>From</th><th>To</th></tr></thead><tbody>'+cs.map((c,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(c.description)+'</td><td>'+esc(c.from)+'</td><td>'+esc(c.to)+'</td></tr>').join('')+'</tbody></table>';
      html = '<p class="center">'+ra+' Form No. 1.1 (LCRO)</p>'+baseOffice()+'<p class="right">Petition No. '+no+'</p><h3>PETITION FOR CORRECTION OF CLERICAL ERROR<br>IN THE '+doc.toUpperCase()+'</h3><p>I, <b>'+p+'</b>, '+esc(get('ageStatement'))+', '+esc(get('nationality'))+', a resident of <b>'+esc(get('petitionerAddress'))+'</b>, after having been duly sworn to in accordance with law, hereby declare that:</p><p>1. The record to be corrected is:</p><p>'+(get('recordOwnerType')==='petitioner'?'☒ my '+doc+'<br>☐ the '+doc+' of '+o:'☐ my '+doc+'<br>☒ the '+doc+' of '+o)+'<br><em>(relationship of the owner to the petitioner: '+esc(get('relationship'))+')</em></p><p>2. '+(get('recordOwnerType')==='petitioner'?'I':'The document owner')+' was born on '+esc(get('dob'))+' at '+esc(get('birthplace'))+'. '+(get('recordOwnerType')==='petitioner'?'':esc(ownerSubjectCap)+' was recorded under '+esc(ownerPossessive)+' birth record.')+'</p><p>3. The birth was recorded under registry number: '+reg+'.</p><p>4. The clerical error(s) to be corrected is/are:</p>'+correctionTable+'<p>5. Facts / reasons for filing this petition:</p><p>To correct the erroneous '+esc(get('entryCount')||'entries')+' in '+esc(get('ownerReference')==='custom'?'my '+get('relationship')+"’s":get('ownerReference')||'my')+' '+doc+', in order to be consistent with supporting documents.</p><p>'+esc(get('reasons'))+'</p>'+supportList+'<h3>For C/MCR use only — ACTION TAKEN BY THE MCR</h3><p><em>Provide the basis for the action taken</em></p><p>'+(actionChoice==='GRANTED'?'☒ Granted &nbsp;&nbsp; ☐ Denied':actionChoice==='DENIED'?'☐ Granted &nbsp;&nbsp; ☒ Denied':'☐ Granted &nbsp;&nbsp; ☐ Denied')+'</p><p>'+esc(get('actionBasis'))+'</p><p>Having found the petition sufficient in form and substance, the petition is hereby '+esc(form.querySelector('input[name="actionTaken"]:checked')?.value||'________')+'. '+cs.map(c=>'The '+esc(c.description)+' in the '+doc+' bearing registry number '+reg+' is hereby corrected from “'+esc(c.from)+'” to “'+esc(c.to)+'”.').join(' ')+'</p><p>Date: '+esc(get('actionDate'))+'</p><h3>For CRG use only — ACTION TAKEN BY CRG</h3><p><em>Provide the basis for the action taken</em></p><p>'+(form.querySelector('input[name="crgActionTaken"]:checked')?.value==='GRANTED'?'☒ Granted &nbsp;&nbsp; ☐ Denied':form.querySelector('input[name="crgActionTaken"]:checked')?.value==='DENIED'?'☐ Granted &nbsp;&nbsp; ☒ Denied':'☐ Granted &nbsp;&nbsp; ☐ Denied')+'</p><p>'+esc(get('crgActionBasis'))+'</p><p>Date: '+esc(get('crgActionDate'))+'</p>'+signature();
    }
    preview.innerHTML = html;
  }
  function validate() {
    const required = [...form.querySelectorAll('[required]')];
    const missing = [];
    required.forEach(el => {
      const invalid = !el.value.trim();
      el.classList.toggle('invalid', invalid);
      if (invalid) missing.push(el.labels?.[0]?.textContent.replace('*','').trim() || el.name);
    });
    const completeCorrection = corrections().some(c => c.description && c.from && c.to);
    if (!document.getElementById('templateFile')?.files?.[0]) missing.push('Select the original Word (.docx) template');
    if (!form.querySelector('input[name="actionTaken"]:checked')) missing.push('Select Granted or Denied for MCR action');
    if (!completeCorrection) missing.push('At least one complete correction row (description, from, and to)');
    const completeCount = required.length - required.filter(el => !el.value.trim()).length;
    const total = required.length + 3;
    progressFill.style.width = Math.round((completeCount + (completeCorrection ? 1 : 0) + (document.getElementById('templateFile')?.files?.[0] ? 1 : 0) + (form.querySelector('input[name="actionTaken"]:checked') ? 1 : 0)) / total * 100) + '%';
    missingList.innerHTML = '';
    const shown = missing.length ? missing : ['All required fields are filled'];
    shown.forEach(item => {
      const div = document.createElement('div');
      div.className = 'check-item' + (missing.length ? '' : ' ok');
      div.innerHTML = '<span class="check-dot">'+(missing.length ? '!' : '✓')+'</span><span>'+esc(item)+'</span>';
      missingList.appendChild(div);
    });
    requiredSummary.textContent = missing.length ? missing.length+' item(s) need attention before generation.' : 'Required fields complete. Review the preview before generating.';
    downloadBtn.disabled = missing.length > 0;
    return missing.length === 0;
  }
  const reasonField = form.elements['reasons'];
  let lastAutoReason = reasonField.value;
  function generatedReason() {
    const self = get('recordOwnerType') === 'petitioner';
    const relationship = get('relationship');
    const reference = self ? 'my' : ({sister:'my sister’s',brother:'my brother’s',mother:'my mother’s',father:'my father’s',daughter:'my daughter’s',son:'my son’s',spouse:'my spouse’s',child:'my child’s',parent:'my parent’s',relative:'my relative’s',guardian:'my ward’s',self:'my',other:'the document owner’s'})[relationship] || 'the document owner’s';
    const pronoun = self ? (get('petitionerPronouns') || 'I') : (get('ownerPronouns') || 'she');
    const possessive = ({I:'my',he:'his',she:'her',they:'their'})[pronoun] || 'their';
    return 'To correct the erroneous '+(get('entryCount') || 'entries')+' in '+reference+' '+get('documentType')+', in order to be consistent with all '+possessive+' other supporting documents.';
  }
  function syncOwnerFields() {
    const self = get('recordOwnerType') === 'petitioner';
    const owner = form.elements['owner'];
    const relationship = form.elements['relationship'];
    const ownerPronouns = form.elements['ownerPronouns'];
    const ownerReference = form.elements['ownerReference'];
    if (self) {
      owner.value = form.elements['petitioner'].value;
      relationship.value = 'self';
      ownerPronouns.value = form.elements['petitionerPronouns'].value;
      ownerReference.value = 'my';
    }
    [[owner,self],[relationship,self],[ownerPronouns,self],[ownerReference,self]].forEach(([field,disabled]) => {
      field.disabled = disabled;
      field.closest('label')?.classList.toggle('auto-filled', disabled);
    });
    const reason = generatedReason();
    if (reasonField.value === lastAutoReason) reasonField.value = reason;
    lastAutoReason = reason;
  }
  function update() { syncOwnerFields(); renderPreview(); validate(); }
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  document.getElementById('addCorrection').addEventListener('click', () => { addCorrection(); update(); });
  document.getElementById('lawSelect')?.addEventListener('change', update);
  document.getElementById('templateFile')?.addEventListener('change', update);
  document.getElementById('clearBtn').addEventListener('click', () => {
    if (!confirm('Clear all case fields? This cannot be undone.')) return;
    form.reset(); rows.innerHTML = ''; addCorrection(); update();
  });
  document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => {
    previewType = button.dataset.preview;
    document.querySelectorAll('[data-preview]').forEach(b => b.classList.toggle('active', b === button));
    renderPreview();
  }));
  function paragraph(docx, text, options={}) {
    return new docx.Paragraph({children:[new docx.TextRun({text:String(text ?? ''),bold:!!options.bold,italics:!!options.italics,size:options.size || 22,font:'Times New Roman'})],alignment:options.center ? docx.AlignmentType.CENTER : options.right ? docx.AlignmentType.RIGHT : docx.AlignmentType.LEFT,spacing:{after:options.after ?? 180,line:320}});
  }
  function cell(docx, text, bold=false) {
    return new docx.TableCell({children:[new docx.Paragraph({children:[new docx.TextRun({text:String(text ?? ''),bold,font:'Times New Roman',size:20})]})],width:{size:25,type:docx.WidthType.PERCENTAGE},margins:{top:80,bottom:80,left:80,right:80}});
  }
  async function generateDocx() {
    if (!validate()) { downloadStatus.textContent = 'Complete the required fields first.'; return; }
    if (!window.docx) { downloadStatus.textContent = 'Word export library did not load. Check internet access and reload the page.'; return; }
    downloadBtn.disabled = true;
    downloadStatus.textContent = 'Building your Word file…';
    try {
      const d = window.docx;
      const cs = corrections();
      const sections = [];
      const add = (children) => sections.push({properties:{page:{margin:{top:900,right:1050,bottom:900,left:1050}}},children});
      const office = () => [paragraph(d,'Republic of the Philippines',{center:true}),paragraph(d,'Province of '+get('province'),{center:true}),paragraph(d,'Municipality of '+get('municipality'),{center:true}),paragraph(d,'Office of the Municipal Civil Registrar',{center:true,after:350})];
      add([...office(),paragraph(d,get('coverDate'),{right:true}),paragraph(d,get('recipient')+'\n'+get('recipientTitle')+'\nLegal Services Division\nOffice of the Director\nPhilippine Statistics Authority Complex\n4th Floor TAM Building\nEast Avenue, Quezon City'),paragraph(d,'Subject: RA No. 9048',{bold:true}),paragraph(d,'Sir:'),paragraph(d,'Submitted herewith is the petition for the correction of a clerical error in the '+get('documentType')+' of '+get('owner')+', under Petition Case No. '+get('caseNo')+', filed by '+get('petitioner')+'.'),paragraph(d,'Thank you in anticipation of favorable action regarding this matter.'),paragraph(d,'Very truly yours,',{right:true}),paragraph(d,get('registrar'),{bold:true,right:true}),paragraph(d,'Municipal Civil Registrar',{right:true}),paragraph(d,'',{size:18})]);
      add([paragraph(d,'R.A. 9048 Form 8.1',{center:true}),...office(),paragraph(d,'NOTICE FOR POSTING',{center:true,bold:true}),paragraph(d,'The public is hereby notified that '+get('petitioner')+' (complete name of petitioner) has filed in this Office a petition for Correction of Clerical Error in the '+get('documentType')+' of '+get('owner')+' (complete name of document owner).'),paragraph(d,'Any person claiming interest or may be adversely affected by said petition may, within ten (10) days, file his/her written opposition with this Office.'),paragraph(d,'Date: '+get('noticeDate')),paragraph(d,get('registrar'),{bold:true,right:true}),paragraph(d,'Municipal Civil Registrar',{right:true})]);
      add([paragraph(d,'R.A. 9048 Form 9.1',{center:true}),...office(),paragraph(d,'CERTIFICATE OF POSTING',{center:true,bold:true}),paragraph(d,'This is to certify that Petition No. '+get('caseNo')+' dated '+get('petitionDate')+' filed by '+get('petitioner')+' for the Correction of Clerical Error in the '+get('documentType')+' of '+get('owner')+' under Civil Registry No. '+get('registryNo')+' has been posted for ten (10) consecutive days from '+get('postingStart')+' to '+get('postingEnd')+' at the Municipal Hall Bulletin Board in accordance with '+ra+'.'),paragraph(d,'Issued at the Local Civil Registry Office, '+get('municipality')+', '+get('province')+' this '+get('certificateDate')+'.'),paragraph(d,get('registrar'),{bold:true,right:true}),paragraph(d,'Municipal Civil Registrar',{right:true})]);
      const table = new d.Table({width:{size:100,type:d.WidthType.PERCENTAGE},rows:[new d.TableRow({children:[cell(d,'Item No.',true),cell(d,'Description',true),cell(d,'From',true),cell(d,'To',true)]}),...cs.filter(c=>c.description||c.from||c.to).map((c,i)=>new d.TableRow({children:[cell(d,String(i+1)),cell(d,c.description),cell(d,c.from),cell(d,c.to)]}))]});
      add([paragraph(d,'RA 9048 Form No. 1.1 (LCRO)',{center:true}),...office(),paragraph(d,'Petition No. '+get('caseNo'),{right:true}),paragraph(d,'PETITION FOR CORRECTION OF CLERICAL ERROR\nIN THE '+get('documentType').toUpperCase(),{center:true,bold:true}),paragraph(d,'I, '+get('petitioner')+', '+get('ageStatement')+', '+get('nationality')+', a resident of '+get('petitionerAddress')+', after having been duly sworn to in accordance with law, hereby declare that:'),paragraph(d,'1. I am the petitioner seeking correction of the clerical error in the '+get('documentType')+' of '+get('owner')+', who is my '+get('relationship')+'.'),paragraph(d,'2. The document owner was born on '+get('dob')+' at '+get('birthplace')+'.'),paragraph(d,'3. The birth was recorded under registry number: '+get('registryNo')+'.'),paragraph(d,'4. The clerical error(s) to be corrected is/are:'),table,paragraph(d,'5. Facts / reasons for filing this petition:'),paragraph(d,get('reasons')),paragraph(d,'ACTION TAKEN BY THE MCR',{center:true,bold:true}),paragraph(d,get('actionBasis')),paragraph(d,'Action taken: '+get('actionTaken')),paragraph(d,'Date: '+get('actionDate')),paragraph(d,get('registrar'),{bold:true,right:true}),paragraph(d,'Municipal Civil Registrar',{right:true})]);
      const document = new d.Document({sections});
      const blob = await d.Packer.toBlob(document);
      const a = document.createElement ? null : null;
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      const slug = (get('petitioner') || 'Petitioner').replace(/[^a-z0-9]+/gi,'_').replace(/^_|_$/g,'');
      const caseSlug = (get('caseNo') || 'CCE-Case').replace(/[^a-z0-9-]+/gi,'_');
      link.href = url; link.download = 'CCE-'+caseSlug+' (RA 9048) '+slug+'.docx';
      window.document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      downloadStatus.textContent = 'Word file generated. Open it in Microsoft Word and review all pages and formatting.';
    } catch (error) {
      console.error(error);
      downloadStatus.textContent = 'Could not generate the Word file: '+(error?.message || 'unknown error')+'. Please reload and try again.';
    } finally { validate(); }
  }
  downloadBtn.addEventListener('click', generateDocx);
  update();
})();