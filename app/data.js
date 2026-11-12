/* SINGAAR app catalogue: services, categories, occasions, areas and photos.
   Photos are free-licence stock (Pexels, see assets/photos/CREDITS.md), illustrative only. */
window.SGD=(function(){
  var SV={
    bridal:{n:'Bridal makeup',d:'Wedding-day look with lashes, base and finish',t:240},
    engagement:{n:'Engagement look',d:'Soft or full glam for the ring ceremony',t:150},
    reception:{n:'Reception look',d:'Evening glam that lasts the night',t:150},
    saree:{n:'Saree draping',d:'Nivi, Kanchipuram, Madisaar, Coorgi and more',t:30},
    bridesmaid:{n:'Bridesmaid look',d:'Per person, for sisters, friends and family',t:90},
    party:{n:'Party makeup',d:'Festive, cocktail or function-ready',t:90},
    guest:{n:'Wedding-guest look',d:'Polished, photo-ready guest look',t:75},
    hair:{n:'Hair styling',d:'Buns, braids, curls with flowers or accessories',t:60},
    blowdry:{n:'Blow-dry and set',d:'Smooth, bouncy finish',t:45},
    hairspa:{n:'Hair spa',d:'Deep-conditioning ritual for dull, dry hair',t:60},
    facial:{n:'Glow facial',d:'Cleanse, exfoliate and glow before the event',t:60},
    prebridal:{n:'Pre-bridal package',d:'Skin, hair and body care across weeks',t:90},
    nails:{n:'Nail art and gel',d:'Gel, extensions and bridal nail art',t:60},
    mehendi:{n:'Mehendi design',d:'Bridal and guest mehendi, both hands',t:180},
    accessory:{n:'Accessory styling',d:'Jewellery, maang tikka and hair accessories set',t:30}
  };
  var CATS=[
    {id:'bridal',n:'Bridal',k:['bridal','engagement','reception','bridesmaid'],img:'app/bride'},
    {id:'party',n:'Party',k:['party','guest'],img:'app/cat-party'},
    {id:'hair',n:'Hair',k:['hair','blowdry','hairspa'],img:'app/cat-hair'},
    {id:'skin',n:'Skin and glow',k:['facial','prebridal'],img:'app/cat-skin'},
    {id:'nails',n:'Nails',k:['nails'],img:'app/cat-nails'},
    {id:'mehendi',n:'Mehendi',k:['mehendi'],img:'app/cat-mehendi'},
    {id:'saree',n:'Saree draping',k:['saree'],img:'app/cat-saree'},
    {id:'styling',n:'Jewellery styling',k:['accessory'],img:'app/cat-styling'}
  ];
  var IMG={
    bridal:['app/bride',12792004,14848717,2119095,5376556,18694202,10214422,13022612,10429558,730056],
    engagement:['app/occ-engagement',16651974,10429558,13022612,730056],reception:['app/occ-reception',10214422,13022612,36721897,12792004],
    saree:['app/cat-saree',8442980,730056,2119095,14848717],bridesmaid:[16651974,1828877,9317089,7593048],
    party:['app/cat-party',11836377,11865986,12008356,1828877,7593048],guest:[1828877,7593048,16651974,11865986],
    hair:['app/cat-hair',2995337,14825057,696285],blowdry:['app/cat-hair',696285,2995337,14825057],hairspa:[696285,14825057,2995337],
    facial:['app/cat-skin',6543489,6543645],prebridal:['app/cat-skin','app/bride',6543645,6543489,14848717],
    nails:['app/cat-nails',17280274,5871311,22668324,16363470,9649301,5871831],mehendi:['app/cat-mehendi',32029488,6197905,5467615],
    accessory:['app/cat-styling',9317089,18694196,8442980,14825057]
  };
  var FOCUS={'app/bride':'center 12%','app/occ-nikah':'center 15%','app/occ-church':'center 15%','app/occ-engagement':'center 18%','app/occ-reception':'center 15%','app/occ-haldi':'center 20%','app/cat-party':'center 25%',12792004:'center 4%',13022612:'center 3%',10214422:'center 5%',16651974:'center 22%',36721897:'center 25%',730056:'center 10%',10429558:'center 10%',2119095:'center 12%',14848717:'center 20%',5376556:'center 18%',18694202:'center 25%'};
  /* occasions: one tap fills the AI Look Studio and the planner */
  var RITUALS=[
    {id:'muhurtham',n:'Wedding (muhurtham)',s:['bridal','saree','hair'],img:'app/bride',faith:'Hindu'},
    {id:'nikah',n:'Nikah',s:['bridal','hair'],img:'app/occ-nikah',faith:'Muslim'},
    {id:'church',n:'Church wedding',s:['bridal','hair'],img:'app/occ-church',faith:'Christian'},
    {id:'engagement',n:'Engagement',s:['engagement','hair'],img:'app/occ-engagement'},
    {id:'reception',n:'Reception',s:['reception','hair'],img:'app/occ-reception'},
    {id:'mehendi',n:'Mehendi',s:['mehendi'],img:'app/cat-mehendi'},
    {id:'haldi',n:'Haldi',s:['prebridal','facial'],img:'app/occ-haldi'},
    {id:'sangeet',n:'Sangeet',s:['party','hair'],img:'app/cat-party'},
    {id:'party',n:'Party or function',s:['party','blowdry'],img:'app/cat-party'},
    {id:'family',n:'Bridesmaid or family',s:['bridesmaid','saree'],img:'app/cat-styling'}
  ];
  /* what to book when, counted back from the wedding day (days before) */
  var PLAN=[
    {d:120,t:'Shortlist and book your bridal artist',s:'bridal',why:'Good artists fill wedding-season dates months ahead.'},
    {d:90,t:'Start the pre-bridal package',s:'prebridal',why:'Skin and hair need 8 to 12 weeks to show results.'},
    {d:60,t:'Makeup and hair trial',s:'bridal',why:'Try the look with your outfit colours and jewellery.'},
    {d:45,t:'Book mehendi, bridesmaid and family looks',s:'mehendi',why:'Group bookings need the artist to bring a team.'},
    {d:21,t:'Glow facial (last strong treatment)',s:'facial',why:'Leaves time for any redness to settle.'},
    {d:7,t:'Nails and hair spa',s:'nails',why:'Fresh nails for the ring and haldi photos.'},
    {d:2,t:'Mehendi night',s:'mehendi',why:'Darkest colour shows on day two.'},
    {d:0,t:'Wedding morning: artist arrives, you glow',s:'bridal',why:'Track her arrival live in the app.'}
  ];
  var AREAS={
    Bangalore:{'Malleshwaram':[13.0035,77.5710],'Frazer Town':[12.9986,77.6150],'Indiranagar':[12.9784,77.6408],'Whitefield':[12.9698,77.7500],'Basavanagudi':[12.9422,77.5738],'Koramangala':[12.9352,77.6245],'Jayanagar':[12.9308,77.5838],'BTM Layout':[12.9166,77.6101],'HSR Layout':[12.9121,77.6446],'Hulimavu':[12.8786,77.6010],'Arekere':[12.8860,77.6064],'Bannerghatta Road':[12.8946,77.5980],'Gottigere':[12.8566,77.5884],'Begur':[12.8741,77.6316],'Akshayanagar':[12.8792,77.6172],'Bilekahalli':[12.8958,77.6105],'Kalena Agrahara':[12.8712,77.5957],'Hongasandra':[12.8930,77.6262],'Bommanahalli':[12.9020,77.6250],'JP Nagar':[12.9063,77.5857],'Electronic City':[12.8452,77.6602],'Banashankari':[12.9255,77.5468]},
    Chennai:{'Anna Nagar':[13.0850,80.2101],'Nungambakkam':[13.0569,80.2425],'T. Nagar':[13.0418,80.2341],'Mylapore':[13.0368,80.2676],'Adyar':[13.0012,80.2565],'Velachery':[12.9815,80.2180]}
  };
  var CENTER={Bangalore:[12.9716,77.5946],Chennai:[13.0475,80.2350]};
  var TYPE={artist:'Independent artist',salon:'Salon',studio:'Studio'};
  var SLOTS=[
    ['Early morning (muhurtham)',['04:00','05:00','06:00','07:00']],
    ['Morning',['08:00','09:00','10:00','11:00']],
    ['Afternoon',['12:00','13:00','14:00','15:00','16:00']],
    ['Evening',['17:00','18:00','19:00']]
  ];
  var PROMISES=[
    ['shield','Verified artists','ID and portfolio checked by our team'],
    ['tag','Fair, visible prices','The price you see is the price you pay'],
    ['heart','Women-led','Independent women artists and family salons'],
    ['pin','Live arrival','Watch your artist travel to you']
  ];
  return {SV:SV,CATS:CATS,IMG:IMG,FOCUS:FOCUS,RITUALS:RITUALS,PLAN:PLAN,AREAS:AREAS,CENTER:CENTER,TYPE:TYPE,SLOTS:SLOTS,PROMISES:PROMISES};
})();
