(() => {
 const fileInput=document.getElementById("templateFile");
 const status=document.getElementById("templateStatus");
 const button=document.getElementById("downloadBtn");
 const note=document.getElementById("downloadStatus");
 const form=document.getElementById("cceForm");
 const get=n=>(form.elements[n] && form.elements[n].value || "").trim();
 const getName=n=>get(n).replace(/\s+/g," ").toLocaleUpperCase("en-US");
 fileInput.addEventListener("change",()=>{const f=fileInput.files[0];status.textContent=f?"Selected: "+f.name+" ("+Math.round(f.size/1024)+" KB)":"No Word template selected yet.";});
 function relationshipReference(){
  if(get("recordOwnerType")==="petitioner")return "my";
  const v=get("ownerReference");if(v&&v!=="custom")return v;
  const refs={sister:"my sister’s",brother:"my brother’s",mother:"my mother’s",father:"my father’s",daughter:"my daughter’s",son:"my son’s",spouse:"my spouse’s",self:"my",child:"my child’s",parent:"my parent’s",relative:"my relative’s",guardian:"my ward’s",other:"the document owner’s"};
  return refs[get("relationship")]||"the document owner’s";
 }
 function decisionText(name){
  const v=form.querySelector('input[name="'+name+'"]:checked')?.value;
  return v==="GRANTED"?"☒ Granted    ☐ Denied":v==="DENIED"?"☐ Granted    ☒ Denied":"☐ Granted    ☐ Denied";
 }
 function actionSentence(){
  const v=form.querySelector('input[name="actionTaken"]:checked')?.value;
  const status=v==="GRANTED"?"GRANTED":v==="DENIED"?"DENIED":"________";
  const corrections=[...document.querySelectorAll(".correction-row")].map(r=>{
   const d=r.querySelector('[data-key="description"]').value.trim(),f=r.querySelector('[data-key="from"]').value.trim(),t=r.querySelector('[data-key="to"]').value.trim();
   return d&&f&&t?"The "+d+" in the "+get("documentType")+" bearing registry number "+get("registryNo")+" is hereby corrected from “"+f+"” to “"+t+"”.":"";
  }).filter(Boolean).join(" ");
  return "Having found the petition sufficient in form and substance, the petition is hereby "+status+". "+corrections;
 }
 function buildMap(){
  const m=new Map(),put=(a,b)=>{if(a&&b!==undefined&&b!==null)m.set(a,String(b));};
  put("RONALD GUIEB CASILANG",getName("petitioner"));put("HELEN GUIEB CASILANG",getName("owner"));put("CCE-0060-2026",get("caseNo"));
  put("June 2, 2026",get("coverDate"));put("2 June 2026",get("actionDate"));put("19 May 2026",get("noticeDate"));put("18 May 2026",get("petitionDate"));put("RA No. 9048","RA No. "+(get("law")||"9048"));put("R.A. 9048","R.A. "+(get("law")||"9048"));put("Republic Act No. 9048","Republic Act No. "+(get("law")||"9048"));
  put("May 20-29, 2026",get("postingStart")+" to "+get("postingEnd"));put("1st day of June, 2026",get("certificateDate"));
  put("Certificate of Live Birth",get("documentType"));put("Civil Registry No. 124","Civil Registry No. "+get("registryNo"));put("registry number: 124","registry number: "+get("registryNo"));put("registry number 124","registry number "+get("registryNo"));
  put("March 6, 1968",get("dob"));put("Sta. Cruz, Ilocos Sur, Philippines",get("birthplace"));put("Province of Ilocos Sur","Province of "+get("province"));
   put("ZENAIDA F. JAVINES",getName("registrar"));put("ATTY. ELIEZER P. AMBATALI",getName("recipient"));put("Municipal Hall, Popularidad Street, Poblacion Weste, Sta. Cruz, Ilocos Sur 2713","");put("Contact no.: 0915-698-3570","");put("Email: javineszenaida@yahoo.com","");put("0915-698-3570","");put("javineszenaida@yahoo.com","");
  put("Municipality of Sta. Cruz","Municipality of "+get("municipality"));put("Municipality of Santa Cruz","Municipality of "+get("municipality"));
  put("Sta. Cruz, Ilocos Sur",get("municipality")+", "+get("province"));put("Santa Cruz, Ilocos Sur",get("municipality")+", "+get("province"));
  const rows=[...document.querySelectorAll(".correction-row")].map(r=>({d:r.querySelector('[data-key="description"]').value.trim(),f:r.querySelector('[data-key="from"]').value.trim(),t:r.querySelector('[data-key="to"]').value.trim()}));
  if(rows[0]){put("PACITA",rows[0].f);put("LAPACENCIA",rows[0].t);}
  if(rows[1]){put("MAY 16, 1968",rows[1].f);put("MAY 11, 1967",rows[1].t);}
  const ra=get("law")||"9048";
  for(const old of ["Republic Act No. 9048","Republic Act 9048","R.A. No. 9048","R.A. 9048","RA No. 9048","RA 9048"])put(old,old.startsWith("Republic")?"Republic Act No. "+ra:"R.A. "+ra);
  put("RA 9048 Form No. 1.1","RA "+ra+" Form No. 1.1");put("R.A. 9048 Form 8.1","R.A. "+ra+" Form 8.1");put("R.A. 9048 Form 9.1","R.A. "+ra+" Form 9.1");
  const owner=getName("owner"), doc=get("documentType"), relationship=get("relationship")||"sister";
  put("☐ my "+doc,get("recordOwnerType")==="petitioner"?"☒ my "+doc:"☐ my "+doc);
  put("☐ the "+doc+" of "+owner,get("recordOwnerType")==="petitioner"?"☐ the "+doc+" of "+owner:"☒ the "+doc+" of "+owner);
  put("☐ my Certificate of Live Birth",get("recordOwnerType")==="petitioner"?"☒ my Certificate of Live Birth":"☐ my Certificate of Live Birth");
  put("☐ the Certificate of Live Birth of "+owner,get("recordOwnerType")==="petitioner"?"☐ the Certificate of Live Birth of "+owner:"☒ the Certificate of Live Birth of "+owner);
  const relText={sister:"my sister",brother:"my brother",mother:"my mother",father:"my father",daughter:"my daughter",son:"my son",spouse:"my spouse",self:"my",child:"my child",parent:"my parent",relative:"my relative",guardian:"my ward",other:"the document owner"}[relationship]||"the document owner";
  put("who is my sister","who is my "+relationship);put("who is my brother","who is my "+relationship);
  put("my sister’s Certificate of Live Birth",relationshipReference()+" Certificate of Live Birth");
  put("my brother’s Certificate of Live Birth",relationshipReference()+" Certificate of Live Birth");
  put("my sister's Certificate of Live Birth",relationshipReference()+" Certificate of Live Birth");
  put("my brother's Certificate of Live Birth",relationshipReference()+" Certificate of Live Birth");
  put("the erroneous entries in my sister's Certificate of Live Birth","the erroneous "+(get("entryCount")||"entries")+" in "+relationshipReference()+" "+doc);
  put("the erroneous entries in my brother's Certificate of Live Birth","the erroneous "+(get("entryCount")||"entries")+" in "+relationshipReference()+" "+doc);
  put("Driver's License",get("idType"));put("A04-08-005650",get("idNumber"));put("18th day of May, 2026",get("swornDate"));
  const pron=get("ownerPronouns")||"she",subj={I:"I",he:"he",she:"she",they:"they"}[pron]||"they",obj={I:"me",he:"him",she:"her",they:"them"}[pron]||"them",poss={I:"my",he:"his",she:"her",they:"their"}[pron]||"their";
  put("he/she",subj);put("He/She",subj.charAt(0).toUpperCase()+subj.slice(1));put("him/her",obj);put("Him/Her",obj.charAt(0).toUpperCase()+obj.slice(1));put("his/her",poss);put("His/Her",poss.charAt(0).toUpperCase()+poss.slice(1));put("he or she",subj);put("his or her",poss);put("him or her",obj);
  put("☐ Granted    ☐ Denied",decisionText("actionTaken"));put("☐ Granted     ☐ Denied",decisionText("crgActionTaken"));
  put("Having found the petition sufficient in form and substance, the petition is hereby GRANTED.",actionSentence());
  put("Having found the petition sufficient in form and substance, the petition is hereby DENIED.",actionSentence());
  put("to correct the erroneous entries in my sister's Certificate of Live Birth, in order to be consistent with all her other documents.","To correct the erroneous "+(get("entryCount")||"entries")+" in "+relationshipReference()+" "+doc+", in order to be consistent with all "+(get("recordOwnerType")==="petitioner"?"my":({I:"my",he:"his",she:"her",they:"their"}[get("ownerPronouns")||"she"]||"their"))+" other supporting documents.");
  const reasonReplacement="To correct the erroneous "+(get("entryCount")||"entries")+" in "+relationshipReference()+" "+doc+", in order to be consistent with all "+(get("recordOwnerType")==="petitioner"?"my":({I:"my",he:"his",she:"her",they:"their"}[get("ownerPronouns")||"she"]||"their"))+" other supporting documents.";
  put("To correct the erroneous entries in my sister’s Certificate of Live Birth, in order to be consistent with all her other supporting documents.",reasonReplacement);
  put("To correct the erroneous entries in my sister's Certificate of Live Birth, in order to be consistent with all her other supporting documents.",reasonReplacement);
  return m;
 }
 function apply(text,map){let out=text;for(const [a,b] of map){if(a&&out.includes(a))out=out.split(a).join(b);}return out;}
 button.addEventListener("click",async event=>{
  event.preventDefault();event.stopImmediatePropagation();
  const file=fileInput.files[0];if(!file){note.textContent="Select your original CCE Word (.docx) file above first.";fileInput.focus();return;}
  if(!window.JSZip){note.textContent="The Word template library did not load. Check internet access and reload.";return;}
  button.disabled=true;note.textContent="Updating a copy of your original Word file while preserving its layout…";
  try{
   const zip=await window.JSZip.loadAsync(file),map=buildMap(),parser=new DOMParser(),serializer=new XMLSerializer(),ns="http://schemas.openxmlformats.org/wordprocessingml/2006/main";
   const paths=Object.keys(zip.files).filter(p=>/^word\/(document|header\d+|footer\d+|footnotes|endnotes|comments)\.xml$/.test(p));let changedParts=0;
   for(const path of paths){
    const source=await zip.file(path).async("string"),xml=parser.parseFromString(source,"application/xml");if(xml.querySelector("parsererror"))continue;let changed=false,decisionSection="actionTaken";
    for(const para of [...xml.getElementsByTagNameNS(ns,"p")]){
     const nodes=[...para.getElementsByTagNameNS(ns,"t")];if(!nodes.length)continue;
     const combined=nodes.map(n=>n.textContent||"").join("");
     if(/ACTION TAKEN BY THE MCR/i.test(combined))decisionSection="actionTaken";
     if(/ACTION TAKEN BY CRG/i.test(combined))decisionSection="crgActionTaken";
     let replacement=apply(combined,map);
     if(/Granted/i.test(combined)&&/Denied/i.test(combined)){
      const chosen=form.querySelector('input[name="'+decisionSection+'"]:checked')?.value;
      replacement=chosen==="GRANTED"?"☒ Granted    ☐ Denied":chosen==="DENIED"?"☐ Granted    ☒ Denied":"☐ Granted    ☐ Denied";
     }
     if(replacement===combined){for(const node of nodes){const next=apply(node.textContent||"",map);if(next!==(node.textContent||"")){node.textContent=next;changed=true;}}}
     else{nodes[0].textContent=replacement;nodes.slice(1).forEach(n=>n.textContent="");changed=true;}
    }
    if(changed){zip.file(path,serializer.serializeToString(xml));changedParts++;}
   }
   if(!changedParts)throw new Error("No editable Word text found. Please select the original .docx file.");
   const blob=await zip.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",compression:"DEFLATE"}),url=URL.createObjectURL(blob),a=document.createElement("a");
   const clean=s=>s.replace(/[^a-z0-9-]+/gi,"_");a.href=url;a.download="CCE-"+clean(get("caseNo")||"Case")+" (RA "+clean(get("law")||"9048")+") "+clean(get("petitioner")||"Petitioner")+".docx";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
   note.textContent="Generated from your original Word file. Header/footer, page setup, images, tables, and layout are retained. Review every replaced field before printing.";
  }catch(err){console.error(err);note.textContent="Could not update this file: "+(err.message||"unknown error")+". Confirm it is a valid .docx and try again.";}
  finally{button.disabled=false;}
 },true);
})();