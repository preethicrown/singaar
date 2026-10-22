/* SINGAAR language switcher (beta): Hindi, Tamil, Kannada for the main page text.
   Artist cards, prices and the portals are still English. Translations should be reviewed by a native speaker before launch. */
(function(){
  var sel=document.getElementById('langSel');if(!sel)return;
  var KEY='singaar.lang';
  /* [selector, mode, {hi,ta,kn}]  mode: 'text' (leaf), 'node' (first text node, keeps child elements), 'html' */
  var T=[
    ['.top-nav a[href="#browse"]','text',{hi:'खोजें',ta:'ஆராயுங்கள்',kn:'ಅನ್ವೇಷಿಸಿ'}],
    ['.top-nav a[data-quiz]','text',{hi:'मेरा लुक खोजें',ta:'என் தோற்றத்தைக் கண்டறி',kn:'ನನ್ನ ಲುಕ್ ಹುಡುಕಿ'}],
    ['.top-nav a[href="#live"]','text',{hi:'लाइव मैप',ta:'நேரடி வரைபடம்',kn:'ಲೈವ್ ನಕ್ಷೆ'}],
    ['.top-nav a[href="#tracker"]','text',{hi:'लाइव आगमन',ta:'நேரடி வருகை',kn:'ಲೈವ್ ಆಗಮನ'}],
    ['.top-nav a[href="#plan"]','text',{hi:'अवसर की योजना',ta:'நிகழ்வுத் திட்டம்',kn:'ಕಾರ್ಯಕ್ರಮ ಯೋಜನೆ'}],
    ['.top-nav a[href="#artists"]','text',{hi:'कलाकारों के लिए',ta:'கலைஞர்களுக்கு',kn:'ಕಲಾವಿದರಿಗಾಗಿ'}],
    ['#joinTop','text',{hi:'खुद को जोड़ें',ta:'உங்களைச் சேருங்கள்',kn:'ನಿಮ್ಮನ್ನು ಸೇರಿಸಿ'}],
    ['#portalBtn','node',{hi:'मेरा SINGAAR ',ta:'என் SINGAAR ',kn:'ನನ್ನ SINGAAR '}],
    ['.hero h1','html',{hi:'हर लुक, उन महिलाओं से <em>जो उसे रचती हैं।</em>',ta:'ஒவ்வொரு தோற்றமும், அதை உருவாக்கும் <em>பெண்களிடமிருந்து.</em>',kn:'ಪ್ರತಿ ಲುಕ್, ಅದನ್ನು ರಚಿಸುವ <em>ಮಹಿಳೆಯರಿಂದ.</em>'}],
    ['.hero .sub','text',{hi:'शादी, पार्टी, बाल, त्वचा, नाखून, मेहंदी। स्वतंत्र महिला कलाकारों और भरोसेमंद सैलून की तुलना करें, पहले से उचित दाम देखें, और जिस पर भरोसा हो उसे बुक करें।',ta:'திருமணம், விருந்து, முடி, சருமம், நகங்கள், மெஹந்தி. சுயதொழில் பெண் கலைஞர்கள் மற்றும் நம்பகமான சலூன்களை ஒப்பிட்டு, நியாயமான விலைகளை முன்கூட்டியே பார்த்து, நம்பிக்கையானவரை முன்பதிவு செய்யுங்கள்.',kn:'ಮದುವೆ, ಪಾರ್ಟಿ, ಕೂದಲು, ಚರ್ಮ, ಉಗುರು, ಮೆಹಂದಿ. ಸ್ವತಂತ್ರ ಮಹಿಳಾ ಕಲಾವಿದರು ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಸಲೂನ್‌ಗಳನ್ನು ಹೋಲಿಸಿ, ನ್ಯಾಯಯುತ ಬೆಲೆಗಳನ್ನು ಮುಂಚಿತವಾಗಿ ನೋಡಿ, ನಿಮ್ಮ ವಿಶ್ವಾಸದವರನ್ನು ಬುಕ್ ಮಾಡಿ.'}],
    ['label[for="city"]','text',{hi:'शहर',ta:'நகரம்',kn:'ನಗರ'}],
    ['label[for="occasion"]','text',{hi:'क्या चाहिए',ta:'தேவை',kn:'ಏನು ಬೇಕು'}],
    ['label[for="budget"]','text',{hi:'इस लुक का बजट',ta:'இந்தத் தோற்றத்திற்கான பட்ஜெட்',kn:'ಈ ಲುಕ್‌ಗೆ ಬಜೆಟ್'}],
    ['#searchForm label[for="date"]','text',{hi:'आपकी तारीख',ta:'உங்கள் தேதி',kn:'ನಿಮ್ಮ ದಿನಾಂಕ'}],
    ['#searchForm button[type="submit"]','text',{hi:'खोजें',ta:'தேடு',kn:'ಹುಡುಕಿ'}],
    ['#askForm h3','text',{hi:'पक्का नहीं है क्या चाहिए? अपने शब्दों में बताइए।',ta:'என்ன வேண்டும் என்று தெரியவில்லையா? உங்கள் சொற்களில் சொல்லுங்கள்.',kn:'ಏನು ಬೇಕು ಅಂತ ಗೊತ್ತಿಲ್ಲವೇ? ನಿಮ್ಮ ಮಾತುಗಳಲ್ಲಿ ಹೇಳಿ.'}],
    ['#askForm button[type="submit"]','text',{hi:'मेरे लिए सुझाएँ',ta:'எனக்குப் பரிந்துரை',kn:'ನನಗೆ ಸೂಚಿಸಿ'}],
    ['.pillars .wrap > div:nth-child(1) h3','text',{hi:'महिलाओं द्वारा संचालित',ta:'பெண்கள் வழிநடத்தும்',kn:'ಮಹಿಳೆಯರ ನೇತೃತ್ವ'}],
    ['.pillars .wrap > div:nth-child(2) h3','text',{hi:'उचित, साफ़ दाम',ta:'நியாயமான, தெளிவான விலைகள்',kn:'ನ್ಯಾಯಯುತ, ಸ್ಪಷ್ಟ ಬೆಲೆ'}],
    ['.pillars .wrap > div:nth-child(3) h3','text',{hi:'गुणवत्ता का वादा',ta:'தரத்தின் உறுதி',kn:'ಗುಣಮಟ್ಟದ ಭರವಸೆ'}],
    ['.pillars .wrap > div:nth-child(4) h3','text',{hi:'हमारे रीति-रिवाजों में रचा-बसा',ta:'நம் சடங்குகளில் வேரூன்றியது',kn:'ನಮ್ಮ ಸಂಪ್ರದಾಯಗಳಲ್ಲಿ ಬೇರೂರಿದೆ'}],
    ['.moodhead h2','text',{hi:'हर रस्म। हर मूड। आपका हर रंग।',ta:'ஒவ்வொரு சடங்கும். ஒவ்வொரு மனநிலையும். உங்கள் ஒவ்வொரு வண்ணமும்.',kn:'ಪ್ರತಿ ಸಂಪ್ರದಾಯ. ಪ್ರತಿ ಮನಸ್ಥಿತಿ. ನಿಮ್ಮ ಪ್ರತಿ ಛಾಯೆ.'}],
    ['.mood .btn[data-quiz]','text',{hi:'सिर्फ़ 30 सेकंड में अपना लुक खोजें',ta:'30 விநாடிகளில் என் தோற்றத்தைக் கண்டறி',kn:'30 ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ ನನ್ನ ಲುಕ್ ಹುಡುಕಿ'}],
    ['#browse .sec-h h2','text',{hi:'आज आप कैसा महसूस करना चाहेंगी?',ta:'இன்று நீங்கள் எப்படி உணர விரும்புகிறீர்கள்?',kn:'ಇಂದು ನೀವು ಹೇಗೆ ಅನಿಸಿಕೊಳ್ಳಲು ಬಯಸುತ್ತೀರಿ?'}],
    ['#live .sec-h h2','text',{hi:'देखिए आपके पास कौन है, पिन पर दाम के साथ।',ta:'உங்கள் அருகில் யார் இருக்கிறார்கள், விலையுடன் பாருங்கள்.',kn:'ನಿಮ್ಮ ಹತ್ತಿರ ಯಾರಿದ್ದಾರೆ ನೋಡಿ, ಪಿನ್ ಮೇಲೆ ಬೆಲೆಯೊಂದಿಗೆ.'}],
    ['#tracker .sec-h h2','text',{hi:'उन्हें आते देखिए। समय की चिंता छोड़िए।',ta:'அவர் வருவதைப் பாருங்கள். நேரத்தைப் பற்றிய கவலையை விடுங்கள்.',kn:'ಅವರು ಬರುವುದನ್ನು ನೋಡಿ. ಸಮಯದ ಚಿಂತೆ ಬಿಡಿ.'}],
    ['#plan .sec-h h2','text',{hi:'हर रस्म, हर लुक, एक ही जगह।',ta:'ஒவ்வொரு சடங்கும், ஒவ்வொரு தோற்றமும், ஒரே இடத்தில்.',kn:'ಪ್ರತಿ ಸಂಪ್ರದಾಯ, ಪ್ರತಿ ಲುಕ್, ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ.'}],
    ['#family .sec-h h2','text',{hi:'पूरे परिवार को सुंदर बनाइए।',ta:'முழு குடும்பத்தையும் அழகாக்குங்கள்.',kn:'ಇಡೀ ಕುಟುಂಬವನ್ನು ಸುಂದರಗೊಳಿಸಿ.'}],
    ['#countdown .sec-h h2','text',{hi:'जानिए कब क्या बुक करना है।',ta:'எப்போது எதை முன்பதிவு செய்ய வேண்டும் என்று தெளிவாக அறியுங்கள்.',kn:'ಯಾವಾಗ ಏನನ್ನು ಬುಕ್ ಮಾಡಬೇಕು ಎಂದು ಸ್ಪಷ್ಟವಾಗಿ ತಿಳಿಯಿರಿ.'}],
    ['#promise .sec-h h2','text',{hi:'उचित दाम। असली गुणवत्ता। हर बार।',ta:'நியாயமான விலை. உண்மையான தரம். ஒவ்வொரு முறையும்.',kn:'ನ್ಯಾಯಯುತ ಬೆಲೆ. ನಿಜವಾದ ಗುಣಮಟ್ಟ. ಪ್ರತಿ ಬಾರಿ.'}],
    ['#artists h2','html',{hi:'आपका हुनर। आपके दाम। <em class="gold" style="font-style:italic;font-weight:500">आपका ब्रांड।</em>',ta:'உங்கள் கலை. உங்கள் விலை. <em class="gold" style="font-style:italic;font-weight:500">உங்கள் பிராண்ட்.</em>',kn:'ನಿಮ್ಮ ಕಲೆ. ನಿಮ್ಮ ಬೆಲೆ. <em class="gold" style="font-style:italic;font-weight:500">ನಿಮ್ಮ ಬ್ರಾಂಡ್.</em>'}],
    ['footer .wrap > div > div','text',{hi:'सुंदरता आप तक आती है',ta:'அழகு உங்களைத் தேடி வருகிறது',kn:'ಸೌಂದರ್ಯ ನಿಮ್ಮನ್ನು ಹುಡುಕಿ ಬರುತ್ತದೆ'}]
  ];
  var els=[];
  T.forEach(function(t){
    var el=document.querySelector(t[0]);if(!el)return;
    var node=null,en;
    if(t[1]==='html')en=el.innerHTML;
    else if(t[1]==='node'){for(var i=0;i<el.childNodes.length;i++){if(el.childNodes[i].nodeType===3&&el.childNodes[i].data.trim()){node=el.childNodes[i];break}}if(!node)return;en=node.data}
    else en=el.textContent;
    els.push({el:el,mode:t[1],node:node,en:en,tr:t[2]});
  });
  function apply(lang){
    document.documentElement.setAttribute('lang',lang);
    els.forEach(function(e){
      var v=lang==='en'?e.en:(e.tr[lang]||e.en);
      if(e.mode==='html')e.el.innerHTML=v;else if(e.mode==='node')e.node.data=v;else e.el.textContent=v;
    });
    sel.value=lang;
  }
  var saved='en';try{saved=localStorage.getItem(KEY)||'en'}catch(e){}
  if(['en','hi','ta','kn'].indexOf(saved)<0)saved='en';
  if(saved!=='en')apply(saved);else sel.value='en';
  sel.addEventListener('change',function(){
    var l=sel.value;apply(l);
    try{localStorage.setItem(KEY,l)}catch(e){}
    if(l!=='en'&&window.SG)SG.toast('Translations are a beta: headings and menus are translated, and artist details stay in English for now.');
  });
})();
